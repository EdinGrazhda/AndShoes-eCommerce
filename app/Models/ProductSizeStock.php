<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProductSizeStock extends Model
{
    protected $fillable = [
        'product_id',
        'size',
        'quantity',
    ];

    protected $casts = [
        'quantity' => 'integer',
    ];

    /**
     * Get the product that owns the size stock
     */
    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    /**
     * Get stock status for this size
     * 0 = out of stock
     * 1-10 = low stock
     * 11+ = in stock
     */
    public function getStockStatusAttribute(): string
    {
        if ($this->quantity === 0) {
            return 'out of stock';
        } elseif ($this->quantity <= 10) {
            return 'low stock';
        }
        return 'in stock';
    }
}
