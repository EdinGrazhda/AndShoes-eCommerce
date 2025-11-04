<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Order;
use App\Services\ImageUrlNormalizer;

class DiagnoseOrderImage extends Command
{
    protected $signature = 'diagnose:order-image {--orderId=}';
    protected $description = 'Print media URLs and normalized URLs for the latest (or given) order';

    public function handle()
    {
        $orderId = $this->option('orderId');

        $query = Order::with('product');
        if ($orderId) {
            $query->where('id', $orderId);
        }

        $order = $query->latest()->first();

        if (! $order) {
            $this->error('No order found');
            return 1;
        }

        $this->info('ORDER_ID: ' . $order->id);
        $this->info('ORDER_SNAPSHOT (orders.product_image): ' . ($order->product_image ?? 'NULL'));
        $this->info('PRODUCT.image column: ' . ($order->product->image ?? 'NULL'));

        $media = optional($order->product->getFirstMedia('images'));
        $this->info('MEDIA getFullUrl(): ' . ($media ? $media->getFullUrl() : 'NULL'));
        $this->info('MEDIA getUrl(): ' . ($media ? $media->getUrl() : 'NULL'));
        $this->info('MEDIA getPath(): ' . ($media ? $media->getPath() : 'NULL'));

        $this->info('NORMALIZED (from order snapshot): ' . (ImageUrlNormalizer::normalize($order->product_image ?? null) ?? 'NULL'));
        $this->info('NORMALIZED (from product): ' . (ImageUrlNormalizer::fromProduct($order->product) ?? 'NULL'));

        return 0;
    }
}
