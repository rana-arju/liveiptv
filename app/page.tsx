'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { Channel } from '@/lib/types';
import { getCategoryStats, filterChannels } from '@/lib/parseM3U';
import { cn } from '@/lib/utils';
import { Hero } from '@/components/Hero';
import { LivePlayer } from '@/components/LivePlayer';
import { CategoryRow } from '@/components/CategoryRow';
import { CategoryView } from '@/components/CategoryView';
import { useApp } from '@/context/AppContext';
import { useSearchParams, useRouter } from 'next/navigation';

export default function Home() {
  const { 
    channels, 
    loading, 
    error, 
    playback, 
    favorites, 
    searchQuery, 
    setSearchQuery,
    isSidebarOpen,
    setIsSidebarOpen
  } = useApp();

  const searchParams = useSearchParams();
  const router = useRouter();
  const selectedCategory = searchParams.get('category');

  // Get current channel
  const currentChannel = useMemo(() => {
    return channels.find(ch => ch.id === playback.currentChannelId) || null;
  }, [channels, playback.currentChannelId]);

  // Featured channel for Hero
  const featuredChannel = useMemo(() => {
    if (channels.length === 0) return null;
    return channels.find(c => c.category?.toLowerCase().includes('news')) || channels[0];
  }, [channels]);

  // Get category stats
  const categoryStats = useMemo(() => {
    return getCategoryStats(channels);
  }, [channels]);

  // Get filtered channels for category view
  const filteredChannels = useMemo(() => {
    if (selectedCategory) {
      return filterChannels(
        channels,
        searchQuery,
        selectedCategory
      );
    }
    return [];
  }, [channels, selectedCategory, searchQuery]);

  // Handle channel selection
  const handleChannelSelect = useCallback(
    (channel: Channel) => {
      playback.playChannel(channel.id);
      favorites.addToRecent(channel.id);
      // Switch to category view to show the player via URL
      router.push(`/?category=${encodeURIComponent(channel.category || 'Uncategorized')}`);
    },
    [playback, favorites, router]
  );

  // Handle category select
  const handleCategorySelect = useCallback(
    (categoryName: string | null) => {
      if (categoryName) {
        router.push(`/?category=${encodeURIComponent(categoryName)}`);
      } else {
        router.push('/');
      }
      setSearchQuery('');
      if (window.innerWidth < 768) {
        setIsSidebarOpen(false);
      }
    },
    [router, setSearchQuery, setIsSidebarOpen]
  );

  // Handle back
  const handleBack = useCallback(() => {
    router.push('/');
    setSearchQuery('');
  }, [router, setSearchQuery]);

  // Filtered categories based on search
  const filteredCategoryStats = useMemo(() => {
    if (!searchQuery) return categoryStats;
    
    return categoryStats.map(cat => {
      const filtered = channels.filter(c => 
        (c.category || 'Uncategorized') === cat.name &&
        c.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      return { ...cat, count: filtered.length, filteredChannels: filtered };
    }).filter(cat => cat.count > 0);
  }, [categoryStats, channels, searchQuery]);

  return (
    <>
      {!selectedCategory ? (
        // Grid View - Categories and Rows
        <div className="h-full overflow-y-auto no-scrollbar scroll-smooth">
          <div className="flex flex-col md:p-8 max-w-7xl mx-auto space-y-8 md:space-y-12">
            
            {/* Hero Section */}
            {!searchQuery && (
              <div className="w-full">
                <Hero 
                  featuredChannel={featuredChannel} 
                  onWatchNow={handleChannelSelect} 
                />
              </div>
            )}

            <div className={cn("px-4 md:px-0", searchQuery ? 'mt-4' : '')}>
              <h1 className="text-3xl md:text-5xl font-black tracking-tighter bg-gradient-to-r from-foreground to-foreground/50 bg-clip-text text-transparent">
                {searchQuery ? `Search Results for "${searchQuery}"` : 'Live TV channels'}
              </h1>
              {!searchQuery && (
                <p className="text-muted-foreground mt-2 text-base md:text-lg font-medium">
                  Watch your favorite channels from around the world
                </p>
              )}
            </div>

            {error && (
              <div className="p-4 bg-red-500/10 text-red-500 border border-red-500/20 rounded-xl mb-6 text-sm flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                {error}
              </div>
            )}

            {loading ? (
              <div className="flex flex-col items-center justify-center h-96 gap-4">
                <div className="animate-spin w-10 h-10 border-4 border-primary border-t-transparent rounded-full font-black" />
                <p className="text-muted-foreground font-bold tracking-tight">Loading premium streams...</p>
              </div>
            ) : filteredCategoryStats.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-96 gap-4 text-center">
                <div className="w-20 h-20 rounded-3xl bg-muted flex items-center justify-center text-muted-foreground shadow-inner">
                  <Search className="w-10 h-10" />
                </div>
                <p className="text-muted-foreground font-bold text-lg">No channels found</p>
              </div>
            ) : (
              <div className="space-y-2 md:space-y-4 pb-12 px-4 md:px-0">
                {filteredCategoryStats.map((category) => (
                  <CategoryRow
                    key={category.name}
                    title={category.name}
                    channels={searchQuery ? (category as any).filteredChannels : channels.filter(c => (c.category || 'Uncategorized') === category.name)}
                    onChannelSelect={handleChannelSelect}
                    onViewAll={() => handleCategorySelect(category.name)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        // Category View - Channel List
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 h-full p-2 md:p-6 max-w-[1600px] mx-auto overflow-hidden">
          {/* Player Section */}
          <div className="lg:col-span-2 flex flex-col gap-3 md:gap-6 overflow-auto no-scrollbar">
            <div className="md:rounded-2xl overflow-hidden shadow-2xl border-y md:border border-border bg-black aspect-video -mx-2 md:mx-0">
              <LivePlayer
                channel={currentChannel}
                isPlaying={playback.isPlaying}
                volume={playback.volume}
                isMuted={playback.isMuted}
                onPlayPause={playback.togglePlayPause}
                onVolumeChange={playback.setVolume}
                onMute={playback.toggleMute}
              />
            </div>

            {/* Player Info */}
            {currentChannel && (
              <div className="space-y-3 bg-card p-4 md:p-6 md:rounded-3xl border-y md:border border-border shadow-sm -mx-2 md:mx-0">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 md:gap-4">
                  <div className="space-y-1.5 md:space-y-2">
                    <div className="flex items-center gap-2 md:gap-3">
                      <div className="px-2 py-0.5 bg-red-600 rounded text-[10px] font-black text-white uppercase tracking-widest animate-pulse">LIVE</div>
                      <h2 className="text-xl md:text-2xl font-black text-card-foreground tracking-tight">{currentChannel.name}</h2>
                    </div>
                    {currentChannel.category && (
                      <p className="text-muted-foreground font-bold tracking-tight text-sm uppercase">
                        {currentChannel.category}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs font-black w-fit">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    106 Views
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Channels List Section */}
          <div className="flex flex-col gap-3 md:gap-4 overflow-hidden bg-card rounded-2xl border border-border shadow-sm">
            <div className="p-3 md:p-6 border-b border-border/50">
              <h3 className="font-black text-lg md:text-xl tracking-tight uppercase">Related Channels</h3>
            </div>

            {error && (
              <div className="px-4 py-2 bg-destructive/10 text-destructive rounded-lg text-sm mx-4">
                {error}
              </div>
            )}

            <div className="flex-1 overflow-hidden">
              <CategoryView
                categoryName={selectedCategory || ''}
                channels={filteredChannels}
                activeChannelId={playback.currentChannelId || undefined}
                onSelectChannel={handleChannelSelect}
                onBack={handleBack}
                isLoading={loading}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
