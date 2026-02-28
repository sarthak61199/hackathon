<?php

namespace App\Http\Controllers;

use App\Http\Requests\CustomerHistoryRequest;
use App\Http\Resources\CustomerHistoryResource;
use App\Http\Resources\RestaurantsGeoJsonResource;
use App\Models\Customer;
use App\Services\CustomerHistoryService;
use App\Services\CustomerVisitedRestaurantsService;
use Illuminate\Contracts\Routing\ResponseFactory;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class CustomerRestaurantController extends Controller
{
    /**
     * GET /api/customers/{customerId}/restaurants
     *
     * @param  string  $customerId
     * @param  Request  $request
     * @return ResponseFactory|Response
     */
    public function index(string $customerId, Request $request): Response|ResponseFactory
    {
        $customerIdInt = (int) $customerId;

        // Ensure customer exists (and gives a clean 404 if not)
        Customer::query()->whereKey($customerIdInt)->firstOrFail();

        /** @var CustomerVisitedRestaurantsService $service */
        $service = app(CustomerVisitedRestaurantsService::class);

        $payload = $service->buildGeoJsonPayload($customerIdInt);

        return response(new RestaurantsGeoJsonResource($payload));
    }

    public function history(string $customerId, CustomerHistoryRequest $request): Response|ResponseFactory
    {
        $customerIdInt = (int) $customerId;

        // 404 if customer doesn't exist
        Customer::query()->whereKey($customerIdInt)->firstOrFail();

        /** @var CustomerHistoryService $service */
        $service = app(CustomerHistoryService::class);

        $payload = $service->buildHistoryPayload(
            customerId: $customerIdInt,
            from: $request->validated('from'),
            to: $request->validated('to'),
            restaurantId: $request->validated('restaurant_id')
        );

        return response(new CustomerHistoryResource($payload));
    }
}
