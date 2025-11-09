import { Minus, Plus, ShoppingCart, Star, X } from 'lucide-react';
import { memo, useCallback, useState } from 'react';
import toast from 'react-hot-toast';
import { useCartStore } from '../store/cartStore';
import type { Product } from '../types/store';

interface QuickViewProps {
    product: Product | null;
    onClose: () => void;
}

/**
 * Quick-view modal for detailed product information
 * Accessible with keyboard navigation and ARIA attributes
 */
export const QuickView = memo(({ product, onClose }: QuickViewProps) => {
    const [quantity, setQuantity] = useState(1);
    const [selectedSize, setSelectedSize] = useState<string | null>(null);
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);
    const addItem = useCartStore((state) => state.addItem);

    const handleBackdropClick = useCallback(
        (e: React.MouseEvent) => {
            if (e.target === e.currentTarget) {
                onClose();
            }
        },
        [onClose],
    );

    const handleAddToCart = useCallback(() => {
        if (!product) return;

        // If product has size-specific stock, require size selection
        if (product.sizeStocks && Object.keys(product.sizeStocks).length > 0) {
            if (!selectedSize) {
                toast.error('Please select a size before adding to cart');
                return;
            }

            const sizeStock = product.sizeStocks[selectedSize];
            if (!sizeStock || sizeStock.quantity === 0) {
                toast.error(`Size ${selectedSize} is out of stock`);
                return;
            }

            // Check if requested quantity is available
            if (quantity > sizeStock.quantity) {
                toast.error(
                    `Not enough stock available for size ${selectedSize}`,
                );
                return;
            }
        } else {
            // Fallback to general stock check
            if (product.stock === 'out of stock') {
                toast.error('This product is out of stock');
                return;
            }
        }

        // Add to cart with selected size
        addItem(
            { ...product, selectedSize: selectedSize || undefined },
            quantity,
        );
        toast.success('Added to cart successfully!');
        onClose();
    }, [product, quantity, selectedSize, addItem, onClose]);

    // Parse available sizes and check stock - MOVED BEFORE early return
    const getAvailableSizes = useCallback(() => {
        if (!product) return [];

        // If product has size-specific stock data, use it
        if (product.sizeStocks && Object.keys(product.sizeStocks).length > 0) {
            return Object.entries(product.sizeStocks)
                .filter(([_, stockInfo]) => stockInfo.quantity > 0) // Only show sizes with stock > 0
                .map(([size, _]) => ({
                    size,
                    available: true, // All returned sizes are available
                }))
                .sort((a, b) => {
                    const sizeA = parseFloat(a.size);
                    const sizeB = parseFloat(b.size);
                    return sizeA - sizeB;
                });
        }

        // If no size-specific stock, don't show any sizes
        // Products without sizeStocks data should not display size options
        return [];
    }, [product]);

    const sizeInfo = getAvailableSizes();
    const availableSizes = sizeInfo.filter((info) => info.available);

    // Early return AFTER all hooks are called
    if (!product) return null;

    const isOutOfStock = product.stock === 'out of stock';
    const maxQuantity = 10; // Set a reasonable max quantity

    return (
        <div
            className="fixed inset-0 z-50 flex animate-in items-center justify-center bg-black/60 p-4 duration-200 fade-in"
            onClick={handleBackdropClick}
            role="dialog"
            aria-labelledby="quick-view-title"
            aria-modal="true"
        >
            <div className="max-h-[90vh] w-full max-w-4xl animate-in overflow-y-auto rounded-xl bg-white shadow-2xl duration-300 zoom-in-95">
                {/* Header */}
                <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4">
                    <h2
                        id="quick-view-title"
                        className="text-2xl font-bold text-gray-900"
                    >
                        Quick View
                    </h2>
                    <button
                        onClick={onClose}
                        className="rounded-lg p-2 transition-colors hover:bg-gray-100 focus:ring-2 focus:ring-[#771E49] focus:outline-none"
                        aria-label="Close quick view"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Content */}
                <div className="grid gap-8 p-6 md:grid-cols-2">
                    {/* Image Gallery */}
                    <div className="space-y-3">
                        {/* Main Image */}
                        <div className="aspect-square overflow-hidden rounded-lg bg-gray-100">
                            <img
                                src={
                                    (product as any).all_images?.[
                                        selectedImageIndex
                                    ]?.url || product.image
                                }
                                alt={product.name}
                                className="h-full w-full object-cover"
                            />
                        </div>

                        {/* Thumbnail Gallery */}
                        {(product as any).all_images?.length > 1 && (
                            <div className="grid grid-cols-4 gap-2">
                                {(product as any).all_images.map(
                                    (img: any, index: number) => (
                                        <button
                                            key={img.id}
                                            onClick={() =>
                                                setSelectedImageIndex(index)
                                            }
                                            className={`aspect-square overflow-hidden rounded-lg border-2 transition-all ${
                                                selectedImageIndex === index
                                                    ? 'border-[#771E49] ring-2 ring-[#771E49]/20'
                                                    : 'border-gray-200 hover:border-gray-300'
                                            }`}
                                        >
                                            <img
                                                src={img.thumb}
                                                alt={`${product.name} view ${index + 1}`}
                                                className="h-full w-full object-cover"
                                            />
                                        </button>
                                    ),
                                )}
                            </div>
                        )}
                    </div>

                    {/* Details */}
                    <div className="flex flex-col">
                        {/* Title */}
                        <h3 className="mb-4 text-3xl font-bold text-gray-900">
                            {product.name}
                        </h3>

                        {/* Rating */}
                        {product.rating && (
                            <div
                                className="mb-4 flex items-center gap-2"
                                aria-label={`Rating: ${product.rating} out of 5 stars`}
                            >
                                <div className="flex gap-1">
                                    {Array.from({ length: 5 }).map((_, i) => (
                                        <Star
                                            key={i}
                                            size={20}
                                            className={
                                                i <
                                                Math.floor(product.rating || 0)
                                                    ? 'fill-[#771E49] text-[#771E49]'
                                                    : 'fill-gray-200 text-gray-200'
                                            }
                                            aria-hidden="true"
                                        />
                                    ))}
                                </div>
                                <span className="text-gray-600">
                                    ({product.rating.toFixed(1)})
                                </span>
                            </div>
                        )}

                        {/* Price */}
                        <div className="mb-6 text-4xl font-bold text-[#771E49]">
                            €{(product.price || 0).toFixed(2)}
                        </div>

                        {/* Description */}
                        <p className="mb-6 leading-relaxed text-gray-600">
                            {product.description}
                        </p>

                        {/* Color */}
                        {product.color && (
                            <div className="mb-6">
                                <span className="mb-2 block text-sm font-semibold text-gray-700">
                                    Color:
                                </span>
                                <span className="inline-flex items-center gap-2 rounded-full bg-gray-100 px-4 py-2 text-sm font-medium text-gray-900">
                                    {product.color}
                                </span>
                            </div>
                        )}

                        {/* Categories */}
                        {product.categories &&
                            product.categories.length > 0 && (
                                <div className="mb-6">
                                    <span className="mb-2 block text-sm font-semibold text-gray-700">
                                        Categories:
                                    </span>
                                    <div className="flex flex-wrap gap-2">
                                        {product.categories.map((category) => (
                                            <span
                                                key={category.id}
                                                className="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-700"
                                            >
                                                {category.name}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                        {/* Stock Status */}
                        <div className="mb-6">
                            {isOutOfStock ? (
                                <span className="font-semibold text-red-600">
                                    Out of Stock
                                </span>
                            ) : product.stock === 'low stock' ? (
                                <span className="font-semibold text-[#771E49]">
                                    Low Stock
                                </span>
                            ) : (
                                <span className="font-semibold text-green-600">
                                    In Stock
                                </span>
                            )}
                        </div>

                        {/* Size Availability */}
                        {(product.foot_numbers ||
                            (product.sizeStocks &&
                                Object.keys(product.sizeStocks).length >
                                    0)) && (
                            <div className="mb-6">
                                <h4 className="mb-3 text-sm font-semibold text-gray-700">
                                    {product.sizeStocks &&
                                    Object.keys(product.sizeStocks).length > 0
                                        ? 'Select Size (EU):'
                                        : 'Available Sizes (EU):'}
                                </h4>
                                <div className="grid grid-cols-4 gap-2">
                                    {sizeInfo.map((sizeItem) => (
                                        <button
                                            key={sizeItem.size}
                                            onClick={() =>
                                                setSelectedSize(sizeItem.size)
                                            }
                                            className={`relative rounded-lg border p-3 text-center transition-all ${
                                                selectedSize === sizeItem.size
                                                    ? 'border-[#771E49] bg-[#771E49] text-white'
                                                    : 'cursor-pointer border-gray-300 bg-white hover:border-[#771E49] hover:bg-[#771E49]/5'
                                            }`}
                                        >
                                            <span className="text-sm font-medium">
                                                {sizeItem.size}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                                {selectedSize && (
                                    <p className="mt-2 text-sm text-[#771E49]">
                                        Selected size: EU {selectedSize}
                                    </p>
                                )}
                                {product.sizeStocks &&
                                    Object.keys(product.sizeStocks).length >
                                        0 &&
                                    !selectedSize && (
                                        <p className="mt-2 text-sm text-orange-600">
                                            Please select a size to continue
                                        </p>
                                    )}
                            </div>
                        )}

                        {/* Quantity Selector */}
                        {!isOutOfStock && (
                            <div className="mb-6">
                                <label
                                    htmlFor="quantity"
                                    className="mb-2 block text-sm font-semibold text-gray-700"
                                >
                                    Quantity:
                                </label>
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={() =>
                                            setQuantity((q) =>
                                                Math.max(1, q - 1),
                                            )
                                        }
                                        className="rounded-lg border border-gray-300 p-2 text-gray-700 transition-colors hover:bg-gray-50 focus:ring-2 focus:ring-[#771E49] focus:outline-none"
                                        aria-label="Decrease quantity"
                                    >
                                        <Minus size={20} />
                                    </button>
                                    <input
                                        id="quantity"
                                        type="number"
                                        min="1"
                                        max={maxQuantity}
                                        value={quantity}
                                        onChange={(e) =>
                                            setQuantity(
                                                Math.min(
                                                    maxQuantity,
                                                    Math.max(
                                                        1,
                                                        Number(e.target.value),
                                                    ),
                                                ),
                                            )
                                        }
                                        className="w-20 rounded-lg border border-gray-300 py-2 text-center focus:ring-2 focus:ring-[#771E49] focus:outline-none"
                                        aria-label="Product quantity"
                                    />
                                    <button
                                        onClick={() =>
                                            setQuantity((q) =>
                                                Math.min(maxQuantity, q + 1),
                                            )
                                        }
                                        disabled={quantity >= maxQuantity}
                                        className="rounded-lg border border-gray-300 p-2 text-gray-700 transition-colors hover:bg-gray-50 focus:ring-2 focus:ring-[#771E49] focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                                        aria-label="Increase quantity"
                                    >
                                        <Plus size={20} />
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Add to Cart Button */}
                        <button
                            onClick={handleAddToCart}
                            disabled={
                                isOutOfStock ||
                                (!!product.sizeStocks &&
                                    Object.keys(product.sizeStocks).length >
                                        0 &&
                                    !selectedSize) ||
                                (!!selectedSize &&
                                    !!product.sizeStocks?.[selectedSize] &&
                                    product.sizeStocks[selectedSize]
                                        .quantity === 0)
                            }
                            className={`flex w-full items-center justify-center gap-2 rounded-lg py-4 text-lg font-semibold transition-all duration-200 focus:ring-2 focus:ring-[#771E49] focus:ring-offset-2 focus:outline-none ${
                                isOutOfStock ||
                                (!!product.sizeStocks &&
                                    Object.keys(product.sizeStocks).length >
                                        0 &&
                                    !selectedSize) ||
                                (!!selectedSize &&
                                    !!product.sizeStocks?.[selectedSize] &&
                                    product.sizeStocks[selectedSize]
                                        .quantity === 0)
                                    ? 'cursor-not-allowed bg-gray-200 text-gray-400'
                                    : 'bg-[#771E49] text-white hover:scale-[1.02] hover:bg-[#5a1738]'
                            }`}
                            aria-label={`Add ${quantity} ${product.name} to cart`}
                        >
                            <ShoppingCart size={24} />
                            {isOutOfStock ||
                            (selectedSize &&
                                product.sizeStocks?.[selectedSize]?.quantity ===
                                    0)
                                ? 'Out of Stock'
                                : product.sizeStocks &&
                                    Object.keys(product.sizeStocks).length >
                                        0 &&
                                    !selectedSize
                                  ? 'Select Size'
                                  : 'Add to Cart'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
});

QuickView.displayName = 'QuickView';
