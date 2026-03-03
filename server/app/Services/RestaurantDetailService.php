<?php

namespace App\Services;

use App\Support\CacheKeys;
use App\Support\CuisineColorPalette;
use Carbon\Carbon;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

readonly class RestaurantDetailService
{
    public function __construct(
        private LoyaltyScoreService $loyaltyScoreService,
    ) {
    }

    public function buildRestaurantDetailPayload(int $restaurantId, int $customerId): array
    {
        $ttl = now()->addDay();

        return Cache::tags(["customer:{$customerId}", "restaurant:{$restaurantId}", 'endpoint:restaurant_detail'])
            ->remember(CacheKeys::restaurantDetail($restaurantId, $customerId), $ttl, function () use ($restaurantId, $customerId) {
                $restaurant = $this->fetchRestaurantBase($restaurantId);
                $stats = $this->fetchCustomerStats($restaurantId, $customerId);
                $timeline = $this->fetchSpendTimeline($restaurantId, $customerId);
                $favouriteDeal = $this->fetchFavouriteDeal($restaurantId, $customerId);

                $costForTwo = (int) ($restaurant->cost_for_two ?? 0);
                $priceTier = $this->priceTierFromCostForTwo($costForTwo);

                $cuisine = (string) ($restaurant->cuisine ?? '');
                $cuisineColor = CuisineColorPalette::colorFor($cuisine);

                $lastVisit = $stats['lastVisit'] ? Carbon::parse($stats['lastVisit']) : null;

                $loyaltyScore = $this->loyaltyScoreService->score(
                    visitCount: (int) $stats['visitCount'],
                    totalSpent: (float) $stats['totalSpent'],
                    lastVisit: $lastVisit
                );

                return [
                    'id' => (int) $restaurant->id,
                    'name' => (string) $restaurant->name,
                    'cuisine' => $cuisine,
                    'cuisineIcon' => null, // ignore image data as requested
                    'chainName' => $restaurant->chain_name ? (string) $restaurant->chain_name : null,
                    'address' => (string) $restaurant->address,
                    'neighborhood' => $restaurant->neighborhood ? (string) $restaurant->neighborhood : null,
                    'area' => $restaurant->area ? (string) $restaurant->area : null,
                    'cityName' => (string) ($restaurant->city_name ?? ''),
                    'costForTwo' => $costForTwo,
                    'priceTier' => $priceTier,
                    'logo' => $restaurant->logo ? (string) $restaurant->logo : null,
                    'coordinates' => [
                        (float) $restaurant->longitude,
                        (float) $restaurant->latitude,
                    ],

                    'customerStats' => [
                        'visitCount' => (int) $stats['visitCount'],
                        'totalSpent' => (float) $stats['totalSpent'],
                        'avgSpent' => (float) $stats['avgSpent'],
                        'lastVisit' => (string) ($stats['lastVisit'] ?? ''),
                        'firstVisit' => (string) ($stats['firstVisit'] ?? ''),
                        'loyaltyScore' => $loyaltyScore,
                        'avgPax' => (float) $stats['avgPax'],
                        'totalSavings' => (float) $stats['totalSavings'],
                        'favouriteDeal' => $favouriteDeal,
                        'spendTimeline' => $timeline,
                    ],
                ];
            });
    }

    /**
     * Restaurant info + primary cuisine + chain + location
     * categories table is NOT used for cuisine.
     */
    private function fetchRestaurantBase(int $restaurantId)
    {
        $primaryCuisineSub = DB::table('restaurants_cuisines as rc1')
            ->selectRaw('rc1.restaurant_id, MIN(rc1.priority) as min_priority')
            ->groupBy('rc1.restaurant_id');

        return DB::table('restaurants as r')
            ->leftJoin('chains as ch', 'r.chain_id', '=', 'ch.id')
            ->leftJoin('locations_data as ld', 'r.group_id', '=', 'ld.group_id')
            ->leftJoinSub($primaryCuisineSub, 'pcr', function ($join) {
                $join->on('pcr.restaurant_id', '=', 'r.id');
            })
            ->leftJoin('restaurants_cuisines as rc', function ($join) {
                $join->on('rc.restaurant_id', '=', 'r.id')
                    ->on('rc.priority', '=', 'pcr.min_priority');
            })
            ->leftJoin('cuisines as cu', 'cu.id', '=', 'rc.cuisine_id')
            ->where('r.id', '=', $restaurantId)
            ->selectRaw('
                r.id, r.name, r.address, r.latitude, r.longitude, r.cost_for_two, r.logo,
                cu.name as cuisine,
                ch.name as chain_name,
                ld.area_name as neighborhood,
                ld.subarea_name as area,
                ld.city_name
            ')
            ->first();
    }

    private function fetchCustomerStats(int $restaurantId, int $customerId): array
    {
        $row = DB::table('bookings as b')
            ->leftJoin('eazypay_transactions as et', function ($join) {
                $join->on('et.booking_id', '=', 'b.id')
                    ->where('et.status', '=', 'complete');
            })
            ->where('b.customer_id', '=', $customerId)
            ->where('b.restaurant_id', '=', $restaurantId)
            ->where(function ($q) {
                $q->where('b.state', '=', 'complete')
                    ->orWhereIn('b.state_status', ['materialized', 'complete', 'checked in']);
            })
            ->selectRaw('
                COUNT(b.id) as visit_count,
                SUM(COALESCE(et.paid_amount, b.bill_amount, 0)) as total_spent,
                AVG(COALESCE(et.paid_amount, b.bill_amount, 0)) as avg_spent,
                MAX(b.date) as last_visit,
                MIN(b.date) as first_visit,
                AVG(b.pax) as avg_pax,
                SUM(
                    COALESCE(et.deal_discount_amount, 0) +
                    COALESCE(et.coupon_amount, 0) +
                    COALESCE(et.wallet_amount, 0)
                ) as total_savings
            ')
            ->first();

        return [
            'visitCount' => (int) ($row->visit_count ?? 0),
            'totalSpent' => (float) ($row->total_spent ?? 0),
            'avgSpent' => (float) ($row->avg_spent ?? 0),
            'lastVisit' => $row->last_visit ? Carbon::parse($row->last_visit)->toDateString() : '',
            'firstVisit' => $row->first_visit ? Carbon::parse($row->first_visit)->toDateString() : '',
            'avgPax' => (float) ($row->avg_pax ?? 0),
            'totalSavings' => (float) ($row->total_savings ?? 0),
        ];
    }

    private function fetchFavouriteDeal(int $restaurantId, int $customerId): ?string
    {
        $row = DB::table('bookings as b')
            ->where('b.customer_id', '=', $customerId)
            ->where('b.restaurant_id', '=', $restaurantId)
            ->where(function ($q) {
                $q->where('b.state', '=', 'complete')
                    ->orWhereIn('b.state_status', ['materialized', 'complete', 'checked in']);
            })
            ->whereNotNull('b.deal')
            ->where('b.deal', '!=', '')
            ->selectRaw('b.deal, COUNT(*) as cnt, MAX(b.date) as last_used')
            ->groupBy('b.deal')
            ->orderByDesc('cnt')
            ->orderByDesc('last_used')
            ->first();

        return $row?->deal ? (string) $row->deal : null;
    }

    private function fetchSpendTimeline(int $restaurantId, int $customerId): array
    {
        $rows = DB::table('bookings as b')
            ->leftJoin('eazypay_transactions as et', function ($join) {
                $join->on('et.booking_id', '=', 'b.id')
                    ->where('et.status', '=', 'complete');
            })
            ->where('b.customer_id', '=', $customerId)
            ->where('b.restaurant_id', '=', $restaurantId)
            ->where(function ($q) {
                $q->where('b.state', '=', 'complete')
                    ->orWhereIn('b.state_status', ['materialized', 'complete', 'checked in']);
            })
            ->orderBy('b.date', 'asc')
            ->orderBy('b.time', 'asc')
            ->get([
                'b.date',
                'b.pax',
                DB::raw('COALESCE(et.paid_amount, b.bill_amount, 0) as amount'),
            ]);

        return $rows->map(fn($r) => [
            'date' => $r->date ? Carbon::parse($r->date)->toDateString() : '',
            'amount' => (float) $r->amount,
            'pax' => (int) $r->pax,
        ])->values()->all();
    }

    /**
     * priceTier per your latest spec:
     * tier1 <=500, tier2 501-1000, tier3 1001-2000, tier4 2001+
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
}
