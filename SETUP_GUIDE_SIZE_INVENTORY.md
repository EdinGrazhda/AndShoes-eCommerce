# Quick Setup Guide - Size-Based Inventory

## Prerequisites

- Laravel project with existing `products` table
- Node.js and npm installed
- Database configured

## Setup Steps

### 1. Run Database Migration

```bash
php artisan migrate
```

This creates the `product_size_stocks` table.

### 2. Verify Migration

```bash
php artisan migrate:status
```

Look for: `2025_10_27_003041_create_product_size_stocks_table` with status "Ran"

### 3. Clear Caches (Optional but Recommended)

```bash
php artisan config:clear
php artisan cache:clear
php artisan route:clear
php artisan view:clear
```

### 4. Rebuild Frontend Assets

```bash
npm run build
```

Or for development:

```bash
npm run dev
```

## Testing the Implementation

### Test 1: Create Product with Size Stocks

1. Go to Admin Panel → Products
2. Click "Add New Product"
3. Fill in product details:
    - Name: "Nike Air Max"
    - Price: 120
    - Category: Select one
    - Gender: Male/Female/Unisex
4. **Stock Management:**
    - Enter total stock: 100
    - Enter foot numbers: 38,39,40,41,42
    - Click "Auto-Fill from Total Stock"
    - Verify sizes are distributed evenly (20 each)
5. Upload image and save
6. Check database:
    ```sql
    SELECT * FROM product_size_stocks WHERE product_id = [new_product_id];
    ```

### Test 2: Manual Size Stock Entry

1. Edit a product
2. Manually set sizes:
    - Size 38: 30 units
    - Size 39: 25 units
    - Size 40: 20 units
3. Verify total stock updates to 75 automatically
4. Save and check database

### Test 3: Customer Purchase Flow

1. Go to storefront
2. Click on a product with size stocks
3. Click "Buy Now"
4. Fill in customer information
5. **Size Selection Step:**
    - Verify all sizes shown with quantities
    - Select a size (e.g., 39)
    - Verify size is highlighted
6. Complete order
7. Check database:
    ```sql
    SELECT * FROM product_size_stocks WHERE product_id = [product_id] AND size = '39';
    -- Quantity should be decremented by 1
    ```

### Test 4: Out of Stock Size

1. Edit product in admin
2. Set one size to 0 quantity (e.g., Size 38: 0)
3. Save product
4. Go to checkout for this product
5. Verify size 38 is grayed out and disabled
6. Try to place order - should require selecting available size

### Test 5: Concurrent Orders (Race Condition Test)

1. Set a size to quantity = 1
2. Open checkout in two browser tabs
3. Try to order same size in both tabs simultaneously
4. Only one should succeed, other should get "insufficient stock" error

## API Endpoints

### Get Product with Size Stocks

```http
GET /api/products/{id}

Response:
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Nike Air Max",
    "price": 120,
    "total_stock": 100,
    "sizeStocks": {
      "38": {"quantity": 20, "stock_status": "in stock"},
      "39": {"quantity": 20, "stock_status": "in stock"},
      "40": {"quantity": 20, "stock_status": "in stock"}
    }
  }
}
```

### Create Product with Size Stocks

```http
POST /api/products
Content-Type: multipart/form-data

Fields:
- name: "Product Name"
- price: 120
- category_id: 1
- gender: "unisex"
- foot_numbers: "38,39,40,41,42"
- stock: 100
- size_stocks: '{"38":{"quantity":20},"39":{"quantity":20},...}'
- image: [file]
```

### Place Order with Size

```http
POST /api/orders

{
  "customer_full_name": "John Doe",
  "customer_email": "john@example.com",
  "customer_phone": "+1234567890",
  "customer_address": "123 Main St",
  "customer_city": "Tirana",
  "customer_country": "albania",
  "product_id": 1,
  "product_price": 120,
  "product_size": "39",
  "product_color": "Black",
  "quantity": 1,
  "notes": ""
}
```

## Database Queries

### Check Product Total Stock

```sql
SELECT p.id, p.name,
       (SELECT SUM(quantity) FROM product_size_stocks WHERE product_id = p.id) as total_stock
FROM products p;
```

### Find Low Stock Sizes

```sql
SELECT p.name, pss.size, pss.quantity
FROM product_size_stocks pss
JOIN products p ON pss.product_id = p.id
WHERE pss.quantity <= 10 AND pss.quantity > 0
ORDER BY pss.quantity ASC;
```

### Find Out of Stock Sizes

```sql
SELECT p.name, pss.size
FROM product_size_stocks pss
JOIN products p ON pss.product_id = p.id
WHERE pss.quantity = 0;
```

### Sales by Size Report

```sql
SELECT o.product_name, o.product_size, COUNT(*) as orders, SUM(o.quantity) as units_sold
FROM orders o
WHERE o.product_size IS NOT NULL
GROUP BY o.product_name, o.product_size
ORDER BY units_sold DESC;
```

## Troubleshooting

### Issue: Total stock not syncing

**Solution:** Check that `Product` model has `getTotalStockAttribute()` and `$appends` includes `'total_stock'`

### Issue: Size selector not showing

**Solution:**

1. Check product has `sizeStocks` relationship loaded
2. Verify `OrderController::checkout()` passes `sizeStocks` to view
3. Check browser console for TypeScript errors

### Issue: Order fails with "size required"

**Solution:**

1. Verify frontend sends `product_size` in order payload
2. Check `OrderController::store()` validation rules
3. Ensure customer selected a size before checkout

### Issue: Multiple sizes decrement instead of one

**Solution:**

1. Verify order payload includes `product_size`
2. Check `OrderController::store()` uses correct size in query:
    ```php
    ProductSizeStock::where('size', $request->product_size)
    ```

### Issue: Race condition causing overselling

**Solution:** Ensure `lockForUpdate()` is used:

```php
$sizeStock = ProductSizeStock::where('product_id', $product->id)
    ->where('size', $request->product_size)
    ->lockForUpdate()
    ->first();
```

## Rollback Plan

If you need to rollback:

```bash
# Rollback migration
php artisan migrate:rollback --step=1

# Or drop table manually
php artisan tinker
>> Schema::dropIfExists('product_size_stocks');
```

## Support

For issues or questions, refer to:

- `SIZE_BASED_INVENTORY_IMPLEMENTATION.md` - Full documentation
- Laravel Docs: https://laravel.com/docs/eloquent-relationships
- Inertia.js Docs: https://inertiajs.com/

---

**Setup Time:** ~5 minutes  
**Dependencies:** None (all included)  
**Complexity:** Medium
