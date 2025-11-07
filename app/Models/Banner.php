<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

class Banner extends Model
{
    protected $table = 'banners';

    protected $fillable = [
        'header',
        'description',
        'image_path',
    ];

    protected $appends = [
        'image_url',
        'has_image',
    ];

    /**
     * Get the banner image URL
     */
    public function getImageUrlAttribute(): ?string
    {
        if (! $this->image_path) {
            return null;
        }

        return Storage::url($this->image_path);
    }

    /**
     * Check if banner has an image
     */
    public function getHasImageAttribute(): bool
    {
        return ! empty($this->image_path) && Storage::exists($this->image_path);
    }

    /**
     * Delete the banner image file
     */
    public function deleteImage(): void
    {
        if ($this->image_path && Storage::exists($this->image_path)) {
            Storage::delete($this->image_path);
        }
    }
}
