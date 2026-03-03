<?php

namespace App\Services;

use App\Support\CacheKeys;
use App\Support\CuisineColorPalette;
use Carbon\Carbon;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

class AnalyticsService
{
    public function buildAnalyticsPayload(int $customerId): array
    {
        $ttl = now()->addDay();

        return Cache::tags(["customer:{$customerId}", 'endpoint:analytics'])
            ->remember(CacheKeys::customerAnalytics($customerId), $ttl, function () use ($customerId) {
                return [
                    'spendByCuisine' => $this->spendByCuisine($customerId),
                    'spendByNeighborhood' => $this->spendByNeighborhood($customerId),
                    'visitsByDayOfWeek' => $this->visitsByDayOfWeek($customerId),
                    'visitsByTimeSlot' => $this->visitsByTimeSlot($customerId),
                    'monthlySpendTrend' => $this->monthlySpendTrend($customerId),
                ];
            });
    }

    /**
     * Base bookings query (completed visit filter) + completed txn join.
     * Note: spend in analytics is based on et.paid_amount (spec).
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

    /**
     * Join restaurants + primary cuisine (cuisines table).
     */
    private function joinRestaurantsPrimaryCuisine($query)
    {
        $primaryCuisineSub = DB::table('restaurants_cuisines as rc1')
            ->selectRaw('rc1.restaurant_id, MIN(rc1.priority) as min_priority')
            ->groupBy('rc1.restaurant_id');

        return $query
            ->join('restaurants as r', 'b.restaurant_id', '=', 'r.id')
            ->leftJoinSub($primaryCuisineSub, 'pcr', function ($join) {
                $join->on('pcr.restaurant_id', '=', 'r.id');
            })
            ->leftJoin('restaurants_cuisines as rc', function ($join) {
                $join->on('rc.restaurant_id', '=', 'r.id')
                    ->on('rc.priority', '=', 'pcr.min_priority');
            })
            ->leftJoin('cuisines as cu', 'cu.id', '=', 'rc.cuisine_id');
    }

    /**
     * spendByCuisine:
     * total = SUM(paid_amount) grouped by cuisine (primary cuisine)
     * visits = COUNT(bookings)
     */
    private function spendByCuisine(int $customerId): array
    {
        $rows = $this->joinRestaurantsPrimaryCuisine($this->baseBookingsWithTxn($customerId))
            ->selectRaw('
                cu.name as cuisine,
                COUNT(b.id) as visits,
                SUM(COALESCE(et.paid_amount, 0)) as total
            ')
            ->groupBy('cu.name')
            ->orderByDesc('total')
            ->get();

        $grandTotal = (float) $rows->sum(fn($r) => (float) $r->total);

        return $rows->map(function ($r) use ($grandTotal) {
            $cuisine = (string) ($r->cuisine ?? '');
            $total = (float) $r->total;

            $percentage = $grandTotal > 0 ? round(($total / $grandTotal) * 100, 2) : 0.0;

            return [
                'cuisine' => $cuisine,
                'cuisineColor' => CuisineColorPalette::colorFor($cuisine),
                'total' => $total,
                'visits' => (int) $r->visits,
                'percentage' => (float) $percentage,
            ];
        })->values()->all();
    }

    /**
     * spendByNeighborhood:
     * neighborhood = locations_data.area_name via restaurants.group_id
     */
    private function spendByNeighborhood(int $customerId): array
    {
        $rows = $this->baseBookingsWithTxn($customerId)
            ->join('restaurants as r', 'b.restaurant_id', '=', 'r.id')
            ->leftJoin('locations_data as ld', 'r.group_id', '=', 'ld.group_id')
            ->selectRaw('
                ld.area_name as neighborhood,
                COUNT(b.id) as visits,
                SUM(COALESCE(et.paid_amount, 0)) as total
            ')
            ->groupBy('ld.area_name')
            ->orderByDesc('total')
            ->get();

        return $rows->map(fn($r) => [
            'neighborhood' => $r->neighborhood ? (string) $r->neighborhood : '',
            'total' => (float) $r->total,
            'visits' => (int) $r->visits,
        ])->values()->all();
    }

    /**
     * visitsByDayOfWeek:
     * DAYOFWEEK in MySQL: 1=Sun ... 7=Sat
     * We output Monday..Sunday with dayIndex 0..6 (Mon=0).
     */
    private function visitsByDayOfWeek(int $customerId): array
    {
        $rows = $this->baseBookingsWithTxn($customerId)
            ->selectRaw('
                DAYOFWEEK(b.date) as mysql_dow,
                COUNT(b.id) as count
            ')
            ->groupBy('mysql_dow')
            ->get();

        // map MySQL -> desired index/name
        // mysql: 1 Sun,2 Mon,3 Tue,4 Wed,5 Thu,6 Fri,7 Sat
        $map = [
            2 => ['day' => 'Monday', 'dayIndex' => 0],
            3 => ['day' => 'Tuesday', 'dayIndex' => 1],
            4 => ['day' => 'Wednesday', 'dayIndex' => 2],
            5 => ['day' => 'Thursday', 'dayIndex' => 3],
            6 => ['day' => 'Friday', 'dayIndex' => 4],
            7 => ['day' => 'Saturday', 'dayIndex' => 5],
            1 => ['day' => 'Sunday', 'dayIndex' => 6],
        ];

        $byIndex = array_fill(0, 7, 0);
        foreach ($rows as $r) {
            $mysqlDow = (int) $r->mysql_dow;
            if (!isset($map[$mysqlDow])) {
                continue;
            }
            $idx = $map[$mysqlDow]['dayIndex'];
            $byIndex[$idx] = (int) $r->count;
        }

        $out = [];
        foreach ($map as $mysqlDow => $info) {
            // build in dayIndex order (Mon..Sun)
        }

        // return in Mon..Sun order
        $names = [
            ['day' => 'Monday', 'dayIndex' => 0],
            ['day' => 'Tuesday', 'dayIndex' => 1],
            ['day' => 'Wednesday', 'dayIndex' => 2],
            ['day' => 'Thursday', 'dayIndex' => 3],
            ['day' => 'Friday', 'dayIndex' => 4],
            ['day' => 'Saturday', 'dayIndex' => 5],
            ['day' => 'Sunday', 'dayIndex' => 6],
        ];

        foreach ($names as $n) {
            $out[] = [
                'day' => $n['day'],
                'dayIndex' => $n['dayIndex'],
                'count' => (int) $byIndex[$n['dayIndex']],
            ];
        }

        return $out;
    }

    /**
     * visitsByTimeSlot:
     * Buckets:
     * Breakfast (6-11), Lunch (11-15), Evening (15-19), Dinner (19-22), Late Night (22-6)
     * We’ll implement as:
     * - Breakfast: 6 <= hour < 11
     * - Lunch: 11 <= hour < 15
     * - Evening: 15 <= hour < 19
     * - Dinner: 19 <= hour < 22
     * - Late Night: otherwise (22-24 and 0-6)
     */
    private function visitsByTimeSlot(int $customerId): array
    {
        $rows = $this->baseBookingsWithTxn($customerId)
            ->selectRaw("
                CASE
                    WHEN HOUR(b.time) >= 6  AND HOUR(b.time) < 11 THEN 'Breakfast'
                    WHEN HOUR(b.time) >= 11 AND HOUR(b.time) < 15 THEN 'Lunch'
                    WHEN HOUR(b.time) >= 15 AND HOUR(b.time) < 19 THEN 'Evening'
                    WHEN HOUR(b.time) >= 19 AND HOUR(b.time) < 22 THEN 'Dinner'
                    ELSE 'Late Night'
                END as slot,
                COUNT(b.id) as count
            ")
            ->groupBy('slot')
            ->get();

        $order = ['Breakfast', 'Lunch', 'Evening', 'Dinner', 'Late Night'];
        $counts = array_fill_keys($order, 0);

        foreach ($rows as $r) {
            $slot = (string) $r->slot;
            if (isset($counts[$slot])) {
                $counts[$slot] = (int) $r->count;
            }
        }

        $out = [];
        foreach ($order as $slot) {
            $out[] = ['slot' => $slot, 'count' => (int) $counts[$slot]];
        }

        return $out;
    }

    /**
     * monthlySpendTrend:
     * month = YYYY-MM
     * totalSpend = SUM(paid_amount)
     * avgSpend = AVG(paid_amount) -- note: NULL paid_amount entries are ignored by AVG in SQL,
     * so we coalesce to 0 for sum, but for avg we want avg of actual payments.
     * Spec says AVG(paid_amount); we’ll compute:
     *   avgSpend = AVG(COALESCE(et.paid_amount, 0))
     * so it stays numeric and consistent.
     */
    private function monthlySpendTrend(int $customerId): array
    {
        $rows = $this->baseBookingsWithTxn($customerId)
            ->selectRaw("
                DATE_FORMAT(b.date, '%Y-%m') as month,
                SUM(COALESCE(et.paid_amount, 0)) as total_spend,
                AVG(COALESCE(et.paid_amount, 0)) as avg_spend,
                COUNT(b.id) as visits
            ")
            ->groupBy('month')
            ->orderBy('month')
            ->get();

        return $rows->map(fn($r) => [
            'month' => (string) $r->month,
            'totalSpend' => (float) $r->total_spend,
            'avgSpend' => (float) $r->avg_spend,
            'visits' => (int) $r->visits,
        ])->values()->all();
    }
}
