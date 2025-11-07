<?php

namespace App\Jobs;

use App\Mail\OrderStatusUpdated;
use App\Models\Order;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class SendOrderStatusUpdateEmail implements ShouldQueue
{
    use Queueable;

    public Order $order;
    public string $previousStatus;
    public string $newStatus;

    /**
     * Create a new job instance.
     */
    public function __construct(Order $order, string $previousStatus, string $newStatus)
    {
        $this->order = $order;
        $this->previousStatus = $previousStatus;
        $this->newStatus = $newStatus;
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        try {
            // Load the product relationship for the email
            $this->order->load('product');
            
            // Send email to customer
            Mail::to($this->order->customer_email)->send(
                new OrderStatusUpdated($this->order, $this->previousStatus, $this->newStatus)
            );

            Log::info("Order status update email sent successfully", [
                'order_id' => $this->order->id,
                'customer_email' => $this->order->customer_email,
                'previous_status' => $this->previousStatus,
                'new_status' => $this->newStatus,
            ]);
        } catch (\Exception $e) {
            Log::error("Failed to send order status update email", [
                'order_id' => $this->order->id,
                'customer_email' => $this->order->customer_email,
                'previous_status' => $this->previousStatus,
                'new_status' => $this->newStatus,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            // Re-throw the exception to trigger retry mechanism
            throw $e;
        }
    }

    /**
     * Handle a job failure.
     */
    public function failed(\Throwable $exception): void
    {
        Log::error("Order status update email job failed permanently", [
            'order_id' => $this->order->id,
            'customer_email' => $this->order->customer_email,
            'previous_status' => $this->previousStatus,
            'new_status' => $this->newStatus,
            'error' => $exception->getMessage(),
        ]);
    }
}
