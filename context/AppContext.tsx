'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Channel } from '@/lib/types';
import { useChannels as useChannelsHook } from '@/hooks/useChannels';
import { usePlayback as usePlaybackHook } from '@/hooks/usePlayback';
import { useFavorites as useFavoritesHook } from '@/hooks/useFavorites';
import { useTheme as useThemeHook, Theme } from '@/hooks/useTheme';

interface AppContextType {
  channels: Channel[];
  loading: boolean;
  error: string | null;
  playback: ReturnType<typeof usePlaybackHook>;
  favorites: ReturnType<typeof useFavoritesHook>;
  theme: Theme;
  toggleTheme: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  isSidebarOpen: boolean;
  setIsSidebarOpen: (open: boolean) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const { channels, loading, error } = useChannelsHook();
  const playback = usePlaybackHook();
  const favorites = useFavoritesHook();
  const { theme, toggleTheme } = useThemeHook();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  return (
    <AppContext.Provider
      value={{
        channels,
        loading,
        error,
        playback,
        favorites,
        theme,
        toggleTheme,
        searchQuery,
        setSearchQuery,
        isSidebarOpen,
        setIsSidebarOpen,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
