'use client';

import { memo, useMemo } from 'react';
import { Channel } from '@/lib/types';
import { ChannelListItem } from './ChannelListItem';
import { ChevronLeft } from 'lucide-react';

interface CategoryViewProps {
  categoryName: string;
  channels: Channel[];
  activeChannelId?: string;
  onSelectChannel: (channel: Channel) => void;
  onBack: () => void;
  isLoading?: boolean;
}

export const CategoryView = memo(function CategoryView({
  categoryName,
  channels,
  activeChannelId,
  onSelectChannel,
  onBack,
  isLoading = false,
}: CategoryViewProps) {
  const filteredChannels = useMemo(
    () => channels.filter(ch => ch.category === categoryName).sort((a, b) => a.name.localeCompare(b.name)),
    [channels, categoryName]
  );

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="flex items-center gap-2 md:gap-3 p-3 md:p-4 border-b border-border">
        <button
          onClick={onBack}
          className="p-1.5 md:p-2 hover:bg-card rounded-lg transition-colors"
          aria-label="Go back"
        >
          <ChevronLeft size={18} className="text-muted-foreground md:size-[20px]" />
        </button>
        <div>
          <h2 className="text-base md:text-lg font-bold text-foreground leading-tight">{categoryName}</h2>
          <p className="text-[11px] md:text-sm text-muted-foreground font-medium uppercase tracking-wider">
            {filteredChannels.length} channel{filteredChannels.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {/* Channel List */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
          </div>
        ) : filteredChannels.length === 0 ? (
          <div className="flex items-center justify-center h-full text-center p-4">
            <div>
              <p className="text-muted-foreground">No channels found</p>
              <button
                onClick={onBack}
                className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
              >
                Go Back
              </button>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {filteredChannels.map(channel => (
              <ChannelListItem
                key={channel.id}
                channel={channel}
                isActive={channel.id === activeChannelId}
                onSelect={onSelectChannel}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
});
