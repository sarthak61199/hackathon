<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CustomerHistoryRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // no auth middleware per spec
    }

    public function rules(): array
    {
        return [
            'from' => ['nullable', 'date_format:Y-m-d'],
            'to' => ['nullable', 'date_format:Y-m-d', 'after_or_equal:from'],
            'restaurant_id' => ['nullable', 'integer', 'min:1'],
        ];
    }
}
