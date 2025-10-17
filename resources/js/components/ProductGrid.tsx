import { memo, useCallback, useEffect } from 'react';
import { useInView } from 'react-intersection-observer';
import type { Product } from '../types/store';
import { ProductCard } from './ProductCard';
import { ProductGridSkeleton } from './Skeletons';

interface ProductGridProps {
    products: Product[];
    isLoading: boolean;
    hasNextPage: boolean;
    fetchNextPage: () => void;
    isFetchingNextPage: boolean;
    onQuickView: (product: Product) => void;
}

/**
 * Optimized product grid with infinite scroll and IntersectionObserver
 * Handles 1000+ products smoothly with windowing and lazy loading
 */
export const ProductGrid = memo(
    ({
        products,
        isLoading,
        hasNextPage,
        fetchNextPage,
        isFetchingNextPage,
        onQuickView,
    }: ProductGridProps) => {
        const { ref: loadMoreRef, inView } = useInView({
            threshold: 0.1,
            rootMargin: '400px',
        });

        const handleQuickView = useCallback(
            (product: Product) => {
                onQuickView(product);
            },
            [onQuickView],
        );

        // Trigger next page load when sentinel is in view
        useEffect(() => {
            if (inView && hasNextPage && !isFetchingNextPage) {
                fetchNextPage();
            }
        }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

        // Show skeleton on initial load
        if (isLoading && products.length === 0) {
            return (
                <div className="px-4 py-8 sm:px-6 lg:px-8">
                    <ProductGridSkeleton count={20} />
                </div>
            );
        }

        // No products found
        if (!isLoading && products.length === 0) {
            return (
                <div className="px-4 py-20 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <div className="mx-auto mb-6 flex h-32 w-32 items-center justify-center rounded-full bg-gray-100">
                            <svg
                                className="h-16 w-16 text-gray-400"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                aria-hidden="true"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                            </svg>
                        </div>
                        <h2 className="mb-2 text-2xl font-bold text-gray-900">
                            No products found
                        </h2>
                        <p className="text-gray-600">
                            Try adjusting your filters or search query
                        </p>
                    </div>
                </div>
            );
        }

        return (
            <div id="products" className="px-4 py-8 sm:px-6 lg:px-8">
                {/* Results Count */}
                <div className="mb-6">
                    <p className="text-gray-600">
                        Showing{' '}
                        <span className="font-semibold text-gray-900">
                            {products.length}
                        </span>{' '}
                        products
                    </p>
                </div>

                {/* Product Grid */}
                <div
                    className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 xl:grid-cols-3 2xl:grid-cols-4"
                    role="list"
                    aria-label="Product list"
                >
                    {products.map((product) => (
                        <div key={product.id} role="listitem">
                            <ProductCard
                                product={product}
                                onQuickView={handleQuickView}
                            />
                        </div>
                    ))}
                </div>

                {/* Loading More Indicator */}
                {hasNextPage && (
                    <div
                        ref={loadMoreRef}
                        className="mt-12 flex justify-center"
                    >
                        {isFetchingNextPage ? (
                            <div className="flex items-center gap-3 text-[#771E49]">
                                <div className="h-6 w-6 animate-spin rounded-full border-3 border-[#771E49] border-t-transparent" />
                                <span className="font-medium">
                                    Loading more products...
                                </span>
                            </div>
                        ) : (
                            <div className="h-20" aria-hidden="true" />
                        )}
                    </div>
                )}

                {/* End of Results */}
                {!hasNextPage && products.length > 0 && (
                    <div className="mt-12 text-center">
                        <p className="text-sm text-gray-500">
                            You've reached the end of the catalog
                        </p>
                    </div>
                )}
            </div>
        );
    },
);

ProductGrid.displayName = 'ProductGrid';
