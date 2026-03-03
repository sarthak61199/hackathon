<?php

namespace App\Services;

use App\Support\CacheKeys;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

class SummaryService
{
    public function buildSummaryPayload($customer): array
    {
        $customerId = (int) $customer->id;
        $ttl = now()->addDay();

        return Cache::tags(["customer:{$customerId}", 'endpoint:summary'])
            ->remember(CacheKeys::customerSummary($customerId), $ttl, function () use ($customer, $customerId) {
                $totals = $this->totals($customerId);
                $topRestaurant = $this->topRestaurant($customerId);
                $topCuisine = $this->topCuisine($customerId);
                $topNeighborhood = $this->topNeighborhood($customerId);
                $newVsRevisit = $this->newVsRevisit($customerId);

                $avgSpendPerVisit = $totals['totalVisits'] > 0
                    ? round($totals['totalSpent'] / $totals['totalVisits'], 2)
                    : 0.0;

                return [
                    'customerName' => (string) ($customer->name ?? ''),
                    'totalVisits' => $totals['totalVisits'],
                    'totalSpent' => $totals['totalSpent'],
                    'uniqueRestaurants' => $totals['uniqueRestaurants'],
                    'avgSpendPerVisit' => (float) $avgSpendPerVisit,

                    'topRestaurant' => $topRestaurant,
                    'topCuisine' => $topCuisine,
                    'topNeighborhood' => $topNeighborhood,
                    'newVsRevisit' => $newVsRevisit,

                    'avgPax' => $totals['avgPax'],
                    'totalSavings' => $totals['totalSavings'],
                ];
            });
    }

    /**
     * Base filter: completed visits.
     * Left join completed transactions for money fields.
     */
    private function baseBookingsWithTxn(int $customerId)
    {
        return DB::table('bookings as b')
            ->leftJoin('eazypay_transactions as et', function ($join) {
                $join->on('et.booking_id', '=', 'b.id')
                    ->where('et.status', '=', 'complete');
            })
            ->where('b.customer_id', '=', $customerId)
            ->where(function ($q) {
                $q->where('b.state', '=', 'complete')
                    ->orWhereIn('b.state_status', ['materialized', 'complete', 'checked in']);
            });
    }

    private function totals(int $customerId): array
    {
        $row = $this->baseBookingsWithTxn($customerId)
            ->selectRaw('
                COUNT(b.id) as total_visits,
                COUNT(DISTINCT b.restaurant_id) as unique_restaurants,
                SUM(COALESCE(et.paid_amount, 0)) as total_spent,
                AVG(b.pax) as avg_pax,
                SUM(
                    COALESCE(et.deal_discount_amount, 0) +
                    COALESCE(et.coupon_amount, 0) +
                    COALESCE(et.wallet_amount, 0)
                ) as total_savings
            ')
            ->first();

        return [
            'totalVisits' => (int) ($row->total_visits ?? 0),
            'uniqueRestaurants' => (int) ($row->unique_restaurants ?? 0),
            'totalSpent' => (float) ($row->total_spent ?? 0),
            'avgPax' => (float) ($row->avg_pax ?? 0),
            'totalSavings' => (float) ($row->total_savings ?? 0),
        ];
    }

    /**
     * topRestaurant: by most visits, tie-breaker by total spent
     */
    private function topRestaurant(int $customerId): array
    {
        $row = $this->baseBookingsWithTxn($customerId)
            ->join('restaurants as r', 'b.restaurant_id', '=', 'r.id')
            ->selectRaw('
                r.id as restaurant_id,
                r.name as restaurant_name,
                COUNT(b.id) as visits,
                SUM(COALESCE(et.paid_amount, 0)) as total_spent
            ')
            ->groupBy('r.id', 'r.name')
            ->orderByDesc('visits')
            ->orderByDesc('total_spent')
            ->first();

        return [
            'id' => (int) ($row->restaurant_id ?? 0),
            'name' => (string) ($row->restaurant_name ?? ''),
            'visits' => (int) ($row->visits ?? 0),
            'totalSpent' => (float) ($row->total_spent ?? 0),
        ];
    }

    /**
     * topCuisine: cuisines via restaurants_cuisines (primary cuisine)
     */
    private function topCuisine(int $customerId): array
    {
        $primaryCuisineSub = DB::table('restaurants_cuisines as rc1')
            ->selectRaw('rc1.restaurant_id, MIN(rc1.priority) as min_priority')
            ->groupBy('rc1.restaurant_id');

        $row = $this->baseBookingsWithTxn($customerId)
            ->join('restaurants as r', 'b.restaurant_id', '=', 'r.id')
            ->leftJoinSub($primaryCuisineSub, 'pcr', function ($join) {
                $join->on('pcr.restaurant_id', '=', 'r.id');
            })
            ->leftJoin('restaurants_cuisines as rc', function ($join) {
                $join->on('rc.restaurant_id', '=', 'r.id')
                    ->on('rc.priority', '=', 'pcr.min_priority');
            })
            ->leftJoin('cuisines as cu', 'cu.id', '=', 'rc.cuisine_id')
            ->selectRaw('
                cu.name as cuisine_name,
                COUNT(b.id) as visits,
                SUM(COALESCE(et.paid_amount, 0)) as total_spent
            ')
            ->groupBy('cu.name')
            ->orderByDesc('visits')
            ->orderByDesc('total_spent')
            ->first();

        return [
            'name' => (string) ($row->cuisine_name ?? ''),
            'visits' => (int) ($row->visits ?? 0),
            'totalSpent' => (float) ($row->total_spent ?? 0),
        ];
    }

    /**
     * topNeighborhood: locations_data.area_name
     */
    private function topNeighborhood(int $customerId): array
    {
        $row = $this->baseBookingsWithTxn($customerId)
            ->join('restaurants as r', 'b.restaurant_id', '=', 'r.id')
            ->leftJoin('locations_data as ld', 'r.group_id', '=', 'ld.group_id')
            ->selectRaw('
                ld.area_name as neighborhood,
                COUNT(b.id) as visits,
                SUM(COALESCE(et.paid_amount, 0)) as total_spent
            ')
            ->groupBy('ld.area_name')
            ->orderByDesc('visits')
            ->orderByDesc('total_spent')
            ->first();

        return [
            'name' => $row && $row->neighborhood ? (string) $row->neighborhood : '',
            'visits' => (int) ($row->visits ?? 0),
            'totalSpent' => (float) ($row->total_spent ?? 0),
        ];
    }

    /**
     * newVsRevisit:
     * - newRestaurants = count of restaurants visited exactly once
     * - revisitCount = total visits to restaurants visited more than once
     */
    private function newVsRevisit(int $customerId): array
    {
        $byRestaurant = $this->baseBookingsWithTxn($customerId)
            ->selectRaw('b.restaurant_id, COUNT(b.id) as visits')
            ->groupBy('b.restaurant_id')
            ->get();

        $newRestaurants = (int) $byRestaurant->filter(fn($r) => (int) $r->visits === 1)->count();
        $revisitCount = (int) $byRestaurant->filter(fn($r) => (int) $r->visits > 1)->sum(fn($r) => (int) $r->visits);

        return [
            'newRestaurants' => $newRestaurants,
            'revisitCount' => $revisitCount,
        ];
    }
}
