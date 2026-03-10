'use client';

import { Moon, Sun, Menu, Search, Users, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Channel } from '@/lib/types';
import { SearchSuggestions } from '@/components/SearchSuggestions';

interface HeaderProps {
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  onToggleSidebar?: () => void;
  searchValue: string;
  onSearchChange: (value: string) => void;
  channels: Channel[];
  onChannelSelect: (channel: Channel) => void;
  onCategorySelect: (category: string) => void;
}

export function Header({
  theme,
  onToggleTheme,
  onToggleSidebar,
  searchValue,
  onSearchChange,
  channels,
  onChannelSelect,
  onCategorySelect,
}: HeaderProps) {
  const [visitorCount, setVisitorCount] = useState<number | null>(null);
  const [localQuery, setLocalQuery] = useState(searchValue);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const desktopRef = useRef<HTMLDivElement>(null);
  const mobileRef = useRef<HTMLDivElement>(null);

  // Visitor count
  useEffect(() => {
    const fetchVisitors = async () => {
      try {
        const response = await fetch('https://api.counterapi.dev/v1/bd-stream-visitor-tracker/visitors/');
        const data = await response.json();
        if (data && typeof data.count === 'number') {
          setVisitorCount(data.count);
        }
      } catch (error) {
        console.error('Failed to fetch visitor count:', error);
      }
    };
    fetchVisitors();
    const interval = setInterval(fetchVisitors, 60000);
    return () => clearInterval(interval);
  }, []);

  // Debounce global search update
  const handleQueryChange = useCallback((value: string) => {
    setLocalQuery(value);
    setActiveIndex(-1);
    setShowSuggestions(value.trim().length > 0);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      onSearchChange(value);
    }, 200);
  }, [onSearchChange]);

  // Sync external clear
  useEffect(() => {
    if (!searchValue) {
      setLocalQuery('');
      setShowSuggestions(false);
    }
  }, [searchValue]);

  // Outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        desktopRef.current && !desktopRef.current.contains(e.target as Node) &&
        mobileRef.current && !mobileRef.current.contains(e.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Compute total suggestion count for keyboard nav
  const q = localQuery.trim().toLowerCase();
  const matchedChannels = channels.filter((c) => c.name.toLowerCase().includes(q)).slice(0, 5);
  const categoryMap = new Map<string, number>();
  channels.forEach((c) => {
    const cat = c.category || 'Uncategorized';
    if (cat.toLowerCase().includes(q)) categoryMap.set(cat, (categoryMap.get(cat) ?? 0) + 1);
  });
  const matchedCategories = Array.from(categoryMap.entries()).slice(0, 3);
  const totalSuggestions = matchedChannels.length + matchedCategories.length + (matchedChannels.length + matchedCategories.length > 0 ? 1 : 0);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, totalSuggestions - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, -1));
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
      setActiveIndex(-1);
    } else if (e.key === 'Enter') {
      if (activeIndex === -1 || activeIndex === matchedCategories.length + matchedChannels.length) {
        // See all / commit global search
        onSearchChange(localQuery);
        setShowSuggestions(false);
      } else if (activeIndex < matchedCategories.length) {
        const [cat] = matchedCategories[activeIndex];
        onCategorySelect(cat);
        setShowSuggestions(false);
        setLocalQuery('');
        onSearchChange('');
      } else {
        const ch = matchedChannels[activeIndex - matchedCategories.length];
        if (ch) {
          onChannelSelect(ch);
          setShowSuggestions(false);
          setLocalQuery('');
          onSearchChange('');
        }
      }
    }
  }, [showSuggestions, activeIndex, totalSuggestions, matchedCategories, matchedChannels, localQuery, onSearchChange, onCategorySelect, onChannelSelect]);

  const handleSelectChannel = useCallback((channel: Channel) => {
    onChannelSelect(channel);
    setShowSuggestions(false);
    setLocalQuery('');
    onSearchChange('');
  }, [onChannelSelect, onSearchChange]);

  const handleSelectCategory = useCallback((cat: string) => {
    onCategorySelect(cat);
    setShowSuggestions(false);
    setLocalQuery('');
    onSearchChange('');
  }, [onCategorySelect, onSearchChange]);

  const handleSeeAll = useCallback(() => {
    onSearchChange(localQuery);
    setShowSuggestions(false);
  }, [localQuery, onSearchChange]);

  const handleClear = useCallback(() => {
    setLocalQuery('');
    onSearchChange('');
    setShowSuggestions(false);
    setActiveIndex(-1);
  }, [onSearchChange]);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center px-4 md:px-8 gap-4 md:gap-8">
        {/* Left Section: Menu & Logo */}
        <div className="flex items-center gap-4 flex-shrink-0">
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleSidebar}
            className="h-9 w-9 p-0 hover:bg-muted md:hidden"
          >
            <Menu className="h-5 w-5" />
          </Button>

          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center text-primary-foreground font-black text-xs shadow-lg shadow-primary/20">
              TV
            </div>
            <span className="font-bold text-xl tracking-tight hidden sm:block">IPTV</span>
          </div>
        </div>

        {/* Center Section: Global Search (desktop) */}
        <div className="flex-1 max-w-2xl mx-auto hidden md:block">
          <div className="relative group" ref={desktopRef}>
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors z-10 pointer-events-none" />
            <input
              type="text"
              placeholder="Search channels, categories..."
              value={localQuery}
              onChange={(e) => handleQueryChange(e.target.value)}
              onFocus={() => { if (localQuery.trim()) setShowSuggestions(true); }}
              onKeyDown={handleKeyDown}
              className="w-full h-10 pl-10 pr-9 bg-muted/50 border border-transparent focus:bg-background focus:border-primary focus:outline-none transition-all rounded-xl text-sm text-foreground placeholder:text-muted-foreground"
            />
            {localQuery && (
              <button
                onClick={handleClear}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 h-5 w-5 flex items-center justify-center rounded-full bg-muted-foreground/20 hover:bg-muted-foreground/30 transition-colors"
              >
                <X className="w-3 h-3 text-muted-foreground" />
              </button>
            )}
            {showSuggestions && localQuery.trim().length > 0 && (
              <SearchSuggestions
                query={localQuery}
                channels={channels}
                activeIndex={activeIndex}
                onSelectChannel={handleSelectChannel}
                onSelectCategory={handleSelectCategory}
                onSeeAll={handleSeeAll}
                onClose={() => setShowSuggestions(false)}
              />
            )}
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-2 md:gap-4 flex-shrink-0">
          {/* Live View Count */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[10px] md:text-xs font-bold whitespace-nowrap">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <Users className="w-3 h-3 md:w-4 md:h-4" />
            <span>{visitorCount !== null ? `${visitorCount} Views` : 'Loading...'}</span>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleTheme}
            className="h-9 w-9 p-0 rounded-full hover:bg-muted"
          >
            {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Search Bar */}
      <div className="px-4 pb-3 md:hidden">
        <div className="relative group" ref={mobileRef}>
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors z-10 pointer-events-none" />
          <input
            type="text"
            placeholder="Search..."
            value={localQuery}
            onChange={(e) => handleQueryChange(e.target.value)}
            onFocus={() => { if (localQuery.trim()) setShowSuggestions(true); }}
            onKeyDown={handleKeyDown}
            className="w-full h-10 pl-10 pr-9 bg-muted/50 border border-transparent focus:bg-background focus:border-primary focus:outline-none transition-all rounded-xl text-sm text-foreground placeholder:text-muted-foreground"
          />
          {localQuery && (
            <button
              onClick={handleClear}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 h-5 w-5 flex items-center justify-center rounded-full bg-muted-foreground/20 hover:bg-muted-foreground/30 transition-colors"
            >
              <X className="w-3 h-3 text-muted-foreground" />
            </button>
          )}
          {showSuggestions && localQuery.trim().length > 0 && (
            <SearchSuggestions
              query={localQuery}
              channels={channels}
              activeIndex={activeIndex}
              onSelectChannel={handleSelectChannel}
              onSelectCategory={handleSelectCategory}
              onSeeAll={handleSeeAll}
              onClose={() => setShowSuggestions(false)}
            />
          )}
        </div>
      </div>
    </header>
  );
}
