'use client';

import { Channel } from '@/lib/types';
import { Heart } from 'lucide-react';
import { useFavorites } from '@/hooks/useFavorites';
import { memo } from 'react';
import { cn } from '@/lib/utils';

interface ChannelListItemProps {
  channel: Channel;
  isActive?: boolean;
  onSelect: (channel: Channel) => void;
}

export const ChannelListItem = memo(function ChannelListItem({
  channel,
  isActive = false,
  onSelect,
}: ChannelListItemProps) {
  const { favorites, toggleFavorite } = useFavorites();
  const isFavorited = favorites.has(channel.id);

  const initials = channel.name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div
      onClick={() => onSelect(channel)}
      className={`flex items-center gap-3 md:gap-4 p-2 md:p-4 border-b border-border cursor-pointer transition-colors ${
        isActive
          ? 'bg-primary/10 border-l-4 border-l-primary'
          : 'hover:bg-card/50'
      }`}
    >
      {/* Logo or Initials */}
      <div className="flex-shrink-0">
        {channel.logo ? (
          <img
            src={channel.logo}
            alt={channel.name}
            className="w-10 h-10 md:w-12 md:h-12 rounded-lg object-contain bg-secondary/50 p-1"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              e.currentTarget.nextElementSibling?.classList.remove('hidden');
            }}
          />
        ) : null}
        <div
          className={`w-10 h-10 md:w-12 md:h-12 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center text-xs md:text-sm font-bold text-primary-foreground ${
            channel.logo ? 'hidden' : ''
          }`}
        >
          {initials}
        </div>
      </div>

      {/* Channel Info */}
      <div className="flex-1 min-w-0">
        <h3 className="font-bold text-sm md:text-base text-foreground truncate tracking-tight">
          {channel.name}
        </h3>
        <p className="text-[10px] md:text-sm text-muted-foreground truncate font-medium uppercase">
          {channel.category}
        </p>
      </div>

      {/* Favorite Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          toggleFavorite(channel.id);
        }}
        className="flex-shrink-0 p-1.5 md:p-2 hover:bg-card rounded-lg transition-all active:scale-90"
        aria-label={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
      >
        <Heart
          size={18}
          className={cn(
            "transition-all duration-300",
            isFavorited ? 'fill-destructive text-destructive scale-110' : 'text-muted-foreground/60'
          )}
        />
      </button>
    </div>
  );
});
