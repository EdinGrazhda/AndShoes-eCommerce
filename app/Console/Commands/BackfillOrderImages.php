<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Order;
use App\Services\ImageUrlNormalizer;

class BackfillOrderImages extends Command
{
    protected $signature = 'orders:backfill-images {--force : Run without confirmation}';
    protected $description = 'Backfill missing orders.product_image using product media or product.image';

    public function handle()
    {
        if (! $this->option('force')) {
            if (! $this->confirm('This will update orders.product_image for orders missing it. Continue?')) {
                $this->info('Cancelled.');
                return 0;
            }
        }

        $updated = 0;
        $skipped = 0;

        Order::with('product')
            ->whereNull('product_image')
            ->orWhere('product_image', '')
            ->chunk(100, function ($orders) use (&$updated, &$skipped) {
                foreach ($orders as $order) {
                    $url = ImageUrlNormalizer::fromProduct($order->product);
                    if ($url) {
                        $order->product_image = $url;
                        $order->save();
                        $this->info("Updated order #{$order->id} -> product_image: {$url}");
                        $updated++;
                    } else {
                        $this->warn("Skipped order #{$order->id} - no product image available");
                        $skipped++;
                    }
                }
            });

        $this->info("Done. Updated: {$updated}, Skipped: {$skipped}");

        return 0;
    }
}
