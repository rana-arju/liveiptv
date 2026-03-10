'use client';

import { useEffect, useRef, useState } from 'react';
import { Channel } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Volume2, VolumeX, Maximize2, Play, Pause, RotateCcw, Scaling } from 'lucide-react';
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
  const MAX_RETRIES = 3;

  // Handle video playback
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying && channel) {
      video.play().catch(err => {
        setError('Failed to play stream');
      });
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
    const isM3U8 = channel.url.includes('.m3u8') || channel.url.includes('.m3u');

    // For HLS streams
    if (isM3U8 && typeof window !== 'undefined') {
      if ('fetch' in window) {
        setIsLoading(true);
        setError(null);
        
        // Simple HLS stream setup
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
      }
    } else {
      // For regular streams
      video.src = channel.url;
      video.crossOrigin = 'anonymous';
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
      className="relative w-full bg-black rounded-lg overflow-hidden group"
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      {/* Video Container */}
      <div className="relative w-full pt-[75%] md:pt-[56.25%] bg-black">
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
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/75 gap-4">
            <div className="text-center">
              <p className="text-white/80 mb-2">Stream Error</p>
              <p className="text-white/60 text-sm">{error}</p>
            </div>
            {retryCount < MAX_RETRIES && (
              <Button
                onClick={handleRetry}
                variant="outline"
                size="sm"
                className="gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                Retry
              </Button>
            )}
          </div>
        )}

        {/* Channel Info Overlay */}
        {channel && !error && (
          <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="flex items-start gap-3">
              {channel.logo && (
                <img
                  src={channel.logo}
                  alt={channel.name}
                  className="w-12 h-12 rounded object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              )}
              <div>
                <h3 className="text-white font-semibold">{channel.name}</h3>
                {channel.category && (
                  <p className="text-white/60 text-xs">{channel.category}</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Controls */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-4 space-y-2">
          {/* Progress placeholder */}
          <div className="h-1 bg-white/20 rounded-full overflow-hidden">
            <div className="h-full bg-primary w-0" />
          </div>

          {/* Controls Bar */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="ghost"
                onClick={onPlayPause}
                className="h-8 w-8 p-0 text-white hover:bg-white/20"
              >
                {isPlaying ? (
                  <Pause className="w-4 h-4" />
                ) : (
                  <Play className="w-4 h-4" />
                )}
              </Button>

              {/* Volume Control */}
              <div className="flex items-center gap-1">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={onMute}
                  className="h-8 w-8 p-0 text-white hover:bg-white/20"
                >
                  {isMuted ? (
                    <VolumeX className="w-4 h-4" />
                  ) : (
                    <Volume2 className="w-4 h-4" />
                  )}
                </Button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={isMuted ? 0 : volume}
                  onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
                  className="w-16 h-1 bg-white/20 rounded-full cursor-pointer"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="ghost"
                onClick={toggleObjectFit}
                className="h-8 px-2 text-[10px] text-white hover:bg-white/20 gap-1 uppercase font-bold"
                title="Toggle Aspect Ratio"
              >
                <Scaling className="w-4 h-4" />
                {objectFit}
              </Button>

              <Button
                size="sm"
                variant="ghost"
                onClick={handleFullscreen}
                className="h-8 w-8 p-0 text-white hover:bg-white/20"
              >
                <Maximize2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* No Channel Selected State */}
      {!channel && (
        <div className="w-full aspect-video flex items-center justify-center bg-gradient-to-br from-primary/10 to-accent/10 flex-col gap-2">
          <Play className="w-12 h-12 text-primary/50" />
          <p className="text-white/50">Select a channel to play</p>
        </div>
      )}
    </div>
  );
}
