<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
   
    protected $fillable = ['name', 'description', 'price', 'stock', 'image_url'];

    public function orders()
    {
        return $this->hasMany(Orders::class);
    }
    public function categories()
    {
        return $this->hasMany(Category::class);
    }
    public function campaigns()
    {
        return $this->belongsToMany(Campaign::class, 'campaign_product');
    }

}
