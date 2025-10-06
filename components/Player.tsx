import React, { useState, useEffect, useRef, useCallback } from 'react';
import { getNowPlaying, getSchedule } from '../services/radioApi';
import type { NowPlaying, ScheduleItem, PodcastEpisode } from '../types';
import Loader from './Loader';
import SongHistory from './SongHistory';
import UpcomingShows from './UpcomingShows';
import MissedShows from './MissedShows';
import { Tabs, Tab, TabPanel } from './Tabs';
import PlayIcon from './icons/PlayIcon';
import PauseIcon from './icons/PauseIcon';
import ListenersIcon from './icons/ListenersIcon';
import HistoryIcon from './icons/HistoryIcon';
import CalendarIcon from './icons/CalendarIcon';
import RssIcon from './icons/RssIcon';
import LiveIcon from './icons/LiveIcon';

interface OnDemandTrack {
  title: string;
  artist: string;
  art: string;
  url: string;
}

const Player: React.FC = () => {
  const [nowPlaying, setNowPlaying] = useState<NowPlaying | null>(null);
  const [schedule, setSchedule] = useState<ScheduleItem[]>([]);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isScheduleLoading, setIsScheduleLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentTrack, setCurrentTrack] = useState<OnDemandTrack | null>(null);

  const audioRef = useRef<HTMLAudioElement>(null);
  const isPlayingOnDemand = useRef(false);

  const fetchNowPlayingData = useCallback(async () => {
    try {
      const data = await getNowPlaying('etn-fm');
      setNowPlaying(data);
      if (!currentTrack) {
        // Pre-load the live stream URL if no on-demand track is active
        if (audioRef.current && audioRef.current.src !== data.station.listen_url) {
          audioRef.current.src = data.station.listen_url;
        }
      }
      setError(null);
    } catch (err) {
      setError('Failed to load station data. Please try again later.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [currentTrack]);

  const fetchScheduleData = useCallback(async () => {
    try {
      setIsScheduleLoading(true);
      const data = await getSchedule('etn-fm');
      const upcoming = data.filter(show => new Date(show.end) > new Date());
      setSchedule(upcoming);
    } catch (err) {
      console.error("Failed to load schedule", err);
    } finally {
      setIsScheduleLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNowPlayingData();
    fetchScheduleData();
    const interval = setInterval(fetchNowPlayingData, 15000);
    return () => clearInterval(interval);
  }, [fetchNowPlayingData, fetchScheduleData]);

  const playAudio = useCallback(() => {
    audioRef.current?.play().catch(e => {
      console.error("Audio play failed:", e);
      setIsPlaying(false);
    });
  }, []);

  const handlePlayEpisode = useCallback((episode: PodcastEpisode) => {
    const track: OnDemandTrack = {
      title: episode.title,
      artist: "Missed Show",
      art: episode.art,
      url: episode.media_url,
    };
    setCurrentTrack(track);
    isPlayingOnDemand.current = true;
    if (audioRef.current) {
      audioRef.current.src = track.url;
      playAudio();
      setIsPlaying(true);
    }
  }, [playAudio]);
  
  const handleListenLive = () => {
    if (!nowPlaying) return;

    isPlayingOnDemand.current = false;
    setCurrentTrack(null);

    if (audioRef.current) {
      if (audioRef.current.src !== nowPlaying.station.listen_url) {
        audioRef.current.src = nowPlaying.station.listen_url;
      }
      playAudio();
      setIsPlaying(true);
    }
  };

  const togglePlayPause = () => {
    if (!audioRef.current || !nowPlaying) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      // If playing on-demand track was paused, resume it.
      // Otherwise, play the live stream.
      if (isPlayingOnDemand.current && currentTrack) {
         if (audioRef.current.src !== currentTrack.url) {
           audioRef.current.src = currentTrack.url;
         }
      } else {
        // Switch to live stream
        isPlayingOnDemand.current = false;
        setCurrentTrack(null);
        if (audioRef.current.src !== nowPlaying.station.listen_url) {
          audioRef.current.src = nowPlaying.station.listen_url;
        }
      }
      playAudio();
      setIsPlaying(true);
    }
  };

  if (isLoading) {
    return <div className="h-screen flex items-center justify-center"><Loader /></div>;
  }

  if (error) {
    return <div className="h-screen flex items-center justify-center text-red-400 text-center p-4">{error}</div>;
  }

  if (!nowPlaying) {
    return <div className="h-screen flex items-center justify-center text-gray-400">No data available.</div>;
  }
  
  const { station, now_playing, listeners, song_history, is_online } = nowPlaying;
  const song = now_playing?.song;
  const FALLBACK_ART_URL = 'https://picsum.photos/500/500';

  const displayTitle = currentTrack?.title || song?.title || station.name;
  const displayArtist = currentTrack?.artist || song?.artist || "...";
  const displayArt = currentTrack?.art || song?.art || FALLBACK_ART_URL;

  return (
    <div className="w-full max-w-md mx-auto flex flex-col items-center">
      <audio ref={audioRef} preload="auto" />
      
      {currentTrack && (
        <div className="w-full mb-4">
          <button 
            onClick={handleListenLive}
            className="w-full bg-red-600 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2 hover:bg-red-700 transition-colors shadow-lg shadow-red-600/30"
          >
            <LiveIcon />
            <span>Listen Live</span>
          </button>
        </div>
      )}

      <div className="w-full aspect-square rounded-2xl shadow-2xl shadow-black/50 overflow-hidden mt-4 mb-6 transform hover:scale-105 transition-transform duration-500 ease-in-out">
        <img 
          src={displayArt} 
          alt={song?.album || displayTitle} 
          className="w-full h-full object-cover" 
          onError={(e) => { e.currentTarget.src = FALLBACK_ART_URL; }}
        />
      </div>

      <div className="text-center w-full px-2">
        <h1 className="text-2xl font-bold text-white truncate" title={displayTitle}>{displayTitle}</h1>
        <h2 className="text-lg text-gray-300 mt-1 truncate" title={displayArtist}>{displayArtist}</h2>
      </div>

      <div className="w-full mt-4 flex justify-between items-center text-gray-400 text-sm px-2">
        <span className="font-semibold">{station.name}</span>
        <div className="flex items-center">
          <ListenersIcon />
          <span className="ml-1.5">{listeners.current}</span>
        </div>
      </div>
      
      <div className="w-full h-2 bg-white/10 rounded-full mt-2 overflow-hidden">
         <div className={`h-full bg-blue-500 ${isPlaying ? 'animate-pulse' : ''}`} style={{width: '100%'}}></div>
      </div>

      <div className="my-8">
        <button 
          onClick={togglePlayPause}
          className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center text-white shadow-lg shadow-blue-600/30 transform hover:scale-110 focus:outline-none focus:ring-4 focus:ring-blue-500 focus:ring-opacity-50 transition-all duration-200"
          aria-label={isPlaying ? 'Pause' : 'Play'}
          disabled={!is_online && !currentTrack}
        >
          {isPlaying ? <PauseIcon /> : <PlayIcon />}
        </button>
      </div>
      
      {!is_online && !currentTrack && (
        <div className="bg-yellow-500/10 border border-yellow-500 text-yellow-300 p-3 rounded-lg mb-4 text-center text-sm">
          Station is currently offline.
        </div>
      )}
      
      <div className="w-full">
        <Tabs>
          <div className="flex justify-center border-b border-white/10 mb-4">
            <Tab index={0}><HistoryIcon /> History</Tab>
            <Tab index={1}><CalendarIcon /> Schedule</Tab>
            <Tab index={2}><RssIcon /> Missed Shows</Tab>
          </div>
          <TabPanel index={0}>
            <SongHistory history={song_history} />
          </TabPanel>
          <TabPanel index={1}>
            <UpcomingShows shows={schedule} isLoading={isScheduleLoading} />
          </TabPanel>
          <TabPanel index={2}>
            <MissedShows onPlayEpisode={handlePlayEpisode} />
          </TabPanel>
        </Tabs>
      </div>
    </div>
  );
};

export default Player;