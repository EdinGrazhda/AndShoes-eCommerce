import { Image as ImageIcon, Upload, X } from 'lucide-react';
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
    stock: number; // Now represents quantity
    stock_quantity?: number; // Backend field
    stock_status?: string; // Calculated status
    foot_numbers?: string;
    color?: string;
    gender?: 'male' | 'female' | 'unisex';
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
    imageFile: File | null; // Add file field
    stock: number; // Now quantity
    foot_numbers: string;
    color: string;
    category_id: number | '';
    gender: 'male' | 'female' | 'unisex';
    sizeStocks: Record<string, number>; // New field for size-specific stock
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
        imageFile: null,
        stock: product?.stock_quantity ?? product?.stock ?? 0,
        foot_numbers: product?.foot_numbers || '',
        color: product?.color || '',
        category_id: product?.category_id || product?.category?.id || '',
        gender: product?.gender || 'unisex',
        sizeStocks: {},
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState<Record<string, string[]>>({});

    // Reset form when product changes or modal opens
    useEffect(() => {
        if (isOpen) {
            // If product contains sizeStocks, normalize into map { size: quantity }
            let initialSizeStocks: Record<string, number> = {};
            if (product && (product as any).sizeStocks) {
                const ss = (product as any).sizeStocks;
                // If it's an array of {size, quantity}
                if (Array.isArray(ss)) {
                    ss.forEach((item: any) => {
                        if (item && item.size) {
                            initialSizeStocks[item.size] =
                                Number(item.quantity) || 0;
                        }
                    });
                } else if (typeof ss === 'object') {
                    // If it's already a map { size: { quantity } } or { size: qty }
                    Object.keys(ss).forEach((k) => {
                        const val = ss[k];
                        if (
                            val &&
                            typeof val === 'object' &&
                            'quantity' in val
                        ) {
                            initialSizeStocks[k] = Number(val.quantity) || 0;
                        } else {
                            initialSizeStocks[k] = Number(val) || 0;
                        }
                    });
                }
            }

            const initialTotal = Object.values(initialSizeStocks).reduce(
                (s, v) => s + v,
                0,
            );

            setFormData({
                name: product?.name || '',
                description: product?.description || '',
                price: product?.price?.toString() || '',
                image: product?.image || '',
                imageFile: null,
                stock:
                    initialTotal > 0
                        ? initialTotal
                        : (product?.stock_quantity ?? product?.stock ?? 0),
                foot_numbers: product?.foot_numbers || '',
                color: product?.color || '',
                category_id:
                    product?.category_id || product?.category?.id || '',
                gender: product?.gender || 'unisex',
                sizeStocks: initialSizeStocks,
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

            // Use FormData for file upload
            const payload = new FormData();
            payload.append('name', formData.name);
            payload.append('description', formData.description);
            payload.append('price', formData.price);
            payload.append('stock', formData.stock.toString());
            payload.append('foot_numbers', formData.foot_numbers);
            payload.append('color', formData.color);
            payload.append('category_id', formData.category_id.toString());
            payload.append('gender', formData.gender);

            // Add image file if selected
            if (formData.imageFile) {
                payload.append('image', formData.imageFile);
            } else if (formData.image) {
                // Fallback to image URL if no file selected
                payload.append('image', formData.image);
            }

            // Attach size-specific stocks if provided
            if (Object.keys(formData.sizeStocks).length > 0) {
                // Convert to the format backend expects: {"38": {"quantity": 10}, "39": {"quantity": 20}}
                const sizeStocksObject: Record<string, { quantity: number }> =
                    {};
                Object.entries(formData.sizeStocks).forEach(
                    ([size, quantity]) => {
                        sizeStocksObject[size] = { quantity: Number(quantity) };
                    },
                );
                payload.append('size_stocks', JSON.stringify(sizeStocksObject));
                // Keep total stock in sync
                payload.set(
                    'stock',
                    String(
                        Object.values(formData.sizeStocks).reduce(
                            (s, v) => s + v,
                            0,
                        ),
                    ),
                );
            }

            console.log('Request payload with file:', formData.imageFile);

            const response = await fetch(url, {
                method,
                headers: {
                    Accept: 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-CSRF-TOKEN':
                        document
                            .querySelector('meta[name="csrf-token"]')
                            ?.getAttribute('content') || '',
                },
                body: payload, // Send FormData
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

    // Helper function to parse sizes from foot_numbers string
    const parseSizes = (sizeString: string): string[] => {
        return sizeString
            .split(',')
            .map((size) => size.trim())
            .filter((size) => size.length > 0);
    };

    // Helper function to handle size stock changes
    const handleSizeStockChange = (size: string, stock: number) => {
        setFormData((prev) => {
            const newSizeStocks = {
                ...prev.sizeStocks,
                [size]: stock,
            };
            const total = Object.values(newSizeStocks).reduce(
                (s, v) => s + v,
                0,
            );
            return {
                ...prev,
                sizeStocks: newSizeStocks,
                stock: total,
            };
        });
    };

    // Helper function to remove a size from stock tracking
    const removeSizeStock = (size: string) => {
        setFormData((prev) => {
            const newSizeStocks = { ...prev.sizeStocks };
            delete newSizeStocks[size];
            const total = Object.values(newSizeStocks).reduce(
                (s, v) => s + v,
                0,
            );
            return {
                ...prev,
                sizeStocks: newSizeStocks,
                stock: total,
            };
        });
    };

    // Get sizes from foot_numbers
    const availableSizes = parseSizes(formData.foot_numbers);

    // Helper function to auto-populate size stocks based on general stock quantity
    const autoPopulateSizeStocks = () => {
        if (availableSizes.length === 0) return;

        const total = Number(formData.stock) || 0;
        const base = Math.floor(total / availableSizes.length);
        const remainder = total % availableSizes.length;

        const newSizeStocks: Record<string, number> = {};
        availableSizes.forEach((size, idx) => {
            newSizeStocks[size] = base + (idx < remainder ? 1 : 0);
        });

        setFormData((prev) => ({
            ...prev,
            sizeStocks: newSizeStocks,
            stock: Object.values(newSizeStocks).reduce((s, v) => s + v, 0),
        }));
    };

    // Calculate total stock from individual size stocks
    const totalSizeStock = Object.values(formData.sizeStocks).reduce(
        (sum, stock) => sum + stock,
        0,
    );

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-screen items-center justify-center p-2 sm:p-4">
                {/* Backdrop */}
                <div
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-all duration-300"
                    onClick={onClose}
                />

                {/* Modal */}
                <div className="relative my-2 w-full max-w-xl rounded-xl bg-white shadow-2xl">
                    {/* Header */}
                    <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
                        <h2 className="text-lg font-bold text-gray-900">
                            {product ? 'Edit Product' : 'Create New Product'}
                        </h2>
                        <button
                            onClick={onClose}
                            className="rounded-full p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="p-5">
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            {/* Name */}
                            <div className="sm:col-span-2">
                                <label className="mb-1.5 block text-sm font-semibold text-gray-700">
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
                                    className="w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-sm transition-colors focus:border-rose-500 focus:bg-white focus:ring-2 focus:ring-rose-200 focus:outline-none"
                                    placeholder="Enter product name"
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
                                <label className="mb-1.5 block text-sm font-semibold text-gray-700">
                                    Price *
                                </label>
                                <div className="relative">
                                    <span className="absolute top-1/2 left-3 -translate-y-1/2 text-sm text-gray-500">
                                        $
                                    </span>
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
                                        className="w-full rounded-lg border border-gray-300 bg-gray-50 py-2 pr-3 pl-7 text-sm transition-colors focus:border-rose-500 focus:bg-white focus:ring-2 focus:ring-rose-200 focus:outline-none"
                                        placeholder="0.00"
                                        required
                                    />
                                </div>
                                {errors.price && (
                                    <p className="mt-1 text-xs text-red-600">
                                        {errors.price[0]}
                                    </p>
                                )}
                            </div>

                            {/* Stock Quantity */}
                            <div>
                                <label className="mb-1.5 block text-sm font-semibold text-gray-700">
                                    Stock Quantity *
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    value={formData.stock}
                                    onChange={(e) =>
                                        handleInputChange(
                                            'stock',
                                            e.target.value,
                                        )
                                    }
                                    className="w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-sm transition-colors focus:border-rose-500 focus:bg-white focus:ring-2 focus:ring-rose-200 focus:outline-none"
                                    placeholder="0"
                                    required
                                />
                                <p className="mt-1 text-xs text-gray-500">
                                    0 = Out of Stock, 1-10 = Low Stock, 11+ = In
                                    Stock
                                </p>
                                {errors.stock && (
                                    <p className="mt-1 text-xs text-red-600">
                                        {errors.stock[0]}
                                    </p>
                                )}
                            </div>

                            {/* Gender */}
                            <div>
                                <label className="mb-1.5 block text-sm font-semibold text-gray-700">
                                    Gender *
                                </label>
                                <select
                                    value={formData.gender}
                                    onChange={(e) =>
                                        handleInputChange(
                                            'gender',
                                            e.target.value as any,
                                        )
                                    }
                                    className="w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-sm transition-colors focus:border-rose-500 focus:bg-white focus:ring-2 focus:ring-rose-200 focus:outline-none"
                                    required
                                >
                                    <option value="unisex">Unisex</option>
                                    <option value="male">Male</option>
                                    <option value="female">Female</option>
                                </select>
                                {errors.gender && (
                                    <p className="mt-1 text-xs text-red-600">
                                        {errors.gender[0]}
                                    </p>
                                )}
                            </div>

                            {/* Color */}
                            <div>
                                <label className="mb-1.5 block text-sm font-semibold text-gray-700">
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
                                    className="w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-sm transition-colors focus:border-rose-500 focus:bg-white focus:ring-2 focus:ring-rose-200 focus:outline-none"
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
                                <label className="mb-1.5 block text-sm font-semibold text-gray-700">
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
                                    className="w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-sm transition-colors focus:border-rose-500 focus:bg-white focus:ring-2 focus:ring-rose-200 focus:outline-none"
                                    placeholder="e.g., 38, 39, 40, 41, 42"
                                />
                                {errors.foot_numbers && (
                                    <p className="mt-1 text-xs text-red-600">
                                        {errors.foot_numbers[0]}
                                    </p>
                                )}
                            </div>

                            {/* Size-Specific Stock Management */}
                            {availableSizes.length > 0 && (
                                <div className="sm:col-span-2">
                                    <div className="mb-2 flex items-center justify-between">
                                        <label className="block text-sm font-semibold text-gray-700">
                                            Stock Quantity per Size
                                        </label>
                                        <button
                                            type="button"
                                            onClick={autoPopulateSizeStocks}
                                            className="rounded-lg border border-blue-300 bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700 transition-colors hover:bg-blue-100"
                                        >
                                            Auto-fill
                                        </button>
                                    </div>
                                    <div className="max-h-40 space-y-2 overflow-y-auto rounded-lg border border-gray-200 bg-gradient-to-br from-gray-50 to-gray-100 p-3">
                                        {availableSizes.map((size) => (
                                            <div
                                                key={size}
                                                className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-2.5 shadow-sm transition-shadow hover:shadow-md"
                                            >
                                                <div className="flex flex-1 items-center gap-2.5">
                                                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-rose-100 text-xs font-bold text-rose-700">
                                                        {size}
                                                    </span>
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        value={
                                                            formData.sizeStocks[
                                                                size
                                                            ] || 0
                                                        }
                                                        onChange={(e) =>
                                                            handleSizeStockChange(
                                                                size,
                                                                parseInt(
                                                                    e.target
                                                                        .value,
                                                                ) || 0,
                                                            )
                                                        }
                                                        className="w-20 rounded-lg border border-gray-300 bg-gray-50 px-2.5 py-1.5 text-sm font-medium transition-colors focus:border-rose-500 focus:bg-white focus:ring-2 focus:ring-rose-200 focus:outline-none"
                                                        placeholder="0"
                                                    />
                                                    <span className="text-xs font-medium text-gray-500">
                                                        units
                                                    </span>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        removeSizeStock(size)
                                                    }
                                                    className="ml-2 rounded-lg px-2 py-1 text-lg font-bold text-red-500 transition-colors hover:bg-red-50 hover:text-red-700"
                                                    title={`Remove size ${size}`}
                                                >
                                                    ×
                                                </button>
                                            </div>
                                        ))}
                                        {availableSizes.length === 0 && (
                                            <p className="py-3 text-center text-sm text-gray-500">
                                                Add sizes above to manage stock
                                                quantities
                                            </p>
                                        )}
                                    </div>
                                    <p className="mt-1.5 text-xs text-gray-500">
                                        Set individual stock quantities for each
                                        size. Leave empty or 0 for out of stock.
                                    </p>
                                    {totalSizeStock > 0 && (
                                        <div className="mt-2 rounded-lg border border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 p-2.5">
                                            <p className="text-xs font-semibold text-blue-800">
                                                📦 Total Stock: {totalSizeStock}{' '}
                                                units across all sizes
                                            </p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Image Upload */}
                            <div className="sm:col-span-2">
                                <label className="mb-1.5 block text-sm font-semibold text-gray-700">
                                    Product Image
                                </label>
                                <div className="flex items-center gap-3">
                                    {/* Preview */}
                                    <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-lg border-2 border-dashed border-gray-300 bg-gray-50">
                                        {formData.imageFile ? (
                                            <img
                                                src={URL.createObjectURL(
                                                    formData.imageFile,
                                                )}
                                                alt="Preview"
                                                className="h-full w-full object-cover"
                                            />
                                        ) : formData.image ? (
                                            <img
                                                src={formData.image}
                                                alt="Current"
                                                className="h-full w-full object-cover"
                                            />
                                        ) : (
                                            <div className="flex h-full w-full items-center justify-center">
                                                <ImageIcon className="h-8 w-8 text-gray-400" />
                                            </div>
                                        )}
                                    </div>

                                    {/* File Input */}
                                    <div className="flex-1">
                                        <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 px-4 py-6 text-center transition-all hover:border-rose-500 hover:bg-rose-50">
                                            <Upload className="h-5 w-5 text-gray-400" />
                                            <div className="text-left">
                                                <p className="text-sm font-semibold text-gray-700">
                                                    {formData.imageFile
                                                        ? formData.imageFile
                                                              .name
                                                        : 'Choose image file'}
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    PNG, JPG, GIF up to 2MB
                                                </p>
                                            </div>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                className="hidden"
                                                onChange={(e) => {
                                                    const file =
                                                        e.target.files?.[0];
                                                    if (file) {
                                                        setFormData((prev) => ({
                                                            ...prev,
                                                            imageFile: file,
                                                        }));
                                                    }
                                                }}
                                            />
                                        </label>
                                    </div>
                                </div>
                                {errors.image && (
                                    <p className="mt-1 text-xs text-red-600">
                                        {errors.image[0]}
                                    </p>
                                )}
                            </div>

                            {/* Description */}
                            <div className="sm:col-span-2">
                                <label className="mb-1.5 block text-sm font-semibold text-gray-700">
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
                                    className="w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-sm transition-colors focus:border-rose-500 focus:bg-white focus:ring-2 focus:ring-rose-200 focus:outline-none"
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
                                <label className="mb-1.5 block text-sm font-semibold text-gray-700">
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
                                    className="w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-sm transition-colors focus:border-rose-500 focus:bg-white focus:ring-2 focus:ring-rose-200 focus:outline-none"
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
                        <div className="mt-6 flex justify-end gap-2.5 border-t border-gray-100 pt-4">
                            <button
                                type="button"
                                onClick={onClose}
                                className="rounded-lg border-2 border-gray-300 px-5 py-2 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50 focus:ring-2 focus:ring-rose-500 focus:outline-none"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="rounded-lg bg-gradient-to-r from-rose-600 to-pink-600 px-5 py-2 text-sm font-semibold text-white shadow-lg transition-all hover:from-rose-700 hover:to-pink-700 hover:shadow-xl focus:ring-2 focus:ring-rose-500 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
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
