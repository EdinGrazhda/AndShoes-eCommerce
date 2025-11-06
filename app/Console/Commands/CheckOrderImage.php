<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Order;

class CheckOrderImage extends Command
{
    protected $signature = 'check:order-image';
    protected $description = 'Check order image path';

    public function handle()
    {
        $order = Order::with('product')->latest()->first();
        
        if (!$order) {
            $this->error('No orders found');
            return 1;
        }
        
        $this->info('=== ORDER IMAGE DEBUG ===');
        $this->info('Order ID: ' . $order->id);
        $this->info('Product ID: ' . $order->product_id);
        $this->info('Product Name: ' . $order->product_name);
        $this->info('');
        $this->info('Product Image (from order): ' . ($order->product_image ?? 'NULL'));
        $this->info('Product Image (from product relation): ' . ($order->product->image ?? 'NULL'));
        $this->info('');
        
        if ($order->product_image) {
            $this->info('Full URL: ' . config('app.url') . '/storage/' . $order->product_image);
        } else {
            $this->warn('⚠️ Product image is NULL in order table!');
            if ($order->product && $order->product->image) {
                $this->info('But product has image: ' . $order->product->image);
                $this->info('Full URL would be: ' . config('app.url') . '/storage/' . $order->product->image);
            }
        }
        
        return 0;
    }
}
