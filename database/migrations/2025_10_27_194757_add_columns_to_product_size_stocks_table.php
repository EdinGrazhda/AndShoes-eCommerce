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
        Schema::table('product_size_stocks', function (Blueprint $table) {
            $table->foreignId('product_id')->after('id')->constrained()->onDelete('cascade');
            $table->string('size', 10)->after('product_id');
            $table->integer('quantity')->default(0)->after('size');
            
            // Ensure unique size per product
            $table->unique(['product_id', 'size']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('product_size_stocks', function (Blueprint $table) {
            $table->dropUnique(['product_id', 'size']);
            $table->dropForeign(['product_id']);
            $table->dropColumn(['product_id', 'size', 'quantity']);
        });
    }
};
