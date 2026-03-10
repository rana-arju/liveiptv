'use client';

import { useState, useCallback } from 'react';

export type ViewMode = 'grid' | 'category';

interface NavigationState {
  viewMode: ViewMode;
  selectedCategory: string | null;
}

export function useNavigation() {
  const [state, setState] = useState<NavigationState>({
    viewMode: 'grid',
    selectedCategory: null,
  });

  const setViewMode = useCallback((mode: ViewMode) => {
    setState(prev => ({ ...prev, viewMode: mode }));
  }, []);

  const selectCategory = useCallback((categoryName: string) => {
    setState(prev => ({
      ...prev,
      viewMode: 'category',
      selectedCategory: categoryName,
    }));
  }, []);

  const goBack = useCallback(() => {
    setState(prev => ({
      ...prev,
      viewMode: 'grid',
      selectedCategory: null,
    }));
  }, []);

  return {
    viewMode: state.viewMode,
    selectedCategory: state.selectedCategory,
    selectCategory,
    goBack,
    setViewMode,
  };
}
