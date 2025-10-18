<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\Product;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    /**
     * Get dashboard statistics
     */
    public function stats(Request $request)
    {
        // Today: From midnight today to now
        $todayStart = Carbon::today();
        $todayEnd = Carbon::now();
        
        // Last 7 days: From 7 days ago to now
        $last7DaysStart = Carbon::now()->subDays(7);
        
        // This month: From 1st of current month to now
        $monthStart = Carbon::now()->startOfMonth();

        // Daily sales (today only)
        $dailySales = Order::whereBetween('created_at', [$todayStart, $todayEnd])
            ->where('status', '!=', 'cancelled')
            ->sum('total_amount');

        $dailyOrdersCount = Order::whereBetween('created_at', [$todayStart, $todayEnd])
            ->where('status', '!=', 'cancelled')
            ->count();

        // Weekly sales (last 7 days)
        $weeklySales = Order::where('created_at', '>=', $last7DaysStart)
            ->where('status', '!=', 'cancelled')
            ->sum('total_amount');

        $weeklyOrdersCount = Order::where('created_at', '>=', $last7DaysStart)
            ->where('status', '!=', 'cancelled')
            ->count();

        // Monthly sales (from 1st of month to now)
        $monthlySales = Order::where('created_at', '>=', $monthStart)
            ->where('status', '!=', 'cancelled')
            ->sum('total_amount');

        $monthlyOrdersCount = Order::where('created_at', '>=', $monthStart)
            ->where('status', '!=', 'cancelled')
            ->count();

        // Total revenue
        $totalRevenue = Order::where('status', '!=', 'cancelled')
            ->sum('total_amount');

        // Low stock products (stock < 10)
        $lowStockProducts = Product::where('stock', '<', 10)
            ->where('stock', '>', 0)
            ->orderBy('stock', 'asc')
            ->get(['id', 'name', 'stock', 'price'])
            ->map(function ($product) {
                return [
                    'id' => $product->id,
                    'name' => $product->name,
                    'stock' => (int) $product->stock,
                    'price' => (float) $product->price,
                ];
            });

        // Out of stock products
        $outOfStockCount = Product::where('stock', 0)->count();

        // Total products
        $totalProducts = Product::count();

        // Total customers (unique customer emails from orders)
        $totalCustomers = Order::distinct('customer_email')->count('customer_email');

        // Recent orders
        $recentOrders = Order::with('product:id,name,price')
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get()
            ->map(function ($order) {
                return [
                    'id' => $order->id,
                    'unique_id' => $order->unique_id,
                    'customer_full_name' => $order->customer_full_name,
                    'customer_email' => $order->customer_email,
                    'product_name' => $order->product_name,
                    'product' => $order->product,
                    'status' => $order->status,
                    'total_amount' => (float) $order->total_amount,
                    'created_at' => $order->created_at,
                ];
            });

        // Top selling products (by quantity sold)
        $topProducts = Order::select('product_id', DB::raw('SUM(quantity) as total_sold'))
            ->where('status', '!=', 'cancelled')
            ->groupBy('product_id')
            ->orderBy('total_sold', 'desc')
            ->limit(5)
            ->with('product:id,name,price,stock')
            ->get();

        // Sales trend (last 7 days)
        $salesTrend = [];
        for ($i = 6; $i >= 0; $i--) {
            $date = Carbon::today()->subDays($i);
            $sales = Order::whereDate('created_at', $date)
                ->where('status', '!=', 'cancelled')
                ->sum('total_amount');

            $salesTrend[] = [
                'date' => $date->format('M d'),
                'sales' => (float) ($sales ?? 0),
            ];
        }

        // Order status breakdown
        $ordersByStatus = Order::select('status', DB::raw('count(*) as count'))
            ->groupBy('status')
            ->get()
            ->pluck('count', 'status');

        return response()->json([
            'daily' => [
                'sales' => (float) ($dailySales ?? 0),
                'orders' => (int) ($dailyOrdersCount ?? 0),
            ],
            'weekly' => [
                'sales' => (float) ($weeklySales ?? 0),
                'orders' => (int) ($weeklyOrdersCount ?? 0),
            ],
            'monthly' => [
                'sales' => (float) ($monthlySales ?? 0),
                'orders' => (int) ($monthlyOrdersCount ?? 0),
            ],
            'total_revenue' => (float) ($totalRevenue ?? 0),
            'low_stock_products' => $lowStockProducts,
            'out_of_stock_count' => (int) ($outOfStockCount ?? 0),
            'total_products' => (int) ($totalProducts ?? 0),
            'total_customers' => (int) ($totalCustomers ?? 0),
            'recent_orders' => $recentOrders,
            'top_products' => $topProducts,
            'sales_trend' => $salesTrend,
            'orders_by_status' => $ordersByStatus,
        ]);
    }
}
