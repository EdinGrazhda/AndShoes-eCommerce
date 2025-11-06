<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Product;

class CheckProductImages extends Command
{
    protected $signature = 'check:product-images';
    protected $description = 'Check product images';

    public function handle()
    {
        $this->info('=== PRODUCT IMAGES CHECK ===');
        
        $totalProducts = Product::count();
        $productsWithImages = Product::whereNotNull('image')->count();
        
        $this->info("Total products: $totalProducts");
        $this->info("Products with images: $productsWithImages");
        $this->info('');
        
        // Show first 5 products
        $products = Product::take(5)->get();
        
        foreach ($products as $product) {
            $this->info("ID: {$product->id} | Name: {$product->name} | Image: " . ($product->image ?? 'NULL'));
        }
        
        if ($productsWithImages > 0) {
            $this->info('');
            $this->info('Sample product with image:');
            $productWithImage = Product::whereNotNull('image')->first();
            $this->info("Image path: {$productWithImage->image}");
            $this->info("Full URL: " . config('app.url') . '/storage/' . $productWithImage->image);
        }
        
        return 0;
    }
}
