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
        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->string('name')->index(); // Index for search and filtering
            $table->text('description')->nullable();
            $table->decimal('price', 10, 2)->index(); // Increased precision, indexed for price filters/sorting
            $table->string('image')->nullable();
            $table->string('stock')->default('in stock')->index(); // Index for stock status filtering
            $table->string('foot_numbers')->nullable()->index(); // Index for size filtering
            $table->string('color')->nullable()->index(); // Index for color filtering
            $table->timestamps();
            
            // Composite index for common query patterns
            $table->index(['stock', 'price'], 'stock_price_idx'); // For filtering available products by price
            $table->index(['color', 'foot_numbers'], 'color_size_idx'); // For filtering by color and size
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};
