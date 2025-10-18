import { create } from 'zustand';
import type { Product } from '../types/store';

interface Order {
    id: number;
    unique_id: string;
    customer_full_name: string;
    customer_email: string;
    customer_phone: string;
    customer_address: string;
    customer_city: string;
    customer_country: 'albania' | 'kosovo' | 'macedonia';
    product_name: string;
    product_price: number;
    product_image?: string;
    product_size?: string;
    product_color?: string;
    quantity: number;
    total_amount: number;
    payment_method: 'cash';
    status: string;
    created_at?: string;
}

interface CheckoutState {
    isOpen: boolean;
    product: Product | null;
    isSuccessOpen: boolean;
    successOrder: Order | null;
    openCheckout: (product: Product) => void;
    closeCheckout: () => void;
    openSuccess: (order: Order) => void;
    closeSuccess: () => void;
}

export const useCheckoutStore = create<CheckoutState>((set) => ({
    isOpen: false,
    product: null,
    isSuccessOpen: false,
    successOrder: null,
    openCheckout: (product) => set({ isOpen: true, product }),
    closeCheckout: () => set({ isOpen: false, product: null }),
    openSuccess: (order) => set({ isSuccessOpen: true, successOrder: order }),
    closeSuccess: () => set({ isSuccessOpen: false, successOrder: null }),
}));
