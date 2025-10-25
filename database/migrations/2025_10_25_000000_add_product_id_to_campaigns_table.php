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
        Schema::table('campaigns', function (Blueprint $table) {
            if (!Schema::hasColumn('campaigns', 'product_id')) {
                // Add product_id after description if possible
                $table->foreignId('product_id')->nullable()->constrained('products')->onDelete('cascade')->after('description');
                $table->index('product_id', 'campaign_product_idx');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('campaigns', function (Blueprint $table) {
            if (Schema::hasColumn('campaigns', 'product_id')) {
                $table->dropForeign(['product_id']);
                $table->dropIndex('campaign_product_idx');
                $table->dropColumn('product_id');
            }
        });
    }
};
