<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->string('unique_id')->unique(); // Unique identifier for the order
            
            // Customer Information
            $table->string('customer_full_name');
            $table->string('customer_email');
            $table->string('customer_phone');
            $table->text('customer_address');
            $table->string('customer_city');
            $table->enum('customer_country', ['albania', 'kosovo', 'macedonia']);
            
            // Product Information
            $table->foreignId('product_id')->constrained()->onDelete('cascade');
            $table->string('product_name'); // Store product name at time of order
            $table->decimal('product_price', 8, 2); // Store price at time of order
            $table->string('product_image')->nullable(); // Store image path at time of order
            $table->string('product_size')->nullable(); // Selected size/foot number
            $table->string('product_color')->nullable(); // Selected color
            $table->integer('quantity')->default(1);
            
            // Order Details
            $table->decimal('total_amount', 8, 2);
            $table->enum('payment_method', ['cash'])->default('cash');
            $table->enum('status', ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'])->default('pending');
            $table->text('notes')->nullable();
            
            // Tracking
            $table->timestamp('confirmed_at')->nullable();
            $table->timestamp('shipped_at')->nullable();
            $table->timestamp('delivered_at')->nullable();
            
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};
