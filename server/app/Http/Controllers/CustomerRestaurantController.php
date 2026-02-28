<?php

namespace App\Http\Controllers;

use App\Http\Resources\RestaurantsGeoJsonResource;
use App\Models\Customer;
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
}
