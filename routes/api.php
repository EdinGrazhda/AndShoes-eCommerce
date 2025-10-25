<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\API\ProductsController;
use App\Http\Controllers\API\CategoryController;
use App\Http\Controllers\API\CampaignController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\DashboardController;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

// Dashboard statistics
Route::get('/dashboard/stats', [DashboardController::class, 'stats'])->name('api.dashboard.stats');

// Products API routes
Route::prefix('products')->group(function () {
    Route::get('/', [ProductsController::class, 'index'])->name('api.products.index');
    Route::post('/', [ProductsController::class, 'store'])->name('api.products.store');
    Route::get('/{id}', [ProductsController::class, 'show'])->name('api.products.show');
    Route::put('/{id}', [ProductsController::class, 'update'])->name('api.products.update');
    Route::delete('/{id}', [ProductsController::class, 'destroy'])->name('api.products.destroy');
    Route::post('/bulk-update', [ProductsController::class, 'bulkUpdate'])->name('api.products.bulk-update');
    Route::post('/bulk-delete', [ProductsController::class, 'bulkDelete'])->name('api.products.bulk-delete');
});

// Categories API routes
Route::prefix('categories')->group(function () {
    Route::get('/', [CategoryController::class, 'index'])->name('api.categories.index');
    Route::post('/', [CategoryController::class, 'store'])->name('api.categories.store');
    Route::get('/tree', [CategoryController::class, 'tree'])->name('api.categories.tree');
    Route::get('/{id}', [CategoryController::class, 'show'])->name('api.categories.show');
    Route::put('/{id}', [CategoryController::class, 'update'])->name('api.categories.update');
    Route::delete('/{id}', [CategoryController::class, 'destroy'])->name('api.categories.destroy');
});

// Campaigns API routes
Route::prefix('campaigns')->group(function () {
    Route::get('/', [CampaignController::class, 'index'])->name('api.campaigns.index');
    Route::get('/active', [CampaignController::class, 'active'])->name('api.campaigns.active');
    Route::post('/', [CampaignController::class, 'store'])->name('api.campaigns.store');
    Route::get('/{id}', [CampaignController::class, 'show'])->name('api.campaigns.show');
    Route::put('/{id}', [CampaignController::class, 'update'])->name('api.campaigns.update');
    Route::delete('/{id}', [CampaignController::class, 'destroy'])->name('api.campaigns.destroy');
});

// Orders API routes
Route::prefix('orders')->group(function () {
    Route::get('/', [OrderController::class, 'index'])->name('api.orders.index');
    Route::post('/', [OrderController::class, 'store'])->name('api.orders.store');
    Route::get('/{order}', [OrderController::class, 'show'])->name('api.orders.show');
    Route::put('/{order}', [OrderController::class, 'update'])->name('api.orders.update');
    Route::delete('/{order}', [OrderController::class, 'destroy'])->name('api.orders.destroy');
});

