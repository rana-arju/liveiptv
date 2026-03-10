export interface Channel {
  id: string;
  name: string;
  url: string;
  logo?: string;
  category?: string;
  groupTitle?: string;
}

export interface PlaybackState {
  currentChannelId: string | null;
  isPlaying: boolean;
  volume: number;
  isMuted: boolean;
}

export interface FilterState {
  searchQuery: string;
  selectedCategory: string | null;
  sortBy: 'name' | 'recent' | 'favorites';
}
