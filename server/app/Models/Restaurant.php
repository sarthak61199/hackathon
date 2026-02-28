<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Restaurant extends Model
{
    protected $table = 'restaurants';

    public function chain(): BelongsTo
    {
        return $this->belongsTo(Chain::class, 'chain_id');
    }

    public function bookings(): HasMany
    {
        return $this->hasMany(Booking::class, 'restaurant_id');
    }

    // ✅ category = restaurant category (NOT cuisine)
    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class, 'category_id');
    }

    // ✅ cuisines = actual cuisines (many-to-many)
    public function cuisines(): BelongsToMany
    {
        return $this->belongsToMany(Cuisine::class, 'restaurants_cuisines', 'restaurant_id', 'cuisine_id')
            ->withPivot(['priority'])
            ->withTimestamps()
            ->orderBy('restaurants_cuisines.priority');
    }
}
