<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Category extends Model
{
    protected $table = 'categories';

    public function restaurants(): HasMany
    {
        return $this->hasMany(Restaurant::class, 'category_id');
    }
}
