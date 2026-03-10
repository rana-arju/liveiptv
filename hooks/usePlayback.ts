import { useCallback, useState } from 'react';
import { PlaybackState } from '@/lib/types';

const DEFAULT_STATE: PlaybackState = {
  currentChannelId: null,
  isPlaying: false,
  volume: 0.8,
  isMuted: false,
};

export function usePlayback() {
  const [state, setState] = useState<PlaybackState>(DEFAULT_STATE);

  const playChannel = useCallback((channelId: string) => {
    setState(prev => ({
      ...prev,
      currentChannelId: channelId,
      isPlaying: true,
    }));
  }, []);

  const pauseChannel = useCallback(() => {
    setState(prev => ({
      ...prev,
      isPlaying: false,
    }));
  }, []);

  const togglePlayPause = useCallback(() => {
    setState(prev => ({
      ...prev,
      isPlaying: !prev.isPlaying,
    }));
  }, []);

  const setVolume = useCallback((volume: number) => {
    setState(prev => ({
      ...prev,
      volume: Math.max(0, Math.min(1, volume)),
      isMuted: volume === 0,
    }));
  }, []);

  const toggleMute = useCallback(() => {
    setState(prev => ({
      ...prev,
      isMuted: !prev.isMuted,
    }));
  }, []);

  return {
    ...state,
    playChannel,
    pauseChannel,
    togglePlayPause,
    setVolume,
    toggleMute,
  };
}
