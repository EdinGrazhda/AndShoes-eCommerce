<?php

use Inertia\Inertia;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ProductsController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\OrderController;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

// Debug route to check products
Route::get('/debug/products', function () {
    $products = App\Models\Product::all(['id', 'name']);
    return response()->json($products);
});

// Public checkout route (no authentication required)
Route::get('checkout/{product}', [OrderController::class, 'checkout'])->name('checkout.show');

// Public order success page (no authentication required)
Route::get('order/success', [OrderController::class, 'success'])->name('order.success');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');

    Route::get('products',[ProductsController::class, 'index'])->name('products.index');
    Route::get('admin/products',[ProductsController::class, 'index'])->name('admin.products.index');
    Route::get('admin/categories',[CategoryController::class, 'index'])->name('admin.categories.index');
    Route::get('admin/orders',[OrderController::class, 'index'])->name('admin.orders.index');
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
