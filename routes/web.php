<?php

use Inertia\Inertia;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ProductsController;
use App\Http\Controllers\CampaignController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\CategoryController;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');

    Route::get('products',[ProductsController::class, 'index'])->name('products.index');
    Route::get('admin/products',[ProductsController::class, 'index'])->name('admin.products.index');
    Route::get('admin/campaigns',[CampaignController::class, 'index'])->name('admin.campaigns.index');
    Route::get('admin/orders',[OrderController::class, 'index'])->name('admin.orders.index');
    Route::get('admin/categories',[CategoryController::class, 'index'])->name('admin.categories.index');
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
