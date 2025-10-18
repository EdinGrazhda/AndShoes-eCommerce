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
        $products = [];
        $pagination = null;
        
        if ($apiData['success'] && isset($apiData['data'])) {
            if (isset($apiData['data']['data'])) {
                // Paginated data
                $products = $apiData['data']['data'];
                $pagination = [
                    'current_page' => $apiData['data']['current_page'] ?? 1,
                    'last_page' => $apiData['data']['last_page'] ?? 1,
                    'per_page' => $apiData['data']['per_page'] ?? 20,
                    'total' => $apiData['data']['total'] ?? 0,
                    'from' => $apiData['data']['from'],
                    'to' => $apiData['data']['to']
                ];
            } else {
                // Direct data array
                $products = $apiData['data'];
            }
        }

        $categories = [];
        if ($categoryData['success'] && isset($categoryData['data'])) {
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
