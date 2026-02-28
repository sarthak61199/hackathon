<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Cuisine extends Model
{
    protected $table = 'cuisines';

    public function restaurants(): BelongsToMany
    {
        return $this->belongsToMany(Restaurant::class, 'restaurants_cuisines', 'cuisine_id', 'restaurant_id')
            ->withPivot(['priority'])
            ->withTimestamps();
    }
}
