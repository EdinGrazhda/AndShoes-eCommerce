import { Minus, Plus, Trash2, X } from 'lucide-react';
import { memo } from 'react';
import { useCartStore } from '../store/cartStore';

/**
 * Sliding cart drawer with item management
 * Accessible with keyboard navigation and screen reader support
 */
export const CartDrawer = memo(() => {
    const {
        items,
        isOpen,
        closeCart,
        updateQuantity,
        removeItem,
        totalPrice,
        clearCart,
    } = useCartStore();

    if (!isOpen) return null;

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 z-50 bg-black/50 transition-opacity"
                onClick={closeCart}
                aria-hidden="true"
            />

            {/* Drawer */}
            <aside
                className="fixed top-0 right-0 bottom-0 z-50 flex w-full max-w-md animate-in flex-col bg-white shadow-2xl duration-300 slide-in-from-right"
                role="dialog"
                aria-label="Shopping cart"
                aria-modal="true"
            >
                {/* Header */}
                <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
                    <h2 className="text-xl font-bold text-gray-900">
                        Shopping Cart
                    </h2>
                    <button
                        onClick={closeCart}
                        className="rounded-lg p-2 transition-colors hover:bg-gray-100 focus:ring-2 focus:ring-[#771E49] focus:outline-none"
                        aria-label="Close cart"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Cart Items */}
                <div className="flex-1 overflow-y-auto px-6 py-4">
                    {items.length === 0 ? (
                        <div className="flex h-full flex-col items-center justify-center text-center">
                            <div className="mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-gray-100">
                                <svg
                                    className="h-12 w-12 text-gray-400"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                    aria-hidden="true"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                                    />
                                </svg>
                            </div>
                            <p className="text-lg text-gray-600">
                                Your cart is empty
                            </p>
                            <p className="mt-2 text-sm text-gray-400">
                                Add some products to get started!
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {items.map((item) => (
                                <div
                                    key={item.product.id}
                                    className="flex gap-4 rounded-lg border border-gray-200 bg-gray-50 p-4"
                                >
                                    {/* Product Image */}
                                    <img
                                        src={item.product.image}
                                        alt={item.product.name}
                                        className="h-20 w-20 flex-shrink-0 rounded-lg object-cover"
                                    />

                                    {/* Product Info */}
                                    <div className="min-w-0 flex-1">
                                        <h3 className="truncate font-semibold text-gray-900">
                                            {item.product.name}
                                        </h3>
                                        <p className="mt-1 font-bold text-[#771E49]">
                                            €{item.product.price.toFixed(2)}
                                        </p>

                                        {/* Quantity Controls */}
                                        <div className="mt-2 flex items-center gap-2">
                                            <button
                                                onClick={() =>
                                                    updateQuantity(
                                                        item.product.id,
                                                        item.quantity - 1,
                                                    )
                                                }
                                                className="rounded p-1 transition-colors hover:bg-white focus:ring-2 focus:ring-[#771E49] focus:outline-none"
                                                aria-label={`Decrease quantity of ${item.product.name}`}
                                            >
                                                <Minus size={16} />
                                            </button>
                                            <span
                                                className="w-8 text-center font-medium"
                                                aria-live="polite"
                                            >
                                                {item.quantity}
                                            </span>
                                            <button
                                                onClick={() =>
                                                    updateQuantity(
                                                        item.product.id,
                                                        item.quantity + 1,
                                                    )
                                                }
                                                disabled={
                                                    item.product.stock ===
                                                    'out of stock'
                                                }
                                                className="rounded p-1 transition-colors hover:bg-white focus:ring-2 focus:ring-[#771E49] focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                                                aria-label={`Increase quantity of ${item.product.name}`}
                                            >
                                                <Plus size={16} />
                                            </button>
                                            <button
                                                onClick={() =>
                                                    removeItem(item.product.id)
                                                }
                                                className="ml-auto rounded p-1 text-red-600 transition-colors hover:bg-red-50 focus:ring-2 focus:ring-red-600 focus:outline-none"
                                                aria-label={`Remove ${item.product.name} from cart`}
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                {items.length > 0 && (
                    <div className="space-y-4 border-t border-gray-200 px-6 py-4">
                        {/* Total */}
                        <div className="flex items-center justify-between text-lg font-bold">
                            <span className="text-gray-900">Total:</span>
                            <span className="text-[#771E49]">
                                €{totalPrice.toFixed(2)}
                            </span>
                        </div>

                        {/* Actions */}
                        <div className="space-y-2">
                            <button
                                className="w-full rounded-lg bg-[#771E49] py-3 font-semibold text-white transition-colors hover:bg-[#5a1738] focus:ring-2 focus:ring-[#771E49] focus:ring-offset-2 focus:outline-none"
                                aria-label="Proceed to checkout"
                            >
                                Checkout
                            </button>
                            <button
                                onClick={clearCart}
                                className="w-full rounded-lg py-2 font-medium text-gray-600 transition-colors hover:text-gray-900 focus:ring-2 focus:ring-gray-400 focus:outline-none"
                                aria-label="Clear all items from cart"
                            >
                                Clear Cart
                            </button>
                        </div>
                    </div>
                )}
            </aside>
        </>
    );
});

CartDrawer.displayName = 'CartDrawer';
