<?php

namespace App\Http\Controllers;

use App\Models\Category;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class CategoryController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        try {
            $query = Category::query();

            // Debug logging
            $totalCount = Category::count();
            Log::info('CategoryController@index - Debug info', [
                'total_categories_in_db' => $totalCount,
                'request_params' => $request->all(),
            ]);

            // Apply filters
            if ($request->has('search') && ! empty($request->search)) {
                $query->where('name', 'like', '%'.$request->search.'%')
                    ->orWhere('description', 'like', '%'.$request->search.'%');
            }

            // Apply sorting
            $sortBy = $request->get('sort_by', 'name');
            $sortOrder = $request->get('sort_order', 'asc');

            $allowedSortFields = ['name', 'slug', 'created_at', 'updated_at'];
            if (in_array($sortBy, $allowedSortFields)) {
                $query->orderBy($sortBy, $sortOrder);
            } else {
                $query->orderBy('name', 'asc');
            }

            // Pagination
            $perPage = min($request->get('per_page', 20), 100); // Max 100 items per page
            $categories = $query->paginate($perPage);

            // Debug the results
            Log::info('CategoryController@index - Query results', [
                'categories_count' => $categories->count(),
                'total' => $categories->total(),
                'categories_items' => $categories->items(),
            ]);

            return Inertia::render('admin/categories/index', [
                'categories' => $categories->items(),
                'pagination' => [
                    'current_page' => $categories->currentPage(),
                    'last_page' => $categories->lastPage(),
                    'per_page' => $categories->perPage(),
                    'total' => $categories->total(),
                    'from' => $categories->firstItem(),
                    'to' => $categories->lastItem(),
                ],
                'filters' => $request->only(['search', 'sort_by', 'sort_order']),
            ]);

        } catch (Exception $e) {
            Log::error('Error fetching categories for admin: '.$e->getMessage(), [
                'trace' => $e->getTraceAsString(),
                'request' => $request->all(),
            ]);

            // Fallback with empty data
            return Inertia::render('admin/categories/index', [
                'categories' => [],
                'pagination' => [
                    'current_page' => 1,
                    'last_page' => 1,
                    'per_page' => 20,
                    'total' => 0,
                    'from' => null,
                    'to' => null,
                ],
                'filters' => $request->only(['search', 'sort_by', 'sort_order']),
            ]);
        }
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
