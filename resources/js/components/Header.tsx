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
                <div className="mx-auto px-6 sm:px-8 lg:px-16 xl:px-24">
                    <div className="flex h-16 items-center justify-between gap-6 sm:gap-8 lg:gap-12">
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
                        <div className="flex-shrink-0 pl-4 lg:pl-8">
                            <img
                                src="/images/andshoeslogo1.png"
                                alt="AndShoes"
                                className="h-10 w-auto sm:h-12"
                            />
                        </div>

                        {/* Search Bar */}
                        <div className="max-w-2xl flex-1 lg:mx-12">
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
                                    className="w-full rounded-lg border-2 py-2 pr-4 pl-10 transition-all focus:border-[#771f48] focus:ring-2 focus:ring-[#771f48]/20 focus:outline-none"
                                    style={{ borderColor: '#771f48' }}
                                    aria-label="Search products"
                                />
                            </div>
                        </div>

                        {/* Cart Button */}
                        <div className="pr-4 lg:pr-8">
                            <button
                                onClick={openCart}
                                className="relative rounded-lg p-2 transition-colors hover:bg-gray-50 focus:ring-2 focus:ring-[#771E49] focus:outline-none"
                                aria-label={`Shopping cart with ${totalItems} items`}
                            >
                                <ShoppingCart
                                    size={24}
                                    className="text-gray-700"
                                />
                                {totalItems > 0 && (
                                    <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#771E49] text-xs font-bold text-white">
                                        {totalItems > 99 ? '99+' : totalItems}
                                    </span>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </header>
        );
    },
);

Header.displayName = 'Header';
