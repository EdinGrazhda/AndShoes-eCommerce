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
            $table->string('slug')->unique()->index(); // URL-friendly identifier
            $table->text('description')->nullable();
            $table->unsignedBigInteger('parent_id')->nullable()->index(); // For hierarchical categories
            $table->integer('sort_order')->default(0)->index(); // For custom ordering
            $table->boolean('is_active')->default(true)->index(); // For enabling/disabling categories
            $table->timestamps();
            
            // Foreign key for parent category (self-referencing)
            $table->foreign('parent_id')->references('id')->on('categories')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::disableForeignKeyConstraints();
        Schema::dropIfExists('categories');
        Schema::enableForeignKeyConstraints();
    }
};
