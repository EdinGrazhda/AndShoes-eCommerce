export interface Product {
    id: number;
    name: string;
    description: string;
    price: number;
    image: string;
    rating: number;
    stock: number;
    categories: Category[];
    created_at: string;
}

export interface Category {
    id: number;
    name: string;
    slug: string;
}

export interface CartItem {
    product: Product;
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
