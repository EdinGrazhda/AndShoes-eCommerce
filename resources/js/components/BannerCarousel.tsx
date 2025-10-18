import { ChevronLeft, ChevronRight } from 'lucide-react';
import { memo, useCallback, useEffect, useState } from 'react';

interface BannerSlide {
    id: number;
    image: string;
    title: string;
    subtitle: string;
    cta?: string;
    ctaLink?: string;
}

interface BannerCarouselProps {
    slides?: BannerSlide[];
    autoPlay?: boolean;
    autoPlayInterval?: number;
}

const defaultSlides: BannerSlide[] = [
    {
        id: 1,
        image: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=400&q=80',
        title: 'New Spring Collection',
        subtitle: 'Discover the latest trends in premium footwear',
        cta: 'Shop Now',
        ctaLink: '#products',
    },
    {
        id: 2,
        image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=400&q=80',
        title: 'Premium Quality Shoes',
        subtitle: 'Crafted with attention to detail and comfort',
        cta: 'Explore',
        ctaLink: '#products',
    },
    {
        id: 3,
        image: 'https://images.unsplash.com/photo-1542834369-7daefed8d178?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=400&q=80',
        title: 'Up to 50% Off',
        subtitle: 'Limited time offer on selected premium styles',
        cta: 'Shop Sale',
        ctaLink: '#products',
    },
];

/**
 * Hero banner carousel with smooth transitions and auto-play
 * Features 3 slides with navigation controls and indicators
 */
export const BannerCarousel = memo(
    ({
        slides = defaultSlides,
        autoPlay = true,
        autoPlayInterval = 5000,
    }: BannerCarouselProps) => {
        const [currentSlide, setCurrentSlide] = useState(0);
        const [isHovered, setIsHovered] = useState(false);

        const nextSlide = useCallback(() => {
            setCurrentSlide((prev) => (prev + 1) % slides.length);
        }, [slides.length]);

        const prevSlide = useCallback(() => {
            setCurrentSlide(
                (prev) => (prev - 1 + slides.length) % slides.length,
            );
        }, [slides.length]);

        const goToSlide = useCallback((index: number) => {
            setCurrentSlide(index);
        }, []);

        // Auto-play functionality
        useEffect(() => {
            if (!autoPlay || isHovered) return;

            const interval = setInterval(nextSlide, autoPlayInterval);
            return () => clearInterval(interval);
        }, [autoPlay, autoPlayInterval, nextSlide, isHovered]);

        return (
            <div
                className="relative h-64 w-full overflow-hidden sm:h-80 lg:h-96"
                style={{ backgroundColor: '#761f49' }}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                role="region"
                aria-label="Featured content carousel"
            >
                {/* Slides Container */}
                <div
                    className="flex h-full transition-transform duration-500 ease-in-out"
                    style={{ transform: `translateX(-${currentSlide * 100}%)` }}
                >
                    {slides.map((slide) => (
                        <div
                            key={slide.id}
                            className="relative flex h-full min-w-full items-center justify-center"
                        >
                            {/* Background Image with Overlay */}
                            <div className="absolute inset-0">
                                <img
                                    src={slide.image}
                                    alt={slide.title}
                                    className="h-full w-full object-cover opacity-70"
                                    loading="lazy"
                                />
                                {/* Gradient Overlay */}
                                <div
                                    className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-black/40"
                                    style={{
                                        backgroundColor:
                                            'rgba(118, 31, 73, 0.3)',
                                    }}
                                />
                            </div>

                            {/* Content */}
                            <div className="relative z-10 max-w-4xl px-4 text-center text-white sm:px-6 lg:px-8">
                                <h2 className="mb-2 text-2xl font-bold drop-shadow-lg sm:mb-4 sm:text-3xl lg:text-5xl">
                                    {slide.title}
                                </h2>
                                <p className="mb-4 text-sm opacity-90 drop-shadow-md sm:mb-6 sm:text-lg lg:text-xl">
                                    {slide.subtitle}
                                </p>
                                {slide.cta && (
                                    <button
                                        onClick={() => {
                                            if (
                                                slide.ctaLink?.startsWith('#')
                                            ) {
                                                document
                                                    .querySelector(
                                                        slide.ctaLink,
                                                    )
                                                    ?.scrollIntoView({
                                                        behavior: 'smooth',
                                                    });
                                            }
                                        }}
                                        className="inline-block transform rounded-lg bg-white px-6 py-2 font-semibold text-[#761f49] transition-all duration-200 hover:scale-105 hover:bg-gray-100 focus:ring-2 focus:ring-white focus:outline-none sm:px-8 sm:py-3"
                                        aria-label={`${slide.cta} - ${slide.title}`}
                                    >
                                        {slide.cta}
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Navigation Arrows */}
                <button
                    onClick={prevSlide}
                    className="absolute top-1/2 left-2 -translate-y-1/2 rounded-full bg-white/20 p-2 backdrop-blur-sm transition-all duration-200 hover:bg-white/30 focus:ring-2 focus:ring-white focus:outline-none sm:left-4 sm:p-3"
                    aria-label="Previous slide"
                >
                    <ChevronLeft size={20} className="text-white" />
                </button>

                <button
                    onClick={nextSlide}
                    className="absolute top-1/2 right-2 -translate-y-1/2 rounded-full bg-white/20 p-2 backdrop-blur-sm transition-all duration-200 hover:bg-white/30 focus:ring-2 focus:ring-white focus:outline-none sm:right-4 sm:p-3"
                    aria-label="Next slide"
                >
                    <ChevronRight size={20} className="text-white" />
                </button>

                {/* Slide Indicators */}
                <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 space-x-2">
                    {slides.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => goToSlide(index)}
                            className={`h-3 w-3 rounded-full transition-all duration-200 focus:ring-2 focus:ring-white focus:outline-none ${
                                index === currentSlide
                                    ? 'scale-110 bg-white'
                                    : 'bg-white/50 hover:bg-white/70'
                            }`}
                            aria-label={`Go to slide ${index + 1}`}
                        />
                    ))}
                </div>

                {/* Progress Bar (Optional) */}
                <div className="absolute right-0 bottom-0 left-0 h-1 bg-white/20">
                    <div
                        className="h-full bg-white transition-all duration-100 ease-linear"
                        style={{
                            width:
                                autoPlay && !isHovered
                                    ? `${((currentSlide + 1) / slides.length) * 100}%`
                                    : '0%',
                        }}
                    />
                </div>
            </div>
        );
    },
);

BannerCarousel.displayName = 'BannerCarousel';
