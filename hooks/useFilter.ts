import { useCallback, useState } from 'react';
import { FilterState } from '@/lib/types';

const DEFAULT_FILTER: FilterState = {
  searchQuery: '',
  selectedCategory: null,
  sortBy: 'name',
};

export function useFilter() {
  const [filter, setFilter] = useState<FilterState>(DEFAULT_FILTER);

  const setSearchQuery = useCallback((query: string) => {
    setFilter(prev => ({
      ...prev,
      searchQuery: query,
    }));
  }, []);

  const setSelectedCategory = useCallback((category: string | null) => {
    setFilter(prev => ({
      ...prev,
      selectedCategory: category,
    }));
  }, []);

  const setSortBy = useCallback((sortBy: 'name' | 'recent' | 'favorites') => {
    setFilter(prev => ({
      ...prev,
      sortBy,
    }));
  }, []);

  const resetFilter = useCallback(() => {
    setFilter(DEFAULT_FILTER);
  }, []);

  return {
    ...filter,
    setSearchQuery,
    setSelectedCategory,
    setSortBy,
    resetFilter,
  };
}
