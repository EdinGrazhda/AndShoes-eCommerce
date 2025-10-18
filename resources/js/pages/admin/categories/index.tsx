import { CategoryModal } from '@/components/CategoryModal';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import {
    Calendar,
    Edit2,
    Filter,
    Hash,
    Plus,
    Search,
    Tags,
    Trash2,
    X,
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Categories',
        href: '/admin/categories',
    },
];

interface Category {
    id: number;
    name: string;
    description?: string;
    slug: string;
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
    sort_by?: string;
    sort_order?: string;
}

interface CategoriesPageProps {
    categories: Category[];
    pagination?: Pagination;
    filters?: Filters;
}

export default function Categories({
    categories = [],
    pagination,
    filters = {},
}: CategoriesPageProps) {
    // Debug logging
    console.log('Categories component received:', {
        categories,
        pagination,
        filters,
        categoriesLength: categories.length,
        categoriesType: typeof categories,
        categoriesIsArray: Array.isArray(categories),
    });

    const [searchTerm, setSearchTerm] = useState(filters.search || '');

    // Modal states
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<Category | null>(
        null,
    );
    const [isLoading, setIsLoading] = useState(false);

    // Real-time filtering with debounce
    const getCurrentFilters = useCallback(() => {
        const filterParams: any = {};
        if (searchTerm) filterParams.search = searchTerm;
        return filterParams;
    }, [searchTerm]);

    const applyFilters = useCallback(() => {
        router.get('/admin/categories', getCurrentFilters(), {
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
    };

    // CRUD Functions
    const handleCreateCategory = () => {
        setSelectedCategory(null);
        setShowCreateModal(true);
    };

    const handleEditCategory = (category: Category) => {
        setSelectedCategory(category);
        setShowEditModal(true);
    };

    const handleDeleteCategory = (category: Category) => {
        setSelectedCategory(category);
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        if (!selectedCategory) return;

        setIsLoading(true);
        try {
            const response = await fetch(
                `/api/categories/${selectedCategory.id}`,
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
                setSelectedCategory(null);
                toast.success('Category deleted successfully!');
                router.reload();
            } else {
                const data = await response.json();
                const errorMessage =
                    data.message || 'Failed to delete category';
                toast.error(errorMessage);
            }
        } catch (error) {
            console.error('Error deleting category:', error);
            toast.error('Network error occurred while deleting the category');
        } finally {
            setIsLoading(false);
        }
    };

    const handleCategorySaved = () => {
        setShowCreateModal(false);
        setShowEditModal(false);
        setSelectedCategory(null);
        router.reload();
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Categories" />

            {/* Main Container */}
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-gray-50">
                <div className="mx-auto max-w-7xl px-6 py-8 lg:px-8">
                    {/* Header Section */}
                    <div className="mb-10 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                        <div className="space-y-2">
                            <div className="flex items-center gap-4">
                                <div className="rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-600 p-3 shadow-lg">
                                    <Tags className="h-7 w-7 text-white" />
                                </div>
                                <div>
                                    <h1 className="text-4xl font-bold tracking-tight text-gray-900 lg:text-5xl">
                                        Categories
                                    </h1>
                                    <p className="mt-2 text-lg text-gray-600">
                                        Organize your products with custom
                                        categories
                                    </p>
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={handleCreateCategory}
                            className="inline-flex items-center gap-3 rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-600 px-8 py-4 text-lg font-semibold text-white shadow-xl transition-all duration-300 hover:scale-105 hover:shadow-2xl focus:ring-4 focus:ring-blue-300 focus:ring-offset-2 focus:outline-none"
                        >
                            <Plus className="h-6 w-6" />
                            Add New Category
                        </button>
                    </div>

                    {/* Smart Filters Section */}
                    <div className="mb-10 overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-2xl">
                        <div className="border-b border-gray-100 bg-gradient-to-r from-slate-50 to-white px-8 py-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 p-3 shadow-lg">
                                        <Filter className="h-5 w-5 text-white" />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900">
                                        Smart Filters
                                    </h3>
                                </div>
                                <button
                                    onClick={clearFilters}
                                    className="inline-flex items-center gap-2 rounded-xl bg-gray-100 px-6 py-3 text-sm font-semibold text-gray-700 transition-all duration-200 hover:scale-105 hover:bg-gray-200 hover:text-gray-900"
                                >
                                    <X className="h-4 w-4" />
                                    Clear All
                                </button>
                            </div>
                        </div>

                        <div className="p-8">
                            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
                                {/* Search */}
                                <div className="space-y-3">
                                    <label className="text-sm font-semibold tracking-wide text-gray-700">
                                        Search Categories
                                    </label>
                                    <div className="relative">
                                        <Search className="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-gray-400" />
                                        <input
                                            type="text"
                                            value={searchTerm}
                                            onChange={(e) =>
                                                setSearchTerm(e.target.value)
                                            }
                                            placeholder="Type to search..."
                                            className="w-full rounded-2xl border-2 border-gray-200 bg-gray-50/50 py-4 pr-4 pl-12 text-sm font-medium transition-all duration-300 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100 focus:outline-none"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Categories Table Section */}
                    <div className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-2xl">
                        <div className="border-b border-gray-100 bg-gradient-to-r from-slate-50 to-white px-8 py-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="rounded-xl bg-gradient-to-r from-purple-500 to-violet-600 p-3 shadow-lg">
                                        <Tags className="h-5 w-5 text-white" />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900">
                                        Categories List (
                                        {pagination?.total || categories.length}{' '}
                                        items)
                                    </h3>
                                </div>
                                <div className="text-sm font-medium text-gray-600">
                                    Showing {pagination?.from || 0} to{' '}
                                    {pagination?.to || 0} of{' '}
                                    {pagination?.total || categories.length}{' '}
                                    categories
                                </div>
                            </div>
                        </div>

                        {categories.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="w-full divide-y divide-gray-200">
                                    <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                                        <tr>
                                            <th className="px-8 py-6 text-left text-xs font-bold tracking-wider text-gray-700 uppercase">
                                                ID
                                            </th>
                                            <th className="px-8 py-6 text-left text-xs font-bold tracking-wider text-gray-700 uppercase">
                                                Category
                                            </th>
                                            <th className="px-8 py-6 text-left text-xs font-bold tracking-wider text-gray-700 uppercase">
                                                Slug
                                            </th>
                                            <th className="px-8 py-6 text-left text-xs font-bold tracking-wider text-gray-700 uppercase">
                                                Description
                                            </th>
                                            <th className="px-8 py-6 text-left text-xs font-bold tracking-wider text-gray-700 uppercase">
                                                Created
                                            </th>
                                            <th className="px-8 py-6 text-right text-xs font-bold tracking-wider text-gray-700 uppercase">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 bg-white">
                                        {categories.map((category, index) => (
                                            <tr
                                                key={category.id}
                                                className={`transition-all duration-300 hover:bg-gradient-to-r hover:from-gray-50 hover:to-white hover:shadow-lg ${
                                                    index % 2 === 0
                                                        ? 'bg-white'
                                                        : 'bg-gray-50/30'
                                                }`}
                                            >
                                                {/* ID */}
                                                <td className="px-8 py-6 whitespace-nowrap">
                                                    <div className="flex items-center gap-3">
                                                        <div className="rounded-lg bg-gradient-to-r from-gray-100 to-gray-200 p-2">
                                                            <Hash className="h-4 w-4 text-gray-600" />
                                                        </div>
                                                        <span className="text-sm font-semibold text-gray-900">
                                                            {category.id}
                                                        </span>
                                                    </div>
                                                </td>

                                                {/* Category Info */}
                                                <td className="px-8 py-6 whitespace-nowrap">
                                                    <div className="flex items-center gap-4">
                                                        <div className="rounded-xl bg-gradient-to-r from-blue-100 to-indigo-100 p-3">
                                                            <Tags className="h-6 w-6 text-blue-600" />
                                                        </div>
                                                        <div>
                                                            <div className="text-lg font-bold text-gray-900">
                                                                {category.name}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* Slug */}
                                                <td className="px-8 py-6 whitespace-nowrap">
                                                    <span className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-800">
                                                        /{category.slug}
                                                    </span>
                                                </td>

                                                {/* Description */}
                                                <td className="px-8 py-6">
                                                    <div className="max-w-xs">
                                                        <p className="line-clamp-2 text-sm text-gray-600">
                                                            {category.description ||
                                                                'No description provided'}
                                                        </p>
                                                    </div>
                                                </td>

                                                {/* Created Date */}
                                                <td className="px-8 py-6 whitespace-nowrap">
                                                    <div className="flex items-center gap-2 text-sm text-gray-500">
                                                        <Calendar className="h-4 w-4" />
                                                        {category.created_at
                                                            ? formatDate(
                                                                  category.created_at,
                                                              )
                                                            : 'Unknown'}
                                                    </div>
                                                </td>

                                                {/* Actions */}
                                                <td className="px-8 py-6 text-right text-sm font-medium whitespace-nowrap">
                                                    <div className="flex items-center justify-end gap-3">
                                                        <button
                                                            onClick={() =>
                                                                handleEditCategory(
                                                                    category,
                                                                )
                                                            }
                                                            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 px-4 py-2 text-sm font-semibold text-white transition-all duration-200 hover:scale-105 hover:from-blue-600 hover:to-indigo-700 focus:ring-4 focus:ring-blue-300 focus:outline-none"
                                                        >
                                                            <Edit2 className="h-4 w-4" />
                                                            Edit
                                                        </button>
                                                        <button
                                                            onClick={() =>
                                                                handleDeleteCategory(
                                                                    category,
                                                                )
                                                            }
                                                            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-red-500 to-red-600 px-4 py-2 text-sm font-semibold text-white transition-all duration-200 hover:scale-105 hover:from-red-600 hover:to-red-700 focus:ring-4 focus:ring-red-300 focus:outline-none"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                            Delete
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-20 text-center">
                                <div className="mb-6 rounded-full bg-gray-100 p-6">
                                    <Tags className="h-12 w-12 text-gray-400" />
                                </div>
                                <h3 className="mb-3 text-xl font-bold text-gray-900">
                                    No categories found
                                </h3>
                                <p className="mb-8 max-w-md text-gray-600">
                                    {Object.keys(filters).length > 0
                                        ? 'Try adjusting your filters to see more results.'
                                        : 'Get started by creating your first category to organize your products.'}
                                </p>
                                <button
                                    onClick={handleCreateCategory}
                                    className="inline-flex items-center gap-3 rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-600 px-8 py-4 text-lg font-semibold text-white shadow-xl transition-all duration-300 hover:scale-105 hover:shadow-2xl focus:ring-4 focus:ring-blue-300 focus:ring-offset-2 focus:outline-none"
                                >
                                    <Plus className="h-6 w-6" />
                                    Create First Category
                                </button>
                            </div>
                        )}

                        {/* Pagination */}
                        {pagination && pagination.last_page > 1 && (
                            <div className="border-t border-gray-200 bg-gray-50 px-8 py-6">
                                <div className="flex items-center justify-between">
                                    <div className="text-sm font-medium text-gray-700">
                                        Showing {pagination.from || 0} to{' '}
                                        {pagination.to || 0} of{' '}
                                        {pagination.total || 0} results
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {pagination.current_page > 1 && (
                                            <button
                                                onClick={() =>
                                                    router.get(
                                                        '/admin/categories',
                                                        {
                                                            ...getCurrentFilters(),
                                                            page:
                                                                pagination.current_page -
                                                                1,
                                                        },
                                                    )
                                                }
                                                className="relative inline-flex items-center rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors duration-200 hover:bg-gray-50"
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
                                                        '/admin/categories',
                                                        {
                                                            ...getCurrentFilters(),
                                                            page,
                                                        },
                                                    )
                                                }
                                                className={`relative inline-flex items-center rounded-xl border px-4 py-2 text-sm font-medium transition-all duration-200 ${
                                                    page ===
                                                    pagination.current_page
                                                        ? 'scale-105 border-blue-500 bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg'
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
                                                        '/admin/categories',
                                                        {
                                                            ...getCurrentFilters(),
                                                            page:
                                                                pagination.current_page +
                                                                1,
                                                        },
                                                    )
                                                }
                                                className="relative inline-flex items-center rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors duration-200 hover:bg-gray-50"
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

            {/* Category Modal */}
            <CategoryModal
                isOpen={showCreateModal || showEditModal}
                onClose={() => {
                    setShowCreateModal(false);
                    setShowEditModal(false);
                    setSelectedCategory(null);
                }}
                category={selectedCategory}
                onSave={handleCategorySaved}
            />

            {/* Delete Confirmation Modal */}
            {showDeleteModal && selectedCategory && (
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
                                    <Tags className="h-8 w-8 text-red-600" />
                                </div>
                                <div>
                                    <p className="text-lg font-semibold text-gray-900">
                                        Delete "{selectedCategory.name}"?
                                    </p>
                                    <p className="mt-1 text-sm text-gray-500">
                                        This action cannot be undone. All
                                        products in this category will be
                                        unassigned.
                                    </p>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <button
                                    onClick={() => {
                                        setShowDeleteModal(false);
                                        setSelectedCategory(null);
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
                                        : 'Delete Category'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}
