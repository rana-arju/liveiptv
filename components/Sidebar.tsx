'use client';

import { Heart, Clock, List, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { usePathname } from 'next/navigation';

interface SidebarProps {
  isOpen: boolean;
  categories: string[];
  selectedCategory: string | null;
  onCategorySelect: (category: string | null) => void;
  favoritesCount?: number;
  onShowFavorites?: () => void;
  recentCount?: number;
  onShowRecent?: () => void;
}

export function Sidebar({
  isOpen,
  categories,
  selectedCategory,
  onCategorySelect,
  favoritesCount = 0,
  onShowFavorites,
  recentCount = 0,
  onShowRecent,
}: SidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
          onClick={() => {
            // Close sidebar through parent component
          }}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed md:relative left-0 top-16 md:top-0 w-64 h-[calc(100vh-4rem)] md:h-screen bg-background border-r border-border overflow-y-auto transition-transform duration-300 ease-in-out z-40 shadow-xl md:shadow-none',
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        )}
      >
        <div className="p-4 space-y-6">
          {/* Quick Access */}
          <div>
            <h3 className="text-xs font-semibold text-sidebar-foreground/60 uppercase mb-3 px-3">
              Quick Access
            </h3>
            <div className="space-y-1">
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-start gap-3 h-11 px-3 rounded-xl transition-all font-medium",
                  pathname === '/' && !selectedCategory ? "bg-primary/10 text-primary hover:bg-primary/20" : "hover:bg-accent"
                )}
                onClick={() => onCategorySelect(null)}
              >
                <Home className="w-5 h-5" />
                <span>Home</span>
              </Button>
              {onShowFavorites && (
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full justify-start gap-3 h-11 px-3 rounded-xl transition-all font-medium",
                    pathname === '/favorites' ? "bg-primary/10 text-primary hover:bg-primary/20" : "hover:bg-accent"
                  )}
                  onClick={onShowFavorites}
                >
                  <Heart className="w-5 h-5" />
                  <span>Favorites</span>
                  {favoritesCount > 0 && (
                    <span className="ml-auto text-[10px] bg-primary/20 text-primary px-2 py-0.5 rounded-full font-bold">
                      {favoritesCount}
                    </span>
                  )}
                </Button>
              )}
              {onShowRecent && (
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full justify-start gap-3 h-11 px-3 rounded-xl transition-all font-medium",
                    pathname === '/recent' ? "bg-primary/10 text-primary hover:bg-primary/20" : "hover:bg-accent"
                  )}
                  onClick={onShowRecent}
                >
                  <Clock className="w-5 h-5" />
                  <span>Recent</span>
                  {recentCount > 0 && (
                    <span className="ml-auto text-[10px] bg-primary/20 text-primary px-2 py-0.5 rounded-full font-bold">
                      {recentCount}
                    </span>
                  )}
                </Button>
              )}
            </div>
          </div>

          {/* Categories */}
          {categories.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold text-sidebar-foreground/60 uppercase mb-3">
                Categories
              </h3>
              <div className="space-y-1 max-h-96 overflow-y-auto">
                {categories.map(category => (
                  <button
                    key={category}
                    onClick={() => onCategorySelect(category)}
                    className={cn(
                      'w-full px-4 py-2.5 rounded-xl text-sm text-left transition-all font-medium flex items-center justify-between group',
                      selectedCategory === category
                        ? 'bg-primary/10 text-primary'
                        : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground'
                    )}
                  >
                    <span>{category}</span>
                    <div className={cn(
                      "w-1.5 h-1.5 rounded-full bg-primary opacity-0 transition-opacity",
                      selectedCategory === category ? "opacity-100" : "group-hover:opacity-40"
                    )} />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
