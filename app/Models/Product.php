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
        'gender',
        'product_id',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'stock_quantity' => 'integer',
    ];

    protected $appends = ['image_url', 'stock_status', 'total_stock', 'all_images'];

    /**
     * Get size-specific stock records
     */
    public function sizeStocks()
    {
        return $this->hasMany(ProductSizeStock::class);
    }

    /**
     * Get total stock across all sizes
     */
    public function getTotalStockAttribute(): int
    {
        return $this->sizeStocks()->sum('quantity');
    }

    /**
     * Get stock status based on total quantity across all sizes
     * 0 = out of stock
     * 1-10 = low stock
     * 11+ = in stock
     */
    public function getStockStatusAttribute(): string
    {
        $total = $this->total_stock;

        if ($total === 0) {
            return 'out of stock';
        } elseif ($total <= 10) {
            return 'low stock';
        }

        return 'in stock';
    }

    /**
     * Get stock quantity for backward compatibility
     */
    public function getStockQuantityAttribute(): int
    {
        return $this->total_stock;
    }

    /**
     * Register media collections
     */
    public function registerMediaCollections(): void
    {
        $this->addMediaCollection('images')
            ->useFallbackUrl('/images/placeholder.jpg')
            ->useFallbackPath(public_path('/images/placeholder.jpg'))
            ->registerMediaConversions(function (Media $media) {
                $this->addMediaConversion('thumb')
                    ->width(150)
                    ->height(150)
                    ->sharpen(10)
                    ->nonQueued(); // Generate immediately, don't queue

                $this->addMediaConversion('preview')
                    ->width(400)
                    ->height(400)
                    ->sharpen(10)
                    ->nonQueued(); // Generate immediately, don't queue
            });
    }
    
    /**
     * Get all product images URLs
     */
    public function getAllImagesAttribute()
    {
        return $this->getMedia('images')->map(function ($media) {
            return [
                'id' => $media->id,
                'url' => $media->getUrl('preview'),
                'thumb' => $media->getUrl('thumb'),
                'original' => $media->getUrl(),
            ];
        })->toArray();
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
