import { Search, ShoppingCart, SlidersHorizontal } from 'lucide-react';
import { memo } from 'react';
import { useCartStore } from '../store/cartStore';

interface HeaderProps {
    searchValue: string;
    onSearchChange: (value: string) => void;
    onToggleFilters?: () => void;
}

/**
 * Compact header with logo, search input, filter toggle (mobile), and cart badge
 * Memoized to prevent unnecessary re-renders
 */
export const Header = memo(
    ({ searchValue, onSearchChange, onToggleFilters }: HeaderProps) => {
        const { totalItems, openCart } = useCartStore();

        return (
            <header className="sticky top-0 z-50 border-b border-gray-100 bg-white shadow-sm">
                <div className="mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 items-center justify-between gap-2 sm:gap-4">
                        {/* Filter Toggle (Mobile Only) */}
                        <button
                            onClick={onToggleFilters}
                            className="relative rounded-lg p-2 transition-colors hover:bg-gray-50 focus:ring-2 focus:ring-[#771E49] focus:outline-none lg:hidden"
                            aria-label="Toggle filters"
                        >
                            <SlidersHorizontal
                                size={24}
                                className="text-[#771E49]"
                            />
                        </button>

                        {/* Logo */}
                        <div className="flex-shrink-0">
                            <h1 className="text-xl font-bold text-[#771E49] sm:text-2xl">
                                AndShoes
                            </h1>
                        </div>

                        {/* Search Bar */}
                        <div className="max-w-2xl flex-1">
                            <div className="relative">
                                <Search
                                    className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400"
                                    size={20}
                                    aria-hidden="true"
                                />
                                <input
                                    type="search"
                                    value={searchValue}
                                    onChange={(e) =>
                                        onSearchChange(e.target.value)
                                    }
                                    placeholder="Search products..."
                                    className="w-full rounded-lg border border-gray-200 py-2 pr-4 pl-10 transition-shadow focus:border-transparent focus:ring-2 focus:ring-[#771E49] focus:outline-none"
                                    aria-label="Search products"
                                />
                            </div>
                        </div>

                        {/* Cart Button */}
                        <button
                            onClick={openCart}
                            className="relative rounded-lg p-2 transition-colors hover:bg-gray-50 focus:ring-2 focus:ring-[#771E49] focus:outline-none"
                            aria-label={`Shopping cart with ${totalItems} items`}
                        >
                            <ShoppingCart size={24} className="text-gray-700" />
                            {totalItems > 0 && (
                                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#771E49] text-xs font-bold text-white">
                                    {totalItems > 99 ? '99+' : totalItems}
                                </span>
                            )}
                        </button>
                    </div>
                </div>
            </header>
        );
    },
);

Header.displayName = 'Header';
