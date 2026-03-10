'use client';

import { Channel } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Play } from 'lucide-react';
import { memo } from 'react';

interface HeroProps {
  featuredChannel: Channel | null;
  onWatchNow: (channel: Channel) => void;
}

export const Hero = memo(function Hero({ featuredChannel, onWatchNow }: HeroProps) {
  if (!featuredChannel) return null;

  return (
    <div className="relative w-full h-[320px] md:h-[500px] md:rounded-3xl overflow-hidden group">
      {/* Background Image/Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
        style={{ 
          backgroundImage: featuredChannel.logo ? `url(${featuredChannel.logo})` : 'none',
          backgroundColor: '#0a0a0a'
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
      </div>

      {/* Content */}
      <div className="relative h-full flex flex-col justify-center px-6 md:px-16 max-w-2xl gap-4 md:gap-6">
        <div className="flex flex-col gap-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-600/20 border border-red-600/30 text-red-500 text-[10px] md:text-xs font-bold uppercase tracking-widest w-fit">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
            </span>
            Featured Live
          </div>
          <h1 className="text-3xl md:text-7xl font-black text-white tracking-tighter leading-tight md:leading-none">
            {featuredChannel.name}
          </h1>
          <p className="text-gray-300 text-sm md:text-xl line-clamp-3 leading-relaxed md:leading-relaxed font-medium">
            Watch breaking news, live match updates, and your favorite shows from {featuredChannel.name} directly on your devices.
          </p>
        </div>

        <Button 
          size="lg"
          onClick={() => onWatchNow(featuredChannel)}
          className="w-fit h-11 md:h-14 px-6 md:px-8 rounded-xl md:rounded-2xl bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-700 hover:to-orange-600 border-none text-white font-bold text-sm md:text-lg shadow-xl shadow-red-600/20 transition-all hover:scale-105 active:scale-95 gap-2 md:gap-3"
        >
          <Play className="fill-current w-4 h-4 md:w-5 md:h-5" />
          Watch Live Now
        </Button>
      </div>

      {/* Abstract Shape Overlay */}
      <div className="absolute top-0 right-0 w-1/2 h-full hidden lg:block opacity-20 pointer-events-none">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] mix-blend-overlay" />
        <div className="w-full h-full bg-gradient-to-l from-primary/20 to-transparent skew-x-12 transform translate-x-1/4" />
      </div>
    </div>
  );
});
