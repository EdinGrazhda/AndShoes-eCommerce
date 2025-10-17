import { SlidersHorizontal, X } from 'lucide-react';
import { memo, useMemo } from 'react';
import type { Category, Filters } from '../types/store';

interface FilterSidebarProps {
    filters: Filters;
    categories: Category[];
    onFilterChange: (updates: Partial<Filters>) => void;
    onClearFilters: () => void;
    hasActiveFilters: boolean;
    isOpen: boolean;
    onClose: () => void;
}

const SORT_OPTIONS = [
    { value: 'newest', label: 'Newest' },
    { value: 'price-asc', label: 'Price: Low to High' },
    { value: 'price-desc', label: 'Price: High to Low' },
    { value: 'rating', label: 'Highest Rated' },
] as const;

/**
 * Filter sidebar - sticky on desktop, drawer on mobile
 * Provides comprehensive filtering options in a dedicated panel
 */
export const FilterSidebar = memo(
    ({
        filters,
        categories,
        onFilterChange,
        onClearFilters,
        hasActiveFilters,
        isOpen,
        onClose,
    }: FilterSidebarProps) => {
        const selectedCategories = useMemo(() => {
            return categories.filter((cat) =>
                filters.categories.includes(cat.id),
            );
        }, [categories, filters.categories]);

        const handleCategoryToggle = (categoryId: number) => {
            const newCategories = filters.categories.includes(categoryId)
                ? filters.categories.filter((id) => id !== categoryId)
                : [...filters.categories, categoryId];
            onFilterChange({ categories: newCategories });
        };

        const handleRemoveCategory = (categoryId: number) => {
            onFilterChange({
                categories: filters.categories.filter(
                    (id) => id !== categoryId,
                ),
            });
        };

        return (
            <>
                {/* Mobile Backdrop */}
                {isOpen && (
                    <div
                        className="fixed inset-0 z-40 bg-black/50 transition-opacity lg:hidden"
                        onClick={onClose}
                        aria-hidden="true"
                    />
                )}

                {/* Sidebar */}
                <aside
                    className={`fixed top-16 left-0 z-40 h-[calc(100vh-4rem)] w-80 overflow-y-auto border-r border-gray-200 bg-white transition-transform duration-300 ease-in-out lg:sticky ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'} `}
                    aria-label="Product filters"
                >
                    {/* Mobile Header */}
                    <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4 lg:hidden">
                        <h2 className="flex items-center gap-2 text-lg font-bold text-gray-900">
                            <SlidersHorizontal
                                size={20}
                                className="text-[#771E49]"
                            />
                            Filters
                        </h2>
                        <button
                            onClick={onClose}
                            className="rounded-lg p-2 transition-colors hover:bg-gray-100 focus:ring-2 focus:ring-[#771E49] focus:outline-none"
                            aria-label="Close filters"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Desktop Header */}
                    <div className="sticky top-0 z-10 hidden border-b border-gray-200 bg-white px-6 py-4 lg:block">
                        <h2 className="flex items-center gap-2 text-lg font-bold text-gray-900">
                            <SlidersHorizontal
                                size={20}
                                className="text-[#771E49]"
                            />
                            Filters
                        </h2>
                    </div>

                    <div className="space-y-8 p-6">
                        {/* Sort By */}
                        <div>
                            <label
                                htmlFor="sortBy"
                                className="mb-3 block text-sm font-semibold text-gray-900"
                            >
                                Sort By
                            </label>
                            <select
                                id="sortBy"
                                value={filters.sortBy}
                                onChange={(e) =>
                                    onFilterChange({
                                        sortBy: e.target
                                            .value as Filters['sortBy'],
                                    })
                                }
                                className="w-full cursor-pointer rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:border-[#771E49] focus:ring-2 focus:ring-[#771E49] focus:outline-none"
                            >
                                {SORT_OPTIONS.map((option) => (
                                    <option
                                        key={option.value}
                                        value={option.value}
                                    >
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Price Range */}
                        <div>
                            <label className="mb-3 block text-sm font-semibold text-gray-900">
                                Price Range
                            </label>
                            <div className="space-y-4">
                                {/* Price Display */}
                                <div className="flex items-center justify-between text-sm font-medium text-gray-700">
                                    <span>€{filters.priceMin.toFixed(2)}</span>
                                    <span className="text-gray-400">—</span>
                                    <span>€{filters.priceMax.toFixed(2)}</span>
                                </div>

                                {/* Dual Range Slider */}
                                <div className="relative pt-2 pb-4">
                                    {/* Track Background */}
                                    <div className="absolute top-1/2 right-0 left-0 h-1 -translate-y-1/2 rounded-full bg-gray-200" />

                                    {/* Active Track */}
                                    <div
                                        className="absolute top-1/2 h-1 -translate-y-1/2 rounded-full bg-[#771E49]"
                                        style={{
                                            left: `${(filters.priceMin / 10000) * 100}%`,
                                            right: `${100 - (filters.priceMax / 10000) * 100}%`,
                                        }}
                                    />

                                    {/* Min Range Input */}
                                    <input
                                        id="priceMin"
                                        type="range"
                                        min="0"
                                        max="10000"
                                        step="10"
                                        value={filters.priceMin}
                                        onChange={(e) => {
                                            const value = Number(
                                                e.target.value,
                                            );
                                            if (value < filters.priceMax) {
                                                onFilterChange({
                                                    priceMin: value,
                                                });
                                            }
                                        }}
                                        className="pointer-events-none absolute h-1 w-full appearance-none bg-transparent [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-[#771E49] [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:shadow-md [&::-moz-range-thumb]:transition-transform [&::-moz-range-thumb]:hover:scale-110 [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-[#771E49] [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:hover:scale-110"
                                        style={{
                                            zIndex:
                                                filters.priceMin > 10000 - 100
                                                    ? 5
                                                    : 3,
                                        }}
                                        aria-label="Minimum price"
                                    />

                                    {/* Max Range Input */}
                                    <input
                                        id="priceMax"
                                        type="range"
                                        min="0"
                                        max="10000"
                                        step="10"
                                        value={filters.priceMax}
                                        onChange={(e) => {
                                            const value = Number(
                                                e.target.value,
                                            );
                                            if (value > filters.priceMin) {
                                                onFilterChange({
                                                    priceMax: value,
                                                });
                                            }
                                        }}
                                        className="pointer-events-none absolute h-1 w-full appearance-none bg-transparent [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-[#771E49] [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:shadow-md [&::-moz-range-thumb]:transition-transform [&::-moz-range-thumb]:hover:scale-110 [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-[#771E49] [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:hover:scale-110"
                                        style={{ zIndex: 4 }}
                                        aria-label="Maximum price"
                                    />
                                </div>

                                {/* Optional: Quick Select Buttons */}
                                <div className="flex flex-wrap gap-2">
                                    <button
                                        onClick={() =>
                                            onFilterChange({
                                                priceMin: 0,
                                                priceMax: 50,
                                            })
                                        }
                                        className="rounded-full bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-700 transition-colors hover:bg-[#771E49] hover:text-white"
                                    >
                                        Under €50
                                    </button>
                                    <button
                                        onClick={() =>
                                            onFilterChange({
                                                priceMin: 50,
                                                priceMax: 100,
                                            })
                                        }
                                        className="rounded-full bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-700 transition-colors hover:bg-[#771E49] hover:text-white"
                                    >
                                        €50 - €100
                                    </button>
                                    <button
                                        onClick={() =>
                                            onFilterChange({
                                                priceMin: 100,
                                                priceMax: 200,
                                            })
                                        }
                                        className="rounded-full bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-700 transition-colors hover:bg-[#771E49] hover:text-white"
                                    >
                                        €100 - €200
                                    </button>
                                    <button
                                        onClick={() =>
                                            onFilterChange({
                                                priceMin: 200,
                                                priceMax: 10000,
                                            })
                                        }
                                        className="rounded-full bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-700 transition-colors hover:bg-[#771E49] hover:text-white"
                                    >
                                        €200+
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Categories */}
                        <div>
                            <label className="mb-3 block text-sm font-semibold text-gray-900">
                                Categories
                                {filters.categories.length > 0 && (
                                    <span className="ml-2 text-[#771E49]">
                                        ({filters.categories.length})
                                    </span>
                                )}
                            </label>
                            <div className="max-h-64 space-y-2 overflow-y-auto">
                                {categories.map((category) => (
                                    <label
                                        key={category.id}
                                        className="group flex cursor-pointer items-center gap-3 rounded-lg p-3 transition-colors hover:bg-gray-50"
                                    >
                                        <input
                                            type="checkbox"
                                            checked={filters.categories.includes(
                                                category.id,
                                            )}
                                            onChange={() =>
                                                handleCategoryToggle(
                                                    category.id,
                                                )
                                            }
                                            className="h-4 w-4 cursor-pointer rounded border-gray-300 text-[#771E49] focus:ring-[#771E49]"
                                        />
                                        <span className="flex-1 text-sm text-gray-700 group-hover:text-gray-900">
                                            {category.name}
                                        </span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Active Filter Chips */}
                        {selectedCategories.length > 0 && (
                            <div>
                                <label className="mb-3 block text-sm font-semibold text-gray-900">
                                    Active Filters
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {selectedCategories.map((category) => (
                                        <button
                                            key={category.id}
                                            onClick={() =>
                                                handleRemoveCategory(
                                                    category.id,
                                                )
                                            }
                                            className="inline-flex items-center gap-2 rounded-full bg-[#771E49] px-3 py-1.5 text-sm text-white transition-colors hover:bg-[#5a1738] focus:ring-2 focus:ring-[#771E49] focus:ring-offset-2 focus:outline-none"
                                            aria-label={`Remove category filter: ${category.name}`}
                                        >
                                            <span>{category.name}</span>
                                            <X size={14} />
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Clear All Button */}
                        {hasActiveFilters && (
                            <button
                                onClick={onClearFilters}
                                className="w-full rounded-lg border-2 border-[#771E49] py-3 text-sm font-semibold text-[#771E49] transition-all duration-200 hover:bg-[#771E49] hover:text-white focus:ring-2 focus:ring-[#771E49] focus:ring-offset-2 focus:outline-none"
                            >
                                Clear All Filters
                            </button>
                        )}
                    </div>
                </aside>
            </>
        );
    },
);

FilterSidebar.displayName = 'FilterSidebar';
