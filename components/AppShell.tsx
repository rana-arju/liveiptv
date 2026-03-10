'use client';

import React, { Suspense } from 'react';
import { AppProvider, useApp } from '@/context/AppContext';
import { Header } from '@/components/Header';
import { Sidebar } from '@/components/Sidebar';
import { useMemo } from 'react';
import { getCategoryStats } from '@/lib/parseM3U';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

function AppShellInner({ children }: { children: React.ReactNode }) {
  const { 
    channels, 
    theme, 
    toggleTheme, 
    searchQuery, 
    setSearchQuery, 
    isSidebarOpen, 
    setIsSidebarOpen,
    favorites,
    playback
  } = useApp();

  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const selectedCategory = searchParams.get('category');

  // Get categories for sidebar
  const categories = useMemo(() => {
    const stats = getCategoryStats(channels);
    return stats.map(s => s.name);
  }, [channels]);

  const handleToggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const handleCategorySelect = (category: string | null) => {
    if (category === null) {
      router.push('/');
    } else {
      router.push(`/?category=${encodeURIComponent(category)}`);
    }
    
    // Auto-hide sidebar on mobile
    if (window.innerWidth < 768) {
      setIsSidebarOpen(false);
    }
  };

  return (
    <div className={`flex flex-col h-screen bg-background text-foreground transition-colors duration-300 overflow-hidden ${theme === 'dark' ? 'dark' : ''}`}>
      <Header 
        theme={theme} 
        onToggleTheme={toggleTheme} 
        onToggleSidebar={handleToggleSidebar}
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
      />

      <div className="flex flex-1 overflow-hidden">
        <Suspense fallback={<div className="flex-1 bg-background" />}>
          <Sidebar
            isOpen={isSidebarOpen}
            categories={categories}
            selectedCategory={selectedCategory}
            onCategorySelect={handleCategorySelect}
            favoritesCount={favorites.favorites.size}
            onShowFavorites={() => {
              router.push('/favorites');
              if (window.innerWidth < 768) setIsSidebarOpen(false);
            }}
            recentCount={favorites.recentChannels.length}
            onShowRecent={() => {
              router.push('/recent');
              if (window.innerWidth < 768) setIsSidebarOpen(false);
            }}
          />

          <main className="flex-1 overflow-hidden relative">
            {children}
          </main>
        </Suspense>
      </div>
    </div>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <AppProvider>
      <AppShellInner>{children}</AppShellInner>
    </AppProvider>
  );
}
