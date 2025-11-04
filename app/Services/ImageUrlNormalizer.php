<?php

namespace App\Services;

use Illuminate\Support\Str;

class ImageUrlNormalizer
{
    /**
     * Normalize an image path or URL into an absolute URL usable in emails.
     *
     * Rules:
     * - If already absolute (http(s)://) return as-is.
     * - If starts with a leading slash, prefix app.url.
     * - Otherwise assume a storage path and prefix app.url/storage/.
     *
     * @param string|null $image
     * @return string|null
     */
    public static function normalize(?string $image): ?string
    {
        if (empty($image)) {
            return null;
        }

        $image = trim($image);

        // Already absolute
        if (Str::startsWith($image, ['http://', 'https://'])) {
            return $image;
        }

        $appUrl = rtrim(config('app.url'), '/');

        // Starts with storage prefix or any leading slash
        if (Str::startsWith($image, '/')) {
            return $appUrl . $image;
        }

        // Otherwise assume relative storage path and prefix /storage/
        return $appUrl . '/storage/' . ltrim($image, '/');
    }

    /**
     * Build a normalized URL from a Product model (media library preferred).
     *
     * @param \Illuminate\Database\Eloquent\Model|object $product
     * @return string|null
     */
    public static function fromProduct($product): ?string
    {
        if (! $product) {
            return null;
        }

        // If product uses Spatie medialibrary
        if (method_exists($product, 'hasMedia') && $product->hasMedia('images')) {
            $url = $product->getFirstMediaUrl('images');
            if (! empty($url)) {
                return self::normalize($url);
            }
        }

        // Fallback to product.image column
        if (! empty($product->image)) {
            return self::normalize($product->image);
        }

        return null;
    }
}
