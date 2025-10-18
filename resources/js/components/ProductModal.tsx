import { X } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

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
    stock: 'in stock' | 'out of stock' | 'low stock';
    foot_numbers?: string;
    color?: string;
    category?: Category;
    category_id?: number;
}

interface ProductModalProps {
    product?: Product | null;
    categories: Category[];
    isOpen: boolean;
    onClose: () => void;
    onSave: () => void;
}

interface FormData {
    name: string;
    description: string;
    price: string;
    image: string;
    stock: 'in stock' | 'out of stock' | 'low stock';
    foot_numbers: string;
    color: string;
    category_id: number | '';
}

export default function ProductModal({
    product,
    categories,
    isOpen,
    onClose,
    onSave,
}: ProductModalProps) {
    const [formData, setFormData] = useState<FormData>({
        name: product?.name || '',
        description: product?.description || '',
        price: product?.price?.toString() || '',
        image: product?.image || '',
        stock: product?.stock || 'in stock',
        foot_numbers: product?.foot_numbers || '',
        color: product?.color || '',
        category_id: product?.category_id || product?.category?.id || '',
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState<Record<string, string[]>>({});

    // Reset form when product changes or modal opens
    useEffect(() => {
        if (isOpen) {
            setFormData({
                name: product?.name || '',
                description: product?.description || '',
                price: product?.price?.toString() || '',
                image: product?.image || '',
                stock: product?.stock || 'in stock',
                foot_numbers: product?.foot_numbers || '',
                color: product?.color || '',
                category_id:
                    product?.category_id || product?.category?.id || '',
            });
            setErrors({});
        }
    }, [product, isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setErrors({});

        console.log('Submitting product:', {
            product,
            formData,
            url: product ? `/api/products/${product.id}` : '/api/products',
            method: product ? 'PUT' : 'POST',
        });

        try {
            const url = product
                ? `/api/products/${product.id}`
                : '/api/products';

            const method = product ? 'PUT' : 'POST';

            const payload = {
                ...formData,
                price: parseFloat(formData.price),
            };

            console.log('Request payload:', payload);

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-CSRF-TOKEN':
                        document
                            .querySelector('meta[name="csrf-token"]')
                            ?.getAttribute('content') || '',
                },
                body: JSON.stringify(payload),
            });

            console.log('Response status:', response.status);

            const data = await response.json();
            console.log('Response data:', data);

            if (response.ok) {
                const action = product ? 'updated' : 'created';
                toast.success(`Product ${action} successfully!`);
                onSave();
            } else {
                console.error('API Error:', {
                    status: response.status,
                    statusText: response.statusText,
                    data: data,
                });

                if (data.errors) {
                    setErrors(data.errors);
                    toast.error(
                        'Please fix the validation errors and try again.',
                    );
                } else {
                    const errorMessage =
                        data.message ||
                        `Error ${response.status}: ${response.statusText}`;
                    toast.error(errorMessage);
                }
            }
        } catch (error) {
            console.error('Error saving product:', error);
            toast.error('Network error occurred while saving the product');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleInputChange = (
        field: keyof FormData,
        value: string | number,
    ) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        // Clear error for this field
        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: [] }));
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-screen items-center justify-center p-2 sm:p-4">
                {/* Backdrop */}
                <div
                    className="fixed inset-0 bg-white/20 backdrop-blur-sm transition-all duration-300"
                    onClick={onClose}
                />

                {/* Modal */}
                <div className="relative my-2 w-full max-w-lg rounded-lg bg-white shadow-xl">
                    {/* Header */}
                    <div className="flex items-center justify-between border-b px-4 py-3">
                        <h2 className="text-lg font-semibold">
                            {product ? 'Edit Product' : 'Create New Product'}
                        </h2>
                        <button
                            onClick={onClose}
                            className="rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="p-4">
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            {/* Name */}
                            <div className="sm:col-span-2">
                                <label className="mb-1 block text-sm font-medium text-gray-700">
                                    Product Name *
                                </label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) =>
                                        handleInputChange(
                                            'name',
                                            e.target.value,
                                        )
                                    }
                                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-rose-500 focus:ring-1 focus:ring-rose-500 focus:outline-none"
                                    required
                                />
                                {errors.name && (
                                    <p className="mt-1 text-xs text-red-600">
                                        {errors.name[0]}
                                    </p>
                                )}
                            </div>

                            {/* Price */}
                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">
                                    Price *
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={formData.price}
                                    onChange={(e) =>
                                        handleInputChange(
                                            'price',
                                            e.target.value,
                                        )
                                    }
                                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-rose-500 focus:ring-1 focus:ring-rose-500 focus:outline-none"
                                    required
                                />
                                {errors.price && (
                                    <p className="mt-1 text-xs text-red-600">
                                        {errors.price[0]}
                                    </p>
                                )}
                            </div>

                            {/* Stock Status */}
                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">
                                    Stock Status *
                                </label>
                                <select
                                    value={formData.stock}
                                    onChange={(e) =>
                                        handleInputChange(
                                            'stock',
                                            e.target.value as any,
                                        )
                                    }
                                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 focus:outline-none"
                                    required
                                >
                                    <option value="in stock">In Stock</option>
                                    <option value="low stock">Low Stock</option>
                                    <option value="out of stock">
                                        Out of Stock
                                    </option>
                                </select>
                                {errors.stock && (
                                    <p className="mt-1 text-sm text-red-600">
                                        {errors.stock[0]}
                                    </p>
                                )}
                            </div>

                            {/* Color */}
                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">
                                    Color
                                </label>
                                <input
                                    type="text"
                                    value={formData.color}
                                    onChange={(e) =>
                                        handleInputChange(
                                            'color',
                                            e.target.value,
                                        )
                                    }
                                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-rose-500 focus:ring-1 focus:ring-rose-500 focus:outline-none"
                                    placeholder="e.g., Red, Blue, Black"
                                />
                                {errors.color && (
                                    <p className="mt-1 text-xs text-red-600">
                                        {errors.color[0]}
                                    </p>
                                )}
                            </div>

                            {/* Foot Numbers */}
                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">
                                    Available Sizes
                                </label>
                                <input
                                    type="text"
                                    value={formData.foot_numbers}
                                    onChange={(e) =>
                                        handleInputChange(
                                            'foot_numbers',
                                            e.target.value,
                                        )
                                    }
                                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-rose-500 focus:ring-1 focus:ring-rose-500 focus:outline-none"
                                    placeholder="e.g., 38, 39, 40, 41, 42"
                                />
                                {errors.foot_numbers && (
                                    <p className="mt-1 text-xs text-red-600">
                                        {errors.foot_numbers[0]}
                                    </p>
                                )}
                            </div>

                            {/* Image URL */}
                            <div className="sm:col-span-2">
                                <label className="mb-1 block text-sm font-medium text-gray-700">
                                    Image URL
                                </label>
                                <input
                                    type="text"
                                    value={formData.image}
                                    onChange={(e) =>
                                        handleInputChange(
                                            'image',
                                            e.target.value,
                                        )
                                    }
                                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-rose-500 focus:ring-1 focus:ring-rose-500 focus:outline-none"
                                    placeholder="https://example.com/image.jpg"
                                />
                                {errors.image && (
                                    <p className="mt-1 text-xs text-red-600">
                                        {errors.image[0]}
                                    </p>
                                )}
                            </div>

                            {/* Description */}
                            <div className="sm:col-span-2">
                                <label className="mb-1 block text-sm font-medium text-gray-700">
                                    Description
                                </label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) =>
                                        handleInputChange(
                                            'description',
                                            e.target.value,
                                        )
                                    }
                                    rows={2}
                                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-rose-500 focus:ring-1 focus:ring-rose-500 focus:outline-none"
                                    placeholder="Product description..."
                                />
                                {errors.description && (
                                    <p className="mt-1 text-xs text-red-600">
                                        {errors.description[0]}
                                    </p>
                                )}
                            </div>

                            {/* Category */}
                            <div className="sm:col-span-2">
                                <label className="mb-1 block text-sm font-medium text-gray-700">
                                    Category *
                                </label>
                                <select
                                    value={formData.category_id}
                                    onChange={(e) =>
                                        handleInputChange(
                                            'category_id',
                                            parseInt(e.target.value) || '',
                                        )
                                    }
                                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-rose-500 focus:ring-1 focus:ring-rose-500 focus:outline-none"
                                    required
                                >
                                    <option value="">Select a category</option>
                                    {categories.map((category) => (
                                        <option
                                            key={category.id}
                                            value={category.id}
                                        >
                                            {category.name}
                                        </option>
                                    ))}
                                </select>
                                {errors.category_id && (
                                    <p className="mt-1 text-xs text-red-600">
                                        {errors.category_id[0]}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="mt-4 flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={onClose}
                                className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:ring-2 focus:ring-rose-500 focus:outline-none"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="rounded-md bg-rose-600 px-4 py-2 text-sm font-medium text-white hover:bg-rose-700 focus:ring-2 focus:ring-rose-500 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {isSubmitting
                                    ? 'Saving...'
                                    : product
                                      ? 'Update Product'
                                      : 'Create Product'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
