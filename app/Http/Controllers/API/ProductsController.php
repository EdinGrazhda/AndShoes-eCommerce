<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;
use Exception;

class ProductsController extends Controller
{
    /**
     * Display a listing of the products with filtering, sorting, and pagination.
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $query = Product::with(['category']);

            // Apply filters
            if ($request->has('search') && !empty($request->search)) {
                $query->where('name', 'like', '%' . $request->search . '%')
                      ->orWhere('description', 'like', '%' . $request->search . '%');
            }

            if ($request->has('category') && !empty($request->category)) {
                $query->where('category_id', $request->category);
            }

            if ($request->has('price_min') && is_numeric($request->price_min)) {
                $query->where('price', '>=', $request->price_min);
            }

            if ($request->has('price_max') && is_numeric($request->price_max)) {
                $query->where('price', '<=', $request->price_max);
            }

            if ($request->has('stock') && !empty($request->stock)) {
                $query->where('stock', $request->stock);
            }

            if ($request->has('color') && !empty($request->color)) {
                $query->where('color', 'like', '%' . $request->color . '%');
            }

            if ($request->has('foot_numbers') && !empty($request->foot_numbers)) {
                $query->where('foot_numbers', 'like', '%' . $request->foot_numbers . '%');
            }

            if ($request->has('gender') && !empty($request->gender)) {
                if (is_array($request->gender)) {
                    $query->whereIn('gender', $request->gender);
                } else {
                    $query->where('gender', $request->gender);
                }
            }

            // Apply sorting
            $sortBy = $request->get('sort_by', 'created_at');
            $sortOrder = $request->get('sort_order', 'desc');
            
            // Handle frontend sorting format
            if ($sortBy === 'price-asc') {
                $sortBy = 'price';
                $sortOrder = 'asc';
            } elseif ($sortBy === 'price-desc') {
                $sortBy = 'price';
                $sortOrder = 'desc';
            } elseif ($sortBy === 'rating') {
                $sortBy = 'created_at'; // Since we don't have rating, use created_at
                $sortOrder = 'desc';
            } elseif ($sortBy === 'newest') {
                $sortBy = 'created_at';
                $sortOrder = 'desc';
            }
            
            $allowedSortFields = ['name', 'price', 'stock', 'color', 'created_at'];
            if (in_array($sortBy, $allowedSortFields)) {
                $query->orderBy($sortBy, $sortOrder);
            } else {
                $query->orderBy('created_at', 'desc');
            }

            // Handle multiple categories filter
            if ($request->has('category') && is_array($request->category)) {
                $query->whereIn('category_id', $request->category);
            }

            // Pagination
            $perPage = min($request->get('per_page', 20), 100); // Max 100 items per page
            $products = $query->paginate($perPage);

            // Add campaign prices to products
            $products->getCollection()->transform(function ($product) {
                $activeCampaign = \App\Models\Campaign::where('product_id', $product->id)
                    ->where('is_active', true)
                    ->where('start_date', '<=', now())
                    ->where('end_date', '>=', now())
                    ->first();
                
                if ($activeCampaign) {
                    $product->campaign_price = $activeCampaign->price;
                    $product->campaign_id = $activeCampaign->id;
                    $product->campaign_name = $activeCampaign->name;
                    $product->campaign_end_date = $activeCampaign->end_date;
                }
                
                // Add media library image URL
                $product->image_url = $product->image_url; // Uses accessor from model
                
                return $product;
            });

            // Return paginated data in the format expected by frontend
            return response()->json($products, 200);

        } catch (Exception $e) {
            Log::error('Error fetching products: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString(),
                'request' => $request->all()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve products',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    }

    /**
     * Store a newly created product in storage.
     */
    public function store(Request $request): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), [
                'name' => 'required|string|max:255|unique:products',
                'description' => 'nullable|string',
                'price' => 'required|numeric|min:0|max:999999.99',
                'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:2048', // Now accepts file upload
                'stock' => 'required|integer|min:0',
                'foot_numbers' => 'nullable|string|max:255',
                'color' => 'nullable|string|max:255',
                'category_id' => 'required|exists:categories,id',
                'gender' => 'required|string|in:male,female,unisex'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $product = Product::create([
                'name' => $request->name,
                'description' => $request->description,
                'price' => $request->price,
                'image' => null, // Will be set by media library
                'stock_quantity' => $request->stock, // Map stock input to stock_quantity column
                'foot_numbers' => $request->foot_numbers,
                'color' => $request->color,
                'category_id' => $request->category_id,
                'gender' => $request->gender
            ]);

            // Handle image upload with Media Library
            if ($request->hasFile('image')) {
                $product->addMediaFromRequest('image')
                    ->toMediaCollection('images');
            }

            $product->load('category');

            return response()->json([
                'success' => true,
                'message' => 'Product created successfully',
                'data' => $product
            ], 201);

        } catch (Exception $e) {
            Log::error('Error creating product: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString(),
                'request' => $request->all()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to create product',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    }

    /**
     * Display the specified product.
     */
    public function show(string $id): JsonResponse
    {
        try {
            $product = Product::with(['category'])->find($id);

            if (!$product) {
                return response()->json([
                    'success' => false,
                    'message' => 'Product not found'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'message' => 'Product retrieved successfully',
                'data' => $product
            ], 200);

        } catch (Exception $e) {
            Log::error('Error fetching product: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString(),
                'product_id' => $id
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve product',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    }

    /**
     * Update the specified product in storage.
     */
    public function update(Request $request, string $id): JsonResponse
    {
        try {
            $product = Product::find($id);

            if (!$product) {
                return response()->json([
                    'success' => false,
                    'message' => 'Product not found'
                ], 404);
            }

            $validator = Validator::make($request->all(), [
                'name' => 'sometimes|required|string|max:255|unique:products,name,' . $id,
                'description' => 'sometimes|nullable|string',
                'price' => 'sometimes|required|numeric|min:0|max:999999.99',
                'image' => 'sometimes|nullable|image|mimes:jpeg,png,jpg,gif,webp|max:2048', // Now accepts file upload
                'stock' => 'sometimes|required|integer|min:0',
                'foot_numbers' => 'sometimes|nullable|string|max:255',
                'color' => 'sometimes|nullable|string|max:255',
                'category_id' => 'sometimes|required|exists:categories,id',
                'gender' => 'sometimes|required|string|in:male,female,unisex'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            // Map stock input to stock_quantity
            $updateData = $request->only(['name', 'description', 'price', 'foot_numbers', 'color', 'category_id', 'gender']);
            if ($request->has('stock')) {
                $updateData['stock_quantity'] = $request->stock;
            }
            $product->update($updateData);

            // Handle image upload with Media Library
            if ($request->hasFile('image')) {
                // Clear old images
                $product->clearMediaCollection('images');
                // Add new image
                $product->addMediaFromRequest('image')
                    ->toMediaCollection('images');
            }

            $product->load('category');

            return response()->json([
                'success' => true,
                'message' => 'Product updated successfully',
                'data' => $product
            ], 200);

        } catch (Exception $e) {
            Log::error('Error updating product: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString(),
                'product_id' => $id,
                'request' => $request->all()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to update product',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    }

    /**
     * Remove the specified product from storage.
     */
    public function destroy(string $id): JsonResponse
    {
        try {
            $product = Product::find($id);

            if (!$product) {
                return response()->json([
                    'success' => false,
                    'message' => 'Product not found'
                ], 404);
            }
            
            $product->delete();

            return response()->json([
                'success' => true,
                'message' => 'Product deleted successfully'
            ], 200);

        } catch (Exception $e) {
            Log::error('Error deleting product: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString(),
                'product_id' => $id
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to delete product',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    }

    /**
     * Bulk delete products.
     */
    public function bulkDelete(Request $request): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), [
                'product_ids' => 'required|array|min:1',
                'product_ids.*' => 'exists:products,id'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $deletedCount = Product::whereIn('id', $request->product_ids)->delete();

            return response()->json([
                'success' => true,
                'message' => "Successfully deleted {$deletedCount} products",
                'deleted_count' => $deletedCount
            ], 200);

        } catch (Exception $e) {
            Log::error('Error bulk deleting products: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString(),
                'request' => $request->all()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to delete products',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    }

    /**
     * Update product stock status.
     */
    public function updateStock(Request $request, string $id): JsonResponse
    {
        try {
            $product = Product::find($id);

            if (!$product) {
                return response()->json([
                    'success' => false,
                    'message' => 'Product not found'
                ], 404);
            }

            $validator = Validator::make($request->all(), [
                'stock' => 'required|integer|min:0'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $product->stock_quantity = $request->stock; // Map stock input to stock_quantity column
            $product->save();

            return response()->json([
                'success' => true,
                'message' => 'Product stock updated successfully',
                'data' => $product
            ], 200);

        } catch (Exception $e) {
            Log::error('Error updating product stock: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString(),
                'product_id' => $id,
                'request' => $request->all()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to update product stock',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    }
}
