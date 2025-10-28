<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\Product;
use App\Models\ProductSizeStock;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Inertia\Inertia;
use Inertia\Response;

class OrderController extends Controller
{
    public function index(Request $request): Response
    {
        $query = Order::with('product');

        // Apply search filter
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('unique_id', 'like', "%{$search}%")
                    ->orWhere('customer_full_name', 'like', "%{$search}%")
                    ->orWhere('customer_email', 'like', "%{$search}%")
                    ->orWhere('product_name', 'like', "%{$search}%");
            });
        }

        // Apply status filter
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        // Apply country filter
        if ($request->filled('country')) {
            $query->where('customer_country', $request->country);
        }

        // Apply payment method filter
        if ($request->filled('payment_method')) {
            $query->where('payment_method', $request->payment_method);
        }

        // Apply date range filter
        if ($request->filled('date_from')) {
            $query->whereDate('created_at', '>=', $request->date_from);
        }

        if ($request->filled('date_to')) {
            $query->whereDate('created_at', '<=', $request->date_to);
        }

        // Apply sorting
        $sortBy = $request->get('sort_by', 'created_at');
        $sortOrder = $request->get('sort_order', 'desc');
        $query->orderBy($sortBy, $sortOrder);

        // Paginate results
        $orders = $query->paginate(15);

        return Inertia::render('admin/orders/index', [
            'orders' => $orders->items(),
            'pagination' => [
                'current_page' => $orders->currentPage(),
                'last_page' => $orders->lastPage(),
                'per_page' => $orders->perPage(),
                'total' => $orders->total(),
                'from' => $orders->firstItem(),
                'to' => $orders->lastItem(),
            ],
            'filters' => $request->only(['search', 'status', 'country', 'payment_method', 'date_from', 'date_to', 'sort_by', 'sort_order']),
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'customer_full_name' => 'required|string|max:255',
            'customer_email' => 'required|email|max:255',
            'customer_phone' => 'required|string|max:20',
            'customer_address' => 'required|string|max:1000',
            'customer_city' => 'required|string|max:100',
            'customer_country' => 'required|in:albania,kosovo,macedonia',
            'product_id' => 'required|exists:products,id',
            'product_price' => 'required|numeric|min:0',
            'product_size' => 'nullable|string|max:50',
            'product_color' => 'nullable|string|max:50',
            'quantity' => 'required|integer|min:1|max:100',
            'notes' => 'nullable|string|max:1000',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            DB::beginTransaction();

            $product = Product::with('sizeStocks')->findOrFail($request->product_id);
            
            Log::info('Order Creation - Product Details', [
                'product_id' => $product->id,
                'product_name' => $product->name,
                'sizeStocks_count' => $product->sizeStocks()->count(),
                'sizeStocks_data' => $product->sizeStocks->toArray(),
                'requested_size' => $request->product_size,
                'requested_quantity' => $request->quantity,
            ]);
            
            // Check if product has size-specific stock tracking
            if ($product->sizeStocks()->count() > 0) {
                // Product uses per-size stock tracking
                if (empty($request->product_size)) {
                    Log::warning('Order Creation - Size required but not provided');
                    return response()->json([
                        'message' => 'Product size is required for this product',
                    ], 422);
                }

                // Find and lock the size stock for update
                $sizeStock = ProductSizeStock::where('product_id', $product->id)
                    ->where('size', $request->product_size)
                    ->lockForUpdate()
                    ->first();

                if (!$sizeStock) {
                    Log::warning('Order Creation - Size not found', [
                        'requested_size' => $request->product_size,
                        'available_sizes' => $product->sizeStocks->pluck('size')->toArray(),
                    ]);
                    
                    return response()->json([
                        'message' => 'Selected size is not available',
                        'requested_size' => $request->product_size,
                        'available_sizes' => $product->sizeStocks->pluck('size')->toArray(),
                    ], 422);
                }

                if ($sizeStock->quantity < $request->quantity) {
                    return response()->json([
                        'message' => "Insufficient stock for size {$request->product_size}. Only {$sizeStock->quantity} available.",
                    ], 422);
                }

                // Decrement the size-specific stock
                $sizeStock->quantity -= $request->quantity;
                $sizeStock->save();
            } else {
                // Product uses total stock tracking (backward compatibility)
                if ($product->stock_quantity < $request->quantity) {
                    return response()->json([
                        'message' => "Insufficient stock. Only {$product->stock_quantity} available.",
                    ], 422);
                }

                $product->update(['stock_quantity' => $product->stock_quantity - $request->quantity]);
            }
            
            // Use the price sent from frontend (which could be campaign price or regular price)
            $productPrice = $request->product_price;
            $totalAmount = $productPrice * $request->quantity;

            $order = Order::create([
                'customer_full_name' => $request->customer_full_name,
                'customer_email' => $request->customer_email,
                'customer_phone' => $request->customer_phone,
                'customer_address' => $request->customer_address,
                'customer_city' => $request->customer_city,
                'customer_country' => $request->customer_country,
                'product_id' => $request->product_id,
                'product_name' => $product->name,
                'product_price' => $productPrice,
                'product_image' => $product->image,
                'product_size' => $request->product_size,
                'product_color' => $request->product_color,
                'quantity' => $request->quantity,
                'total_amount' => $totalAmount,
                'payment_method' => 'cash',
                'notes' => $request->notes,
            ]);

            DB::commit();

            return response()->json([
                'message' => 'Order created successfully',
                'order' => $order->load('product'),
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error creating order: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString(),
                'request' => $request->all()
            ]);

            return response()->json([
                'message' => 'Failed to create order',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    }

    public function show(Order $order): JsonResponse
    {
        return response()->json($order->load('product'));
    }

    public function update(Request $request, Order $order): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'status' => 'required|in:pending,confirmed,processing,shipped,delivered,cancelled',
            'notes' => 'nullable|string|max:1000',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        $updateData = [
            'status' => $request->status,
            'notes' => $request->notes,
        ];

        // Set timestamps based on status
        if ($request->status === 'confirmed' && $order->status !== 'confirmed') {
            $updateData['confirmed_at'] = now();
        } elseif ($request->status === 'shipped' && $order->status !== 'shipped') {
            $updateData['shipped_at'] = now();
        } elseif ($request->status === 'delivered' && $order->status !== 'delivered') {
            $updateData['delivered_at'] = now();
        }

        $order->update($updateData);

        return response()->json([
            'message' => 'Order updated successfully',
            'order' => $order->load('product'),
        ]);
    }

    public function destroy(Order $order): JsonResponse
    {
        $order->delete();

        return response()->json([
            'message' => 'Order deleted successfully',
        ]);
    }

    public function checkout(Product $product): Response
    {
        // Debug: Log the product data
        Log::info('Checkout accessed for product', [
            'product_id' => $product->id,
            'product_name' => $product->name,
        ]);

        try {
            // Load product with category and size stocks
            $product->load(['category', 'sizeStocks']);
            
            // Format sizeStocks as associative array for frontend
            $productData = $product->toArray();
            if ($product->sizeStocks->isNotEmpty()) {
                $productData['sizeStocks'] = $product->sizeStocks->mapWithKeys(function ($stock) {
                    return [$stock->size => [
                        'quantity' => $stock->quantity,
                        'stock_status' => $stock->stock_status
                    ]];
                })->toArray();
            }
            
            return Inertia::render('checkout/index', [
                'product' => $productData,
            ]);
        } catch (\Exception $e) {
            Log::error('Checkout error', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            // For debugging, throw the exception to see the actual error
            throw $e;
        }
    }

    public function success(Request $request)
    {
        $orderId = $request->query('order_id');

        if (! $orderId) {
            // If no order ID provided, redirect to home
            return redirect()->route('home');
        }

        $order = Order::where('unique_id', $orderId)->with('product')->first();

        if (! $order) {
            // If order not found, redirect to home
            return redirect()->route('home');
        }

        return Inertia::render('order/success', [
            'order' => $order,
        ]);
    }
}
