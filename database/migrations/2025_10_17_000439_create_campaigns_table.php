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
        Schema::create('campaigns', function (Blueprint $table) {
            $table->id();
            $table->string('name')->index(); // Index for campaign lookups
            $table->text('description')->nullable();
            $table->decimal('price', 10, 2); // Campaign discount price, increased precision
            $table->date('start_date')->nullable()->index(); // Index for date filtering
            $table->date('end_date')->nullable()->index(); // Index for date filtering
            $table->foreignId('product_id')->constrained('products')->onDelete('cascade'); // Explicit table reference
            $table->timestamps();
            
            // Composite index for finding active campaigns
            $table->index(['start_date', 'end_date'], 'active_campaigns_idx');
            
            // Index for product campaigns lookup
            $table->index('product_id', 'campaign_product_idx');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('campaigns');
    }
};
