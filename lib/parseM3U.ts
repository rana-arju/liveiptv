import { Channel } from './types';

const M3U_URL = 'https://raw.githubusercontent.com/rana-arju/iptv/main/index.m3u';

interface M3UExtinfInfo {
  duration?: string;
  tvgId?: string;
  tvgName?: string;
  tvgLogo?: string;
  groupTitle?: string;
  tvgChno?: string;
  [key: string]: string | undefined;
}

function parseExtinf(extinf: string): { info: M3UExtinfInfo; name: string } {
  const parts = extinf.replace('#EXTINF:', '').split(',');
  const infoString = parts[0].trim();
  const name = parts.slice(1).join(',').trim();

  const info: M3UExtinfInfo = {
    duration: infoString.split(' ')[0] || '-1'
  };

  // Improved regex to handle attribute names with hyphens accurately
  const regex = /([\w-]+)="([^"]*)"/g;
  let match;

  while ((match = regex.exec(infoString)) !== null) {
    const key = match[1];
    // Map hyphenated keys to camelCase for the info object if needed, 
    // or keep them as is and handle mapping in the caller
    const camelKey = key.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
    info[camelKey] = match[2];
    
    // Also store the original key just in case
    if (camelKey !== key) {
      info[key] = match[2];
    }
  }

  return { info, name };
}

export async function parseM3UPlaylist(): Promise<Channel[]> {
  try {
    const response = await fetch(M3U_URL);
    if (!response.ok) {
      throw new Error(`Failed to fetch M3U: ${response.statusText}`);
    }

    const content = await response.text();
    const lines = content.split('\n').map(line => line.trim()).filter(Boolean);

    const channels: Map<string, Channel> = new Map();
    let currentChannelInfo: M3UExtinfInfo | null = null;
    let currentChannelName: string | null = null;

    for (const line of lines) {
      if (line.startsWith('#EXTINF:')) {
        const { info, name } = parseExtinf(line);
        currentChannelInfo = info;
        currentChannelName = name;
      } else if (line.startsWith('http') && currentChannelInfo && currentChannelName) {
        const url = line;
        const id = `${currentChannelName}-${url}`.replace(/\s+/g, '_');

        // Avoid duplicates by checking if channel with same name and URL exists
        const key = `${currentChannelName}|${url}`;
        if (!channels.has(key)) {
          channels.set(key, {
            id,
            name: currentChannelName,
            url,
            logo: currentChannelInfo.tvgLogo,
            category: currentChannelInfo.groupTitle || 'Uncategorized',
            groupTitle: currentChannelInfo.groupTitle,
          });
        }

        currentChannelInfo = null;
        currentChannelName = null;
      }
    }

    return Array.from(channels.values());
  } catch (error) {
    console.error('[v0] Error parsing M3U playlist:', error);
    return [];
  }
}

export function getCategories(channels: Channel[]): string[] {
  const categories = new Set<string>();
  channels.forEach(channel => {
    if (channel.category) {
      categories.add(channel.category);
    }
  });
  return Array.from(categories).sort();
}

export function filterChannels(
  channels: Channel[],
  searchQuery: string = '',
  category: string | null = null
): Channel[] {
  return channels.filter(channel => {
    const matchesSearch = searchQuery === '' || 
      channel.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = category === null || channel.category === category;
    return matchesSearch && matchesCategory;
  });
}

export interface CategoryInfo {
  name: string;
  count: number;
  logos: (string | undefined)[];
}

export function getCategoryStats(channels: Channel[]): CategoryInfo[] {
  const categoryMap = new Map<string, (string | undefined)[]>();

  channels.forEach(channel => {
    const category = channel.category || 'Uncategorized';
    if (!categoryMap.has(category)) {
      categoryMap.set(category, []);
    }
    const logos = categoryMap.get(category)!;
    if (logos.length < 3 && !logos.includes(channel.logo)) {
      logos.push(channel.logo);
    }
  });

  return Array.from(categoryMap.entries())
    .map(([name, logos]) => ({
      name,
      count: channels.filter(c => c.category === name).length,
      logos: logos.slice(0, 3),
    }))
    .sort((a, b) => b.count - a.count);
}
