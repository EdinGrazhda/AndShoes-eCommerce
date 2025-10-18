import { useCallback, useEffect, useMemo, useState } from 'react';
import type { Filters } from '../types/store';

/**
 * Manages filter state in URL query parameters for shareable/bookmarkable views
 * Provides type-safe getters and setters for all filter options
 */
export function useURLFilters() {
    // Read initial filters from URL
    const [filters, setFilters] = useState<Filters>(() => {
        const params = new URLSearchParams(window.location.search);
        const search = params.get('search') || '';
        const categories =
            params.get('categories')?.split(',').filter(Boolean).map(Number) ||
            [];
        const priceMin = Number(params.get('priceMin')) || 0;
        const priceMax = Number(params.get('priceMax')) || 10000;
        const gender = params.get('gender')?.split(',').filter(Boolean) || [];
        const sortBy = (params.get('sortBy') || 'newest') as Filters['sortBy'];

        return {
            search,
            categories,
            priceMin,
            priceMax,
            gender,
            sortBy,
        };
    });

    // Sync filters to URL
    useEffect(() => {
        const newParams = new URLSearchParams();

        if (filters.search) {
            newParams.set('search', filters.search);
        }

        if (filters.categories.length > 0) {
            newParams.set('categories', filters.categories.join(','));
        }

        if (filters.priceMin > 0) {
            newParams.set('priceMin', String(filters.priceMin));
        }

        if (filters.priceMax < 10000) {
            newParams.set('priceMax', String(filters.priceMax));
        }

        if (filters.gender.length > 0) {
            newParams.set('gender', filters.gender.join(','));
        }

        if (filters.sortBy !== 'newest') {
            newParams.set('sortBy', filters.sortBy);
        }

        const newUrl = newParams.toString()
            ? `?${newParams.toString()}`
            : window.location.pathname;
        window.history.replaceState({}, '', newUrl);
    }, [filters]);

    const updateFilters = useCallback((updates: Partial<Filters>) => {
        setFilters((prev) => ({ ...prev, ...updates }));
    }, []);

    const clearFilters = useCallback(() => {
        setFilters({
            search: '',
            categories: [],
            priceMin: 0,
            priceMax: 10000,
            gender: [],
            sortBy: 'newest',
        });
    }, []);

    const hasActiveFilters = useMemo(() => {
        return (
            filters.search !== '' ||
            filters.categories.length > 0 ||
            filters.priceMin > 0 ||
            filters.priceMax < 10000 ||
            filters.gender.length > 0 ||
            filters.sortBy !== 'newest'
        );
    }, [filters]);

    return {
        filters,
        updateFilters,
        clearFilters,
        hasActiveFilters,
    };
}
