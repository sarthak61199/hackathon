<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\CustomerAnalyticsController;
use App\Http\Controllers\CustomerRestaurantController;
use App\Http\Controllers\RestaurantController;

Route::prefix('customers/{customerId}')->group(function () {
    Route::get('restaurants', [CustomerRestaurantController::class, 'index']);
    Route::get('history', [CustomerRestaurantController::class, 'history']);
    Route::get('analytics', [CustomerAnalyticsController::class, 'analytics']);
    Route::get('summary', [CustomerAnalyticsController::class, 'summary']);
});

Route::get('restaurants/{restaurantId}/detail', [RestaurantController::class, 'detail']);
//Route::get('/user', function (Request $request) {
//    return $request->user();
//})->middleware('auth:sanctum');
