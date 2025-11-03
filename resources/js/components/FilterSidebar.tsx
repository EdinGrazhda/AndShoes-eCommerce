import {
    ChevronDown,
    ChevronUp,
    SlidersHorizontal,
    Sparkles,
    X,
} from 'lucide-react';
import { memo, useMemo, useState } from 'react';
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
 * Provides comprehensive filtering options in a dedicated panel with modern, aesthetic design
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
        const [expandedSections, setExpandedSections] = useState({
            sort: true,
            price: true,
            gender: true,
            categories: true,
        });

        const toggleSection = (section: keyof typeof expandedSections) => {
            setExpandedSections((prev) => ({
                ...prev,
                [section]: !prev[section],
            }));
        };

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
                    className={`fixed top-16 left-0 z-40 h-[calc(100vh-4rem)] w-80 overflow-y-auto bg-gradient-to-b from-[#761f49] to-[#5a1737] shadow-2xl transition-transform duration-300 ease-in-out lg:sticky ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'} `}
                    aria-label="Product filters"
                >
                    {/* Mobile Header */}
                    <div className="sticky top-0 z-10 flex items-center justify-between border-b border-white/10 bg-[#761f49]/95 px-6 py-4 backdrop-blur-sm lg:hidden">
                        <h2 className="flex items-center gap-2 text-lg font-bold text-white">
                            <SlidersHorizontal
                                size={20}
                                className="text-white"
                            />
                            Filters
                        </h2>
                        <button
                            onClick={onClose}
                            className="rounded-lg p-2 text-white transition-all hover:rotate-90 hover:bg-white/20 focus:ring-2 focus:ring-white/50 focus:outline-none"
                            aria-label="Close filters"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Desktop Header */}
                    <div className="sticky top-0 z-10 hidden border-b border-white/10 bg-[#761f49]/95 px-6 py-5 backdrop-blur-sm lg:block">
                        <div className="flex items-center gap-2">
                            <Sparkles
                                size={20}
                                className="animate-pulse text-yellow-300"
                            />
                            <h2 className="text-lg font-bold text-white">
                                Filter Products
                            </h2>
                        </div>
                        <p className="mt-1 text-xs text-white/70">
                            Find your perfect shoes
                        </p>
                    </div>

                    <div className="space-y-2 p-6">
                        {/* Sort By */}
                        <div className="rounded-xl bg-white/5 p-4 backdrop-blur-sm transition-all hover:bg-white/10">
                            <button
                                onClick={() => toggleSection('sort')}
                                className="flex w-full items-center justify-between text-sm font-semibold text-white"
                            >
                                <span>Sort By</span>
                                {expandedSections.sort ? (
                                    <ChevronUp size={16} />
                                ) : (
                                    <ChevronDown size={16} />
                                )}
                            </button>
                            {expandedSections.sort && (
                                <div className="mt-3">
                                    <select
                                        id="sortBy"
                                        value={filters.sortBy}
                                        onChange={(e) =>
                                            onFilterChange({
                                                sortBy: e.target
                                                    .value as Filters['sortBy'],
                                            })
                                        }
                                        className="w-full cursor-pointer rounded-lg border-0 bg-white/90 px-4 py-2.5 text-sm font-medium text-gray-800 shadow-sm transition-all hover:bg-white hover:shadow-md focus:ring-2 focus:ring-white/50 focus:outline-none"
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
                            )}
                        </div>

                        {/* Price Range */}
                        <div className="rounded-xl bg-white/5 p-4 backdrop-blur-sm transition-all hover:bg-white/10">
                            <button
                                onClick={() => toggleSection('price')}
                                className="flex w-full items-center justify-between text-sm font-semibold text-white"
                            >
                                <span>Price Range</span>
                                {expandedSections.price ? (
                                    <ChevronUp size={16} />
                                ) : (
                                    <ChevronDown size={16} />
                                )}
                            </button>
                            {expandedSections.price && (
                                <div className="mt-3">
                                    {/* Quick Select Buttons */}
                                    <div className="flex flex-wrap gap-2">
                                        <button
                                            onClick={() =>
                                                onFilterChange({
                                                    priceMin: 0,
                                                    priceMax: 50,
                                                })
                                            }
                                            className={`rounded-lg px-3 py-2 text-xs font-medium transition-all ${
                                                filters.priceMin === 0 &&
                                                filters.priceMax === 50
                                                    ? 'bg-white text-[#761f49] shadow-md'
                                                    : 'bg-white/10 text-white hover:bg-white/20'
                                            }`}
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
                                            className={`rounded-lg px-3 py-2 text-xs font-medium transition-all ${
                                                filters.priceMin === 50 &&
                                                filters.priceMax === 100
                                                    ? 'bg-white text-[#761f49] shadow-md'
                                                    : 'bg-white/10 text-white hover:bg-white/20'
                                            }`}
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
                                            className={`rounded-lg px-3 py-2 text-xs font-medium transition-all ${
                                                filters.priceMin === 100 &&
                                                filters.priceMax === 200
                                                    ? 'bg-white text-[#761f49] shadow-md'
                                                    : 'bg-white/10 text-white hover:bg-white/20'
                                            }`}
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
                                            className={`rounded-lg px-3 py-2 text-xs font-medium transition-all ${
                                                filters.priceMin === 200 &&
                                                filters.priceMax === 10000
                                                    ? 'bg-white text-[#761f49] shadow-md'
                                                    : 'bg-white/10 text-white hover:bg-white/20'
                                            }`}
                                        >
                                            €200+
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Gender Filter */}
                        <div className="rounded-xl bg-white/5 p-4 backdrop-blur-sm transition-all hover:bg-white/10">
                            <button
                                onClick={() => toggleSection('gender')}
                                className="flex w-full items-center justify-between text-sm font-semibold text-white"
                            >
                                <span>
                                    Gender
                                    {filters.gender &&
                                        filters.gender.length > 0 && (
                                            <span className="ml-2 inline-flex h-5 w-5 items-center justify-center rounded-full bg-white/20 text-xs">
                                                {filters.gender.length}
                                            </span>
                                        )}
                                </span>
                                {expandedSections.gender ? (
                                    <ChevronUp size={16} />
                                ) : (
                                    <ChevronDown size={16} />
                                )}
                            </button>
                            {expandedSections.gender && (
                                <div className="mt-3 space-y-1">
                                    {[
                                        { value: 'male', label: 'Male' },
                                        { value: 'female', label: 'Female' },
                                        { value: 'unisex', label: 'Unisex' },
                                    ].map((genderOption) => (
                                        <label
                                            key={genderOption.value}
                                            className="group flex cursor-pointer items-center gap-3 rounded-lg p-2.5 transition-all hover:bg-white/10"
                                        >
                                            <input
                                                type="checkbox"
                                                checked={
                                                    filters.gender?.includes(
                                                        genderOption.value,
                                                    ) || false
                                                }
                                                onChange={() => {
                                                    const currentGenders =
                                                        filters.gender || [];
                                                    const newGenders =
                                                        currentGenders.includes(
                                                            genderOption.value,
                                                        )
                                                            ? currentGenders.filter(
                                                                  (g) =>
                                                                      g !==
                                                                      genderOption.value,
                                                              )
                                                            : [
                                                                  ...currentGenders,
                                                                  genderOption.value,
                                                              ];
                                                    onFilterChange({
                                                        gender: newGenders,
                                                    });
                                                }}
                                                className="h-4 w-4 cursor-pointer rounded border-white/30 bg-white/10 text-[#761f49] shadow-sm focus:ring-2 focus:ring-white/50 focus:ring-offset-0"
                                            />
                                            <span className="text-sm text-white/90 group-hover:text-white">
                                                {genderOption.label}
                                            </span>
                                        </label>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Categories */}
                        <div className="rounded-xl bg-white/5 p-4 backdrop-blur-sm transition-all hover:bg-white/10">
                            <button
                                onClick={() => toggleSection('categories')}
                                className="flex w-full items-center justify-between text-sm font-semibold text-white"
                            >
                                <span>
                                    Categories
                                    {filters.categories.length > 0 && (
                                        <span className="ml-2 inline-flex h-5 w-5 items-center justify-center rounded-full bg-white/20 text-xs">
                                            {filters.categories.length}
                                        </span>
                                    )}
                                </span>
                                {expandedSections.categories ? (
                                    <ChevronUp size={16} />
                                ) : (
                                    <ChevronDown size={16} />
                                )}
                            </button>
                            {expandedSections.categories && (
                                <div className="custom-scrollbar mt-3 max-h-64 space-y-1 overflow-y-auto pr-2">
                                    {categories.map((category) => (
                                        <label
                                            key={category.id}
                                            className="group flex cursor-pointer items-center gap-3 rounded-lg p-2.5 transition-all hover:bg-white/10"
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
                                                className="h-4 w-4 cursor-pointer rounded border-white/30 bg-white/10 text-[#761f49] shadow-sm focus:ring-2 focus:ring-white/50"
                                            />
                                            <span className="flex-1 text-sm text-white/90 group-hover:text-white">
                                                {category.name}
                                            </span>
                                        </label>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Active Filter Chips */}
                        {selectedCategories.length > 0 && (
                            <div className="rounded-xl bg-white/5 p-4 backdrop-blur-sm">
                                <label className="mb-3 block text-sm font-semibold text-white">
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
                                            className="inline-flex items-center gap-2 rounded-lg bg-white px-3 py-1.5 text-sm font-medium text-[#761f49] shadow-sm transition-all hover:bg-white/90 hover:shadow-md focus:ring-2 focus:ring-white/50 focus:outline-none"
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
                                className="w-full rounded-xl bg-white/10 py-3.5 text-sm font-semibold text-white shadow-lg transition-all duration-200 hover:scale-[1.02] hover:bg-white/20 hover:shadow-xl focus:ring-2 focus:ring-white/50 focus:outline-none"
                            >
                                Clear All Filters
                            </button>
                        )}
                    </div>

                    {/* Custom scrollbar styles */}
                    <style>{`
                        .custom-scrollbar::-webkit-scrollbar {
                            width: 6px;
                        }
                        .custom-scrollbar::-webkit-scrollbar-track {
                            background: rgba(255, 255, 255, 0.05);
                            border-radius: 3px;
                        }
                        .custom-scrollbar::-webkit-scrollbar-thumb {
                            background: rgba(255, 255, 255, 0.3);
                            border-radius: 3px;
                        }
                        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                            background: rgba(255, 255, 255, 0.5);
                        }
                    `}</style>
                </aside>
            </>
        );
    },
);

FilterSidebar.displayName = 'FilterSidebar';
