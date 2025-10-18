# 🛍️ Guest Checkout System - Complete Guide

## ✅ System Overview

Your AndShoes eCommerce platform supports **GUEST CHECKOUT** - customers can purchase products **WITHOUT creating an account**. All guest orders appear in your admin panel for management.

---

## 🎯 How It Works

### For Customers (No Login Required)

#### Step 1: Browse Products

- Visit: `http://127.0.0.1:8000`
- Browse available shoes
- No account needed

#### Step 2: Add to Cart & Checkout

- Click "Add to Cart" on any product
- Open cart drawer
- Click "Proceed to Checkout"
- **OR** Click "Buy Now" directly on product

#### Step 3: Fill Customer Information (Modal Step 1)

Required fields:

- Full Name
- Email Address
- Phone Number
- Street Address
- City
- Country (Albania, Kosovo, or Macedonia)

#### Step 4: Verify Product Details (Modal Step 2)

- Size selection
- Color selection
- Quantity
- Special notes (optional)

#### Step 5: Confirm Order (Modal Step 3)

- Review all information
- Confirm payment method: **Cash on Delivery**
- Submit order

#### Step 6: Order Confirmation

- Automatic redirect to success page
- Shows unique Order ID (e.g., ORD-12345678)
- Order details displayed
- **No account created - Guest checkout complete!**

---

## 👨‍💼 For Admin (You)

### Accessing Admin Panel

⚠️ **Important**: You MUST be logged in to access the admin panel

1. **Login URL**: `http://127.0.0.1:8000/login`
2. Enter your admin credentials
3. After login, you'll have access to:
    - Dashboard
    - Products Management
    - Categories Management
    - **Orders Management** ← All guest orders appear here

### Viewing Orders

**URL**: `http://127.0.0.1:8000/admin/orders`

Features:

- ✅ View all customer orders (including guest orders)
- ✅ Search by Order ID, customer name, email, product
- ✅ Filter by:
    - Status (pending, confirmed, processing, shipped, delivered, cancelled)
    - Country (Albania, Kosovo, Macedonia)
    - Date range
- ✅ Update order status
- ✅ View full customer details
- ✅ View product snapshot (name, price, size, color, quantity)
- ✅ Delete orders

---

## 🔐 Authentication Requirements

| Page/Action      | Requires Login? | Who Can Access?  |
| ---------------- | --------------- | ---------------- |
| Homepage         | ❌ No           | Everyone         |
| Product Browsing | ❌ No           | Everyone         |
| Checkout         | ❌ No           | Everyone (Guest) |
| Place Order      | ❌ No           | Everyone (Guest) |
| Order Success    | ❌ No           | Everyone (Guest) |
| Admin Dashboard  | ✅ Yes          | Admin Only       |
| Admin Orders     | ✅ Yes          | Admin Only       |
| Admin Products   | ✅ Yes          | Admin Only       |
| Admin Categories | ✅ Yes          | Admin Only       |

---

## 📊 Order Data Flow

### Guest Places Order:

```
Customer fills form → POST /api/orders → Order created in database
```

### Order Contains:

```php
- unique_id: "ORD-XXXXXXXX"
- customer_full_name
- customer_email
- customer_phone
- customer_address
- customer_city
- customer_country
- product_id (reference)
- product_name (snapshot)
- product_price (snapshot)
- product_image (snapshot)
- product_size
- product_color
- quantity
- total_amount
- payment_method: "cash"
- status: "pending" (default)
- notes
- timestamps
```

### Admin Views Orders:

```
Admin logs in → Visits /admin/orders → Sees all orders
```

---

## 🧪 Testing the System

### Test Guest Checkout:

1. **Open homepage** in incognito/private browser window:

    ```
    http://127.0.0.1:8000
    ```

2. **Click any product** → "Buy Now"

3. **Fill checkout form**:
    - Name: Test Customer
    - Email: test@example.com
    - Phone: +355 69 123 4567
    - Address: Rr. Tirana, Nr. 123
    - City: Tirana
    - Country: Albania

4. **Select product details**:
    - Size: 42
    - Color: Black
    - Quantity: 1

5. **Confirm order** → Should see success page

6. **Note the Order ID** (e.g., ORD-12345678)

### Verify in Admin Panel:

1. **Open new browser tab** (keep guest tab open)

2. **Login as admin**:

    ```
    http://127.0.0.1:8000/login
    ```

3. **Go to orders**:

    ```
    http://127.0.0.1:8000/admin/orders
    ```

4. **Search for the Order ID** you noted

5. **Verify all customer data** appears correctly

---

## 🐛 Troubleshooting

### Problem: Blank Page at /admin/orders

**Solutions**:

1. ✅ Make sure you're logged in first
2. ✅ Check browser console for JavaScript errors (F12)
3. ✅ Clear cache: `php artisan cache:clear`
4. ✅ Rebuild assets: `npm run build`
5. ✅ Check Laravel logs: `storage/logs/laravel.log`

### Problem: Can't Place Order as Guest

**Check**:

1. ✅ Is `/api/orders` route accessible?
    ```
    php artisan route:list --name=api.orders
    ```
2. ✅ Check browser console for errors
3. ✅ Verify form validation

### Problem: Orders Not Showing in Admin

**Check**:

1. ✅ Are you logged in?
2. ✅ Are there orders in database?
3. ✅ Check filters - clear all filters to see all orders

---

## 📁 Key Files

### Backend

- `routes/web.php` - Web routes (checkout, success)
- `routes/api.php` - API routes (order creation)
- `app/Http/Controllers/OrderController.php` - Order logic
- `app/Models/Order.php` - Order model
- `database/migrations/*_create_orders_table.php` - Database structure

### Frontend

- `resources/js/pages/welcome.tsx` - Homepage with products
- `resources/js/pages/checkout/index.tsx` - Guest checkout page
- `resources/js/pages/order/success.tsx` - Order confirmation
- `resources/js/pages/admin/orders/index.tsx` - Admin orders management
- `resources/js/layouts/public-layout.tsx` - Public pages layout
- `resources/js/layouts/app-layout.tsx` - Admin pages layout

---

## ✨ Features

### Guest Checkout Features:

- ✅ No account registration required
- ✅ 3-step modal checkout process
- ✅ Real-time form validation
- ✅ Albania, Kosovo, Macedonia support
- ✅ Cash on Delivery payment
- ✅ Order confirmation page
- ✅ Unique order tracking ID

### Admin Features:

- ✅ View all orders (guest + registered)
- ✅ Advanced filtering and search
- ✅ Order status management
- ✅ Customer contact information
- ✅ Product details snapshot
- ✅ Order timeline tracking
- ✅ Pagination for large datasets

---

## 🚀 Quick Start

1. **Start the server**:

    ```bash
    php artisan serve
    ```

2. **Build assets** (if needed):

    ```bash
    npm run build
    ```

3. **Create test orders** (optional):

    ```bash
    php artisan db:seed --class=OrderSeeder
    ```

4. **Access the site**:
    - Customer site: `http://127.0.0.1:8000`
    - Admin login: `http://127.0.0.1:8000/login`
    - Admin orders: `http://127.0.0.1:8000/admin/orders`

---

## 📞 Support

Your guest checkout system is fully functional! Customers can order without accounts, and all orders appear in your admin panel.

**Need help?**

- Check this guide
- Review Laravel logs: `storage/logs/laravel.log`
- Check browser console (F12) for frontend errors
