<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Mail;
use App\Models\Order;
use App\Mail\OrderPlaced;

class TestEmail extends Command
{
    protected $signature = 'test:email';
    protected $description = 'Test email sending functionality';

    public function handle()
    {
        $this->info('Testing email configuration...');
        
        // Get the latest order to test with
        $order = Order::latest()->first();
        
        if (!$order) {
            $this->error('No orders found in database. Create an order first.');
            return 1;
        }
        
        $this->info("Using order ID: {$order->id}");
        $this->info("Sending to: {$order->customer_email}");
        
        try {
            Mail::to($order->customer_email)->send(new OrderPlaced($order));
            $this->info('✓ Email sent successfully!');
            $this->info('Check the email inbox for: ' . $order->customer_email);
            return 0;
        } catch (\Exception $e) {
            $this->error('✗ Failed to send email');
            $this->error('Error: ' . $e->getMessage());
            $this->error('Trace: ' . $e->getTraceAsString());
            return 1;
        }
    }
}
