<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;
use Spatie\MediaLibrary\MediaCollections\Models\Media;

class Banner extends Model implements HasMedia
{
    use InteractsWithMedia;

    protected $table = 'banners'; // Fixed table name to match migration

    protected $fillable = [
        'header',
        'description',
    ];

    protected $appends = [
        'image_url',
    ];

    /**
     * Define media collections
     */
    public function registerMediaCollections(): void
    {
        $this->addMediaCollection('banner_images')
            ->singleFile()
            ->acceptsMimeTypes(['image/jpeg', 'image/png', 'image/jpg', 'image/gif', 'image/webp']);
    }

    /**
     * Define media conversions
     */
    public function registerMediaConversions(?Media $media = null): void
    {
        $this->addMediaConversion('thumbnail')
            ->width(300)
            ->height(200)
            ->sharpen(10)
            ->performOnCollections('banner_images');

        $this->addMediaConversion('large')
            ->width(1200)
            ->height(600)
            ->sharpen(10)
            ->performOnCollections('banner_images');
    }

    /**
     * Get the banner image URL
     */
    public function getImageUrlAttribute(): ?string
    {
        $media = $this->getFirstMedia('banner_images');

        return $media ? $media->getUrl() : null;
    }

    /**
     * Get the thumbnail image URL
     */
    public function getThumbnailUrlAttribute(): ?string
    {
        $media = $this->getFirstMedia('banner_images');

        return $media ? $media->getUrl('thumbnail') : null;
    }

    /**
     * Get the large image URL
     */
    public function getLargeImageUrlAttribute(): ?string
    {
        $media = $this->getFirstMedia('banner_images');

        return $media ? $media->getUrl('large') : null;
    }

    /**
     * Check if banner has an image
     */
    public function hasImage(): bool
    {
        return $this->hasMedia('banner_images');
    }
}
