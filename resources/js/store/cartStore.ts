import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CartItem, Product } from '../types/store';

interface CartStore {
    items: CartItem[];
    isOpen: boolean;
    addItem: (product: Product, quantity?: number) => void;
    removeItem: (productId: number) => void;
    updateQuantity: (productId: number, quantity: number) => void;
    clearCart: () => void;
    openCart: () => void;
    closeCart: () => void;
    toggleCart: () => void;
    totalItems: number;
    totalPrice: number;
}

/**
 * Zustand store for cart state management with localStorage persistence
 * Provides optimized actions for cart operations
 */
export const useCartStore = create<CartStore>()(
    persist(
        (set, get) => ({
            items: [],
            isOpen: false,

            addItem: (product, quantity = 1) => {
                set((state) => {
                    const existingItem = state.items.find(
                        (item) => item.product.id === product.id,
                    );

                    if (existingItem) {
                        return {
                            items: state.items.map((item) =>
                                item.product.id === product.id
                                    ? {
                                          ...item,
                                          quantity: item.quantity + quantity,
                                      }
                                    : item,
                            ),
                            isOpen: true,
                        };
                    }

                    return {
                        items: [
                            ...state.items,
                            {
                                product,
                                quantity: quantity,
                            },
                        ],
                        isOpen: true,
                    };
                });
            },

            removeItem: (productId) => {
                set((state) => ({
                    items: state.items.filter(
                        (item) => item.product.id !== productId,
                    ),
                }));
            },

            updateQuantity: (productId, quantity) => {
                set((state) => {
                    if (quantity <= 0) {
                        return {
                            items: state.items.filter(
                                (item) => item.product.id !== productId,
                            ),
                        };
                    }

                    return {
                        items: state.items.map((item) =>
                            item.product.id === productId
                                ? {
                                      ...item,
                                      quantity: quantity,
                                  }
                                : item,
                        ),
                    };
                });
            },

            clearCart: () => {
                set({ items: [], isOpen: false });
            },

            openCart: () => {
                set({ isOpen: true });
            },

            closeCart: () => {
                set({ isOpen: false });
            },

            toggleCart: () => {
                set((state) => ({ isOpen: !state.isOpen }));
            },

            get totalItems() {
                return get().items.reduce(
                    (sum, item) => sum + item.quantity,
                    0,
                );
            },

            get totalPrice() {
                return get().items.reduce(
                    (sum, item) => sum + item.product.price * item.quantity,
                    0,
                );
            },
        }),
        {
            name: 'cart-storage',
            partialize: (state) => ({ items: state.items }),
        },
    ),
);
