import { useEffect, useState } from 'react';
import { Channel } from '@/lib/types';
import { parseM3UPlaylist } from '@/lib/parseM3U';

export function useChannels() {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadChannels = async () => {
      try {
        setLoading(true);
        
        // Try to get from session storage first
        const cached = sessionStorage.getItem('iptv_channels_cache');
        if (cached) {
          const parsedChannels = JSON.parse(cached);
          if (isMounted) {
            setChannels(parsedChannels);
            setLoading(false);
          }
          return;
        }

        const parsedChannels = await parseM3UPlaylist();
        if (isMounted) {
          setChannels(parsedChannels);
          // Cache in session storage
          sessionStorage.setItem('iptv_channels_cache', JSON.stringify(parsedChannels));
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Failed to load channels');
          setChannels([]);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadChannels();

    return () => {
      isMounted = false;
    };
  }, []);

  return { channels, loading, error };
}
