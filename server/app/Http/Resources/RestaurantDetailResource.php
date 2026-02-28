<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class RestaurantDetailResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        // Resource payload already built in the service and matches TS interface
        return [
            'id' => $this->resource['id'],
            'name' => $this->resource['name'],
            'cuisine' => $this->resource['cuisine'],
            'cuisineIcon' => $this->resource['cuisineIcon'],
            'chainName' => $this->resource['chainName'],
            'address' => $this->resource['address'],
            'neighborhood' => $this->resource['neighborhood'],
            'area' => $this->resource['area'],
            'cityName' => $this->resource['cityName'],
            'costForTwo' => $this->resource['costForTwo'],
            'priceTier' => $this->resource['priceTier'],
            'logo' => $this->resource['logo'],
            'coordinates' => $this->resource['coordinates'],

            'customerStats' => $this->resource['customerStats'],
        ];
    }
}
