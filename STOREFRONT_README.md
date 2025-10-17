# AndShoes E-Commerce Frontend

## Overview

A high-performance, single-page e-commerce storefront built with React, Vite, TypeScript, and Tailwind CSS. The application is optimized to handle 1000+ products with smooth 60fps scrolling and excellent Lighthouse scores.

## Design System

- **Primary Color**: `#771E49` (Brand burgundy)
- **Background**: `#FFFFFF` (White)
- **Typography**: Clean, readable sans-serif
- **Spacing**: Generous, comfortable spacing throughout
- **Shadows**: Subtle elevation for depth

## Key Features

### 🎨 UI/UX

- **Responsive Layout**: Mobile-first design with sidebar for desktop
- **Filter Sidebar**:
    - Sticky on desktop (lg and up)
    - Slide-in drawer on mobile/tablet
    - Toggle via header button on mobile
- **Compact Header**: Logo, search, filter toggle (mobile), and cart badge
- **Product Cards**: Image, title, price, rating, stock badge, and quick add-to-cart
- **Cart Drawer**: Slide-in panel with full cart management
- **Quick View Modal**: Detailed product view without leaving the page

### ⚡ Performance Optimizations

#### 1. **Infinite Scroll with IntersectionObserver**

- Loads products in batches of 20
- Preloads next page when user is 400px from bottom
- Smooth, seamless loading experience

#### 2. **React Query (TanStack Query)**

- Aggressive caching (30s stale time)
- Background refetching
- Automatic retry on failure
- Prefetching support

#### 3. **Component Memoization**

- All components use `React.memo`
- Stable callbacks with `useCallback`
- Memoized computed values with `useMemo`

#### 4. **Debounced Search**

- 300ms debounce to reduce API calls
- Smooth user experience

#### 5. **Lazy Image Loading**

- Native `loading="lazy"` attribute
- Fixed aspect ratios to prevent layout shift
- Skeleton loaders during load

#### 6. **State Management**

- Zustand for cart (persisted to localStorage)
- URL query params for filters (shareable links)
- Optimized re-renders

#### 7. **CSS Optimizations**

- GPU-accelerated animations
- Smooth scroll behavior
- Optimized font rendering

### 🎯 Accessibility

- **Semantic HTML**: Proper heading hierarchy, landmarks
- **ARIA Labels**: Comprehensive labeling for screen readers
- **Keyboard Navigation**: Full keyboard support
- **Focus Indicators**: Visible focus rings with brand color
- **Color Contrast**: WCAG AA compliant (#771E49 on white)
- **Live Regions**: Dynamic content announcements

### 🔍 Features Breakdown

#### Filter System

- **Categories**: Multi-select checkboxes
- **Price Range**: Min/max inputs with live validation
- **Sorting**: Newest, Price (asc/desc), Rating
- **Search**: Full-text search with debouncing
- **Active Filters**: Chip display with individual removal
- **URL Sync**: Filters persist in URL for sharing

#### Product Display

- **Grid Layout**: Responsive columns (1-4 based on screen size)
- **Stock Badges**: "Out of Stock" and "Only X left" indicators
- **Rating Display**: Visual 5-star rating system
- **Hover Effects**: Smooth scale and border transitions

#### Cart Management

- **Add to Cart**: Quick add from product card
- **Quantity Control**: Increment/decrement with stock limits
- **Remove Items**: Individual item removal
- **Clear Cart**: One-click cart clearing
- **Persistence**: Cart saved to localStorage
- **Total Calculation**: Real-time price calculation

## File Structure

```
resources/js/
├── pages/
│   └── welcome.tsx          # Main storefront page
├── components/
│   ├── Header.tsx           # Top navigation with search and cart
│   ├── FilterSidebar.tsx    # Left sidebar with all filters
│   ├── ProductGrid.tsx      # Infinite scroll product grid
│   ├── ProductCard.tsx      # Individual product card
│   ├── CartDrawer.tsx       # Slide-in cart panel
│   ├── QuickView.tsx        # Product quick view modal
│   └── Skeletons.tsx        # Loading skeletons
├── hooks/
│   ├── useDebounce.ts       # Debounce utility hook
│   └── useURLFilters.ts     # URL query param management
├── store/
│   └── cartStore.ts         # Zustand cart store
└── types/
    └── store.ts             # TypeScript interfaces

resources/css/
└── app.css                  # Tailwind config and custom styles
```

## Mock Data

The application includes a mock data generator that creates 1000 products with:

- Random names combining adjectives and shoe types
- Prices between $30-$230
- Ratings between 3.0-5.0 stars
- Stock levels 0-50 units
- 1-3 random categories per product
- Placeholder images from Picsum

## Performance Targets

### Lighthouse Scores (Production Build)

- **Performance**: ≥90
- **Accessibility**: ≥90
- **Best Practices**: ≥90
- **SEO**: ≥90

### Runtime Performance

- **60fps scrolling**: Achieved through GPU acceleration
- **Time to Interactive**: <3s on 3G
- **First Contentful Paint**: <1.5s

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari 14+, Chrome Android)

## Development

### Running the App

```bash
npm run dev
```

### Building for Production

```bash
npm run build
```

### Type Checking

```bash
npm run types
```

## Customization

### Changing Brand Color

Update the `--brand-primary` variable in `resources/css/app.css`:

```css
:root {
    --brand-primary: #771e49; /* Your color here */
    --brand-primary-hover: #5a1738; /* Darker variant */
}
```

### Adjusting Product Grid

Modify the grid classes in `ProductGrid.tsx`:

```tsx
// Current: 1-2-3-4 columns
className =
    'grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 sm:gap-6';
```

### Changing Pagination

Update `perPage` in `welcome.tsx`:

```tsx
const perPage = 20; // Products per page
```

## Future Enhancements

- [ ] Connect to real backend API
- [ ] Add product variants (size, color)
- [ ] Implement wishlist functionality
- [ ] Add product comparison feature
- [ ] Enhanced filtering (brand, material, etc.)
- [ ] Sort by popularity/trending
- [ ] User reviews and ratings
- [ ] Product recommendations
- [ ] Advanced search with autocomplete

## Notes

- All data is currently mocked for demonstration
- Cart persists in localStorage
- Filters sync to URL for shareable links
- Mobile-optimized with touch interactions
- Fully accessible with keyboard navigation
