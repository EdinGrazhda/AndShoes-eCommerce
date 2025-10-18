export interface Product {
    id: number;
    name: string;
    description: string;
    price: number;
    image: string;
    rating: number;
    stock: string; // Changed from number to string - can be 'in stock', 'low stock', 'out of stock'
    foot_numbers?: string; // Available sizes as comma-separated string
    sizeStocks?: Record<string, number>; // Size-specific stock quantities
    color?: string;
    categories: Category[];
    created_at: string;
}

export interface Category {
    id: number;
    name: string;
    slug: string;
}

export interface CartItem {
    product: Product & { selectedSize?: string };
    quantity: number;
}

export interface Filters {
    search: string;
    categories: number[];
    priceMin: number;
    priceMax: number;
    sortBy: 'newest' | 'price-asc' | 'price-desc' | 'rating';
}

export interface PaginatedResponse<T> {
    data: T[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
}
