<?php

namespace App\Http\Controllers;

use App\Http\Resources\RestaurantDetailResource;
use App\Models\Customer;
use App\Models\Restaurant;
use App\Services\RestaurantDetailService;
use Illuminate\Http\Request;

class RestaurantController extends Controller
{
    public function detail(string $restaurantId, Request $request)
    {
        $restaurantIdInt = (int) $restaurantId;

        $customerId = (int) $request->query('customer_id', 0);
        if ($customerId <= 0) {
            return response()->json([
                'message' => 'The customer_id query parameter is required.',
                'errors' => ['customer_id' => ['customer_id is required']],
            ], 422);
        }

        // Clean 404s if invalid ids
        Restaurant::query()->whereKey($restaurantIdInt)->firstOrFail();
        Customer::query()->whereKey($customerId)->firstOrFail();

        /** @var RestaurantDetailService $service */
        $service = app(RestaurantDetailService::class);

        $payload = $service->buildRestaurantDetailPayload(
            restaurantId: $restaurantIdInt,
            customerId: $customerId
        );

        return response(new RestaurantDetailResource($payload));
    }
}
