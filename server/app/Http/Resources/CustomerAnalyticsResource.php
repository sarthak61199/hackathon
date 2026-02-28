<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CustomerAnalyticsResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'spendByCuisine' => $this->resource['spendByCuisine'],
            'spendByNeighborhood' => $this->resource['spendByNeighborhood'],
            'visitsByDayOfWeek' => $this->resource['visitsByDayOfWeek'],
            'visitsByTimeSlot' => $this->resource['visitsByTimeSlot'],
            'monthlySpendTrend' => $this->resource['monthlySpendTrend'],
        ];
    }
}
