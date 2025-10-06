import type { NowPlaying, ScheduleItem, Show, PodcastEpisode } from '../types';

const API_BASE_URL = 'https://radio.etnecosystem.org/api';

export const getNowPlaying = async (stationId: string = 'etn-fm'): Promise<NowPlaying> => {
  try {
    const response = await fetch(`${API_BASE_URL}/nowplaying/${stationId}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    
    // API can return a single object or an array with one object. This handles both.
    if (Array.isArray(data)) {
      if (data.length === 0) {
        throw new Error('API returned an empty array for now playing data.');
      }
      return data[0] as NowPlaying;
    }

    return data as NowPlaying;
  } catch (error) {
    console.error("Failed to fetch now playing data:", error);
    throw error;
  }
};

export const getSchedule = async (stationId: string = 'etn-fm'): Promise<ScheduleItem[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/station/${stationId}/schedule`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data as ScheduleItem[];
  } catch (error) {
    console.error("Failed to fetch schedule data:", error);
    throw error;
  }
};

const SHOW_FEEDS = [
  'https://radio.etnecosystem.org/public/1/podcast/1f06b4d1-b84e-6444-b0f1-512f08c41f80/feed', // ETN Music Show
  'https://radio.etnecosystem.org/public/1/podcast/1f05df56-7a2a-6718-8c41-9bd9fba24f10/feed', // ETN Talk Show
  'https://radio.etnecosystem.org/public/1/podcast/1f06b4c2-33ff-6bfc-b3ed-fb52da87aa40/feed'  // ETN-FM Public Feed
];

const fetchAndParseFeed = async (feedUrl: string): Promise<Document> => {
  const PROXIED_URL = `https://corsproxy.io/?${encodeURIComponent(feedUrl)}`;
  const response = await fetch(PROXIED_URL);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  const xmlText = await response.text();
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlText, 'application/xml');

  const errorNode = xmlDoc.querySelector('parsererror');
  if (errorNode) {
    throw new Error(`Failed to parse RSS feed XML for ${feedUrl}.`);
  }
  return xmlDoc;
};

export const getShows = async (): Promise<Show[]> => {
  try {
    const showPromises = SHOW_FEEDS.map(async (feedUrl) => {
      const xmlDoc = await fetchAndParseFeed(feedUrl);
      const channel = xmlDoc.querySelector('channel');
      if (!channel) throw new Error(`Could not find channel in feed ${feedUrl}`);
      
      const title = channel.querySelector('title')?.textContent ?? 'Untitled Show';
      const description = channel.querySelector('description')?.textContent ?? '';
      const artNode = channel.querySelector('itunes\\:image, image');
      const art = artNode?.getAttribute('href') ?? artNode?.querySelector('url')?.textContent ?? '';

      return {
        id: feedUrl, // Use URL as unique ID
        title,
        description,
        art,
        feedUrl,
      };
    });
    return await Promise.all(showPromises);
  } catch (error) {
    console.error("Failed to fetch shows:", error);
    throw error;
  }
};

export const getMissedShows = async (feedUrl: string): Promise<PodcastEpisode[]> => {
  try {
    const xmlDoc = await fetchAndParseFeed(feedUrl);
    const items = Array.from(xmlDoc.querySelectorAll('item'));
    const episodes: PodcastEpisode[] = items.map(item => {
      const guid = item.querySelector('guid')?.textContent ?? String(Math.random());
      const title = item.querySelector('title')?.textContent ?? 'Untitled Episode';
      const link = item.querySelector('link')?.textContent ?? '';
      const pubDate = item.querySelector('pubDate')?.textContent ?? '';
      const mediaUrl = item.querySelector('enclosure')?.getAttribute('url') ?? '';
      
      const artNode = item.querySelector('itunes\\:image, image');
      const art = artNode?.getAttribute('href') ?? '';

      return {
        id: guid,
        title,
        link,
        explicit: false,
        published_at: pubDate ? new Date(pubDate).getTime() / 1000 : 0,
        media_url: mediaUrl,
        art,
      };
    });

    return episodes;

  } catch (error) {
    console.error(`Failed to fetch or parse episodes from ${feedUrl}:`, error);
    throw error;
  }
};
