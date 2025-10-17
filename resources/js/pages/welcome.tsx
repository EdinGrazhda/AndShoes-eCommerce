import {
    QueryClient,
    QueryClientProvider,
    useInfiniteQuery,
    useQuery,
} from '@tanstack/react-query';
import { useCallback, useMemo, useState } from 'react';
import { CartDrawer } from '../components/CartDrawer';
import { FilterSidebar } from '../components/FilterSidebar';
import { Header } from '../components/Header';
import { ProductGrid } from '../components/ProductGrid';
import { QuickView } from '../components/QuickView';
import { useDebounce } from '../hooks/useDebounce';
import { useURLFilters } from '../hooks/useURLFilters';
import type {
    Category,
    Filters,
    PaginatedResponse,
    Product,
} from '../types/store';

// Mock data generator for demonstration
const generateMockProducts = (count: number = 1000): Product[] => {
    const categories: Category[] = [
        { id: 1, name: 'Running', slug: 'running' },
        { id: 2, name: 'Casual', slug: 'casual' },
        { id: 3, name: 'Formal', slug: 'formal' },
        { id: 4, name: 'Sports', slug: 'sports' },
        { id: 5, name: 'Boots', slug: 'boots' },
        { id: 6, name: 'Sandals', slug: 'sandals' },
        { id: 7, name: 'Sneakers', slug: 'sneakers' },
        { id: 8, name: 'Loafers', slug: 'loafers' },
    ];

    const adjectives = [
        'Premium',
        'Classic',
        'Modern',
        'Elegant',
        'Sporty',
        'Luxury',
        'Comfort',
        'Professional',
    ];
    const types = [
        'Runner',
        'Walker',
        'Trainer',
        'Oxford',
        'Derby',
        'Loafer',
        'Sneaker',
        'Boot',
    ];

    return Array.from({ length: count }, (_, i) => {
        const randomCategories = categories
            .sort(() => Math.random() - 0.5)
            .slice(0, Math.floor(Math.random() * 3) + 1);

        return {
            id: i + 1,
            name: `${adjectives[Math.floor(Math.random() * adjectives.length)]} ${types[Math.floor(Math.random() * types.length)]} ${i + 1}`,
            description: `Experience ultimate comfort and style with these premium shoes. Crafted with attention to detail and designed for everyday wear.`,
            price: Math.floor(Math.random() * 200) + 30,
            image: `https://picsum.photos/seed/${i + 1}/400/400`,
            rating: Math.floor(Math.random() * 20 + 30) / 10,
            stock: Math.floor(Math.random() * 50),
            categories: randomCategories,
            created_at: new Date(
                Date.now() - Math.random() * 10000000000,
            ).toISOString(),
        };
    });
};

// Mock API functions
const mockProducts = generateMockProducts(1000);

const fetchProducts = async (
    page: number,
    filters: Filters,
): Promise<PaginatedResponse<Product>> => {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 300));

    let filtered = [...mockProducts];

    // Apply search filter
    if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        filtered = filtered.filter((p) =>
            p.name.toLowerCase().includes(searchLower),
        );
    }

    // Apply category filter
    if (filters.categories.length > 0) {
        filtered = filtered.filter((p) =>
            p.categories.some((cat) => filters.categories.includes(cat.id)),
        );
    }

    // Apply price filter
    filtered = filtered.filter(
        (p) => p.price >= filters.priceMin && p.price <= filters.priceMax,
    );

    // Apply sorting
    switch (filters.sortBy) {
        case 'price-asc':
            filtered.sort((a, b) => a.price - b.price);
            break;
        case 'price-desc':
            filtered.sort((a, b) => b.price - a.price);
            break;
        case 'rating':
            filtered.sort((a, b) => b.rating - a.rating);
            break;
        case 'newest':
        default:
            filtered.sort(
                (a, b) =>
                    new Date(b.created_at).getTime() -
                    new Date(a.created_at).getTime(),
            );
            break;
    }

    const perPage = 20;
    const start = (page - 1) * perPage;
    const end = start + perPage;
    const paginatedData = filtered.slice(start, end);

    return {
        data: paginatedData,
        current_page: page,
        last_page: Math.ceil(filtered.length / perPage),
        per_page: perPage,
        total: filtered.length,
    };
};

const fetchCategories = async (): Promise<Category[]> => {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 100));

    return [
        { id: 1, name: 'Running', slug: 'running' },
        { id: 2, name: 'Casual', slug: 'casual' },
        { id: 3, name: 'Formal', slug: 'formal' },
        { id: 4, name: 'Sports', slug: 'sports' },
        { id: 5, name: 'Boots', slug: 'boots' },
        { id: 6, name: 'Sandals', slug: 'sandals' },
        { id: 7, name: 'Sneakers', slug: 'sneakers' },
        { id: 8, name: 'Loafers', slug: 'loafers' },
    ];
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

    // Flatten paginated data
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
