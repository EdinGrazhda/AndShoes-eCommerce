# Performance Optimization Guide

## Implemented Optimizations

### 1. React Optimizations

#### Component Memoization

All components are wrapped with `React.memo` to prevent unnecessary re-renders:

```tsx
export const ProductCard = memo(
    ({ product, onQuickView }: ProductCardProps) => {
        // Component logic
    },
);
```

#### Stable Callbacks

Using `useCallback` to ensure function references don't change:

```tsx
const handleAddToCart = useCallback(
    (e: React.MouseEvent) => {
        if (product.stock > 0) {
            addItem(product);
        }
    },
    [addItem, product],
);
```

#### Computed Values

Using `useMemo` for expensive calculations:

```tsx
const products = useMemo(() => {
    return data?.pages.flatMap((page) => page.data) ?? [];
}, [data]);
```

### 2. Data Fetching Optimizations

#### TanStack Query Configuration

```tsx
const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            refetchOnWindowFocus: false, // Don't refetch when tab regains focus
            retry: 1, // Only retry once on failure
            staleTime: 30000, // Cache for 30 seconds
        },
    },
});
```

#### Infinite Query Setup

```tsx
useInfiniteQuery({
    queryKey: ['products', filters], // Automatic cache by filter state
    queryFn: ({ pageParam = 1 }) => fetchProducts(pageParam, filters),
    getNextPageParam: (lastPage) =>
        lastPage.current_page < lastPage.last_page
            ? lastPage.current_page + 1
            : undefined,
    initialPageParam: 1,
    staleTime: 30000, // 30 seconds stale time
    gcTime: 300000, // 5 minutes garbage collection
});
```

### 3. Infinite Scroll Optimization

#### IntersectionObserver

```tsx
const { ref: loadMoreRef, inView } = useInView({
    threshold: 0.1, // Trigger when 10% visible
    rootMargin: '400px', // Start loading 400px before sentinel
});

useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
    }
}, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);
```

### 4. Search Optimization

#### Debounced Input

```tsx
// User types
const [searchInput, setSearchInput] = useState('');

// Debounced value (300ms delay)
const debouncedSearch = useDebounce(searchInput, 300);

// Effect only runs after 300ms of no typing
useMemo(() => {
    if (debouncedSearch !== filters.search) {
        updateFilters({ search: debouncedSearch });
    }
}, [debouncedSearch]);
```

### 5. Image Optimization

#### Lazy Loading

```tsx
<img
    src={product.image}
    alt={product.name}
    loading="lazy" // Native lazy loading
    onLoad={() => setImageLoaded(true)}
    className={imageLoaded ? 'opacity-100' : 'opacity-0'}
/>
```

#### Fixed Aspect Ratios

```tsx
<div className="relative aspect-square overflow-hidden bg-gray-100">
    {/* Image here - prevents layout shift */}
</div>
```

### 6. CSS Optimizations

#### GPU Acceleration

```css
.gpu-accelerated {
    transform: translateZ(0);
    backface-visibility: hidden;
    perspective: 1000px;
}
```

#### Will-Change for Animations

```css
.will-change-transform {
    will-change: transform;
}
```

#### Smooth Scrolling

```css
html {
    scroll-behavior: smooth;
}
```

### 7. State Management

#### Zustand with Persistence

```tsx
export const useCartStore = create<CartStore>()(
    persist(
        (set, get) => ({
            items: [],
            // ... store logic
        }),
        {
            name: 'cart-storage',
            partialize: (state) => ({ items: state.items }),
        },
    ),
);
```

#### URL State for Filters

```tsx
// Filters sync to URL automatically
// Example: ?search=nike&categories=1,2&priceMax=100&sortBy=price-asc
```

### 8. Bundle Optimization

#### Code Splitting (Future Enhancement)

```tsx
// Lazy load heavy components
const QuickView = lazy(() => import('./components/QuickView'));

<Suspense fallback={<Skeleton />}>
    <QuickView product={product} />
</Suspense>;
```

## Performance Metrics

### Target Metrics

- **First Contentful Paint (FCP)**: < 1.5s
- **Largest Contentful Paint (LCP)**: < 2.5s
- **Time to Interactive (TTI)**: < 3.8s
- **Cumulative Layout Shift (CLS)**: < 0.1
- **First Input Delay (FID)**: < 100ms

### How to Measure

```bash
# Build for production
npm run build

# Serve production build
npm run preview

# Run Lighthouse
lighthouse http://localhost:4173 --view
```

## Browser Performance Tools

### Chrome DevTools

1. **Performance Tab**
    - Record while scrolling
    - Look for long tasks (>50ms)
    - Check for jank in frame rate

2. **Network Tab**
    - Check waterfall for request timing
    - Verify image lazy loading
    - Monitor API call frequency

3. **Lighthouse**
    - Run performance audit
    - Check accessibility score
    - Review best practices

### React DevTools Profiler

1. Install React DevTools extension
2. Open Profiler tab
3. Record interaction
4. Analyze component render times

## Common Performance Pitfalls (Avoided)

### ❌ Don't Do This

```tsx
// Inline object/array creation causes re-renders
<Component style={{ color: 'red' }} />
<Component items={[1, 2, 3]} />

// Anonymous functions in props
<Component onClick={() => doSomething()} />

// Expensive calculations in render
function Component() {
  const result = expensiveOperation(data); // Runs every render!
}
```

### ✅ Do This Instead

```tsx
// Define outside component or use useMemo
const style = { color: 'red' };
const items = [1, 2, 3];
<Component style={style} items={items} />;

// useCallback for stable references
const handleClick = useCallback(() => doSomething(), []);
<Component onClick={handleClick} />;

// useMemo for expensive calculations
function Component() {
    const result = useMemo(() => expensiveOperation(data), [data]);
}
```

## Monitoring in Production

### Add Performance Monitoring

```tsx
// Example: Web Vitals
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

getCLS(console.log);
getFID(console.log);
getFCP(console.log);
getLCP(console.log);
getTTFB(console.log);
```

### Bundle Size Analysis

```bash
# Analyze bundle
npm run build -- --mode analyze
```

## Future Optimizations

### Service Worker for Caching

```tsx
// Cache API responses and static assets
// Enable offline functionality
```

### Image CDN

```tsx
// Use CDN with automatic optimization
// WebP/AVIF format support
// Responsive images
```

### Virtual Scrolling (if needed)

```tsx
// For extremely large lists (10k+ items)
import { FixedSizeGrid } from 'react-window';
```

### Preloading

```tsx
// Preload critical resources
<link rel="preload" href="/fonts/..." as="font" />
```

## Testing Performance

### Load Testing

```bash
# Simulate 1000 products
# Scroll through entire list
# Monitor memory usage
# Check for memory leaks
```

### Mobile Testing

```bash
# Test on real devices
# Use Chrome DevTools device emulation
# Test on slow 3G network
# Enable CPU throttling (4x slowdown)
```

## Checklist

- [x] Component memoization
- [x] Stable callbacks and computed values
- [x] TanStack Query caching
- [x] Infinite scroll with IntersectionObserver
- [x] Debounced search
- [x] Lazy image loading
- [x] Fixed aspect ratios
- [x] GPU-accelerated animations
- [x] State management optimization
- [x] URL state persistence
- [ ] Code splitting
- [ ] Service worker
- [ ] Bundle analysis
- [ ] Performance monitoring
- [ ] Image CDN integration
