'use client';

import { memo, useCallback, useMemo } from 'react';
import { Channel } from '@/lib/types';
import { Heart } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChannelListProps {
  channels: Channel[];
  selectedChannelId: string | null;
  onChannelSelect: (channel: Channel) => void;
  favorites: Set<string>;
  onToggleFavorite: (channelId: string) => void;
  isLoading?: boolean;
}

const ChannelItem = memo(function ChannelItem({
  channel,
  isSelected,
  isFavorite,
  onSelect,
  onToggleFavorite,
}: {
  channel: Channel;
  isSelected: boolean;
  isFavorite: boolean;
  onSelect: () => void;
  onToggleFavorite: () => void;
}) {
  return (
    <div
      onClick={onSelect}
      className={cn(
        'group relative p-3 rounded-lg border transition-all cursor-pointer hover:bg-accent/10',
        isSelected
          ? 'border-primary bg-primary/10'
          : 'border-border hover:border-primary/50'
      )}
    >
      <div className="flex items-start gap-3">
        {channel.logo ? (
          <img
            src={channel.logo}
            alt={channel.name}
            className="w-12 h-12 rounded bg-muted object-cover flex-shrink-0"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
        ) : (
          <div className="w-12 h-12 rounded bg-muted flex items-center justify-center flex-shrink-0 text-muted-foreground text-xs font-medium">
            {channel.name.substring(0, 2)}
          </div>
        )}

        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-sm truncate">{channel.name}</h4>
          {channel.category && (
            <p className="text-xs text-muted-foreground truncate">
              {channel.category}
            </p>
          )}
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite();
          }}
          className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
        >
          <Heart
            className={cn(
              'w-4 h-4 transition-colors',
              isFavorite
                ? 'fill-red-500 text-red-500'
                : 'text-muted-foreground hover:text-red-500'
            )}
          />
        </button>
      </div>
    </div>
  );
});

export function ChannelList({
  channels,
  selectedChannelId,
  onChannelSelect,
  favorites,
  onToggleFavorite,
  isLoading = false,
}: ChannelListProps) {
  const handleChannelSelect = useCallback(
    (channel: Channel) => {
      onChannelSelect(channel);
    },
    [onChannelSelect]
  );

  const handleToggleFavorite = useCallback(
    (channelId: string) => {
      onToggleFavorite(channelId);
    },
    [onToggleFavorite]
  );

  const sortedChannels = useMemo(() => {
    // Sort with favorites first
    const favoriteChannels = channels.filter(ch => favorites.has(ch.id));
    const otherChannels = channels.filter(ch => !favorites.has(ch.id));
    return [...favoriteChannels, ...otherChannels];
  }, [channels, favorites]);

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="h-20 rounded-lg bg-muted animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (channels.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <p className="text-muted-foreground">No channels found</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {sortedChannels.map(channel => (
        <ChannelItem
          key={channel.id}
          channel={channel}
          isSelected={selectedChannelId === channel.id}
          isFavorite={favorites.has(channel.id)}
          onSelect={() => handleChannelSelect(channel)}
          onToggleFavorite={() => handleToggleFavorite(channel.id)}
        />
      ))}
    </div>
  );
}
