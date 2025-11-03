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
                <div className="mx-auto px-3 sm:px-6 lg:px-16 xl:px-24">
                    <div className="flex h-14 items-center justify-between gap-2 sm:h-16 sm:gap-6 lg:gap-12">
                        {/* Filter Toggle (Mobile Only) */}
                        <button
                            onClick={onToggleFilters}
                            className="relative flex-shrink-0 rounded-lg p-1.5 transition-colors hover:bg-gray-50 focus:ring-2 focus:ring-[#771E49] focus:outline-none sm:p-2 lg:hidden"
                            aria-label="Toggle filters"
                        >
                            <SlidersHorizontal
                                size={20}
                                className="text-[#771E49] sm:h-6 sm:w-6"
                            />
                        </button>

                        {/* Logo */}
                        <div className="flex-shrink-0">
                            <img
                                src="/images/andshoeslogo1.png"
                                alt="AndShoes"
                                className="h-8 w-auto sm:h-10 lg:h-12"
                            />
                        </div>

                        {/* Search Bar */}
                        <div className="max-w-2xl flex-1 lg:mx-12">
                            <div className="relative">
                                <Search
                                    className="absolute top-1/2 left-2 -translate-y-1/2 text-gray-400 sm:left-3"
                                    size={18}
                                    aria-hidden="true"
                                />
                                <input
                                    type="search"
                                    value={searchValue}
                                    onChange={(e) =>
                                        onSearchChange(e.target.value)
                                    }
                                    placeholder="Search..."
                                    className="w-full rounded-lg border-2 py-1.5 pr-2 pl-8 text-sm transition-all focus:border-[#771f48] focus:ring-2 focus:ring-[#771f48]/20 focus:outline-none sm:py-2 sm:pr-4 sm:pl-10 sm:text-base"
                                    style={{ borderColor: '#771f48' }}
                                    aria-label="Search products"
                                />
                            </div>
                        </div>

                        {/* Cart Button */}
                        <div className="flex-shrink-0">
                            <button
                                onClick={openCart}
                                className="relative rounded-lg p-1.5 transition-colors hover:bg-gray-50 focus:ring-2 focus:ring-[#771E49] focus:outline-none sm:p-2"
                                aria-label={`Shopping cart with ${totalItems} items`}
                            >
                                <ShoppingCart
                                    size={20}
                                    className="text-gray-700 sm:h-6 sm:w-6"
                                />
                                {totalItems > 0 && (
                                    <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#771E49] text-[10px] font-bold text-white sm:-top-1 sm:-right-1 sm:h-5 sm:w-5 sm:text-xs">
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
