# AndShoes Layout Guide

## Desktop Layout (≥1024px)

```
┌─────────────────────────────────────────────────────────────┐
│ HEADER (Sticky, z-50)                                       │
│ ┌─────┬─────────────────────────────────────────┬────────┐ │
│ │Logo │        Search Bar                        │  Cart  │ │
│ └─────┴─────────────────────────────────────────┴────────┘ │
└─────────────────────────────────────────────────────────────┘
┌──────────────┬──────────────────────────────────────────────┐
│ FILTER       │ PRODUCTS                                     │
│ SIDEBAR      │                                              │
│ (Sticky)     │ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐│
│              │ │Product │ │Product │ │Product │ │Product ││
│ Sort By      │ │  Card  │ │  Card  │ │  Card  │ │  Card  ││
│ ▼ Newest     │ └────────┘ └────────┘ └────────┘ └────────┘│
│              │                                              │
│ Price Range  │ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐│
│ $ Min        │ │Product │ │Product │ │Product │ │Product ││
│ $ Max        │ │  Card  │ │  Card  │ │  Card  │ │  Card  ││
│              │ └────────┘ └────────┘ └────────┘ └────────┘│
│ Categories   │                                              │
│ ☑ Running    │ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐│
│ ☐ Casual     │ │Product │ │Product │ │Product │ │Product ││
│ ☐ Formal     │ │  Card  │ │  Card  │ │  Card  │ │  Card  ││
│ ☐ Sports     │ └────────┘ └────────┘ └────────┘ └────────┘│
│ ...          │                                              │
│              │         (Infinite Scroll)                    │
│ Active:      │                 ↓                            │
│ [Running ×]  │            Loading...                        │
│              │                                              │
│ Clear All    │                                              │
│              │                                              │
└──────────────┴──────────────────────────────────────────────┘
```

## Mobile Layout (<1024px)

### Default View (Filters Hidden)

```
┌─────────────────────────────────────┐
│ HEADER (Sticky)                     │
│ ┌─────┬─────┬─────────────┬──────┐ │
│ │[≡]  │Logo │   Search    │ Cart │ │
│ └─────┴─────┴─────────────┴──────┘ │
└─────────────────────────────────────┘
┌─────────────────────────────────────┐
│ PRODUCTS (Full Width)               │
│                                     │
│ ┌─────────────┐ ┌─────────────┐   │
│ │   Product   │ │   Product   │   │
│ │    Card     │ │    Card     │   │
│ └─────────────┘ └─────────────┘   │
│                                     │
│ ┌─────────────┐ ┌─────────────┐   │
│ │   Product   │ │   Product   │   │
│ │    Card     │ │    Card     │   │
│ └─────────────┘ └─────────────┘   │
│                                     │
│        (Infinite Scroll)            │
│              ↓                      │
│         Loading...                  │
│                                     │
└─────────────────────────────────────┘
```

### Filters Drawer Open (Mobile)

```
┌─────────────────────────────────────┐
│ HEADER                              │
│ ┌─────┬─────┬─────────────┬──────┐ │
│ │[≡]  │Logo │   Search    │ Cart │ │
│ └─────┴─────┴─────────────┴──────┘ │
└─────────────────────────────────────┘
┌───────────────┐ ┌─────────────────┐
│ FILTER DRAWER │█│   (Backdrop)    │
│               │█│                 │
│ Filters    [×]│█│                 │
│ ─────────────│█│                 │
│               │█│                 │
│ Sort By       │█│                 │
│ ▼ Newest      │█│                 │
│               │█│                 │
│ Price Range   │█│                 │
│ $ Min         │█│                 │
│ $ Max         │█│                 │
│               │█│                 │
│ Categories    │█│                 │
│ ☑ Running     │█│                 │
│ ☐ Casual      │█│                 │
│ ☐ Formal      │█│                 │
│               │█│                 │
│ Active:       │█│                 │
│ [Running ×]   │█│                 │
│               │█│                 │
│ Clear All     │█│                 │
│               │█│                 │
└───────────────┘ └─────────────────┘
```

## Component Hierarchy

```
Welcome (Root)
├── QueryClientProvider
│   └── StorefrontContent
│       ├── Header
│       │   ├── Filter Toggle (mobile only)
│       │   ├── Logo
│       │   ├── Search Input
│       │   └── Cart Button
│       ├── Main Layout (flex)
│       │   ├── FilterSidebar
│       │   │   ├── Sort Dropdown
│       │   │   ├── Price Range Inputs
│       │   │   ├── Category Checkboxes
│       │   │   ├── Active Filter Chips
│       │   │   └── Clear All Button
│       │   └── ProductGrid
│       │       ├── Results Count
│       │       ├── Product Cards
│       │       │   ├── Image (lazy loaded)
│       │       │   ├── Title
│       │       │   ├── Rating Stars
│       │       │   ├── Price
│       │       │   └── Add to Cart Button
│       │       └── Load More Sentinel
│       ├── CartDrawer (overlay)
│       │   ├── Cart Items
│       │   ├── Quantity Controls
│       │   ├── Total Price
│       │   └── Checkout Button
│       └── QuickView Modal (overlay)
│           ├── Product Image
│           ├── Details
│           ├── Quantity Selector
│           └── Add to Cart Button
```

## Responsive Breakpoints

| Breakpoint | Width   | Sidebar | Grid Columns |
| ---------- | ------- | ------- | ------------ |
| Mobile     | <640px  | Drawer  | 1            |
| SM         | ≥640px  | Drawer  | 2            |
| MD         | ≥768px  | Drawer  | 2            |
| LG         | ≥1024px | Sticky  | 3            |
| XL         | ≥1280px | Sticky  | 3            |
| 2XL        | ≥1536px | Sticky  | 4            |

## Color Usage

| Element      | Color    | Usage                |
| ------------ | -------- | -------------------- |
| Logo         | #771E49  | Brand identity       |
| Buttons      | #771E49  | Primary actions      |
| Filter Chips | #771E49  | Active filters       |
| Focus Rings  | #771E49  | Accessibility        |
| Hover States | #5a1738  | Interactive feedback |
| Text         | Gray-900 | Primary content      |
| Backgrounds  | White    | Main surface         |
| Borders      | Gray-200 | Subtle separators    |

## Interactive States

### Product Card

- **Hover**: Scale up, border color to #771E49
- **Focus**: Ring-2 #771E49
- **Click**: Opens Quick View

### Buttons

- **Hover**: Background darkens
- **Focus**: Ring-2 #771E49
- **Disabled**: Gray-200 background, reduced opacity

### Filter Sidebar

- **Desktop**: Always visible, sticky scroll
- **Mobile**: Hidden by default, slides in from left
- **Close**: Click backdrop or close button

### Cart Drawer

- **Open**: Slides in from right
- **Close**: Click backdrop, close button, or ESC key
- **Updates**: Live total recalculation
