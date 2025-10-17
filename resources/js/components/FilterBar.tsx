import { ChevronDown, X } from 'lucide-react';
import { memo, useMemo } from 'react';
import type { Category, Filters } from '../types/store';

interface FilterBarProps {
    filters: Filters;
    categories: Category[];
    onFilterChange: (updates: Partial<Filters>) => void;
    onClearFilters: () => void;
    hasActiveFilters: boolean;
}

const SORT_OPTIONS = [
    { value: 'newest', label: 'Newest' },
    { value: 'price-asc', label: 'Price: Low to High' },
    { value: 'price-desc', label: 'Price: High to Low' },
    { value: 'rating', label: 'Highest Rated' },
] as const;

/**
 * Filter toolbar with category multi-select, price range, sorting, and active filter chips
 * Optimized with memoization and stable callbacks
 */
export const FilterBar = memo(
    ({
        filters,
        categories,
        onFilterChange,
        onClearFilters,
        hasActiveFilters,
    }: FilterBarProps) => {
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
            <div className="sticky top-16 z-40 border-b border-gray-100 bg-white">
                <div className="mx-auto max-w-[1600px] px-4 py-4 sm:px-6 lg:px-8">
                    {/* Filter Controls */}
                    <div className="flex flex-wrap items-center gap-4">
                        {/* Category Multi-Select */}
                        <div className="group relative">
                            <button
                                className="flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2 transition-colors hover:border-[#771E49] focus:ring-2 focus:ring-[#771E49] focus:outline-none"
                                aria-label="Filter by category"
                            >
                                <span className="text-sm font-medium text-gray-700">
                                    Categories{' '}
                                    {filters.categories.length > 0 &&
                                        `(${filters.categories.length})`}
                                </span>
                                <ChevronDown
                                    size={16}
                                    className="text-gray-500"
                                />
                            </button>

                            {/* Dropdown */}
                            <div className="absolute top-full left-0 mt-2 hidden max-h-64 w-64 overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg group-hover:block">
                                {categories.map((category) => (
                                    <label
                                        key={category.id}
                                        className="flex cursor-pointer items-center gap-3 px-4 py-3 transition-colors hover:bg-gray-50"
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
                                            className="h-4 w-4 rounded border-gray-300 text-[#771E49] focus:ring-[#771E49]"
                                        />
                                        <span className="text-sm text-gray-700">
                                            {category.name}
                                        </span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Price Range */}
                        <div className="flex items-center gap-2">
                            <label htmlFor="priceMin" className="sr-only">
                                Minimum price
                            </label>
                            <input
                                id="priceMin"
                                type="number"
                                min="0"
                                max={filters.priceMax}
                                value={filters.priceMin}
                                onChange={(e) =>
                                    onFilterChange({
                                        priceMin: Number(e.target.value),
                                    })
                                }
                                placeholder="Min"
                                className="w-24 rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-transparent focus:ring-2 focus:ring-[#771E49] focus:outline-none"
                            />
                            <span className="text-gray-400">—</span>
                            <label htmlFor="priceMax" className="sr-only">
                                Maximum price
                            </label>
                            <input
                                id="priceMax"
                                type="number"
                                min={filters.priceMin}
                                max="10000"
                                value={filters.priceMax}
                                onChange={(e) =>
                                    onFilterChange({
                                        priceMax: Number(e.target.value),
                                    })
                                }
                                placeholder="Max"
                                className="w-24 rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-transparent focus:ring-2 focus:ring-[#771E49] focus:outline-none"
                            />
                        </div>

                        {/* Sort Select */}
                        <label htmlFor="sortBy" className="sr-only">
                            Sort products
                        </label>
                        <select
                            id="sortBy"
                            value={filters.sortBy}
                            onChange={(e) =>
                                onFilterChange({
                                    sortBy: e.target.value as Filters['sortBy'],
                                })
                            }
                            className="cursor-pointer rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:border-[#771E49] focus:ring-2 focus:ring-[#771E49] focus:outline-none"
                        >
                            {SORT_OPTIONS.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>

                        {/* Clear Filters */}
                        {hasActiveFilters && (
                            <button
                                onClick={onClearFilters}
                                className="ml-auto rounded-lg px-4 py-2 text-sm font-medium text-[#771E49] transition-colors hover:bg-[#771E49] hover:text-white focus:ring-2 focus:ring-[#771E49] focus:outline-none"
                            >
                                Clear all
                            </button>
                        )}
                    </div>

                    {/* Active Filter Chips */}
                    {(selectedCategories.length > 0 || filters.search) && (
                        <div
                            className="mt-3 flex flex-wrap gap-2"
                            role="list"
                            aria-label="Active filters"
                        >
                            {filters.search && (
                                <div
                                    className="inline-flex items-center gap-2 rounded-full bg-[#771E49] px-3 py-1 text-sm text-white"
                                    role="listitem"
                                >
                                    <span>Search: {filters.search}</span>
                                    <button
                                        onClick={() =>
                                            onFilterChange({ search: '' })
                                        }
                                        className="rounded-full p-0.5 hover:bg-white/20 focus:ring-2 focus:ring-white focus:outline-none"
                                        aria-label={`Remove search filter: ${filters.search}`}
                                    >
                                        <X size={14} />
                                    </button>
                                </div>
                            )}

                            {selectedCategories.map((category) => (
                                <div
                                    key={category.id}
                                    className="inline-flex items-center gap-2 rounded-full bg-[#771E49] px-3 py-1 text-sm text-white"
                                    role="listitem"
                                >
                                    <span>{category.name}</span>
                                    <button
                                        onClick={() =>
                                            handleRemoveCategory(category.id)
                                        }
                                        className="rounded-full p-0.5 hover:bg-white/20 focus:ring-2 focus:ring-white focus:outline-none"
                                        aria-label={`Remove category filter: ${category.name}`}
                                    >
                                        <X size={14} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        );
    },
);

FilterBar.displayName = 'FilterBar';
