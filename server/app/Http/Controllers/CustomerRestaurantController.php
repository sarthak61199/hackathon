<?php

namespace App\Http\Controllers;

use Illuminate\Contracts\Routing\ResponseFactory;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class CustomerRestaurantController extends Controller
{
    /**
     * @param  string  $customerId
     * @param  Request  $request
     * @return ResponseFactory|Response
     */
    public function index(string $customerId, Request $request): Response|ResponseFactory
    {
        return response(['data' => ['key' => 'value']]);
    }
}
