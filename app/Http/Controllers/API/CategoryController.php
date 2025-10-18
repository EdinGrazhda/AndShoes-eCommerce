<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Exception;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;

class CategoryController extends Controller
{
    /**
     * Display a listing of the categories.
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $query = Category::query();

            // Apply search filter
            if ($request->has('search') && ! empty($request->search)) {
                $query->where('name', 'like', '%'.$request->search.'%')
                    ->orWhere('description', 'like', '%'.$request->search.'%');
            }

            // Apply sorting
            $sortBy = $request->get('sort_by', 'name');
            $sortOrder = $request->get('sort_order', 'asc');

            if (in_array($sortBy, ['name', 'created_at', 'updated_at'])) {
                $query->orderBy($sortBy, $sortOrder);
            }

            // Pagination
            $perPage = $request->get('per_page', 15);
            $perPage = min($perPage, 100); // Limit max per page

            $categories = $query->paginate($perPage);

            // Return data in the format expected by frontend
            return response()->json($categories, 200);

        } catch (Exception $e) {
            Log::error('Error fetching categories: '.$e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Error fetching categories',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error',
            ], 500);
        }
    }

    /**
     * Store a newly created category in storage.
     */
    public function store(Request $request): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), [
                'name' => 'required|string|max:255|unique:categories,name',
                'slug' => 'required|string|max:255|unique:categories,slug',
                'description' => 'nullable|string|max:1000',
                'parent_id' => 'nullable|integer|exists:categories,id',
                'is_active' => 'boolean',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors(),
                ], 422);
            }

            $category = Category::create([
                'name' => $request->name,
                'slug' => $request->slug,
                'description' => $request->description,
                'parent_id' => $request->parent_id,
                'is_active' => $request->get('is_active', true),
            ]);

            return response()->json([
                'success' => true,
                'data' => $category,
                'message' => 'Category created successfully',
            ], 201);

        } catch (Exception $e) {
            Log::error('Error creating category: '.$e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Error creating category',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error',
            ], 500);
        }
    }

    /**
     * Display the specified category.
     */
    public function show(string $id): JsonResponse
    {
        try {
            $category = Category::with(['products'])->findOrFail($id);

            return response()->json([
                'success' => true,
                'data' => $category,
                'message' => 'Category retrieved successfully',
            ]);

        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Category not found',
                'error' => config('app.debug') ? $e->getMessage() : 'Category not found',
            ], 404);
        }
    }

    /**
     * Update the specified category in storage.
     */
    public function update(Request $request, string $id): JsonResponse
    {
        try {
            $category = Category::findOrFail($id);

            $validator = Validator::make($request->all(), [
                'name' => 'required|string|max:255|unique:categories,name,'.$id,
                'slug' => 'required|string|max:255|unique:categories,slug,'.$id,
                'description' => 'nullable|string|max:1000',
                'parent_id' => 'nullable|integer|exists:categories,id|different:'.$id,
                'is_active' => 'boolean',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors(),
                ], 422);
            }

            $category->update([
                'name' => $request->name,
                'slug' => $request->slug,
                'description' => $request->description,
                'parent_id' => $request->parent_id,
                'is_active' => $request->get('is_active', $category->is_active),
            ]);

            return response()->json([
                'success' => true,
                'data' => $category->fresh(),
                'message' => 'Category updated successfully',
            ]);

        } catch (Exception $e) {
            Log::error('Error updating category: '.$e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Error updating category',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error',
            ], 500);
        }
    }

    /**
     * Remove the specified category from storage.
     */
    public function destroy(string $id): JsonResponse
    {
        try {
            $category = Category::findOrFail($id);

            // Check if category has products
            if ($category->products()->count() > 0) {
                return response()->json([
                    'success' => false,
                    'message' => 'Cannot delete category with associated products',
                ], 422);
            }

            $category->delete();

            return response()->json([
                'success' => true,
                'message' => 'Category deleted successfully',
            ]);

        } catch (Exception $e) {
            Log::error('Error deleting category: '.$e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Error deleting category',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error',
            ], 500);
        }
    }

    /**
     * Get all categories in a tree structure
     */
    public function tree(): JsonResponse
    {
        try {
            $categories = Category::where('is_active', true)
                ->whereNull('parent_id')
                ->with(['children' => function ($query) {
                    $query->where('is_active', true);
                }])
                ->orderBy('name')
                ->get();

            return response()->json([
                'success' => true,
                'data' => $categories,
                'message' => 'Category tree retrieved successfully',
            ]);

        } catch (Exception $e) {
            Log::error('Error fetching category tree: '.$e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Error fetching category tree',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error',
            ], 500);
        }
    }
}
