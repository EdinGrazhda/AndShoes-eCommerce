<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Campaign extends Model
{
    
    protected $fillable = [
        'name',
        'description',
        'start_date',
        'end_date',
        'discount_percentage',
    ];

    public function products()
    {
        return $this->belongsToMany(Product::class, 'campaign_product');
    }
}
