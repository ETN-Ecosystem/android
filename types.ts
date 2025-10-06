
export interface Song {
  id: string;
  text: string;
  artist: string;
  title: string;
  album: string;
  genre: string;
  lyrics: string;
  art: string;
}

export interface NowPlayingCurrentSong {
  sh_id: number;
  played_at: number;
  duration: number;
  playlist: string;
  streamer: string;
  is_request: boolean;
  song: Song;
}

export interface SongHistoryItem extends NowPlayingCurrentSong {}

export interface StationListener {
  total: number;
  unique: number;
  current: number;
}

export interface Station {
  id: number;
  name: string;
  shortcode: string;
  description: string;
  frontend: string;
  backend: string;
  listen_url: string;
  url: string;
  is_public: boolean;
}

export interface Live {
  is_live: boolean;
  streamer_name: string;
  broadcast_start: number | null;
  art: string | null;
}

export interface ScheduleItem {
  id: number;
  start: string;
  end: string;
  title: string;
  description: string;
  is_now: boolean;
}

export interface NowPlaying {
  station: Station;
  listeners: StationListener;
  live: Live;
  now_playing: NowPlayingCurrentSong;
  playing_next: NowPlayingCurrentSong | null;
  song_history: SongHistoryItem[];
  is_online: boolean;
  cache: any | null;
}

export interface Show {
  id: string;
  title: string;
  description: string;
  art: string;
  feedUrl: string;
}

export interface PodcastEpisode {
  id: string;
  title: string;
  link: string;
  explicit: boolean;
  published_at: number;
  media_url: string;
  art: string;
}
