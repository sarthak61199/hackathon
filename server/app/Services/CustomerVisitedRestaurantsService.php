<?php

namespace App\Services;

use App\Support\CacheKeys;
use App\Support\CuisineColorPalette;
use Carbon\Carbon;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

class CustomerVisitedRestaurantsService
{
    public function buildGeoJsonPayload(int $customerId): array
    {
        $ttl = now()->addDay();

        // If you want tags (recommended):
        return Cache::tags(["customer:{$customerId}", 'endpoint:restaurants_geojson'])
            ->remember(CacheKeys::customerRestaurantsGeoJson($customerId), $ttl, function () use ($customerId) {
                $rows = $this->fetchAggregatedRows($customerId);

                $features = $rows->map(function ($row) {
                    $cuisineName = (string) ($row->cuisine ?? '');
                    $cuisineColor = CuisineColorPalette::colorFor($cuisineName);

                    $costForTwo = (int) $row->cost_for_two;
                    $priceTier = $this->priceTierFromCostForTwo($costForTwo);

                    $visitCount = (int) $row->visit_count;
                    $totalSpent = (float) $row->total_spent;
                    $lastVisit = $row->last_visit ? Carbon::parse($row->last_visit) : null;

                    $loyaltyScore = $this->loyaltyScore(
                        visitCount: $visitCount,
                        totalSpent: $totalSpent,
                        lastVisit: $lastVisit
                    );

                    return [
                        'type' => 'Feature',
                        'geometry' => [
                            'type' => 'Point',
                            'coordinates' => [
                                (float) $row->longitude, // [lng, lat]
                                (float) $row->latitude,
                            ],
                        ],
                        'properties' => [
                            'id' => (int) $row->id,
                            'name' => (string) $row->name,
                            'address' => (string) $row->address,

                            // ✅ Cuisine comes from cuisines table (NOT categories)
                            'cuisine' => $cuisineName,
                            // you said ignore all image data → always null
                            'cuisineIcon' => null,

                            'cuisineColor' => $cuisineColor,
                            'chainName' => $row->chain_name ? (string) $row->chain_name : null,
                            'neighborhood' => $row->neighborhood ? (string) $row->neighborhood : null,
                            'cityName' => (string) ($row->city_name ?? ''),
                            'costForTwo' => $costForTwo,
                            'priceTier' => $priceTier,
                            'logo' => $row->logo ? (string) $row->logo : null,
                            'visitCount' => $visitCount,
                            'totalSpent' => (float) $row->total_spent,
                            'avgSpent' => (float) $row->avg_spent,
                            'lastVisit' => $row->last_visit ? Carbon::parse($row->last_visit)->toDateString() : '',
                            'firstVisit' => $row->first_visit ? Carbon::parse($row->first_visit)->toDateString() : '',
                            'loyaltyScore' => $loyaltyScore,
                            'opacity' => 1.0,
                        ],
                    ];
                })->values();

                $dateRange = $this->computeDateRange($rows);
                $cuisineColorMap = $this->computeCuisineColorMap($rows);

                return [
                    'type' => 'FeatureCollection',
                    'features' => $features,
                    'meta' => [
                        'totalRestaurants' => $features->count(),
                        'dateRange' => $dateRange,
                        'cuisineColorMap' => $cuisineColorMap,
                    ],
                ];
            });

    }

    /**
     * Endpoint 1 DB query.
     * - completed visits filter
     * - completed payments join (paid_amount)
     * - cuisine via cuisines + restaurants_cuisines (primary by min(priority))
     * - category is NOT used for cuisine (kept separate conceptually)
     */
    private function fetchAggregatedRows(int $customerId): Collection
    {
        $primaryCuisineSub = DB::table('restaurants_cuisines as rc1')
            ->selectRaw('rc1.restaurant_id, MIN(rc1.priority) as min_priority')
            ->groupBy('rc1.restaurant_id');

        return DB::table('restaurants as r')
            ->join('bookings as b', function ($join) use ($customerId) {
                $join->on('b.restaurant_id', '=', 'r.id')
                    ->where('b.customer_id', '=', $customerId)
                    ->where(function ($q) {
                        $q->where('b.state', '=', 'complete')
                            ->orWhereIn('b.state_status', ['materialized', 'complete', 'checked in']);
                    });
            })
            ->leftJoin('eazypay_transactions as et', function ($join) {
                $join->on('et.booking_id', '=', 'b.id')
                    ->where('et.status', '=', 'complete');
            })
            ->leftJoin('chains as ch', 'r.chain_id', '=', 'ch.id')
            ->leftJoin('locations_data as ld', 'r.group_id', '=', 'ld.group_id')

            // ✅ cuisine join
            ->leftJoinSub($primaryCuisineSub, 'pcr', function ($join) {
                $join->on('pcr.restaurant_id', '=', 'r.id');
            })
            ->leftJoin('restaurants_cuisines as rc', function ($join) {
                $join->on('rc.restaurant_id', '=', 'r.id')
                    ->on('rc.priority', '=', 'pcr.min_priority');
            })
            ->leftJoin('cuisines as cu', 'cu.id', '=', 'rc.cuisine_id')
            ->selectRaw('
                r.id,
                r.name,
                r.address,
                r.latitude,
                r.longitude,
                r.cost_for_two,
                r.logo,

                cu.name as cuisine,

                ch.name as chain_name,
                ld.area_name as neighborhood,
                ld.city_name,

                COUNT(b.id) as visit_count,
                SUM(COALESCE(et.paid_amount, b.bill_amount, 0)) as total_spent,
                AVG(COALESCE(et.paid_amount, b.bill_amount, 0)) as avg_spent,
                MAX(b.date) as last_visit,
                MIN(b.date) as first_visit
            ')
            // strict-mode safe group by
            ->groupBy(
                'r.id',
                'r.name',
                'r.address',
                'r.latitude',
                'r.longitude',
                'r.cost_for_two',
                'r.logo',
                'cu.name',
                'ch.name',
                'ld.area_name',
                'ld.city_name'
            )
            ->get();
    }

    private function computeDateRange(Collection $rows): array
    {
        $earliest = $rows->min('first_visit');
        $latest = $rows->max('last_visit');

        return [
            'earliest' => $earliest ? Carbon::parse($earliest)->toDateString() : '',
            'latest' => $latest ? Carbon::parse($latest)->toDateString() : '',
        ];
    }

    private function computeCuisineColorMap(Collection $rows): array
    {
        $unique = $rows->pluck('cuisine')
            ->filter()
            ->map(fn($v) => (string) $v)
            ->unique()
            ->values();

        $map = [];
        foreach ($unique as $cuisine) {
            $map[$cuisine] = CuisineColorPalette::colorFor($cuisine);
        }

        return $map;
    }

    /**
     * ✅ Updated tiers per your spec:
     * 1 (<=500), 2 (501-1000), 3 (1001-2000), 4 (2001+)
     */
    private function priceTierFromCostForTwo(int $costForTwo): int
    {
        return match (true) {
            $costForTwo <= 500 => 1,
            $costForTwo <= 1000 => 2,
            $costForTwo <= 2000 => 3,
            default => 4,
        };
    }

    /**
     * Stable 0..100 score
     */
    private function loyaltyScore(int $visitCount, float $totalSpent, ?Carbon $lastVisit): int
    {
        $visitComponent = log(1 + max(0, $visitCount)) * 18;
        $spendComponent = log(1 + max(0, $totalSpent)) * 6;

        $daysSince = $lastVisit ? $lastVisit->diffInDays(now()) : 9999;
        $recencyComponent = max(0, 40 - min(40, $daysSince));

        $score = $visitComponent + $spendComponent + $recencyComponent;

        return (int) max(0, min(100, round($score)));
    }
}
