'use client';

import { memo, useCallback } from 'react';
import { useChannels } from '@/hooks/useChannels';
import { CategoryInfo, filterChannels } from '@/lib/parseM3U';
import { ChannelCard } from '@/components/ChannelCard';
import { ChevronRight } from 'lucide-react';

interface CategoryGridProps {
  categories: CategoryInfo[];
  onSelectCategory: (categoryName: string) => void;
  isLoading?: boolean;
}

export const CategoryGrid = memo(function CategoryGrid({
  categories,
  onSelectCategory,
  isLoading = false,
}: CategoryGridProps) {
  const { channels } = useChannels();

  const getCategoryChannels = useCallback(
    (categoryName: string) => {
      return filterChannels(channels, '', categoryName).slice(0, 6);
    },
    [channels]
  );

  if (isLoading) {
    return (
      <div className="space-y-12">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="space-y-4">
            <div className="h-6 w-32 bg-card rounded animate-pulse" />
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
              {Array.from({ length: 6 }).map((_, j) => (
                <div
                  key={j}
                  className="aspect-video bg-card rounded-lg animate-pulse"
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {categories.map((category) => {
        const categoryChannels = getCategoryChannels(category.name);

        return (
          <div key={category.name} className="space-y-3">
            {/* Category Header */}
            <div className="flex items-center justify-between px-1">
              <h2 className="text-xl md:text-2xl font-bold text-foreground">
                {category.name}
              </h2>
              <button
                onClick={() => onSelectCategory(category.name)}
                className="flex items-center gap-1 text-sm font-semibold text-primary hover:text-accent transition-colors group"
              >
                View all
                <ChevronRight
                  size={18}
                  className="group-hover:translate-x-1 transition-transform"
                />
              </button>
            </div>

            {/* Channel Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3 md:gap-4">
              {categoryChannels.length > 0 ? (
                categoryChannels.map((channel) => (
                  <ChannelCard
                    key={channel.id}
                    channel={channel}
                    onClick={() => onSelectCategory(category.name)}
                  />
                ))
              ) : (
                <div className="col-span-full text-center py-8">
                  <p className="text-muted-foreground text-sm">
                    No channels available
                  </p>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
});
