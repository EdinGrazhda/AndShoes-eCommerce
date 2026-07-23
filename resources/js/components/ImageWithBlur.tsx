import { useEffect, useState } from 'react';

interface ImageWithBlurProps {
    src: string;
    alt: string;
    className?: string;
    loading?: 'lazy' | 'eager';
    fetchPriority?: 'high' | 'low' | 'auto';
    decoding?: 'sync' | 'async' | 'auto';
    onLoad?: () => void;
}

/**
 * Image component with blur placeholder
 * Shows a tiny blur placeholder immediately while the full image loads
 */
export function ImageWithBlur({
    src,
    alt,
    className = '',
    loading = 'lazy',
    fetchPriority = 'auto',
    decoding = 'async',
    onLoad,
}: ImageWithBlurProps) {
    const [isLoaded, setIsLoaded] = useState(false);
    const [currentSrc, setCurrentSrc] = useState<string>(src);

    useEffect(() => {
        // Reset loaded state when src changes
        setIsLoaded(false);

        // Preload the image
        const img = new Image();
        img.src = src;
        img.onload = () => {
            setCurrentSrc(src);
            setIsLoaded(true);
            onLoad?.();
        };

        return () => {
            img.onload = null;
        };
    }, [src, onLoad]);

    return (
        <div className="relative h-full w-full">
            {/* Blur placeholder - always visible */}
            <div
                className={`absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300 transition-opacity duration-300 ${
                    isLoaded ? 'opacity-0' : 'opacity-100'
                }`}
                aria-hidden="true"
            />

            {/* Actual image */}
            <img
                src={currentSrc}
                alt={alt}
                loading={loading}
                fetchPriority={fetchPriority}
                decoding={decoding}
                className={`${className} transition-opacity duration-300 ${
                    isLoaded ? 'opacity-100' : 'opacity-0'
                }`}
            />
        </div>
    );
}
