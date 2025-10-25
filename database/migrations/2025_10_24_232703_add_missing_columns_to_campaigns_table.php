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
            // Add missing columns if they don't exist
            if (!Schema::hasColumn('campaigns', 'price')) {
                $table->decimal('price', 10, 2)->after('description');
            }
            if (!Schema::hasColumn('campaigns', 'banner_image')) {
                $table->string('banner_image')->nullable()->after('product_id');
            }
            if (!Schema::hasColumn('campaigns', 'banner_color')) {
                $table->string('banner_color', 20)->nullable()->after('banner_image');
            }
            if (!Schema::hasColumn('campaigns', 'is_active')) {
                $table->boolean('is_active')->default(true)->after('banner_color');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('campaigns', function (Blueprint $table) {
            $table->dropColumn(['price', 'banner_image', 'banner_color', 'is_active']);
        });
    }
};
