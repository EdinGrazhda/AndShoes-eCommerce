<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;

class Campaign extends Model
{
    protected $fillable = [
        'name',
        'description',
        'price',
        'start_date',
        'end_date',
        'product_id',
        'banner_image',
        'banner_color',
        'is_active',
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
        'is_active' => 'boolean',
    ];

    /**
     * Get the product that belongs to the campaign
     */
    public function product()
    {
        return $this->belongsTo(Product::class);
    }
}

