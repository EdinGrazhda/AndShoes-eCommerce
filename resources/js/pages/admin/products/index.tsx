import ProductModal from '@/components/ProductModal';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import {
    Edit,
    Edit2,
    Filter,
    Package,
    Plus,
    Search,
    Trash2,
    X,
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Products',
        href: '/products',
    },
];

interface Category {
    id: number;
    name: string;
    description?: string;
}

interface Product {
    id: number;
    name: string;
    price: number;
    description?: string;
    image?: string;
    image_url?: string; // Add Media Library URL
    stock: number; // Now represents quantity
    stock_quantity?: number; // Backend field
    stock_status?: string; // Calculated status from backend
    foot_numbers?: string;
    color?: string;
    gender?: 'male' | 'female' | 'unisex';
    category?: Category;
    category_id?: number;
    created_at?: string;
    updated_at?: string;
}

interface Pagination {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number | null;
    to: number | null;
}

interface Filters {
    search?: string;
    category?: string;
    price_min?: number;
    price_max?: number;
    stock?: string;
    color?: string;
    foot_numbers?: string;
    sort_by?: string;
    sort_order?: string;
}

interface ProductsPageProps {
    products: Product[];
    categories: Category[];
    pagination?: Pagination;
    filters?: Filters;
}

export default function Products({
    products = [],
    categories = [],
    pagination,
    filters = {},
}: ProductsPageProps) {
    // Debug logging
    console.log('Products component received:', {
        products,
        categories,
        pagination,
        filters,
        productsLength: products.length,
        productsType: typeof products,
        productsIsArray: Array.isArray(products),
    });

    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [selectedCategory, setSelectedCategory] = useState(
        filters.category || '',
    );
    const [selectedStock, setSelectedStock] = useState(filters.stock || '');
    const [selectedColor, setSelectedColor] = useState(filters.color || '');

    // Modal states
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(
        null,
    );
    const [isLoading, setIsLoading] = useState(false);

    // Real-time filtering with debounce
    const getCurrentFilters = useCallback(() => {
        const filterParams: any = {};
        if (searchTerm) filterParams.search = searchTerm;
        if (selectedCategory) filterParams.category = selectedCategory;
        if (selectedStock) filterParams.stock = selectedStock;
        if (selectedColor) filterParams.color = selectedColor;
        return filterParams;
    }, [searchTerm, selectedCategory, selectedStock, selectedColor]);

    const applyFilters = useCallback(() => {
        router.get('/admin/products', getCurrentFilters(), {
            preserveState: true,
            preserveScroll: true,
        });
    }, [getCurrentFilters]);

    // Debounced filtering effect
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            applyFilters();
        }, 300); // 300ms debounce

        return () => clearTimeout(timeoutId);
    }, [applyFilters]);

    const clearFilters = () => {
        setSearchTerm('');
        setSelectedCategory('');
        setSelectedStock('');
        setSelectedColor('');
    };

    // CRUD Functions
    const handleCreateProduct = () => {
        setSelectedProduct(null);
        setShowCreateModal(true);
    };

    const handleEditProduct = (product: Product) => {
        setSelectedProduct(product);
        setShowEditModal(true);
    };

    const handleDeleteProduct = (product: Product) => {
        setSelectedProduct(product);
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        if (!selectedProduct) return;

        setIsLoading(true);
        try {
            const response = await fetch(
                `/api/products/${selectedProduct.id}`,
                {
                    method: 'DELETE',
                    headers: {
                        Accept: 'application/json',
                        'X-Requested-With': 'XMLHttpRequest',
                        'X-CSRF-TOKEN':
                            document
                                .querySelector('meta[name="csrf-token"]')
                                ?.getAttribute('content') || '',
                    },
                },
            );

            if (response.ok) {
                setShowDeleteModal(false);
                setSelectedProduct(null);
                toast.success('Product deleted successfully!');
                router.reload();
            } else {
                const data = await response.json();
                const errorMessage = data.message || 'Failed to delete product';
                toast.error(errorMessage);
            }
        } catch (error) {
            console.error('Error deleting product:', error);
            toast.error('Network error occurred while deleting the product');
        } finally {
            setIsLoading(false);
        }
    };

    const handleProductSaved = () => {
        setShowCreateModal(false);
        setShowEditModal(false);
        setSelectedProduct(null);
        router.reload();
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Products" />

            {/* Main Container with proper spacing */}
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-gray-50">
                <div className="mx-auto max-w-7xl px-6 py-8 lg:px-8">
                    {/* Header Section */}
                    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="space-y-1">
                            <div className="flex items-center gap-3">
                                <div className="rounded-xl bg-gradient-to-r from-rose-500 to-pink-600 p-2 shadow-lg">
                                    <Package className="h-5 w-5 text-white" />
                                </div>
                                <div>
                                    <h1 className="text-2xl font-bold tracking-tight text-gray-900 lg:text-3xl">
                                        Products
                                    </h1>
                                    <p className="mt-1 text-sm text-gray-600">
                                        Manage your product inventory with style
                                        and efficiency
                                    </p>
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={handleCreateProduct}
                            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-rose-500 to-pink-600 px-6 py-3 text-sm font-semibold text-white shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl focus:ring-4 focus:ring-rose-300 focus:ring-offset-2 focus:outline-none"
                        >
                            <Plus className="h-5 w-5" />
                            Add New Product
                        </button>
                    </div>

                    {/* Smart Filters Section */}
                    <div className="mb-6 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-xl">
                        <div className="border-b border-gray-100 bg-gradient-to-r from-slate-50 to-white px-6 py-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 p-2 shadow-lg">
                                        <Filter className="h-4 w-4 text-white" />
                                    </div>
                                    <h3 className="text-base font-bold text-gray-900">
                                        Smart Filters
                                    </h3>
                                </div>
                                <button
                                    onClick={clearFilters}
                                    className="inline-flex items-center gap-2 rounded-lg bg-gray-100 px-4 py-2 text-xs font-semibold text-gray-700 transition-all duration-200 hover:scale-105 hover:bg-gray-200 hover:text-gray-900"
                                >
                                    <X className="h-3 w-3" />
                                    Clear All
                                </button>
                            </div>
                        </div>

                        <div className="p-6">
                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                                {/* Search */}
                                <div className="space-y-2">
                                    <label className="text-xs font-semibold tracking-wide text-gray-700">
                                        Search Products
                                    </label>
                                    <div className="relative">
                                        <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
                                        <input
                                            type="text"
                                            value={searchTerm}
                                            onChange={(e) =>
                                                setSearchTerm(e.target.value)
                                            }
                                            placeholder="Type to search..."
                                            className="w-full rounded-xl border-2 border-gray-200 bg-gray-50/50 py-2.5 pr-3 pl-10 text-sm font-medium transition-all duration-300 focus:border-rose-400 focus:bg-white focus:ring-4 focus:ring-rose-100 focus:outline-none"
                                        />
                                    </div>
                                </div>

                                {/* Categories */}
                                <div className="space-y-2">
                                    <label className="text-xs font-semibold tracking-wide text-gray-700">
                                        Category
                                    </label>
                                    <select
                                        value={selectedCategory}
                                        onChange={(e) =>
                                            setSelectedCategory(e.target.value)
                                        }
                                        className="w-full rounded-xl border-2 border-gray-200 bg-gray-50/50 px-4 py-2.5 text-sm font-medium transition-all duration-300 focus:border-rose-400 focus:bg-white focus:ring-4 focus:ring-rose-100 focus:outline-none"
                                    >
                                        <option value="">All Categories</option>
                                        {categories.map((category) => (
                                            <option
                                                key={category.id}
                                                value={category.id}
                                            >
                                                {category.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Stock Status */}
                                <div className="space-y-2">
                                    <label className="text-xs font-semibold tracking-wide text-gray-700">
                                        Stock Status
                                    </label>
                                    <select
                                        value={selectedStock}
                                        onChange={(e) =>
                                            setSelectedStock(e.target.value)
                                        }
                                        className="w-full rounded-xl border-2 border-gray-200 bg-gray-50/50 px-4 py-2.5 text-sm font-medium transition-all duration-300 focus:border-rose-400 focus:bg-white focus:ring-4 focus:ring-rose-100 focus:outline-none"
                                    >
                                        <option value="">
                                            All Stock Levels
                                        </option>
                                        <option value="in stock">
                                            In Stock
                                        </option>
                                        <option value="low stock">
                                            Low Stock
                                        </option>
                                        <option value="out of stock">
                                            Out of Stock
                                        </option>
                                    </select>
                                </div>

                                {/* Color */}
                                <div className="space-y-2">
                                    <label className="text-xs font-semibold tracking-wide text-gray-700">
                                        Color
                                    </label>
                                    <input
                                        type="text"
                                        value={selectedColor}
                                        onChange={(e) =>
                                            setSelectedColor(e.target.value)
                                        }
                                        placeholder="Enter color..."
                                        className="w-full rounded-xl border-2 border-gray-200 bg-gray-50/50 px-4 py-2.5 text-sm font-medium transition-all duration-300 focus:border-rose-400 focus:bg-white focus:ring-4 focus:ring-rose-100 focus:outline-none"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Products Table Section */}
                    <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-xl">
                        <div className="border-b border-gray-100 bg-gradient-to-r from-slate-50 to-white px-6 py-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="rounded-lg bg-gradient-to-r from-emerald-500 to-teal-600 p-2 shadow-lg">
                                        <Package className="h-4 w-4 text-white" />
                                    </div>
                                    <h3 className="text-base font-bold text-gray-900">
                                        Product Inventory (
                                        {pagination?.total || products.length}{' '}
                                        items)
                                    </h3>
                                </div>
                                <div className="text-xs font-medium text-gray-600">
                                    Showing {pagination?.from || 0} to{' '}
                                    {pagination?.to || 0} of{' '}
                                    {pagination?.total || products.length}{' '}
                                    products
                                </div>
                            </div>
                        </div>

                        {products.length > 0 ? (
                            <>
                                {/* Desktop Table View - Hidden on mobile */}
                                <div className="hidden overflow-x-auto lg:block">
                                    <table className="w-full divide-y divide-gray-200">
                                        <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                                            <tr>
                                                <th className="px-4 py-4 text-left text-xs font-bold tracking-wider text-gray-700 uppercase">
                                                    ID
                                                </th>
                                                <th className="px-4 py-4 text-left text-xs font-bold tracking-wider text-gray-700 uppercase">
                                                    Product
                                                </th>
                                                <th className="px-4 py-4 text-left text-xs font-bold tracking-wider text-gray-700 uppercase">
                                                    Category
                                                </th>
                                                <th className="px-4 py-4 text-left text-xs font-bold tracking-wider text-gray-700 uppercase">
                                                    Price
                                                </th>
                                                <th className="px-4 py-4 text-left text-xs font-bold tracking-wider text-gray-700 uppercase">
                                                    Stock
                                                </th>
                                                <th className="px-4 py-4 text-left text-xs font-bold tracking-wider text-gray-700 uppercase">
                                                    Color
                                                </th>
                                                <th className="px-4 py-4 text-left text-xs font-bold tracking-wider text-gray-700 uppercase">
                                                    Gender
                                                </th>
                                                <th className="px-4 py-4 text-left text-xs font-bold tracking-wider text-gray-700 uppercase">
                                                    Sizes
                                                </th>
                                                <th className="w-48 px-4 py-4 text-right text-xs font-bold tracking-wider text-gray-700 uppercase">
                                                    Actions
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200 bg-white">
                                            {products.map((product, index) => (
                                                <tr
                                                    key={product.id}
                                                    className={`transition-all duration-300 hover:bg-gradient-to-r hover:from-gray-50 hover:to-white hover:shadow-lg ${
                                                        index % 2 === 0
                                                            ? 'bg-white'
                                                            : 'bg-gray-50/30'
                                                    }`}
                                                >
                                                    {/* Product ID */}
                                                    <td className="px-4 py-3 whitespace-nowrap">
                                                        <div className="text-xs font-semibold text-gray-500">
                                                            #{product.id}
                                                        </div>
                                                    </td>

                                                    {/* Product Info */}
                                                    <td className="px-4 py-3 whitespace-nowrap">
                                                        <div className="flex items-center">
                                                            {(product.image_url ||
                                                                product.image) && (
                                                                <div className="h-10 w-10 flex-shrink-0">
                                                                    <img
                                                                        className="h-10 w-10 rounded-lg object-cover"
                                                                        src={
                                                                            product.image_url ||
                                                                            product.image ||
                                                                            `https://picsum.photos/seed/${product.id}/80/80`
                                                                        }
                                                                        alt={
                                                                            product.name
                                                                        }
                                                                    />
                                                                </div>
                                                            )}
                                                            <div
                                                                className={
                                                                    product.image_url ||
                                                                    product.image
                                                                        ? 'ml-3'
                                                                        : ''
                                                                }
                                                            >
                                                                <div className="text-xs font-medium text-gray-900">
                                                                    {
                                                                        product.name
                                                                    }
                                                                </div>
                                                                {product.description && (
                                                                    <div className="max-w-xs truncate text-xs text-gray-500">
                                                                        {
                                                                            product.description
                                                                        }
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </td>

                                                    {/* Category */}
                                                    <td className="px-4 py-3 whitespace-nowrap">
                                                        {product.category ? (
                                                            <span className="inline-flex items-center rounded-full bg-rose-100 px-2.5 py-0.5 text-xs font-medium text-rose-800">
                                                                {
                                                                    product
                                                                        .category
                                                                        .name
                                                                }
                                                            </span>
                                                        ) : (
                                                            <span className="text-xs text-gray-400">
                                                                No category
                                                            </span>
                                                        )}
                                                    </td>

                                                    {/* Price */}
                                                    <td className="px-4 py-3 whitespace-nowrap">
                                                        <div className="text-xs font-semibold text-gray-900">
                                                            ${product.price}
                                                        </div>
                                                    </td>

                                                    {/* Stock */}
                                                    <td className="px-4 py-3 whitespace-nowrap">
                                                        <div className="flex flex-col gap-1">
                                                            <span
                                                                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                                                    product.stock_status ===
                                                                    'in stock'
                                                                        ? 'bg-green-100 text-green-800'
                                                                        : product.stock_status ===
                                                                            'low stock'
                                                                          ? 'bg-yellow-100 text-yellow-800'
                                                                          : 'bg-red-100 text-red-800'
                                                                }`}
                                                            >
                                                                {
                                                                    product.stock_status
                                                                }
                                                            </span>
                                                            <span className="text-xs text-gray-500">
                                                                Qty:{' '}
                                                                {product.stock_quantity ??
                                                                    product.stock}
                                                            </span>
                                                        </div>
                                                    </td>

                                                    {/* Color */}
                                                    <td className="px-4 py-3 whitespace-nowrap">
                                                        <div className="flex items-center gap-2">
                                                            {product.color && (
                                                                <>
                                                                    <div
                                                                        className="h-4 w-4 rounded-full border-2 border-gray-300 shadow-sm"
                                                                        style={{
                                                                            backgroundColor:
                                                                                product.color.toLowerCase(),
                                                                        }}
                                                                    ></div>
                                                                    <span className="text-xs font-medium text-gray-700 capitalize">
                                                                        {
                                                                            product.color
                                                                        }
                                                                    </span>
                                                                </>
                                                            )}
                                                            {!product.color && (
                                                                <span className="text-xs text-gray-400">
                                                                    No color
                                                                </span>
                                                            )}
                                                        </div>
                                                    </td>

                                                    {/* Gender */}
                                                    <td className="px-4 py-3 whitespace-nowrap">
                                                        <span
                                                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                                                product.gender ===
                                                                'male'
                                                                    ? 'bg-blue-100 text-blue-800'
                                                                    : product.gender ===
                                                                        'female'
                                                                      ? 'bg-pink-100 text-pink-800'
                                                                      : 'bg-gray-100 text-gray-800'
                                                            }`}
                                                        >
                                                            {product.gender ===
                                                            'male'
                                                                ? 'Male'
                                                                : product.gender ===
                                                                    'female'
                                                                  ? 'Female'
                                                                  : 'Unisex'}
                                                        </span>
                                                    </td>

                                                    {/* Sizes */}
                                                    <td className="px-4 py-3 whitespace-nowrap">
                                                        <div className="text-xs font-medium text-gray-600">
                                                            {product.foot_numbers ||
                                                                'N/A'}
                                                        </div>
                                                    </td>

                                                    {/* Actions */}
                                                    <td className="w-48 px-4 py-3 pr-6 whitespace-nowrap">
                                                        <div className="flex items-center justify-end gap-2">
                                                            <button
                                                                onClick={() =>
                                                                    handleEditProduct(
                                                                        product,
                                                                    )
                                                                }
                                                                className="inline-flex items-center gap-1.5 rounded-lg border border-rose-200 bg-gradient-to-r from-rose-50 to-pink-50 px-3 py-2 text-xs font-semibold text-rose-700 transition-all duration-200 hover:scale-105 hover:border-rose-300 hover:from-rose-100 hover:to-pink-100 focus:ring-4 focus:ring-rose-200 focus:outline-none"
                                                            >
                                                                <Edit className="h-3.5 w-3.5" />
                                                                Edit
                                                            </button>
                                                            <button
                                                                onClick={() =>
                                                                    handleDeleteProduct(
                                                                        product,
                                                                    )
                                                                }
                                                                className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-rose-500 to-pink-600 px-3 py-2 text-xs font-semibold text-white transition-all duration-200 hover:scale-105 hover:from-rose-600 hover:to-pink-700 focus:ring-4 focus:ring-rose-300 focus:outline-none"
                                                            >
                                                                <Trash2 className="h-3.5 w-3.5" />
                                                                Delete
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Mobile Card View - Visible on mobile only */}
                                <div className="grid gap-6 p-6 lg:hidden">
                                    {products.map((product) => (
                                        <div
                                            key={product.id}
                                            className="overflow-hidden rounded-2xl border border-gray-200 bg-gradient-to-br from-white to-gray-50 shadow-lg transition-all duration-300 hover:scale-[1.02] hover:shadow-xl"
                                        >
                                            {/* Product Image and Name */}
                                            <div className="border-b border-gray-200 bg-gradient-to-r from-rose-50 to-pink-50 p-4">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-start gap-4">
                                                        {(product.image_url ||
                                                            product.image) && (
                                                            <img
                                                                src={
                                                                    product.image_url ||
                                                                    product.image ||
                                                                    `https://picsum.photos/seed/${product.id}/200/200`
                                                                }
                                                                alt={
                                                                    product.name
                                                                }
                                                                className="h-16 w-16 flex-shrink-0 rounded-xl object-cover shadow-md"
                                                            />
                                                        )}
                                                        <div className="flex-1">
                                                            <div className="mb-1 text-xs font-semibold text-gray-500">
                                                                ID: #
                                                                {product.id}
                                                            </div>
                                                            <h3 className="text-lg font-bold text-gray-900">
                                                                {product.name}
                                                            </h3>
                                                            {product.description && (
                                                                <p className="mt-1 line-clamp-2 text-sm text-gray-600">
                                                                    {
                                                                        product.description
                                                                    }
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Product Details */}
                                            <div className="space-y-4 p-4">
                                                {/* Category */}
                                                <div>
                                                    <div className="mb-1.5 text-xs font-semibold text-gray-500">
                                                        Category
                                                    </div>
                                                    {product.category ? (
                                                        <span className="inline-flex items-center rounded-full bg-rose-100 px-3 py-1 text-xs font-medium text-rose-800">
                                                            {
                                                                product.category
                                                                    .name
                                                            }
                                                        </span>
                                                    ) : (
                                                        <span className="text-sm text-gray-400">
                                                            No category
                                                        </span>
                                                    )}
                                                </div>

                                                {/* Price */}
                                                <div>
                                                    <div className="mb-1.5 text-xs font-semibold text-gray-500">
                                                        Price
                                                    </div>
                                                    <p className="text-2xl font-bold text-gray-900">
                                                        ${product.price}
                                                    </p>
                                                </div>

                                                {/* Stock Status */}
                                                <div>
                                                    <div className="mb-1.5 text-xs font-semibold text-gray-500">
                                                        Stock Status
                                                    </div>
                                                    <div className="flex flex-col gap-1">
                                                        <span
                                                            className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
                                                                product.stock_status ===
                                                                'in stock'
                                                                    ? 'bg-green-100 text-green-800'
                                                                    : product.stock_status ===
                                                                        'low stock'
                                                                      ? 'bg-yellow-100 text-yellow-800'
                                                                      : 'bg-red-100 text-red-800'
                                                            }`}
                                                        >
                                                            {
                                                                product.stock_status
                                                            }
                                                        </span>
                                                        <span className="text-xs text-gray-600">
                                                            Quantity:{' '}
                                                            {product.stock_quantity ??
                                                                product.stock}
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Color */}
                                                <div>
                                                    <div className="mb-1.5 text-xs font-semibold text-gray-500">
                                                        Color
                                                    </div>
                                                    {product.color ? (
                                                        <div className="flex items-center gap-2">
                                                            <div
                                                                className="h-6 w-6 rounded-full border-2 border-gray-300 shadow-sm"
                                                                style={{
                                                                    backgroundColor:
                                                                        product.color.toLowerCase(),
                                                                }}
                                                            ></div>
                                                            <span className="text-sm font-medium text-gray-700 capitalize">
                                                                {product.color}
                                                            </span>
                                                        </div>
                                                    ) : (
                                                        <span className="text-sm text-gray-400">
                                                            No color
                                                        </span>
                                                    )}
                                                </div>

                                                {/* Gender */}
                                                <div>
                                                    <div className="mb-1.5 text-xs font-semibold text-gray-500">
                                                        Gender
                                                    </div>
                                                    <span
                                                        className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
                                                            product.gender ===
                                                            'male'
                                                                ? 'bg-blue-100 text-blue-800'
                                                                : product.gender ===
                                                                    'female'
                                                                  ? 'bg-pink-100 text-pink-800'
                                                                  : 'bg-gray-100 text-gray-800'
                                                        }`}
                                                    >
                                                        {product.gender ===
                                                        'male'
                                                            ? 'Male'
                                                            : product.gender ===
                                                                'female'
                                                              ? 'Female'
                                                              : 'Unisex'}
                                                    </span>
                                                </div>

                                                {/* Sizes */}
                                                <div>
                                                    <div className="mb-1.5 text-xs font-semibold text-gray-500">
                                                        Sizes
                                                    </div>
                                                    <p className="text-sm text-gray-600">
                                                        {product.foot_numbers ||
                                                            'N/A'}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Card Actions */}
                                            <div className="border-t border-gray-200 bg-gray-50 p-4">
                                                <div className="flex gap-3">
                                                    <button
                                                        onClick={() =>
                                                            handleEditProduct(
                                                                product,
                                                            )
                                                        }
                                                        className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-rose-500 to-pink-600 px-4 py-3 text-sm font-semibold text-white transition-all duration-200 hover:scale-105 hover:from-rose-600 hover:to-pink-700 focus:ring-4 focus:ring-rose-300 focus:outline-none"
                                                    >
                                                        <Edit2 className="h-4 w-4" />
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={() =>
                                                            handleDeleteProduct(
                                                                product,
                                                            )
                                                        }
                                                        className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-red-500 to-red-600 px-4 py-3 text-sm font-semibold text-white transition-all duration-200 hover:scale-105 hover:from-red-600 hover:to-red-700 focus:ring-4 focus:ring-red-300 focus:outline-none"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                        Delete
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-16 text-center">
                                <div className="mb-4 rounded-full bg-gray-100 p-4">
                                    <Package className="h-10 w-10 text-gray-400" />
                                </div>
                                <h3 className="mb-2 text-lg font-bold text-gray-900">
                                    No products found
                                </h3>
                                <p className="mb-6 max-w-md text-sm text-gray-600">
                                    {Object.keys(filters).length > 0
                                        ? 'Try adjusting your filters to see more results.'
                                        : 'Get started by adding your first product to your inventory.'}
                                </p>
                                <button
                                    onClick={handleCreateProduct}
                                    className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-rose-500 to-pink-600 px-6 py-3 text-sm font-semibold text-white shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl focus:ring-4 focus:ring-rose-300 focus:ring-offset-2 focus:outline-none"
                                >
                                    <Plus className="h-5 w-5" />
                                    Add First Product
                                </button>
                            </div>
                        )}

                        {/* Pagination */}
                        {pagination && pagination.last_page > 1 && (
                            <div className="border-t border-gray-200 bg-gray-50 px-6 py-4">
                                <div className="flex items-center justify-between">
                                    <div className="text-xs font-medium text-gray-700">
                                        Showing {pagination.from || 0} to{' '}
                                        {pagination.to || 0} of{' '}
                                        {pagination.total || 0} results
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        {pagination.current_page > 1 && (
                                            <button
                                                onClick={() =>
                                                    router.get(
                                                        '/admin/products',
                                                        {
                                                            ...getCurrentFilters(),
                                                            page:
                                                                pagination.current_page -
                                                                1,
                                                        },
                                                    )
                                                }
                                                className="relative inline-flex items-center rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 transition-colors duration-200 hover:bg-gray-50"
                                            >
                                                Previous
                                            </button>
                                        )}

                                        {Array.from(
                                            { length: pagination.last_page },
                                            (_, i) => i + 1,
                                        ).map((page) => (
                                            <button
                                                key={page}
                                                onClick={() =>
                                                    router.get(
                                                        '/admin/products',
                                                        {
                                                            ...getCurrentFilters(),
                                                            page,
                                                        },
                                                    )
                                                }
                                                className={`relative inline-flex items-center rounded-lg border px-3 py-1.5 text-xs font-medium transition-all duration-200 ${
                                                    page ===
                                                    pagination.current_page
                                                        ? 'scale-105 border-rose-500 bg-gradient-to-r from-rose-500 to-pink-600 text-white shadow-lg'
                                                        : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                                                }`}
                                            >
                                                {page}
                                            </button>
                                        ))}

                                        {pagination.current_page <
                                            pagination.last_page && (
                                            <button
                                                onClick={() =>
                                                    router.get(
                                                        '/admin/products',
                                                        {
                                                            ...getCurrentFilters(),
                                                            page:
                                                                pagination.current_page +
                                                                1,
                                                        },
                                                    )
                                                }
                                                className="relative inline-flex items-center rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 transition-colors duration-200 hover:bg-gray-50"
                                            >
                                                Next
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Product Modal */}
            <ProductModal
                isOpen={showCreateModal || showEditModal}
                onClose={() => {
                    setShowCreateModal(false);
                    setShowEditModal(false);
                    setSelectedProduct(null);
                }}
                product={selectedProduct}
                categories={categories}
                onSave={handleProductSaved}
            />

            {/* Delete Confirmation Modal */}
            {showDeleteModal && selectedProduct && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
                    <div className="w-full max-w-md overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-2xl">
                        <div className="bg-gradient-to-r from-red-500 to-pink-500 px-8 py-6">
                            <h3 className="text-xl font-bold text-white">
                                Confirm Deletion
                            </h3>
                        </div>
                        <div className="p-8">
                            <div className="mb-8 flex items-center gap-4">
                                <div className="rounded-full bg-red-100 p-4">
                                    <Package className="h-8 w-8 text-red-600" />
                                </div>
                                <div>
                                    <p className="text-lg font-semibold text-gray-900">
                                        Delete "{selectedProduct.name}"?
                                    </p>
                                    <p className="mt-1 text-sm text-gray-500">
                                        This action cannot be undone.
                                    </p>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <button
                                    onClick={() => {
                                        setShowDeleteModal(false);
                                        setSelectedProduct(null);
                                    }}
                                    className="flex-1 rounded-2xl border-2 border-gray-300 bg-white px-6 py-4 text-sm font-semibold text-gray-700 transition-all duration-200 hover:border-gray-400 hover:bg-gray-50 focus:ring-4 focus:ring-gray-200 focus:outline-none"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={confirmDelete}
                                    disabled={isLoading}
                                    className="flex-1 rounded-2xl bg-gradient-to-r from-red-500 to-red-600 px-6 py-4 text-sm font-semibold text-white transition-all duration-200 hover:from-red-600 hover:to-red-700 focus:ring-4 focus:ring-red-300 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {isLoading
                                        ? 'Deleting...'
                                        : 'Delete Product'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}
