<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Order;
use App\Mail\OrderPlaced;
use App\Mail\OrderNotificationAdmin;
use Illuminate\Support\Facades\Mail;

class TestCidEmbedding extends Command
{
    protected $signature = 'test:cid-embedding {--orderId=}';
    protected $description = 'Test CID inline image embedding by logging the mailable structure';

    public function handle()
    {
        $orderId = $this->option('orderId');
        $order = Order::with('product')->when($orderId, fn($q) => $q->where('id', $orderId))->latest()->first();

        if (!$order) {
            $this->error('No order found');
            return 1;
        }

        $this->info("Testing CID embedding for Order #{$order->id}");
        $this->info("Product: {$order->product_name}");
        $this->newLine();

        // Test customer mailable
        $this->info("=== Testing OrderPlaced (Customer Email) ===");
        $customerMail = new OrderPlaced($order);
        $customerMail->build();
        
        if ($customerMail->productImageCid) {
            $this->info("✓ CID generated: {$customerMail->productImageCid}");
        } else {
            $this->warn("⚠ No CID generated (image file may not exist)");
        }

        $this->newLine();

        // Test admin mailable
        $this->info("=== Testing OrderNotificationAdmin (Admin Email) ===");
        $adminMail = new OrderNotificationAdmin($order);
        $adminMail->build();
        
        if ($adminMail->productImageCid) {
            $this->info("✓ CID generated: {$adminMail->productImageCid}");
        } else {
            $this->warn("⚠ No CID generated (image file may not exist)");
        }

        $this->newLine();
        
        // Check if image file exists
        $imagePath = null;
        if ($order->product && $order->product->hasMedia('images')) {
            $media = $order->product->getFirstMedia('images');
            $imagePath = $media ? $media->getPath() : null;
        } elseif ($order->product && !empty($order->product->image)) {
            $imagePath = storage_path('app/public/' . ltrim($order->product->image, '/'));
        }

        if ($imagePath) {
            $this->info("Image path: {$imagePath}");
            if (file_exists($imagePath)) {
                $this->info("✓ Image file exists (" . round(filesize($imagePath) / 1024, 2) . " KB)");
            } else {
                $this->error("✗ Image file does NOT exist at this path");
            }
        } else {
            $this->warn("⚠ No image path resolved");
        }

        return 0;
    }
}
