import {
    QueryClient,
    QueryClientProvider,
    useInfiniteQuery,
    useQuery,
} from '@tanstack/react-query';
import { useCallback, useMemo, useState } from 'react';
import { BannerCarousel } from '../components/BannerCarousel';
import { CartDrawer } from '../components/CartDrawer';
import { CheckoutModal } from '../components/CheckoutModal';
import { FilterSidebar } from '../components/FilterSidebar';
import { Header } from '../components/Header';
import { OrderSuccessModal } from '../components/OrderSuccessModal';
import { ProductGrid } from '../components/ProductGrid';
import { QuickView } from '../components/QuickView';
import { useDebounce } from '../hooks/useDebounce';
import { useURLFilters } from '../hooks/useURLFilters';
import { useCheckoutStore } from '../store/checkoutStore';
import type {
    Category,
    Filters,
    PaginatedResponse,
    Product,
} from '../types/store';

// Real API functions to fetch data from your Laravel backend
const fetchProducts = async (
    page: number,
    filters: Filters,
): Promise<PaginatedResponse<Product>> => {
    // Simulate network delay for UX (optional)
    await new Promise((resolve) => setTimeout(resolve, 100));

    const params = new URLSearchParams({
        page: page.toString(),
        per_page: '20',
    });

    // Add filters to the request
    if (filters.search) {
        params.append('search', filters.search);
    }
    if (filters.categories.length > 0) {
        filters.categories.forEach((categoryId) => {
            params.append('category[]', categoryId.toString());
        });
    }
    if (filters.priceMin > 0) {
        params.append('price_min', filters.priceMin.toString());
    }
    if (filters.priceMax < 1000) {
        params.append('price_max', filters.priceMax.toString());
    }
    if (filters.gender && filters.gender.length > 0) {
        filters.gender.forEach((gender) => {
            params.append('gender[]', gender);
        });
    }
    if (filters.sortBy) {
        params.append('sort_by', filters.sortBy);
    }

    try {
        const response = await fetch(`/api/products?${params.toString()}`);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        // Since the API now returns Laravel pagination object directly,
        // the products are in data.data
        return {
            data: data.data.map((product: any) => ({
                id: product.id,
                name: product.name,
                description: product.description,
                price: parseFloat(product.campaign_price || product.price), // Use campaign price if available
                originalPrice: product.campaign_price
                    ? parseFloat(product.price)
                    : undefined, // Store original price if on campaign
                image:
                    product.image ||
                    `https://picsum.photos/seed/${product.id}/400/400`,
                rating: Math.floor(Math.random() * 20 + 30) / 10, // Random rating since it's not in your schema
                stock: product.stock || 0,
                foot_numbers: product.foot_numbers, // Added missing foot_numbers field
                color: product.color, // Also added color field for completeness
                gender: product.gender || 'unisex', // Added gender field
                categories: product.category ? [product.category] : [],
                created_at: product.created_at,
                hasActiveCampaign: !!product.campaign_price, // Flag to show campaign badge
            })),
            current_page: data.current_page,
            last_page: data.last_page,
            per_page: data.per_page,
            total: data.total,
        };
    } catch (error) {
        console.error('Error fetching products:', error);
        // Fallback to empty results if API fails
        return {
            data: [],
            current_page: page,
            last_page: 1,
            per_page: 20,
            total: 0,
        };
    }
};

const fetchCategories = async (): Promise<Category[]> => {
    try {
        const response = await fetch('/api/categories');

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        return data.data.map((category: any) => ({
            id: category.id,
            name: category.name,
            slug: category.name.toLowerCase().replace(/\s+/g, '-'),
        }));
    } catch (error) {
        console.error('Error fetching categories:', error);

        return [
            { id: 1, name: 'Running', slug: 'running' },
            { id: 2, name: 'Casual', slug: 'casual' },
            { id: 3, name: 'Formal', slug: 'formal' },
            { id: 4, name: 'Sports', slug: 'sports' },
        ];
    }
};

/**
 * Main storefront component with all optimizations
 */
function StorefrontContent() {
    const { filters, updateFilters, clearFilters, hasActiveFilters } =
        useURLFilters();
    const [searchInput, setSearchInput] = useState(filters.search);
    const debouncedSearch = useDebounce(searchInput, 300);
    const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(
        null,
    );
    const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

    const {
        isOpen: isCheckoutOpen,
        product: checkoutProduct,
        closeCheckout,
        isSuccessOpen,
        successOrder,
        closeSuccess,
    } = useCheckoutStore();

    // Update filters when debounced search changes
    useMemo(() => {
        if (debouncedSearch !== filters.search) {
            updateFilters({ search: debouncedSearch });
        }
    }, [debouncedSearch]);

    // Fetch categories
    const { data: categories = [] } = useQuery({
        queryKey: ['categories'],
        queryFn: fetchCategories,
        staleTime: Infinity,
        gcTime: Infinity,
    });

    // Fetch products with infinite scroll
    const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
        useInfiniteQuery({
            queryKey: ['products', filters],
            queryFn: ({ pageParam = 1 }) => fetchProducts(pageParam, filters),
            getNextPageParam: (lastPage) =>
                lastPage.current_page < lastPage.last_page
                    ? lastPage.current_page + 1
                    : undefined,
            initialPageParam: 1,
            staleTime: 30000, // 30 seconds
            gcTime: 300000, // 5 minutes
        });

    const products = useMemo(() => {
        return data?.pages.flatMap((page) => page.data) ?? [];
    }, [data]);

    const handleSearchChange = useCallback((value: string) => {
        setSearchInput(value);
    }, []);

    const handleQuickView = useCallback((product: Product) => {
        setQuickViewProduct(product);
    }, []);

    const handleCloseQuickView = useCallback(() => {
        setQuickViewProduct(null);
    }, []);

    const handleToggleFilters = useCallback(() => {
        setIsMobileFilterOpen((prev) => !prev);
    }, []);

    const handleCloseFilters = useCallback(() => {
        setIsMobileFilterOpen(false);
    }, []);

    return (
        <div className="min-h-screen bg-white">
            {/* Header */}
            <Header
                searchValue={searchInput}
                onSearchChange={handleSearchChange}
                onToggleFilters={handleToggleFilters}
            />

            {/* Banner Carousel */}
            <BannerCarousel />

            {/* Main Layout with Sidebar */}
            <div className="flex">
                {/* Filter Sidebar */}
                <FilterSidebar
                    filters={filters}
                    categories={categories}
                    onFilterChange={updateFilters}
                    onClearFilters={clearFilters}
                    hasActiveFilters={hasActiveFilters}
                    isOpen={isMobileFilterOpen}
                    onClose={handleCloseFilters}
                />

                {/* Product Grid - Main Content */}
                <main className="min-w-0 flex-1">
                    <ProductGrid
                        products={products}
                        isLoading={isLoading}
                        hasNextPage={hasNextPage ?? false}
                        fetchNextPage={fetchNextPage}
                        isFetchingNextPage={isFetchingNextPage}
                        onQuickView={handleQuickView}
                    />
                </main>
            </div>

            {/* Cart Drawer */}
            <CartDrawer />

            {/* Quick View Modal */}
            <QuickView
                product={quickViewProduct}
                onClose={handleCloseQuickView}
            />

            {/* Checkout Modal */}
            {checkoutProduct && (
                <CheckoutModal
                    isOpen={isCheckoutOpen}
                    onClose={closeCheckout}
                    product={checkoutProduct}
                />
            )}

            {/* Order Success Modal */}
            {successOrder && (
                <OrderSuccessModal
                    isOpen={isSuccessOpen}
                    onClose={closeSuccess}
                    order={successOrder}
                />
            )}
        </div>
    );
}

// Initialize React Query client with optimizations
const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            refetchOnWindowFocus: false,
            retry: 1,
            staleTime: 30000,
        },
    },
});

/**
 * Root component with React Query provider
 */
export default function Welcome() {
    return (
        <QueryClientProvider client={queryClient}>
            <StorefrontContent />
        </QueryClientProvider>
    );
}
