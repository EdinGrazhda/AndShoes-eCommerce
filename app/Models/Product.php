<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;
use Spatie\MediaLibrary\MediaCollections\Models\Media;

class Product extends Model implements HasMedia
{
    use InteractsWithMedia;
   
    protected $fillable = [
        'name', 
        'description', 
        'price', 
        'image', 
        'stock', 
        'stock_quantity',
        'foot_numbers', 
        'color',
        'category_id',
        'gender'
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'stock_quantity' => 'integer',
    ];

    protected $appends = ['image_url', 'stock_status'];

    /**
     * Get stock status based on quantity
     * 0 = out of stock
     * 1-10 = low stock
     * 11+ = in stock
     */
    public function getStockStatusAttribute(): string
    {
        if ($this->stock_quantity === 0) {
            return 'out of stock';
        } elseif ($this->stock_quantity <= 10) {
            return 'low stock';
        }
        return 'in stock';
    }

    /**
     * Register media collections
     */
    public function registerMediaCollections(): void
    {
        $this->addMediaCollection('images')
            ->useFallbackUrl('/images/placeholder.jpg')
            ->useFallbackPath(public_path('/images/placeholder.jpg'));
    }

    /**
     * Register media conversions
     */
    public function registerMediaConversions(?Media $media = null): void
    {
        $this->addMediaConversion('thumb')
            ->width(150)
            ->height(150)
            ->sharpen(10);

        $this->addMediaConversion('preview')
            ->width(400)
            ->height(400)
            ->sharpen(10);
    }

    /**
     * Get the product's image URL (for backward compatibility)
     */
    public function getImageUrlAttribute()
    {
        // If using media library, get first image
        if ($this->hasMedia('images')) {
            return $this->getFirstMediaUrl('images', 'preview');
        }
        
        // Fallback to old image column
        return $this->image ?? '/images/placeholder.jpg';
    }

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
