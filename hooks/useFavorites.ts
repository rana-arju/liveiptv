import { useCallback, useEffect, useState } from 'react';

const FAVORITES_KEY = 'iptv_favorites';
const RECENT_CHANNELS_KEY = 'iptv_recent_channels';
const MAX_RECENT = 10;

export function useFavorites() {
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [recentChannels, setRecentChannels] = useState<string[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const savedFavorites = localStorage.getItem(FAVORITES_KEY);
    const savedRecent = localStorage.getItem(RECENT_CHANNELS_KEY);

    if (savedFavorites) {
      setFavorites(new Set(JSON.parse(savedFavorites)));
    }
    if (savedRecent) {
      setRecentChannels(JSON.parse(savedRecent));
    }
    setIsLoaded(true);
  }, []);

  // Save favorites to localStorage whenever they change
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(Array.from(favorites)));
    }
  }, [favorites, isLoaded]);

  // Save recent channels to localStorage whenever they change
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(RECENT_CHANNELS_KEY, JSON.stringify(recentChannels));
    }
  }, [recentChannels, isLoaded]);

  const toggleFavorite = useCallback((channelId: string) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(channelId)) {
        newFavorites.delete(channelId);
      } else {
        newFavorites.add(channelId);
      }
      return newFavorites;
    });
  }, []);

  const isFavorite = useCallback((channelId: string) => {
    return favorites.has(channelId);
  }, [favorites]);

  const addToRecent = useCallback((channelId: string) => {
    setRecentChannels(prev => {
      const filtered = prev.filter(id => id !== channelId);
      return [channelId, ...filtered].slice(0, MAX_RECENT);
    });
  }, []);

  const clearRecent = useCallback(() => {
    setRecentChannels([]);
  }, []);

  return {
    favorites,
    recentChannels,
    toggleFavorite,
    isFavorite,
    addToRecent,
    clearRecent,
  };
}
