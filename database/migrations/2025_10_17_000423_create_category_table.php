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
        Schema::create('categories', function (Blueprint $table) {
            $table->id();
            $table->string('name')->index(); // Index for category lookups
            $table->text('description')->nullable();
            $table->foreignId('product_id')->constrained('products')->onDelete('cascade'); // Explicit table reference
            $table->timestamps();
            
            // Index for product-category relationship queries
            $table->index('product_id', 'category_product_idx');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('categories');
    }
};
