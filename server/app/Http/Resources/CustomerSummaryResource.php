<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CustomerSummaryResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'customerName' => $this->resource['customerName'],
            'totalVisits' => $this->resource['totalVisits'],
            'totalSpent' => $this->resource['totalSpent'],
            'uniqueRestaurants' => $this->resource['uniqueRestaurants'],
            'avgSpendPerVisit' => $this->resource['avgSpendPerVisit'],

            'topRestaurant' => $this->resource['topRestaurant'],
            'topCuisine' => $this->resource['topCuisine'],
            'topNeighborhood' => $this->resource['topNeighborhood'],
            'newVsRevisit' => $this->resource['newVsRevisit'],

            'avgPax' => $this->resource['avgPax'],
            'totalSavings' => $this->resource['totalSavings'],
        ];
    }
}
