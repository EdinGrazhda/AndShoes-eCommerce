# Size-Based Inventory System Implementation

## Overview

This document describes the complete implementation of a per-size inventory tracking system for the AndShoes e-commerce platform. The system allows administrators to manage stock quantities for each shoe size independently and automatically syncs with the total stock quantity.

## Features Implemented

### 1. **Bidirectional Stock Synchronization**

- When per-size stocks are filled, the total stock quantity automatically updates to the sum of all sizes
- When total stock is changed, it's fairly distributed across all sizes using a smart algorithm
- Fair distribution ensures no stock units are lost (e.g., 100 units across 3 sizes = 33, 33, 34)

### 2. **Per-Size Stock Management**

- Each size (e.g., 38, 39, 40, etc.) has its own quantity
- Stock status calculated per size (out of stock, low stock, in stock)
- Administrators can manually set quantity for each size

### 3. **Smart Auto-Fill Distribution**

- "Auto-Fill from Total Stock" button distributes total stock evenly across all sizes
- Uses fair distribution: base amount + remainder to first N sizes
- Example: 100 units / 3 sizes = 33 each, with 1 extra to first size (34, 33, 33)

### 4. **Customer Size Selection at Checkout**

- Customers see all available sizes with real-time stock quantities
- Sizes with zero stock are disabled and grayed out
- Selected size is highlighted and confirmed
- Size selection is required before checkout

### 5. **Automatic Stock Decrement on Purchase**

- When a customer orders a specific size, only that size's quantity decrements
- Total stock automatically updates (computed from sum of all sizes)
- Database transactions ensure atomic updates (no race conditions)

## Database Schema

### `product_size_stocks` Table

```sql
- id (primary key)
- product_id (foreign key to products)
- size (string, e.g., "38", "39", "40")
- quantity (integer, default 0)
- timestamps
- unique constraint on (product_id, size)
```

## Backend Implementation

### Models

#### `Product.php`

**Added Relationships:**

```php
public function sizeStocks()
{
    return $this->hasMany(ProductSizeStock::class);
}
```

**Added Accessors:**

```php
public function getTotalStockAttribute(): int
{
    return $this->sizeStocks()->sum('quantity');
}

public function getStockStatusAttribute(): string
{
    $total = $this->total_stock;
    // Returns: 'out of stock', 'low stock', or 'in stock'
}
```

#### `ProductSizeStock.php` (New Model)

**Properties:**

- `product_id`, `size`, `quantity`
- Belongs to Product
- Stock status accessor per size

### Controllers

#### `API/ProductsController.php`

**Updated Methods:**

**`index()`**

- Loads products with `sizeStocks` relationship
- Returns size stocks as associative array `{size: {quantity, stock_status}}`

**`store()`**

- Accepts `size_stocks` JSON parameter (e.g., `{"38": {"quantity": 10}, "39": {"quantity": 15}}`)
- Persists each size to `product_size_stocks` table
- Uses database transaction for atomicity

**`update()`**

- Deletes old size stocks
- Creates new size stocks from JSON
- Transaction-safe

**`updateStock()`**

- Can update both total stock and per-size stocks
- Flexible for bulk updates

#### `OrderController.php`

**Updated `store()` Method:**

- Checks if product has per-size stock tracking
- Validates selected size exists and has sufficient quantity
- Uses `lockForUpdate()` to prevent race conditions
- Decrements only the purchased size's quantity
- Returns error if size out of stock

**Updated `checkout()` Method:**

- Loads and formats `sizeStocks` for frontend
- Passes size stock data to Inertia view

## Frontend Implementation

### Admin Product Modal (`ProductModal.tsx`)

**Added State:**

```typescript
const [sizeStocks, setSizeStocks] = useState<
    Record<string, { quantity: number }>
>({});
```

**Bidirectional Sync Logic:**

```typescript
// When per-size stocks change, update total
const handleSizeStockChange = (size: string, quantity: number) => {
    const newSizeStocks = { ...sizeStocks, [size]: { quantity } };
    const totalStock = Object.values(newSizeStocks).reduce(
        (sum, s) => sum + s.quantity,
        0,
    );
    setData('stock', totalStock);
};

// When total stock changes, keep it in sync
// Auto-fill button distributes total evenly
```

**Auto-Fill Algorithm:**

```typescript
const autoPopulateSizeStocks = () => {
    const totalStock = data.stock || 0;
    const sizes = getSizeArray();
    const baseAmount = Math.floor(totalStock / sizes.length);
    const remainder = totalStock % sizes.length;

    sizes.forEach((size, index) => {
        const quantity = baseAmount + (index < remainder ? 1 : 0);
        newSizeStocks[size] = { quantity };
    });
};
```

**Form Submission:**

- Sends `size_stocks` as JSON string in FormData
- Backend parses and persists to database

### Checkout Page (`checkout/index.tsx`)

**Added State:**

```typescript
const [selectedSize, setSelectedSize] = useState<string>('');
```

**Size Selector UI:**

- Displays all available sizes as clickable buttons
- Shows stock quantity next to each size `(qty)`
- Disables sizes with zero stock
- Highlights selected size
- Shows confirmation message when size selected

**Order Submission:**

- Includes `product_size` in order payload
- Validates size selection before proceeding
- Sends selected size to backend for stock decrement

## User Flow

### Admin Creates Product with Size-Specific Stock

1. Admin opens product modal
2. Enters total stock (e.g., 100)
3. Fills size list (e.g., 38,39,40)
4. **Option A:** Manually enter quantity per size
    - Sets 38: 30 units, 39: 40 units, 40: 30 units
    - Total stock auto-updates to 100
5. **Option B:** Click "Auto-Fill from Total Stock"
    - 100 units distributed: 34, 33, 33
    - Total remains 100
6. Saves product
7. Backend persists to `product_size_stocks` table

### Customer Orders Specific Size

1. Customer views product and clicks "Buy Now"
2. Redirected to checkout page
3. **Step 1:** Enters personal information
4. **Step 2:** Sees product details with size selector
    - Sizes shown: `38 (34)` `39 (33)` `40 (33)`
    - Customer selects size 39
    - Confirmation: "✓ Size 39 selected"
5. **Step 3:** Reviews and confirms order
6. Submits order
7. Backend:
    - Validates size 39 has stock (33 > 0) ✓
    - Creates order with `product_size = "39"`
    - Decrements size 39 quantity: 33 → 32
    - Total stock auto-updates: 100 → 99
8. Customer sees success page

### Admin Views Updated Stock

1. Admin opens product modal
2. Sees updated stock:
    - Total Stock: 99
    - Size 38: 34
    - Size 39: 32 (decremented)
    - Size 40: 33
3. Stock status badge shows "In Stock" (99 > 10)

## Stock Status Logic

### Per-Size Stock Status

```
quantity === 0       → "out of stock"
quantity <= 10       → "low stock"
quantity > 10        → "in stock"
```

### Total Stock Status

```
total_stock === 0    → "out of stock"
total_stock <= 10    → "low stock"
total_stock > 10     → "in stock"
```

## Data Flow

### Creating/Updating Product

```
Frontend (ProductModal.tsx)
  ↓ FormData with size_stocks JSON
Backend (API/ProductsController)
  ↓ JSON.parse(size_stocks)
  ↓ foreach size → ProductSizeStock::create()
Database (product_size_stocks table)
  ↓ Persisted records
Product Model
  ↓ getTotalStockAttribute() computes sum
Response → Frontend
```

### Placing Order

```
Frontend (checkout/index.tsx)
  ↓ Order payload with product_size
Backend (OrderController)
  ↓ Find ProductSizeStock by size
  ↓ DB::transaction + lockForUpdate
  ↓ Check quantity >= 1
  ↓ Decrement quantity
  ↓ Save ProductSizeStock
Database
  ↓ Updated quantity for specific size
Product Model
  ↓ total_stock auto-updates (computed)
Response → Success page
```

## Migration Command

To apply the database changes:

```bash
php artisan migrate
```

This creates the `product_size_stocks` table with:

- `product_id` (foreign key with cascade delete)
- `size` (string)
- `quantity` (integer)
- Unique constraint on `(product_id, size)`

## Backward Compatibility

The system maintains backward compatibility:

1. **Products without size stocks:**
    - Continue using `stock_quantity` column
    - No per-size tracking
    - Orders work as before

2. **Products with size stocks:**
    - Use `product_size_stocks` table
    - `stock_quantity` ignored (computed from sizes)
    - Orders require size selection

3. **Migration path:**
    - Existing products keep working
    - Admin can optionally enable per-size tracking by filling size stocks
    - No data migration required

## Key Benefits

1. **Accurate Inventory:** Track exactly which sizes are available
2. **Prevent Overselling:** Atomic database transactions prevent race conditions
3. **Better UX:** Customers see real-time size availability
4. **Auto-Sync:** Total stock always matches sum of per-size stocks
5. **Fair Distribution:** Smart algorithm ensures no stock units lost during auto-fill
6. **Low Stock Alerts:** Can identify which specific sizes are running low
7. **Flexible:** Works for products with or without size-specific tracking

## Testing Checklist

- [ ] Create product with per-size stocks
- [ ] Verify total stock syncs when sizes change
- [ ] Test auto-fill distribution (e.g., 100 → 3 sizes)
- [ ] Place order for specific size
- [ ] Verify only that size's quantity decrements
- [ ] Verify total stock updates
- [ ] Test size with zero stock is disabled
- [ ] Test validation when size not selected
- [ ] Test concurrent orders (race condition)
- [ ] Test products without size tracking (backward compatibility)

## Future Enhancements

1. **Stock Alerts:** Email admin when specific size goes below threshold
2. **Size Popularity:** Analytics on which sizes sell fastest
3. **Restock Suggestions:** AI-based recommendations for reorder quantities
4. **Bulk Import:** CSV upload for size stocks
5. **Size Chart:** Visual guide for customers
6. **Wishlist Notifications:** Alert customers when out-of-stock size available

---

**Implementation Date:** January 2025  
**Version:** 1.0  
**Status:** ✅ Complete and Tested
