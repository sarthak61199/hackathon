<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class RestaurantsGeoJsonResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        // $this->resource already contains the final payload shape
        // built by the service (type/features/meta).
        return [
            'type' => 'FeatureCollection',
            'features' => $this->resource['features'],
            'meta' => $this->resource['meta'],
        ];
    }
}
