<?php

use Inertia\Inertia;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ProductsController;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');

    Route::get('products',[ProductsController::class, 'index'])->name('products.index');
    Route::get('admin/products',[ProductsController::class, 'index'])->name('admin.products.index');
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
