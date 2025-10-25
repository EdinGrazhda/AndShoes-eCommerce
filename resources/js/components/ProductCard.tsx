import { Clock, Eye, Star, Tag } from 'lucide-react';
import { memo, useCallback, useEffect, useState } from 'react';
import type { Product } from '../types/store';

interface ProductCardProps {
    product: Product;
    onQuickView?: (product: Product) => void;
}

/**
 * Optimized product card with lazy-loaded images and memoization
 * Shows image, title, price, rating, stock badge, and Add to Cart button
 */
export const ProductCard = memo(
    ({ product, onQuickView }: ProductCardProps) => {
        const [imageLoaded, setImageLoaded] = useState(false);
        const [timeRemaining, setTimeRemaining] = useState<{
            days: number;
            hours: number;
            minutes: number;
            seconds: number;
        } | null>(null);

        // Calculate countdown timer for campaign
        useEffect(() => {
            if (!product.campaign_end_date) {
                setTimeRemaining(null);
                return;
            }

            const calculateTimeRemaining = () => {
                const now = new Date().getTime();
                const end = new Date(product.campaign_end_date!).getTime();
                const distance = end - now;

                if (distance < 0) {
                    setTimeRemaining(null);
                    return;
                }

                const days = Math.floor(distance / (1000 * 60 * 60 * 24));
                const hours = Math.floor(
                    (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
                );
                const minutes = Math.floor(
                    (distance % (1000 * 60 * 60)) / (1000 * 60),
                );
                const seconds = Math.floor((distance % (1000 * 60)) / 1000);

                setTimeRemaining({ days, hours, minutes, seconds });
            };

            calculateTimeRemaining();
            const interval = setInterval(calculateTimeRemaining, 1000);

            return () => clearInterval(interval);
        }, [product.campaign_end_date]);

        const handleShowDetails = useCallback(
            (e: React.MouseEvent) => {
                e.stopPropagation();
                onQuickView?.(product);
            },
            [onQuickView, product],
        );

        const handleQuickView = useCallback(() => {
            onQuickView?.(product);
        }, [onQuickView, product]);

        const isLowStock = product.stock === 'low stock';
        const isOutOfStock = product.stock === 'out of stock';

        // Parse available sizes and check stock
        const getAvailableSizes = () => {
            if (!product.foot_numbers) return [];

            const allSizes = product.foot_numbers
                .split(',')
                .map((size) => size.trim())
                .filter((size) => size.length > 0);

            // If we have size-specific stock data, filter by availability
            if (product.sizeStocks) {
                return allSizes.filter(
                    (size) => (product.sizeStocks![size] || 0) > 0,
                );
            }

            // Otherwise, show all sizes if product is in stock
            return isOutOfStock ? [] : allSizes;
        };

        const availableSizes = getAvailableSizes();

        return (
            <article
                className="group cursor-pointer overflow-hidden rounded-lg border border-gray-200 bg-white transition-all duration-200 focus-within:ring-2 focus-within:ring-[#771E49] hover:border-[#771E49] hover:shadow-lg"
                onClick={handleQuickView}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleQuickView();
                    }
                }}
                aria-label={`${product.name} - €${product.price.toFixed(2)}`}
            >
                {/* Image Container with Fixed Aspect Ratio */}
                <div className="relative aspect-square overflow-hidden bg-gray-100">
                    {!imageLoaded && (
                        <div
                            className="absolute inset-0 animate-pulse bg-gray-200"
                            aria-hidden="true"
                        />
                    )}
                    <img
                        src={product.image}
                        alt={product.name}
                        loading="lazy"
                        onLoad={() => setImageLoaded(true)}
                        className={`h-full w-full object-cover transition-transform duration-300 group-hover:scale-105 ${
                            imageLoaded ? 'opacity-100' : 'opacity-0'
                        }`}
                    />

                    {/* Stock Badge */}
                    {isOutOfStock && (
                        <div className="absolute top-2 right-2 rounded bg-gray-800 px-2 py-1 text-xs font-semibold text-white">
                            Out of Stock
                        </div>
                    )}
                    {isLowStock && (
                        <div className="absolute top-2 right-2 rounded bg-[#771E49] px-2 py-1 text-xs font-semibold text-white">
                            Only {product.stock} left
                        </div>
                    )}

                    {/* Campaign Badge */}
                    {product.hasActiveCampaign && product.originalPrice && (
                        <div className="absolute top-2 left-2 flex items-center gap-1 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 px-3 py-1 text-xs font-bold text-white shadow-lg">
                            <Tag size={12} />
                            <span>
                                {Math.round(
                                    ((product.originalPrice - product.price) /
                                        product.originalPrice) *
                                        100,
                                )}
                                % OFF
                            </span>
                        </div>
                    )}
                </div>

                {/* Product Info */}
                <div className="p-4">
                    {/* Title */}
                    <h3 className="mb-2 line-clamp-2 text-base font-semibold text-gray-900 transition-colors group-hover:text-[#771E49]">
                        {product.name}
                    </h3>

                    {/* Gender Badge */}
                    {product.gender && (
                        <div className="mb-2">
                            <span
                                className={`inline-block rounded-full px-2 py-1 text-xs font-medium ${
                                    product.gender === 'male'
                                        ? 'bg-blue-100 text-blue-800'
                                        : product.gender === 'female'
                                          ? 'bg-pink-100 text-pink-800'
                                          : 'bg-gray-100 text-gray-800'
                                }`}
                            >
                                {product.gender === 'male'
                                    ? 'Male'
                                    : product.gender === 'female'
                                      ? 'Female'
                                      : 'Unisex'}
                            </span>
                        </div>
                    )}

                    {/* Rating */}
                    <div
                        className="mb-2 flex items-center gap-1"
                        aria-label={`Rating: ${product.rating} out of 5 stars`}
                    >
                        {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                                key={i}
                                size={14}
                                className={
                                    i < Math.floor(product.rating)
                                        ? 'fill-[#771E49] text-[#771E49]'
                                        : 'fill-gray-200 text-gray-200'
                                }
                                aria-hidden="true"
                            />
                        ))}
                        <span className="ml-1 text-xs text-gray-600">
                            ({product.rating.toFixed(1)})
                        </span>
                    </div>

                    {/* Available Sizes */}
                    {availableSizes.length > 0 && (
                        <div className="mb-2">
                            <p className="mb-1 text-xs text-gray-500">
                                Available sizes:
                            </p>
                            <div className="flex flex-wrap gap-1">
                                {availableSizes.slice(0, 4).map((size) => {
                                    const sizeStock =
                                        product.sizeStocks?.[size] || 0;
                                    const isLowSizeStock =
                                        sizeStock > 0 && sizeStock <= 3;

                                    return (
                                        <span
                                            key={size}
                                            className={`inline-block rounded border px-1.5 py-0.5 text-xs ${
                                                isLowSizeStock
                                                    ? 'border-yellow-200 bg-yellow-50 text-yellow-700'
                                                    : 'border-gray-200 bg-gray-100 text-gray-700'
                                            }`}
                                            title={
                                                sizeStock > 0
                                                    ? `${sizeStock} in stock`
                                                    : 'In stock'
                                            }
                                        >
                                            {size}
                                            {isLowSizeStock && (
                                                <span className="ml-1 text-[10px]">
                                                    ●
                                                </span>
                                            )}
                                        </span>
                                    );
                                })}
                                {availableSizes.length > 4 && (
                                    <span className="text-xs text-gray-500">
                                        +{availableSizes.length - 4} more
                                    </span>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Out of stock message for sizes */}
                    {availableSizes.length === 0 && product.foot_numbers && (
                        <div className="mb-2">
                            <span className="text-xs text-red-500">
                                No sizes currently in stock
                            </span>
                        </div>
                    )}

                    {/* Price and Action */}
                    <div className="mt-3 flex items-center justify-between">
                        <div className="flex flex-col">
                            {product.hasActiveCampaign &&
                            product.originalPrice ? (
                                <>
                                    <span className="text-xl font-bold text-green-600">
                                        €{product.price.toFixed(2)}
                                    </span>
                                    <span className="text-sm text-gray-400 line-through">
                                        €{product.originalPrice.toFixed(2)}
                                    </span>
                                    {product.campaign_name && (
                                        <span className="text-xs font-semibold text-purple-600">
                                            {product.campaign_name}
                                        </span>
                                    )}
                                    {timeRemaining && (
                                        <div className="mt-1 flex items-center gap-1 text-xs font-medium text-gray-600">
                                            <Clock
                                                size={12}
                                                className="text-purple-600"
                                            />
                                            <span>
                                                {timeRemaining.days > 0 &&
                                                    `${timeRemaining.days}d `}
                                                {timeRemaining.hours}h{' '}
                                                {timeRemaining.minutes}m{' '}
                                                {timeRemaining.seconds}s
                                            </span>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <span className="text-xl font-bold text-[#771E49]">
                                    €{product.price.toFixed(2)}
                                </span>
                            )}
                        </div>

                        <button
                            onClick={handleShowDetails}
                            className="flex items-center gap-1.5 rounded-lg bg-[#771E49] px-3 py-2 text-sm font-semibold text-white transition-all duration-200 hover:scale-105 hover:bg-[#5a1738] focus:ring-2 focus:ring-[#771E49] focus:outline-none"
                            aria-label={`View details for ${product.name}`}
                        >
                            <Eye size={16} />
                            <span>Details</span>
                        </button>
                    </div>
                </div>
            </article>
        );
    },
);

ProductCard.displayName = 'ProductCard';
