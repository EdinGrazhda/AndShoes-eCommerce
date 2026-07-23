import { Minus, Plus, ShoppingCart, Star, X } from 'lucide-react';
import { memo, useCallback, useEffect, useState } from 'react';
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
    const [isImageLoading, setIsImageLoading] = useState(false);
    const addItem = useCartStore((state) => state.addItem);

    // Preload next/previous images for smoother transitions
    useEffect(() => {
        if (!product || !(product as any).all_images) return;

        const images = (product as any).all_images;
        const preloadImage = (index: number) => {
            if (images[index]) {
                const img = new Image();
                img.src = images[index].preview; // Preload preview size
            }
        };

        // Preload next and previous images
        if (selectedImageIndex < images.length - 1) {
            preloadImage(selectedImageIndex + 1);
        }
        if (selectedImageIndex > 0) {
            preloadImage(selectedImageIndex - 1);
        }
    }, [selectedImageIndex, product]);

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
            className="fixed inset-0 z-50 flex animate-in items-center justify-center bg-black/60 p-3 duration-200 fade-in sm:p-4"
            onClick={handleBackdropClick}
            role="dialog"
            aria-labelledby="quick-view-title"
            aria-modal="true"
        >
            <div className="max-h-[92vh] w-full max-w-3xl animate-in overflow-y-auto rounded-2xl bg-white shadow-2xl duration-300 zoom-in-95">
                {/* Header */}
                <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-100 bg-white/95 px-5 py-3 backdrop-blur-sm">
                    <h2
                        id="quick-view-title"
                        className="text-lg font-bold text-gray-900"
                    >
                        Quick View
                    </h2>
                    <button
                        onClick={onClose}
                        className="rounded-full p-1.5 transition-colors hover:bg-gray-100 focus:ring-2 focus:ring-[#771E49] focus:outline-none"
                        aria-label="Close quick view"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="grid gap-5 p-5 md:grid-cols-2">
                    {/* Image Gallery */}
                    <div className="space-y-2">
                        {/* Main Image */}
                        <div className="relative aspect-square overflow-hidden rounded-xl bg-gray-50">
                            {isImageLoading && (
                                <div className="absolute inset-0 z-10 flex items-center justify-center bg-gray-50">
                                    <div className="h-7 w-7 animate-spin rounded-full border-3 border-gray-200 border-t-[#771E49]"></div>
                                </div>
                            )}
                            <img
                                src={
                                    (product as any).all_images?.[
                                        selectedImageIndex
                                    ]?.url ||
                                    (product as any).all_images?.[
                                        selectedImageIndex
                                    ]?.preview ||
                                    product.image
                                }
                                srcSet={
                                    (product as any).all_images?.[
                                        selectedImageIndex
                                    ]
                                        ? `${(product as any).all_images[selectedImageIndex].preview} 400w, 
                                           ${(product as any).all_images[selectedImageIndex].url || (product as any).all_images[selectedImageIndex].preview} 1200w`
                                        : undefined
                                }
                                sizes="(max-width: 768px) 100vw, 50vw"
                                alt={product.name}
                                className={`h-full w-full object-cover transition-opacity duration-200 ${
                                    isImageLoading ? 'opacity-0' : 'opacity-100'
                                }`}
                                loading="eager"
                                decoding="async"
                                onLoadStart={() => setIsImageLoading(true)}
                                onLoad={() => setIsImageLoading(false)}
                                onError={() => setIsImageLoading(false)}
                            />
                        </div>

                        {/* Thumbnail Gallery */}
                        {(product as any).all_images?.length > 1 && (
                            <div className="grid grid-cols-4 gap-1.5">
                                {(product as any).all_images.map(
                                    (img: any, index: number) => (
                                        <button
                                            key={img.id}
                                            onClick={() => {
                                                setIsImageLoading(true);
                                                setSelectedImageIndex(index);
                                            }}
                                            className={`aspect-square overflow-hidden rounded-lg border-2 transition-all ${
                                                selectedImageIndex === index
                                                    ? 'border-[#771E49] ring-2 ring-[#771E49]/20'
                                                    : 'border-gray-200 hover:border-gray-300'
                                            }`}
                                        >
                                            <img
                                                src={img.preview || img.thumb}
                                                alt={`${product.name} view ${index + 1}`}
                                                className="h-full w-full object-cover"
                                                loading="lazy"
                                                decoding="async"
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
                        <h3 className="text-2xl leading-tight font-bold text-gray-900">
                            {product.name}
                        </h3>

                        {/* Rating */}
                        {product.rating && (
                            <div
                                className="mt-2 flex items-center gap-1.5"
                                aria-label={`Rating: ${product.rating} out of 5 stars`}
                            >
                                <div className="flex gap-0.5">
                                    {Array.from({ length: 5 }).map((_, i) => (
                                        <Star
                                            key={i}
                                            size={16}
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
                                <span className="text-sm text-gray-500">
                                    ({product.rating.toFixed(1)})
                                </span>
                            </div>
                        )}

                        {/* Price */}
                        <div className="mt-3 text-3xl font-bold text-[#771E49]">
                            €{(product.price || 0).toFixed(2)}
                        </div>

                        {/* Description */}
                        {product.description && (
                            <p className="mt-3 text-sm leading-relaxed text-gray-500">
                                {product.description}
                            </p>
                        )}

                        {/* Divider */}
                        <div className="my-4 border-t border-gray-100" />

                        {/* Color with swatch */}
                        {product.color && (
                            <div className="mb-4">
                                <span className="mb-1.5 block text-xs font-semibold tracking-wide text-gray-500 uppercase">
                                    Color
                                </span>
                                <div className="inline-flex items-center gap-2.5 rounded-full border border-gray-200 bg-gray-50/80 px-3.5 py-1.5">
                                    <span
                                        className="h-5 w-5 shrink-0 rounded-full border border-gray-300 shadow-inner"
                                        style={{
                                            backgroundColor: product.color
                                                .toLowerCase()
                                                .split('/')[0]
                                                .trim(),
                                        }}
                                        aria-hidden="true"
                                    />
                                    <span className="text-sm font-medium text-gray-800 capitalize">
                                        {product.color}
                                    </span>
                                </div>
                            </div>
                        )}

                        {/* Categories */}
                        {product.categories &&
                            product.categories.length > 0 && (
                                <div className="mb-4">
                                    <span className="mb-1.5 block text-xs font-semibold tracking-wide text-gray-500 uppercase">
                                        Categories
                                    </span>
                                    <div className="flex flex-wrap gap-1.5">
                                        {product.categories.map((category) => (
                                            <span
                                                key={category.id}
                                                className="rounded-full border border-[#771E49]/20 bg-[#771E49]/5 px-3 py-1 text-xs font-medium text-[#771E49]"
                                            >
                                                {category.name}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                        {/* Stock Status */}
                        <div className="mb-4">
                            {isOutOfStock ? (
                                <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-600">
                                    <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                                    Out of Stock
                                </span>
                            ) : product.stock === 'low stock' ? (
                                <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-600">
                                    <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                                    Low Stock
                                </span>
                            ) : (
                                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-600">
                                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                    In Stock
                                </span>
                            )}
                        </div>

                        {/* Size Selector */}
                        {(product.foot_numbers ||
                            (product.sizeStocks &&
                                Object.keys(product.sizeStocks).length >
                                    0)) && (
                            <div className="mb-4">
                                <h4 className="mb-2 text-xs font-semibold tracking-wide text-gray-500 uppercase">
                                    {product.sizeStocks &&
                                    Object.keys(product.sizeStocks).length > 0
                                        ? 'Select Size (EU)'
                                        : 'Available Sizes (EU)'}
                                </h4>
                                <div className="flex flex-wrap gap-1.5">
                                    {sizeInfo.map((sizeItem) => (
                                        <button
                                            key={sizeItem.size}
                                            onClick={() =>
                                                setSelectedSize(sizeItem.size)
                                            }
                                            className={`min-w-[3rem] rounded-lg border px-2.5 py-1.5 text-center text-sm font-medium transition-all ${
                                                selectedSize === sizeItem.size
                                                    ? 'border-[#771E49] bg-[#771E49] text-white shadow-sm'
                                                    : 'border-gray-200 bg-white text-gray-700 hover:border-[#771E49] hover:text-[#771E49]'
                                            }`}
                                        >
                                            {sizeItem.size}
                                        </button>
                                    ))}
                                </div>
                                {selectedSize && (
                                    <p className="mt-1.5 text-xs font-medium text-[#771E49]">
                                        Selected: EU {selectedSize}
                                    </p>
                                )}
                                {product.sizeStocks &&
                                    Object.keys(product.sizeStocks).length >
                                        0 &&
                                    !selectedSize && (
                                        <p className="mt-1.5 text-xs font-medium text-orange-500">
                                            Please select a size to continue
                                        </p>
                                    )}
                            </div>
                        )}

                        {/* Quantity Selector */}
                        {!isOutOfStock && (
                            <div className="mb-5">
                                <label
                                    htmlFor="quantity"
                                    className="mb-1.5 block text-xs font-semibold tracking-wide text-gray-500 uppercase"
                                >
                                    Quantity
                                </label>
                                <div className="inline-flex items-center rounded-lg border border-gray-200">
                                    <button
                                        onClick={() =>
                                            setQuantity((q) =>
                                                Math.max(1, q - 1),
                                            )
                                        }
                                        className="rounded-l-lg px-3 py-2 text-gray-600 transition-colors hover:bg-gray-50 focus:ring-2 focus:ring-[#771E49] focus:outline-none focus:ring-inset"
                                        aria-label="Decrease quantity"
                                    >
                                        <Minus size={16} />
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
                                        className="w-14 border-x border-gray-200 py-2 text-center text-sm font-medium focus:ring-2 focus:ring-[#771E49] focus:outline-none focus:ring-inset"
                                        aria-label="Product quantity"
                                    />
                                    <button
                                        onClick={() =>
                                            setQuantity((q) =>
                                                Math.min(maxQuantity, q + 1),
                                            )
                                        }
                                        disabled={quantity >= maxQuantity}
                                        className="rounded-r-lg px-3 py-2 text-gray-600 transition-colors hover:bg-gray-50 focus:ring-2 focus:ring-[#771E49] focus:outline-none focus:ring-inset disabled:cursor-not-allowed disabled:opacity-40"
                                        aria-label="Increase quantity"
                                    >
                                        <Plus size={16} />
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Spacer to push button to bottom */}
                        <div className="flex-1" />

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
                            className={`flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-bold tracking-wide transition-all duration-200 focus:ring-2 focus:ring-[#771E49] focus:ring-offset-2 focus:outline-none ${
                                isOutOfStock ||
                                (!!product.sizeStocks &&
                                    Object.keys(product.sizeStocks).length >
                                        0 &&
                                    !selectedSize) ||
                                (!!selectedSize &&
                                    !!product.sizeStocks?.[selectedSize] &&
                                    product.sizeStocks[selectedSize]
                                        .quantity === 0)
                                    ? 'cursor-not-allowed bg-gray-100 text-gray-400'
                                    : 'bg-[#771E49] text-white shadow-lg shadow-[#771E49]/25 hover:bg-[#5a1738]'
                            }`}
                            aria-label={`Add ${quantity} ${product.name} to cart`}
                        >
                            <ShoppingCart size={18} />
                            {isOutOfStock ||
                            (selectedSize &&
                                product.sizeStocks?.[selectedSize]?.quantity ===
                                    0)
                                ? 'Out of Stock'
                                : product.sizeStocks &&
                                    Object.keys(product.sizeStocks).length >
                                        0 &&
                                    !selectedSize
                                  ? 'Select a Size'
                                  : 'Add to Cart'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
});

QuickView.displayName = 'QuickView';
