'use client';

import { useEffect, useRef, useState } from 'react';
import { Channel } from '@/lib/types';
import { Button } from '@/components/ui/button';
import {
  Volume2, VolumeX, Maximize2, Play, Pause,
  RotateCcw, Scaling, RefreshCw
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface LivePlayerProps {
  channel: Channel | null;
  isPlaying: boolean;
  volume: number;
  isMuted: boolean;
  onPlayPause: () => void;
  onVolumeChange: (volume: number) => void;
  onMute: () => void;
}

type ObjectFit = 'contain' | 'cover' | 'fill';

export function LivePlayer({
  channel,
  isPlaying,
  volume,
  isMuted,
  onPlayPause,
  onVolumeChange,
  onMute,
}: LivePlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [objectFit, setObjectFit] = useState<ObjectFit>('contain');

  // Mobile overlay: tap to show/hide controls
  const [showMobileControls, setShowMobileControls] = useState(true);
  const mobileControlsTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const MAX_RETRIES = 3;

  const autoHideMobileControls = () => {
    if (mobileControlsTimerRef.current) clearTimeout(mobileControlsTimerRef.current);
    setShowMobileControls(true);
    mobileControlsTimerRef.current = setTimeout(() => setShowMobileControls(false), 3500);
  };

  const handleVideoTap = () => {
    if (showMobileControls) {
      setShowMobileControls(false);
      if (mobileControlsTimerRef.current) clearTimeout(mobileControlsTimerRef.current);
    } else {
      autoHideMobileControls();
    }
  };

  // Auto-hide on mount / channel change
  useEffect(() => {
    if (channel) autoHideMobileControls();
    return () => { if (mobileControlsTimerRef.current) clearTimeout(mobileControlsTimerRef.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [channel?.id]);

  // Handle video playback
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (isPlaying && channel) {
      video.play().catch(() => setError('Failed to play stream'));
    } else {
      video.pause();
    }
  }, [isPlaying, channel]);

  // Handle volume
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.volume = isMuted ? 0 : volume;
  }, [volume, isMuted]);

  // Handle channel changes
  useEffect(() => {
    if (!channel || !videoRef.current) return;
    const video = videoRef.current;
    setIsLoading(true);
    setError(null);
    video.src = channel.url;
    video.crossOrigin = 'anonymous';
    if (isPlaying) {
      video.play().catch(() => {
        if (retryCount < MAX_RETRIES) {
          setRetryCount(prev => prev + 1);
        } else {
          setError('Stream unavailable');
        }
      });
    }
    setIsLoading(false);
  }, [channel, retryCount, isPlaying]);

  const handleFullscreen = async () => {
    try {
      if (!isFullscreen && containerRef.current) {
        await containerRef.current.requestFullscreen();
        setIsFullscreen(true);
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch (err) {
      console.log('[v0] Fullscreen error:', err);
    }
  };

  const toggleObjectFit = () => {
    setObjectFit(prev => {
      if (prev === 'contain') return 'cover';
      if (prev === 'cover') return 'fill';
      return 'contain';
    });
  };

  const handleRetry = () => {
    setRetryCount(0);
    setError(null);
    if (channel && videoRef.current) {
      videoRef.current.src = channel.url;
      videoRef.current.play().catch(() => setError('Failed to retry stream'));
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case ' ':
        e.preventDefault();
        onPlayPause();
        break;
      case 'f':
      case 'F':
        e.preventDefault();
        handleFullscreen();
        break;
      case 'm':
      case 'M':
        e.preventDefault();
        onMute();
        break;
      case 'ArrowUp':
        e.preventDefault();
        onVolumeChange(Math.min(1, volume + 0.1));
        break;
      case 'ArrowDown':
        e.preventDefault();
        onVolumeChange(Math.max(0, volume - 0.1));
        break;
      case 'z':
      case 'Z':
        e.preventDefault();
        toggleObjectFit();
        break;
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full bg-black overflow-hidden group"
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      {/* Video Container */}
      <div className="relative w-full pt-[80%] md:pt-[65%] bg-black">
        {/* Tap area for mobile control toggle */}
        <div
          className="absolute inset-0 z-10 md:hidden"
          onClick={handleVideoTap}
        />

        <video
          ref={videoRef}
          style={{ objectFit }}
          className="absolute inset-0 w-full h-full"
          crossOrigin="anonymous"
          onPlay={() => setError(null)}
          onError={() => {
            if (retryCount < MAX_RETRIES) {
              setRetryCount(prev => prev + 1);
            } else {
              setError('Stream unavailable');
            }
          }}
        />

        {/* Loading Spinner */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary" />
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/75 gap-4 z-20">
            <div className="text-center">
              <p className="text-white/80 mb-2">Stream Error</p>
              <p className="text-white/60 text-sm">{error}</p>
            </div>
            {retryCount < MAX_RETRIES && (
              <Button onClick={handleRetry} variant="outline" size="sm" className="gap-2">
                <RotateCcw className="w-4 h-4" />
                Retry
              </Button>
            )}
          </div>
        )}

        {/* Channel Info Overlay — desktop hover / mobile tap */}
        {channel && !error && (
          <div className={cn(
            "absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/60 to-transparent transition-opacity duration-200 z-20",
            "opacity-0 group-hover:opacity-100",
            showMobileControls ? "md:opacity-0 opacity-100" : "opacity-0",
          )}>
            <div className="flex items-start gap-3">
              {channel.logo && (
                <img
                  src={channel.logo}
                  alt={channel.name}
                  className="w-10 h-10 rounded object-cover"
                  onError={(e) => { e.currentTarget.style.display = 'none'; }}
                />
              )}
              <div>
                <div className="flex items-center gap-2">
                  <div className="px-1.5 py-0.5 bg-red-600 rounded text-[9px] font-black text-white uppercase tracking-widest animate-pulse">
                    LIVE
                  </div>
                  <h3 className="text-white font-bold text-sm">{channel.name}</h3>
                </div>
                {channel.category && (
                  <p className="text-white/60 text-xs uppercase tracking-wide">{channel.category}</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── DESKTOP Controls (hover) ── */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-4 space-y-2 z-20 hidden md:block">
          <div className="h-1 bg-white/20 rounded-full overflow-hidden">
            <div className="h-full bg-primary w-0" />
          </div>
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Button size="sm" variant="ghost" onClick={onPlayPause} className="h-8 w-8 p-0 text-white hover:bg-white/20">
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </Button>
              <div className="flex items-center gap-1">
                <Button size="sm" variant="ghost" onClick={onMute} className="h-8 w-8 p-0 text-white hover:bg-white/20">
                  {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </Button>
                <input
                  type="range" min="0" max="1" step="0.1"
                  value={isMuted ? 0 : volume}
                  onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
                  className="w-16 h-1 bg-white/20 rounded-full cursor-pointer"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="ghost" onClick={toggleObjectFit}
                className="h-8 px-2 text-[10px] text-white hover:bg-white/20 gap-1 uppercase font-bold" title="Toggle Aspect Ratio">
                <Scaling className="w-4 h-4" />
                {objectFit}
              </Button>
              <Button size="sm" variant="ghost" onClick={handleFullscreen} className="h-8 w-8 p-0 text-white hover:bg-white/20">
                <Maximize2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* ── MOBILE Controls (tap to show/hide) ── */}
        {channel && !error && (
          <div className={cn(
            "absolute inset-0 flex flex-col justify-end pointer-events-none transition-opacity duration-200 z-20 md:hidden",
            showMobileControls ? "opacity-100" : "opacity-0",
          )}>
            {/* gradient backdrop */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

            <div className="relative pointer-events-auto px-3 pb-3 space-y-2">
              {/* Channel name row */}
              <div className="flex items-center gap-1.5">
                <div className="px-1.5 py-0.5 bg-red-600 rounded text-[9px] font-black text-white uppercase tracking-widest animate-pulse flex-shrink-0">LIVE</div>
                <span className="text-white/90 text-xs font-semibold truncate">{channel.name}</span>
              </div>

              {/* Main controls: centered play + surrounding buttons */}
              <div className="flex items-center justify-between gap-2">
                {/* Left cluster: Reload + Mute */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => { e.stopPropagation(); handleRetry(); autoHideMobileControls(); }}
                    className="h-9 w-9 flex items-center justify-center rounded-full bg-white/15 active:bg-white/35 backdrop-blur-sm"
                    title="Reload stream"
                  >
                    <RefreshCw className="w-4 h-4 text-white" />
                  </button>

                  <button
                    onClick={(e) => { e.stopPropagation(); onMute(); autoHideMobileControls(); }}
                    className="h-9 w-9 flex items-center justify-center rounded-full bg-white/15 active:bg-white/35 backdrop-blur-sm"
                  >
                    {isMuted ? <VolumeX className="w-4 h-4 text-white" /> : <Volume2 className="w-4 h-4 text-white" />}
                  </button>

                  {/* Compact volume */}
                  <input
                    type="range" min="0" max="1" step="0.1"
                    value={isMuted ? 0 : volume}
                    onClick={(e) => e.stopPropagation()}
                    onChange={(e) => { onVolumeChange(parseFloat(e.target.value)); autoHideMobileControls(); }}
                    className="w-16 h-1 accent-white cursor-pointer"
                  />
                </div>

                {/* Center: Play / Pause (big) */}
                <button
                  onClick={(e) => { e.stopPropagation(); onPlayPause(); autoHideMobileControls(); }}
                  className="h-12 w-12 flex items-center justify-center rounded-full bg-white/25 active:bg-white/50 backdrop-blur-sm ring-2 ring-white/30 flex-shrink-0"
                >
                  {isPlaying
                    ? <Pause className="w-6 h-6 text-white" />
                    : <Play className="w-6 h-6 text-white fill-white" />}
                </button>

                {/* Right cluster: Aspect (icon-only) + Fullscreen */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => { e.stopPropagation(); toggleObjectFit(); autoHideMobileControls(); }}
                    className="h-9 w-9 flex items-center justify-center rounded-full bg-white/15 active:bg-white/35 backdrop-blur-sm"
                    title={`Aspect: ${objectFit}`}
                  >
                    <Scaling className="w-4 h-4 text-white" />
                  </button>

                  <button
                    onClick={(e) => { e.stopPropagation(); handleFullscreen(); autoHideMobileControls(); }}
                    className="h-9 w-9 flex items-center justify-center rounded-full bg-white/15 active:bg-white/35 backdrop-blur-sm"
                  >
                    <Maximize2 className="w-4 h-4 text-white" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* No Channel Selected State */}
      {!channel && (
        <div className="w-full pt-[80%] md:pt-[65%] relative bg-gradient-to-br from-primary/10 to-accent/10">
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
            <Play className="w-12 h-12 text-primary/50" />
            <p className="text-white/50">Select a channel to play</p>
          </div>
        </div>
      )}
    </div>
  );
}
