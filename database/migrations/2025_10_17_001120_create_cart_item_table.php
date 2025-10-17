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
        Schema::create('cart_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained('products')->onDelete('cascade'); // Explicit table reference
            $table->integer('quantity')->unsigned()->default(1); // Ensure positive values
            $table->decimal('price', 10, 2); // Increased precision
            $table->decimal('total', 10, 2);
            $table->timestamps();
            
            // Index for product cart items lookup
            $table->index('product_id', 'cart_product_idx');
            
            // Index for cart cleanup queries (old carts)
            $table->index('created_at', 'cart_created_idx');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('cart_items');
    }
};
