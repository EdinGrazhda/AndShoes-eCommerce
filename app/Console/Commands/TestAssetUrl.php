<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Order;

class TestAssetUrl extends Command
{
    protected $signature = 'test:asset-url {--orderId=}';
    protected $description = 'Test what asset() helper generates for order product image';

    public function handle()
    {
        $orderId = $this->option('orderId');
        $order = Order::with('product')->when($orderId, fn($q) => $q->where('id', $orderId))->latest()->first();

        if (!$order) {
            $this->error('No order found');
            return 1;
        }

        $this->info("Order ID: {$order->id}");
        $this->info("Product: {$order->product_name}");
        $this->newLine();

        // Test the logic from the email template
        $mediaPath = null;
        
        if (!empty($order->product_image)) {
            if (preg_match('/^https?:\/\//i', $order->product_image)) {
                $mediaPath = $order->product_image;
                $this->info("✓ Order snapshot is absolute URL (used as-is):");
            } else {
                $mediaPath = asset('storage/' . ltrim($order->product_image, '/'));
                $this->info("✓ Order snapshot is relative, using asset():");
            }
            $this->line("  {$mediaPath}");
        }
        
        if (empty($mediaPath) && isset($order->product)) {
            if ($order->product->hasMedia('images')) {
                $media = $order->product->getFirstMedia('images');
                $relativePath = str_replace('public/', '', $media->id . '/' . $media->file_name);
                $mediaPath = asset('storage/' . $relativePath);
                $this->info("✓ Using product media with asset():");
                $this->line("  {$mediaPath}");
            } elseif (!empty($order->product->image)) {
                $mediaPath = asset('storage/' . ltrim($order->product->image, '/'));
                $this->info("✓ Using product.image column with asset():");
                $this->line("  {$mediaPath}");
            }
        }

        if (empty($mediaPath)) {
            $this->warn('⚠ No image path resolved');
        }

        $this->newLine();
        $this->info("config('app.url'): " . config('app.url'));

        return 0;
    }
}
