'use client';

import { memo } from 'react';
import { Channel } from '@/lib/types';
import { ChannelCard } from './ChannelCard';
import { ChevronRight } from 'lucide-react';

interface CategoryRowProps {
  title: string;
  channels: Channel[];
  onChannelSelect: (channel: Channel) => void;
  onViewAll?: () => void;
}

export const CategoryRow = memo(function CategoryRow({
  title,
  channels,
  onChannelSelect,
  onViewAll,
}: CategoryRowProps) {
  if (channels.length === 0) return null;

  return (
    <section className="space-y-3 md:space-y-4 py-2 md:py-4">
      <div className="flex items-center justify-between px-1">
        <h2 className="text-lg md:text-xl font-bold text-foreground tracking-tight flex items-center gap-2">
          {title}
        </h2>
        <button 
          onClick={onViewAll}
          className="text-[10px] md:text-xs font-bold text-muted-foreground hover:text-primary transition-colors flex items-center gap-1 group uppercase tracking-wider"
        >
          View all
          <ChevronRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5" />
        </button>
      </div>

      <div className="relative group/row">
        <div className="flex overflow-x-auto gap-3 md:gap-4 pb-4 no-scrollbar scroll-smooth">
          {channels.map((channel) => (
            <div key={channel.id} className="flex-none w-[180px] md:w-[240px]">
              <ChannelCard
                channel={channel}
                onClick={() => onChannelSelect(channel)}
              />
            </div>
          ))}
        </div>
        
        {/* Subtle fade effect for scrolling */}
        <div className="absolute top-0 right-0 h-full w-20 bg-gradient-to-l from-black/20 to-transparent pointer-events-none" />
      </div>
    </section>
  );
});
