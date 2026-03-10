'use client';

import { Moon, Sun, Menu, Search, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useEffect, useState } from 'react';

interface HeaderProps {
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  onToggleSidebar?: () => void;
  searchValue: string;
  onSearchChange: (value: string) => void;
}

export function Header({ 
  theme, 
  onToggleTheme, 
  onToggleSidebar,
  searchValue,
  onSearchChange
}: HeaderProps) {
  const [visitorCount, setVisitorCount] = useState<number | null>(null);

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
    const interval = setInterval(fetchVisitors, 60000); // Update every minute
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center px-4 md:px-8 gap-4 md:gap-8">
        {/* Left Section: Menu & Logo */}
        <div className="flex items-center gap-4">
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

        {/* Center Section: Global Search */}
        <div className="flex-1 max-w-2xl mx-auto hidden md:block">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <Input
              type="text"
              placeholder="Search channels, categories..."
              value={searchValue}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full h-10 pl-10 pr-4 bg-muted/50 border-transparent focus:bg-background focus:border-primary transition-all rounded-xl"
            />
          </div>
        </div>

        {/* Right Section: View Count, Theme, Search Toggle (Mobile) */}
        <div className="flex items-center gap-2 md:gap-4">
          {/* Live View Count Pill */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[10px] md:text-xs font-bold whitespace-nowrap">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <Users className="w-3 h-3 md:w-4 md:h-4" />
            <span>{visitorCount !== null ? `${visitorCount} Views` : 'Loading...'}</span>
          </div>

          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleTheme}
              className="h-9 w-9 p-0 rounded-full hover:bg-muted"
            >
              {theme === 'dark' ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Search Bar - Visible only on mobile */}
      <div className="px-4 pb-3 md:hidden">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search..."
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full h-10 pl-10 bg-muted/50 border-transparent focus:bg-background focus:border-primary rounded-xl"
          />
        </div>
      </div>
    </header>
  );
}
