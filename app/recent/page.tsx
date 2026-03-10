'use client';

import { useApp } from '@/context/AppContext';
import { ChannelCard } from '@/components/ChannelCard';
import { Clock } from 'lucide-react';
import { Channel } from '@/lib/types';
import { useMemo } from 'react';
import { useRouter } from 'next/navigation';

export default function RecentPage() {
  const { channels, favorites, playback, loading } = useApp();
  const router = useRouter();

  const recentChannelsList = useMemo(() => {
    return favorites.recentChannels
      .map(id => channels.find(c => c.id === id))
      .filter((c): c is Channel => !!c);
  }, [channels, favorites.recentChannels]);

  const handleChannelSelect = (channel: Channel) => {
    playback.playChannel(channel.id);
    favorites.addToRecent(channel.id);
    router.push(`/?category=${encodeURIComponent(channel.category || 'Uncategorized')}`);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <div className="animate-spin w-10 h-10 border-4 border-primary border-t-transparent rounded-full font-black" />
        <p className="text-muted-foreground font-bold">Loading watch history...</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl md:text-5xl font-black tracking-tighter bg-gradient-to-r from-foreground to-foreground/50 bg-clip-text text-transparent">
          Recently Played
        </h1>
        <p className="text-muted-foreground mt-2 text-base md:text-lg font-medium">
          Continue where you left off
        </p>
      </div>

      {recentChannelsList.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-96 gap-4 text-center">
          <div className="w-20 h-20 rounded-3xl bg-muted flex items-center justify-center text-muted-foreground shadow-inner">
            <Clock className="w-10 h-10" />
          </div>
          <p className="text-muted-foreground font-bold text-lg">No watch history yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
          {recentChannelsList.map((channel) => (
            <ChannelCard
              key={channel.id}
              channel={channel}
              isFavorite={favorites.isFavorite(channel.id)}
              onToggleFavorite={() => favorites.toggleFavorite(channel.id)}
              onClick={() => handleChannelSelect(channel)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
