import { ShoppingCart, Star } from 'lucide-react';
import { memo, useCallback, useState } from 'react';
import { useCartStore } from '../store/cartStore';
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
        const addItem = useCartStore((state) => state.addItem);

        const handleAddToCart = useCallback(
            (e: React.MouseEvent) => {
                e.stopPropagation();
                if (product.stock > 0) {
                    addItem(product);
                }
            },
            [addItem, product],
        );

        const handleQuickView = useCallback(() => {
            onQuickView?.(product);
        }, [onQuickView, product]);

        const isLowStock = product.stock > 0 && product.stock <= 5;
        const isOutOfStock = product.stock === 0;

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
                </div>

                {/* Product Info */}
                <div className="p-4">
                    {/* Title */}
                    <h3 className="mb-2 line-clamp-2 text-base font-semibold text-gray-900 transition-colors group-hover:text-[#771E49]">
                        {product.name}
                    </h3>

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

                    {/* Price and Action */}
                    <div className="mt-3 flex items-center justify-between">
                        <span className="text-xl font-bold text-[#771E49]">
                            €{product.price.toFixed(2)}
                        </span>

                        <button
                            onClick={handleAddToCart}
                            disabled={isOutOfStock}
                            className={`rounded-lg p-2 transition-all duration-200 focus:ring-2 focus:ring-[#771E49] focus:outline-none ${
                                isOutOfStock
                                    ? 'cursor-not-allowed bg-gray-200 text-gray-400'
                                    : 'bg-[#771E49] text-white hover:scale-110 hover:bg-[#5a1738]'
                            }`}
                            aria-label={`Add ${product.name} to cart`}
                        >
                            <ShoppingCart size={20} />
                        </button>
                    </div>
                </div>
            </article>
        );
    },
);

ProductCard.displayName = 'ProductCard';
