'use client';

import { memo } from 'react';
import { Channel } from '@/lib/types';
import { Heart } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChannelCardProps {
  channel: Channel;
  onClick?: () => void;
  isFavorite?: boolean;
  onToggleFavorite?: (e: React.MouseEvent) => void;
}

export const ChannelCard = memo(function ChannelCard({
  channel,
  onClick,
  isFavorite,
  onToggleFavorite,
}: ChannelCardProps) {
  const getInitials = (name: string) => {
    return name
      .split(/[\s-]+/)
      .filter(word => word.length > 0)
      .slice(0, 2)
      .map(word => word[0].toUpperCase())
      .join('');
  };

  const initials = getInitials(channel.name);

  return (
    <button
      onClick={onClick}
      className="group relative flex flex-col w-full text-left transition-all duration-300 transform hover:translate-y-[-4px]"
    >
      {/* Thumbnail/Logo Container */}
      <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-muted/50 border border-border group-hover:border-primary/40 transition-all duration-500 shadow-lg group-hover:shadow-primary/20 group-hover:shadow-2xl">
        {/* LIVE Badge */}
        <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5 px-2 py-1 bg-red-600 rounded-md shadow-lg transition-transform duration-300 group-hover:scale-110">
          <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
          <span className="text-[10px] font-bold text-white uppercase tracking-wider">LIVE</span>
        </div>

        {/* Logo/Initials */}
        <div className="absolute inset-0 flex items-center justify-center p-2 transition-transform duration-500 group-hover:scale-105">
          {channel.logo ? (
            <img
              src={channel.logo}
              alt={channel.name}
              className="max-w-full max-h-full object-contain"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                e.currentTarget.parentElement?.querySelector('.initials-fallback')?.classList.remove('hidden');
              }}
            />
          ) : null}
          <div className={`initials-fallback ${channel.logo ? 'hidden' : ''} flex items-center justify-center`}>
            <span className="text-2xl font-bold bg-gradient-to-br from-foreground to-foreground/40 bg-clip-text text-transparent">
              {initials}
            </span>
          </div>
        </div>

        {/* Favorite Button */}
        {onToggleFavorite && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(e);
            }}
            className={cn(
              "absolute top-3 right-3 z-20 p-2 rounded-lg backdrop-blur-md border transition-all duration-300 hover:scale-110 active:scale-95",
              isFavorite 
                ? "bg-red-500 text-white border-red-400 shadow-lg shadow-red-500/20" 
                : "bg-black/20 text-white/70 border-white/20 hover:bg-black/40 hover:text-white"
            )}
          >
            <Heart className={cn("w-4 h-4", isFavorite && "fill-current")} />
          </button>
        )}

        {/* Glossy Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        
        {/* Play Icon on Hover */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 scale-125 group-hover:scale-100">
          <div className="w-14 h-14 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-2xl shadow-primary/40 transform transition-transform duration-300 hover:scale-110 active:scale-90">
            <svg className="w-7 h-7 fill-current ml-1" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Info Section */}
      <div className="mt-3 px-1">
        <h3 className="text-sm font-semibold text-foreground/90 line-clamp-1 group-hover:text-primary transition-colors">
          {channel.name}
        </h3>
        <p className="text-xs text-muted-foreground mt-0.5 font-medium">
          {channel.category || channel.groupTitle || 'TV Channel'}
        </p>
      </div>
    </button>
  );
});
