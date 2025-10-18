<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use Illuminate\Http\Request;

class ProductsController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        // Get products from API controller
        $apiController = new \App\Http\Controllers\API\ProductsController();
        $apiResponse = $apiController->index($request);
        $apiData = json_decode($apiResponse->getContent(), true);

        // Get categories for filters
        $categoryController = new \App\Http\Controllers\API\CategoryController();
        $categoryResponse = $categoryController->index(new Request());
        $categoryData = json_decode($categoryResponse->getContent(), true);

        // Extract the actual data from the API response
        // Since API now returns Laravel pagination object directly
        $products = [];
        $pagination = null;
        
        if (isset($apiData['data'])) {
            // Paginated data - Laravel pagination format
            $products = $apiData['data'];
            $pagination = [
                'current_page' => $apiData['current_page'] ?? 1,
                'last_page' => $apiData['last_page'] ?? 1,
                'per_page' => $apiData['per_page'] ?? 20,
                'total' => $apiData['total'] ?? 0,
                'from' => $apiData['from'],
                'to' => $apiData['to']
            ];
        }

        $categories = [];
        if (isset($categoryData['data'])) {
            $categories = $categoryData['data'];
        }

        return Inertia::render('admin/products/index', [
            'products' => $products,
            'categories' => $categories,
            'pagination' => $pagination,
            'filters' => $request->only(['search', 'category', 'price_min', 'price_max', 'stock', 'color', 'foot_numbers', 'sort_by', 'sort_order'])
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }
}
