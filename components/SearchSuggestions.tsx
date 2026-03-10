'use client';

import { useEffect, useRef } from 'react';
import { Channel } from '@/lib/types';
import { Search, Tv, LayoutGrid, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Suggestion {
  type: 'channel' | 'category';
  channel?: Channel;
  category?: string;
  count?: number;
}

interface SearchSuggestionsProps {
  query: string;
  channels: Channel[];
  activeIndex: number;
  onSelectChannel: (channel: Channel) => void;
  onSelectCategory: (category: string) => void;
  onSeeAll: () => void;
  onClose: () => void;
}

function highlightMatch(text: string, query: string) {
  if (!query) return <span>{text}</span>;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return <span>{text}</span>;
  return (
    <span>
      {text.slice(0, idx)}
      <span className="font-black text-foreground">{text.slice(idx, idx + query.length)}</span>
      {text.slice(idx + query.length)}
    </span>
  );
}

export function SearchSuggestions({
  query,
  channels,
  activeIndex,
  onSelectChannel,
  onSelectCategory,
  onSeeAll,
  onClose,
}: SearchSuggestionsProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Build suggestions
  const q = query.trim().toLowerCase();

  const matchedChannels = channels
    .filter((c) => c.name.toLowerCase().includes(q))
    .slice(0, 5);

  const categoryMap = new Map<string, number>();
  channels.forEach((c) => {
    const cat = c.category || 'Uncategorized';
    if (cat.toLowerCase().includes(q)) {
      categoryMap.set(cat, (categoryMap.get(cat) ?? 0) + 1);
    }
  });
  const matchedCategories = Array.from(categoryMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  const suggestions: Suggestion[] = [
    ...matchedChannels.map((ch) => ({ type: 'channel' as const, channel: ch })),
    ...matchedCategories.map(([cat, count]) => ({ type: 'category' as const, category: cat, count })),
  ];

  const hasResults = suggestions.length > 0;

  // Scroll active item into view
  useEffect(() => {
    const el = containerRef.current?.querySelector(`[data-idx="${activeIndex}"]`) as HTMLElement | null;
    el?.scrollIntoView({ block: 'nearest' });
  }, [activeIndex]);

  return (
    <div
      ref={containerRef}
      className="absolute top-full left-0 right-0 mt-2 z-[200] bg-popover border border-border rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150"
    >
      {/* Category section */}
      {matchedCategories.length > 0 && (
        <div>
          <div className="px-4 pt-3 pb-1 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
            Categories
          </div>
          {matchedCategories.map(([cat, count], i) => {
            const idx = i;
            return (
              <button
                key={cat}
                data-idx={idx}
                onMouseDown={(e) => { e.preventDefault(); onSelectCategory(cat); }}
                className={cn(
                  'w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors group',
                  activeIndex === idx ? 'bg-primary/10 text-primary' : 'hover:bg-muted/50',
                )}
              >
                <div className={cn(
                  'w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors',
                  activeIndex === idx ? 'bg-primary/20' : 'bg-muted group-hover:bg-muted/70',
                )}>
                  <LayoutGrid className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate text-foreground">
                    {highlightMatch(cat, q)}
                  </p>
                  <p className="text-[11px] text-muted-foreground">{count} channels</p>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            );
          })}
        </div>
      )}

      {/* Channels section */}
      {matchedChannels.length > 0 && (
        <div>
          <div className="px-4 pt-3 pb-1 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
            Channels
          </div>
          {matchedChannels.map((ch, i) => {
            const idx = matchedCategories.length + i;
            return (
              <button
                key={ch.id}
                data-idx={idx}
                onMouseDown={(e) => { e.preventDefault(); onSelectChannel(ch); }}
                className={cn(
                  'w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors group',
                  activeIndex === idx ? 'bg-primary/10 text-primary' : 'hover:bg-muted/50',
                )}
              >
                {/* Logo or fallback */}
                <div className={cn(
                  'w-8 h-8 rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center bg-muted transition-colors',
                  activeIndex === idx ? 'ring-2 ring-primary/50' : '',
                )}>
                  {ch.logo ? (
                    <img
                      src={ch.logo}
                      alt={ch.name}
                      className="w-full h-full object-cover"
                      onError={(e) => { (e.currentTarget.parentElement!).innerHTML = `<svg xmlns='http://www.w3.org/2000/svg' class='w-4 h-4 text-muted-foreground' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2'><rect x='2' y='7' width='20' height='15' rx='2'/><polyline points='17 2 12 7 7 2'/></svg>`; }}
                    />
                  ) : (
                    <Tv className="w-4 h-4 text-muted-foreground" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate text-foreground">
                    {highlightMatch(ch.name, q)}
                  </p>
                  {ch.category && (
                    <p className="text-[11px] text-muted-foreground uppercase tracking-wide truncate">
                      {ch.category}
                    </p>
                  )}
                </div>
                <div className="flex-shrink-0 px-1.5 py-0.5 bg-red-600/10 border border-red-600/20 rounded text-[9px] font-bold text-red-500 uppercase">
                  LIVE
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* No results */}
      {!hasResults && (
        <div className="flex flex-col items-center justify-center py-8 gap-2 text-center">
          <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
            <Search className="w-5 h-5 text-muted-foreground" />
          </div>
          <p className="text-sm text-muted-foreground font-medium">No results for &ldquo;{query}&rdquo;</p>
        </div>
      )}

      {/* See all footer */}
      {hasResults && (
        <div className="border-t border-border/50">
          <button
            onMouseDown={(e) => { e.preventDefault(); onSeeAll(); }}
            data-idx={suggestions.length}
            className={cn(
              'w-full flex items-center justify-between px-4 py-3 text-sm font-semibold transition-colors',
              activeIndex === suggestions.length ? 'bg-primary/10 text-primary' : 'hover:bg-muted/50 text-muted-foreground',
            )}
          >
            <span>See all results for &ldquo;{query}&rdquo;</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
