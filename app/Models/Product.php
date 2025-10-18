<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
   
    protected $fillable = [
        'name', 
        'description', 
        'price', 
        'image', 
        'stock', 
        'foot_numbers', 
        'color',
        'category_id',
        'gender'
    ];

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function campaigns()
    {
        return $this->hasMany(Campaign::class);
    }

    public function cartItems()
    {
        return $this->hasMany(CartItems::class);
    }
}
