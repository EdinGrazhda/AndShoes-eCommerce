import { memo } from 'react';

/**
 * Skeleton loader for product cards
 * Provides visual feedback during data fetching
 */
export const ProductCardSkeleton = memo(() => {
    return (
        <div className="animate-pulse overflow-hidden rounded-lg border border-gray-200 bg-white">
            {/* Image Skeleton */}
            <div className="aspect-square bg-gray-200" />

            {/* Content Skeleton */}
            <div className="space-y-3 p-4">
                {/* Title */}
                <div className="h-5 w-3/4 rounded bg-gray-200" />
                <div className="h-5 w-1/2 rounded bg-gray-200" />

                {/* Rating */}
                <div className="flex gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="h-4 w-4 rounded bg-gray-200" />
                    ))}
                </div>

                {/* Price and Button */}
                <div className="flex items-center justify-between pt-2">
                    <div className="h-6 w-20 rounded bg-gray-200" />
                    <div className="h-10 w-10 rounded-lg bg-gray-200" />
                </div>
            </div>
        </div>
    );
});

ProductCardSkeleton.displayName = 'ProductCardSkeleton';

/**
 * Grid of skeleton loaders
 */
export const ProductGridSkeleton = memo(
    ({ count = 12 }: { count?: number }) => {
        return (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 xl:grid-cols-3 2xl:grid-cols-4">
                {Array.from({ length: count }).map((_, i) => (
                    <ProductCardSkeleton key={i} />
                ))}
            </div>
        );
    },
);

ProductGridSkeleton.displayName = 'ProductGridSkeleton';
