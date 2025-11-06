<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Product;

class AddProductImages extends Command
{
    protected $signature = 'products:add-images';
    protected $description = 'Add sample images to products';

    public function handle()
    {
        $this->info('Adding images to products...');
        
        // Sample shoe images (you can replace these with actual shoe image URLs or paths)
        $sampleImages = [
            'products/shoe1.jpg',
            'products/shoe2.jpg',
            'products/shoe3.jpg',
            'products/shoe4.jpg',
        ];
        
        $products = Product::whereNull('image')->get();
        
        if ($products->isEmpty()) {
            $this->info('No products without images found.');
            return 0;
        }
        
        $this->info("Found {$products->count()} products without images.");
        
        foreach ($products as $index => $product) {
            // Assign images in a rotating manner
            $imageIndex = $index % count($sampleImages);
            $product->image = $sampleImages[$imageIndex];
            $product->save();
            
            $this->info("✓ Updated product #{$product->id} ({$product->name}) with image: {$sampleImages[$imageIndex]}");
        }
        
        $this->info('');
        $this->info('✓ All products have been updated with images!');
        $this->info('Note: These are sample image paths. Upload actual product images to public/storage/products/ directory.');
        
        return 0;
    }
}
