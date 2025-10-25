<?php

namespace App\Http\Controllers;

use App\Models\Campaign;
use App\Models\Product;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CampaignController extends Controller
{
    /**
     * Display a listing of campaigns
     */
    public function index(Request $request)
    {
        $query = Campaign::with('product');

        // Apply filters
        if ($request->has('search') && $request->search) {
            $query->where('name', 'like', '%' . $request->search . '%');
        }

        if ($request->has('product_id') && $request->product_id) {
            $query->where('product_id', $request->product_id);
        }

        if ($request->has('is_active') && $request->is_active !== '') {
            $query->where('is_active', $request->is_active);
        }

        // Sorting
        $sortBy = $request->get('sort_by', 'created_at');
        $sortOrder = $request->get('sort_order', 'desc');
        $query->orderBy($sortBy, $sortOrder);

        // Pagination
        $campaigns = $query->paginate(10);

        // Get all products for the dropdown
        $products = Product::select('id', 'name', 'price', 'image')
            ->orderBy('name')
            ->get();

        return Inertia::render('admin/campaigns/index', [
            'campaigns' => $campaigns->items(),
            'products' => $products,
            'pagination' => [
                'current_page' => $campaigns->currentPage(),
                'last_page' => $campaigns->lastPage(),
                'per_page' => $campaigns->perPage(),
                'total' => $campaigns->total(),
                'from' => $campaigns->firstItem(),
                'to' => $campaigns->lastItem(),
            ],
            'filters' => [
                'search' => $request->search,
                'product_id' => $request->product_id,
                'is_active' => $request->is_active,
            ],
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
