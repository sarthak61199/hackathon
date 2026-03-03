<?php

namespace App\Services;

use App\Support\CacheKeys;
use Carbon\Carbon;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

class CustomerHistoryService
{
    /**
     * Returns payload shaped exactly like HistoryResponse:
     * [
     *   'data' => [...],
     *   'meta' => ['total' => int, 'totalSpent' => float]
     * ]
     */
    public function buildHistoryPayload(int $customerId, ?string $from, ?string $to, ?int $restaurantId): array
    {
        $ttl = now()->addHours(6);

        return Cache::tags(["customer:{$customerId}", 'endpoint:history'])
            ->remember(CacheKeys::customerHistory($customerId, $from, $to, $restaurantId), $ttl, function () use ($customerId, $from, $to, $restaurantId) {
                $query = $this->baseQuery($customerId);

                if ($from) {
                    $query->where('b.date', '>=', $from);
                }
                if ($to) {
                    $query->where('b.date', '<=', $to);
                }
                if ($restaurantId) {
                    $query->where('b.restaurant_id', '=', $restaurantId);
                }

                // rows
                $rows = $query
                    ->orderByDesc('b.date')
                    ->orderByDesc('b.time')
                    ->get();

                $data = $rows->map(function ($r) {
                    return [
                        'id' => (int) $r->id,
                        'restaurantId' => (int) $r->restaurant_id,
                        'restaurantName' => (string) $r->restaurant_name,

                        // ✅ cuisine from cuisines table (primary)
                        'cuisine' => (string) ($r->cuisine ?? ''),

                        'date' => $r->date ? Carbon::parse($r->date)->toDateString() : '',
                        'time' => $r->time ? (string) $r->time : '',
                        'pax' => (int) $r->pax,
                        'children' => (int) $r->children,
                        'deal' => (string) ($r->deal ?? ''),

                        'billAmount' => $r->bill_amount !== null ? (float) $r->bill_amount : null,
                        'paidAmount' => $r->paid_amount !== null ? (float) $r->paid_amount : null,
                        'walletAmount' => $r->wallet_amount !== null ? (float) $r->wallet_amount : null,
                        'dealDiscount' => $r->deal_discount_amount !== null ? (float) $r->deal_discount_amount : null,
                        'tipAmount' => $r->tip_amount !== null ? (float) $r->tip_amount : null,
                        'couponAmount' => $r->coupon_amount !== null ? (float) $r->coupon_amount : null,
                    ];
                })->values();

                // meta totals:
                // Spec says: totalSpent = SUM of paid_amount across all results
                // If paid_amount is NULL (no completed txn), it contributes 0.
                $totalSpent = (float) $rows->sum(function ($r) {
                    return $r->paid_amount !== null ? (float) $r->paid_amount : 0.0;
                });

                return [
                    'data' => $data,
                    'meta' => [
                        'total' => $data->count(),
                        'totalSpent' => $totalSpent,
                    ],
                ];
            });
    }

    /**
     * Base query reflecting spec + corrected cuisine join.
     */
    private function baseQuery(int $customerId)
    {
        $primaryCuisineSub = DB::table('restaurants_cuisines as rc1')
            ->selectRaw('rc1.restaurant_id, MIN(rc1.priority) as min_priority')
            ->groupBy('rc1.restaurant_id');

        return DB::table('bookings as b')
            ->join('restaurants as r', 'b.restaurant_id', '=', 'r.id')

            // ✅ primary cuisine join
            ->leftJoinSub($primaryCuisineSub, 'pcr', function ($join) {
                $join->on('pcr.restaurant_id', '=', 'r.id');
            })
            ->leftJoin('restaurants_cuisines as rc', function ($join) {
                $join->on('rc.restaurant_id', '=', 'r.id')
                    ->on('rc.priority', '=', 'pcr.min_priority');
            })
            ->leftJoin('cuisines as cu', 'cu.id', '=', 'rc.cuisine_id')

            // completed payment join
            ->leftJoin('eazypay_transactions as et', function ($join) {
                $join->on('et.booking_id', '=', 'b.id')
                    ->where('et.status', '=', 'complete');
            })
            ->where('b.customer_id', '=', $customerId)
            ->where(function ($q) {
                $q->where('b.state', '=', 'complete')
                    ->orWhereIn('b.state_status', ['materialized', 'complete', 'checked in']);
            })
            ->select([
                'b.id',
                'b.restaurant_id',
                DB::raw('r.name as restaurant_name'),
                DB::raw('cu.name as cuisine'),
                'b.date',
                'b.time',
                'b.pax',
                'b.children',
                'b.deal',
                'b.bill_amount',

                DB::raw('et.total_amount as transaction_total'),
                'et.paid_amount',
                'et.wallet_amount',
                'et.deal_discount_amount',
                'et.tip_amount',
                'et.coupon_amount',
            ]);
    }
}
