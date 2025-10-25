import { Calendar, DollarSign, Percent, Tag, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface Product {
    id: number;
    name: string;
    price: number;
    image?: string;
}

interface Campaign {
    id: number;
    name: string;
    description?: string;
    price: number;
    start_date: string;
    end_date: string;
    product_id: number;
    product?: Product;
    banner_image?: string;
    banner_color?: string;
    is_active: boolean;
}

interface CampaignModalProps {
    isOpen: boolean;
    onClose: () => void;
    campaign: Campaign | null;
    products: Product[];
    onSave: () => void;
}

export function CampaignModal({
    isOpen,
    onClose,
    campaign,
    products,
    onSave,
}: CampaignModalProps) {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        start_date: '',
        end_date: '',
        product_id: '',
        banner_image: '',
        banner_color: '#ef4444',
        is_active: true,
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState<Record<string, string[]>>({});
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(
        null,
    );
    const [discountPercentage, setDiscountPercentage] = useState(0);

    // Reset form when modal opens/closes or campaign changes
    useEffect(() => {
        if (isOpen) {
            if (campaign) {
                // Editing existing campaign
                setFormData({
                    name: campaign.name || '',
                    description: campaign.description || '',
                    price: campaign.price.toString(),
                    start_date: campaign.start_date || '',
                    end_date: campaign.end_date || '',
                    product_id: campaign.product_id?.toString() || '',
                    banner_image: campaign.banner_image || '',
                    banner_color: campaign.banner_color || '#ef4444',
                    is_active: campaign.is_active ?? true,
                });

                // Set selected product
                const product = products.find(
                    (p) => p.id === campaign.product_id,
                );
                setSelectedProduct(product || null);

                // Calculate discount percentage
                if (product && campaign.price) {
                    const productPrice =
                        typeof product.price === 'number'
                            ? product.price
                            : parseFloat(product.price);
                    const discount =
                        ((productPrice - campaign.price) / productPrice) * 100;
                    setDiscountPercentage(Math.round(discount));
                }
            } else {
                // Creating new campaign
                setFormData({
                    name: '',
                    description: '',
                    price: '',
                    start_date: '',
                    end_date: '',
                    product_id: '',
                    banner_image: '',
                    banner_color: '#ef4444',
                    is_active: true,
                });
                setSelectedProduct(null);
                setDiscountPercentage(0);
            }
            setErrors({});
        }
    }, [isOpen, campaign, products]);

    // Handle product selection
    const handleProductChange = (productId: string) => {
        const product = products.find((p) => p.id === parseInt(productId));
        setSelectedProduct(product || null);
        setFormData((prev) => ({ ...prev, product_id: productId, price: '' }));
        setDiscountPercentage(0);
    };

    // Handle discount percentage change
    const handleDiscountChange = (discount: number) => {
        if (!selectedProduct) return;

        const clampedDiscount = Math.max(0, Math.min(100, discount));
        setDiscountPercentage(clampedDiscount);

        const productPrice =
            typeof selectedProduct.price === 'number'
                ? selectedProduct.price
                : parseFloat(selectedProduct.price);
        const salePrice = productPrice * (1 - clampedDiscount / 100);
        setFormData((prev) => ({
            ...prev,
            price: salePrice.toFixed(2),
        }));
    };

    // Handle price change
    const handlePriceChange = (price: string) => {
        if (!selectedProduct) return;

        setFormData((prev) => ({ ...prev, price }));

        const priceNum = parseFloat(price);
        const productPrice =
            typeof selectedProduct.price === 'number'
                ? selectedProduct.price
                : parseFloat(selectedProduct.price);
        if (!isNaN(priceNum) && priceNum > 0) {
            const discount = ((productPrice - priceNum) / productPrice) * 100;
            setDiscountPercentage(Math.max(0, Math.round(discount)));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setErrors({});

        try {
            const url = campaign
                ? `/api/campaigns/${campaign.id}`
                : '/api/campaigns';
            const method = campaign ? 'PUT' : 'POST';

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
                body: JSON.stringify({
                    ...formData,
                    price: parseFloat(formData.price),
                    product_id: parseInt(formData.product_id),
                }),
            });

            const data = await response.json();

            if (response.ok) {
                toast.success(
                    data.message ||
                        `Campaign ${campaign ? 'updated' : 'created'} successfully!`,
                );
                onSave();
            } else {
                if (data.errors) {
                    setErrors(data.errors);
                    const firstError = Object.values(data.errors)[0];
                    if (Array.isArray(firstError) && firstError.length > 0) {
                        toast.error(firstError[0]);
                    }
                } else {
                    toast.error(
                        data.message ||
                            `Failed to ${campaign ? 'update' : 'create'} campaign`,
                    );
                }
            }
        } catch (error) {
            console.error('Error saving campaign:', error);
            toast.error('Network error occurred');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
            <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-3xl border border-gray-100 bg-white shadow-2xl">
                {/* Header */}
                <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-200 bg-gradient-to-r from-purple-500 to-indigo-600 px-8 py-6">
                    <div className="flex items-center gap-3">
                        <div className="rounded-xl bg-white/20 p-2 backdrop-blur-sm">
                            <Tag className="h-5 w-5 text-white" />
                        </div>
                        <h2 className="text-xl font-bold text-white">
                            {campaign ? 'Edit Campaign' : 'Create New Campaign'}
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="rounded-xl p-2 text-white/80 transition-all duration-200 hover:bg-white/20 hover:text-white"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-8">
                    <div className="space-y-6">
                        {/* Campaign Name */}
                        <div>
                            <label className="mb-2 block text-sm font-semibold text-gray-700">
                                Campaign Name *
                            </label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) =>
                                    setFormData((prev) => ({
                                        ...prev,
                                        name: e.target.value,
                                    }))
                                }
                                placeholder="e.g., Summer Sale 2025"
                                className={`w-full rounded-xl border-2 ${
                                    errors.name
                                        ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
                                        : 'border-gray-200 focus:border-purple-400 focus:ring-purple-100'
                                } bg-gray-50/50 px-4 py-3 text-sm font-medium transition-all duration-300 focus:bg-white focus:ring-4 focus:outline-none`}
                            />
                            {errors.name && (
                                <p className="mt-1 text-xs text-red-600">
                                    {errors.name[0]}
                                </p>
                            )}
                        </div>

                        {/* Description */}
                        <div>
                            <label className="mb-2 block text-sm font-semibold text-gray-700">
                                Description
                            </label>
                            <textarea
                                value={formData.description}
                                onChange={(e) =>
                                    setFormData((prev) => ({
                                        ...prev,
                                        description: e.target.value,
                                    }))
                                }
                                placeholder="Brief description of the campaign..."
                                rows={3}
                                className="w-full rounded-xl border-2 border-gray-200 bg-gray-50/50 px-4 py-3 text-sm font-medium transition-all duration-300 focus:border-purple-400 focus:bg-white focus:ring-4 focus:ring-purple-100 focus:outline-none"
                            />
                        </div>

                        {/* Product Selection */}
                        <div>
                            <label className="mb-2 block text-sm font-semibold text-gray-700">
                                Select Product *
                            </label>
                            <select
                                value={formData.product_id}
                                onChange={(e) =>
                                    handleProductChange(e.target.value)
                                }
                                className={`w-full rounded-xl border-2 ${
                                    errors.product_id
                                        ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
                                        : 'border-gray-200 focus:border-purple-400 focus:ring-purple-100'
                                } bg-gray-50/50 px-4 py-3 text-sm font-medium transition-all duration-300 focus:bg-white focus:ring-4 focus:outline-none`}
                            >
                                <option value="">Choose a product...</option>
                                {products.map((product) => (
                                    <option key={product.id} value={product.id}>
                                        {product.name} - $
                                        {typeof product.price === 'number'
                                            ? product.price.toFixed(2)
                                            : parseFloat(product.price).toFixed(
                                                  2,
                                              )}
                                    </option>
                                ))}
                            </select>
                            {errors.product_id && (
                                <p className="mt-1 text-xs text-red-600">
                                    {errors.product_id[0]}
                                </p>
                            )}

                            {/* Selected Product Info */}
                            {selectedProduct && (
                                <div className="mt-3 rounded-xl bg-gradient-to-r from-purple-50 to-indigo-50 p-4">
                                    <div className="flex items-center gap-3">
                                        {selectedProduct.image && (
                                            <img
                                                src={selectedProduct.image}
                                                alt={selectedProduct.name}
                                                className="h-16 w-16 rounded-lg object-cover shadow-md"
                                            />
                                        )}
                                        <div>
                                            <div className="text-sm font-bold text-gray-900">
                                                {selectedProduct.name}
                                            </div>
                                            <div className="text-lg font-bold text-purple-600">
                                                Original Price: $
                                                {typeof selectedProduct.price ===
                                                'number'
                                                    ? selectedProduct.price.toFixed(
                                                          2,
                                                      )
                                                    : parseFloat(
                                                          selectedProduct.price,
                                                      ).toFixed(2)}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Pricing Section */}
                        {selectedProduct && (
                            <div className="rounded-2xl bg-gradient-to-br from-rose-50 to-pink-50 p-6">
                                <div className="mb-4 flex items-center gap-2">
                                    <DollarSign className="h-5 w-5 text-rose-600" />
                                    <h3 className="text-base font-bold text-gray-900">
                                        Campaign Pricing
                                    </h3>
                                </div>

                                <div className="grid gap-4 sm:grid-cols-2">
                                    {/* Discount Percentage */}
                                    <div>
                                        <label className="mb-2 block text-sm font-semibold text-gray-700">
                                            Discount %
                                        </label>
                                        <div className="relative">
                                            <Percent className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
                                            <input
                                                type="number"
                                                min="0"
                                                max="100"
                                                value={discountPercentage}
                                                onChange={(e) =>
                                                    handleDiscountChange(
                                                        parseInt(
                                                            e.target.value,
                                                        ) || 0,
                                                    )
                                                }
                                                placeholder="e.g., 50"
                                                className="w-full rounded-xl border-2 border-gray-200 bg-white px-4 py-3 pr-3 pl-10 text-sm font-bold transition-all duration-300 focus:border-rose-400 focus:ring-4 focus:ring-rose-100 focus:outline-none"
                                            />
                                        </div>
                                    </div>

                                    {/* Campaign Price */}
                                    <div>
                                        <label className="mb-2 block text-sm font-semibold text-gray-700">
                                            Campaign Price *
                                        </label>
                                        <div className="relative">
                                            <DollarSign className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
                                            <input
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                value={formData.price}
                                                onChange={(e) =>
                                                    handlePriceChange(
                                                        e.target.value,
                                                    )
                                                }
                                                placeholder="0.00"
                                                className={`w-full rounded-xl border-2 ${
                                                    errors.price
                                                        ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
                                                        : 'border-gray-200 focus:border-rose-400 focus:ring-rose-100'
                                                } bg-white px-4 py-3 pr-3 pl-10 text-sm font-bold transition-all duration-300 focus:ring-4 focus:outline-none`}
                                            />
                                        </div>
                                        {errors.price && (
                                            <p className="mt-1 text-xs text-red-600">
                                                {errors.price[0]}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* Price Comparison */}
                                {formData.price &&
                                    parseFloat(formData.price) > 0 && (
                                        <div className="mt-4 rounded-xl bg-white p-4 shadow-sm">
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-gray-600">
                                                    Original Price:
                                                </span>
                                                <span className="font-bold text-gray-900 line-through">
                                                    $
                                                    {typeof selectedProduct.price ===
                                                    'number'
                                                        ? selectedProduct.price.toFixed(
                                                              2,
                                                          )
                                                        : parseFloat(
                                                              selectedProduct.price,
                                                          ).toFixed(2)}
                                                </span>
                                            </div>
                                            <div className="mt-2 flex items-center justify-between text-sm">
                                                <span className="text-gray-600">
                                                    Campaign Price:
                                                </span>
                                                <span className="text-lg font-bold text-purple-600">
                                                    $
                                                    {parseFloat(
                                                        formData.price,
                                                    ).toFixed(2)}
                                                </span>
                                            </div>
                                            <div className="mt-2 flex items-center justify-between border-t border-gray-200 pt-2 text-sm">
                                                <span className="font-semibold text-gray-700">
                                                    You Save:
                                                </span>
                                                <span className="text-lg font-bold text-green-600">
                                                    $
                                                    {(
                                                        (typeof selectedProduct.price ===
                                                        'number'
                                                            ? selectedProduct.price
                                                            : parseFloat(
                                                                  selectedProduct.price,
                                                              )) -
                                                        parseFloat(
                                                            formData.price,
                                                        )
                                                    ).toFixed(2)}{' '}
                                                    ({discountPercentage}%)
                                                </span>
                                            </div>
                                        </div>
                                    )}
                            </div>
                        )}

                        {/* Date Range */}
                        <div className="grid gap-4 sm:grid-cols-2">
                            {/* Start Date */}
                            <div>
                                <label className="mb-2 block text-sm font-semibold text-gray-700">
                                    Start Date *
                                </label>
                                <div className="relative">
                                    <Calendar className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="date"
                                        value={formData.start_date}
                                        onChange={(e) =>
                                            setFormData((prev) => ({
                                                ...prev,
                                                start_date: e.target.value,
                                            }))
                                        }
                                        className={`w-full rounded-xl border-2 ${
                                            errors.start_date
                                                ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
                                                : 'border-gray-200 focus:border-purple-400 focus:ring-purple-100'
                                        } bg-gray-50/50 px-4 py-3 pr-3 pl-10 text-sm font-medium transition-all duration-300 focus:bg-white focus:ring-4 focus:outline-none`}
                                    />
                                </div>
                                {errors.start_date && (
                                    <p className="mt-1 text-xs text-red-600">
                                        {errors.start_date[0]}
                                    </p>
                                )}
                            </div>

                            {/* End Date */}
                            <div>
                                <label className="mb-2 block text-sm font-semibold text-gray-700">
                                    End Date *
                                </label>
                                <div className="relative">
                                    <Calendar className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="date"
                                        value={formData.end_date}
                                        min={formData.start_date}
                                        onChange={(e) =>
                                            setFormData((prev) => ({
                                                ...prev,
                                                end_date: e.target.value,
                                            }))
                                        }
                                        className={`w-full rounded-xl border-2 ${
                                            errors.end_date
                                                ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
                                                : 'border-gray-200 focus:border-purple-400 focus:ring-purple-100'
                                        } bg-gray-50/50 px-4 py-3 pr-3 pl-10 text-sm font-medium transition-all duration-300 focus:bg-white focus:ring-4 focus:outline-none`}
                                    />
                                </div>
                                {errors.end_date && (
                                    <p className="mt-1 text-xs text-red-600">
                                        {errors.end_date[0]}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Banner Settings */}
                        <div className="rounded-2xl bg-gradient-to-br from-blue-50 to-cyan-50 p-6">
                            <h3 className="mb-4 text-base font-bold text-gray-900">
                                Banner Settings
                            </h3>

                            <div className="space-y-4">
                                {/* Banner Color */}
                                <div>
                                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                                        Banner Color
                                    </label>
                                    <div className="flex items-center gap-3">
                                        <input
                                            type="color"
                                            value={formData.banner_color}
                                            onChange={(e) =>
                                                setFormData((prev) => ({
                                                    ...prev,
                                                    banner_color:
                                                        e.target.value,
                                                }))
                                            }
                                            className="h-12 w-20 cursor-pointer rounded-xl border-2 border-gray-200 transition-all duration-200 hover:scale-105"
                                        />
                                        <input
                                            type="text"
                                            value={formData.banner_color}
                                            onChange={(e) =>
                                                setFormData((prev) => ({
                                                    ...prev,
                                                    banner_color:
                                                        e.target.value,
                                                }))
                                            }
                                            placeholder="#ef4444"
                                            className="flex-1 rounded-xl border-2 border-gray-200 bg-white px-4 py-3 text-sm font-medium transition-all duration-300 focus:border-blue-400 focus:ring-4 focus:ring-blue-100 focus:outline-none"
                                        />
                                    </div>
                                </div>

                                {/* Banner Image URL */}
                                <div>
                                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                                        Banner Image URL (optional)
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.banner_image}
                                        onChange={(e) =>
                                            setFormData((prev) => ({
                                                ...prev,
                                                banner_image: e.target.value,
                                            }))
                                        }
                                        placeholder="https://example.com/banner.jpg"
                                        className="w-full rounded-xl border-2 border-gray-200 bg-white px-4 py-3 text-sm font-medium transition-all duration-300 focus:border-blue-400 focus:ring-4 focus:ring-blue-100 focus:outline-none"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Active Status */}
                        <div className="flex items-center justify-between rounded-xl bg-gray-50 p-4">
                            <div>
                                <label className="text-sm font-semibold text-gray-900">
                                    Campaign Status
                                </label>
                                <p className="text-xs text-gray-600">
                                    Enable or disable this campaign
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() =>
                                    setFormData((prev) => ({
                                        ...prev,
                                        is_active: !prev.is_active,
                                    }))
                                }
                                className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors duration-200 ${
                                    formData.is_active
                                        ? 'bg-gradient-to-r from-green-500 to-emerald-600'
                                        : 'bg-gray-300'
                                }`}
                            >
                                <span
                                    className={`inline-block h-6 w-6 transform rounded-full bg-white shadow-lg transition-transform duration-200 ${
                                        formData.is_active
                                            ? 'translate-x-7'
                                            : 'translate-x-1'
                                    }`}
                                />
                            </button>
                        </div>
                    </div>

                    {/* Form Actions */}
                    <div className="mt-8 flex gap-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 rounded-2xl border-2 border-gray-300 bg-white px-6 py-4 text-sm font-semibold text-gray-700 transition-all duration-200 hover:border-gray-400 hover:bg-gray-50 focus:ring-4 focus:ring-gray-200 focus:outline-none"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting || !formData.product_id}
                            className="flex-1 rounded-2xl bg-gradient-to-r from-purple-500 to-indigo-600 px-6 py-4 text-sm font-semibold text-white transition-all duration-200 hover:from-purple-600 hover:to-indigo-700 focus:ring-4 focus:ring-purple-300 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {isSubmitting
                                ? 'Saving...'
                                : campaign
                                  ? 'Update Campaign'
                                  : 'Create Campaign'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
