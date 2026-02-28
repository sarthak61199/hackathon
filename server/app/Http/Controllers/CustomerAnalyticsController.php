<?php

namespace App\Http\Controllers;

use App\Http\Resources\CustomerAnalyticsResource;
use App\Http\Resources\CustomerSummaryResource;
use App\Models\Customer;
use App\Services\AnalyticsService;
use App\Services\SummaryService;
use Illuminate\Contracts\Routing\ResponseFactory;
use Illuminate\Http\Response;

class CustomerAnalyticsController extends Controller
{
    /**
     * @param  string  $customerId
     * @return ResponseFactory|Response
     */
    public function analytics(string $customerId)
    {
        $customerIdInt = (int) $customerId;

        Customer::query()->whereKey($customerIdInt)->firstOrFail();

        /** @var AnalyticsService $service */
        $service = app(AnalyticsService::class);

        $payload = $service->buildAnalyticsPayload($customerIdInt);

        return response(new CustomerAnalyticsResource($payload));
    }

    public function summary(string $customerId)
    {
        $customerIdInt = (int) $customerId;

        $customer = Customer::query()->whereKey($customerIdInt)->firstOrFail();

        /** @var SummaryService $service */
        $service = app(SummaryService::class);

        $payload = $service->buildSummaryPayload($customer);

        return response(new CustomerSummaryResource($payload));
    }
}
