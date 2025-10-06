
import React, { useState, useEffect } from 'react';
import type { PodcastEpisode, Show } from '../types';
import { getShows, getMissedShows } from '../services/radioApi';
import Loader from './Loader';
import PlayIcon from './icons/PlayIcon';
import ChevronLeftIcon from './icons/ChevronLeftIcon';

interface MissedShowsProps {
  onPlayEpisode: (episode: PodcastEpisode) => void;
}

const MissedShows: React.FC<MissedShowsProps> = ({ onPlayEpisode }) => {
  const [shows, setShows] = useState<Show[]>([]);
  const [selectedShow, setSelectedShow] = useState<Show | null>(null);
  const [episodes, setEpisodes] = useState<PodcastEpisode[]>([]);
  
  const [isShowsLoading, setIsShowsLoading] = useState(true);
  const [isEpisodesLoading, setIsEpisodesLoading] = useState(false);
  const [showsError, setShowsError] = useState<string | null>(null);
  const [episodesError, setEpisodesError] = useState<string | null>(null);

  useEffect(() => {
    const fetchShows = async () => {
      try {
        setIsShowsLoading(true);
        setShowsError(null);
        const fetchedShows = await getShows();
        setShows(fetchedShows);
      } catch (err) {
        console.error("Failed to load shows", err);
        setShowsError("Could not load shows.");
      } finally {
        setIsShowsLoading(false);
      }
    };
    fetchShows();
  }, []);
  
  useEffect(() => {
    if (!selectedShow) {
      setEpisodes([]); // Clear episodes when going back to show list
      return;
    }
    
    const fetchEpisodes = async () => {
      try {
        setIsEpisodesLoading(true);
        setEpisodesError(null);
        const fetchedEpisodes = await getMissedShows(selectedShow.feedUrl);
        setEpisodes(fetchedEpisodes);
      } catch (err) {
        console.error(`Failed to load episodes for ${selectedShow.title}`, err);
        setEpisodesError(`Could not load episodes for this show.`);
      } finally {
        setIsEpisodesLoading(false);
      }
    };
    fetchEpisodes();
  }, [selectedShow]);
  
  const FALLBACK_ART_URL = 'https://picsum.photos/100/100';

  // Main view for list of shows
  const renderShowsList = () => {
    if (isShowsLoading) {
      return <div className="flex justify-center py-8"><Loader /></div>;
    }
    if (showsError) {
      return <div className="text-center text-red-400 py-8">{showsError}</div>
    }
    if (shows.length === 0) {
      return <div className="text-center text-gray-500 py-8">No missed shows available.</div>;
    }
    return (
      <>
        <h2 className="text-xl font-bold text-gray-300 mb-4 text-center">Available Shows</h2>
        <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
          {shows.map((show) => (
            <div 
              key={show.id}
              onClick={() => setSelectedShow(show)}
              className="flex items-center bg-white/5 hover:bg-white/10 p-3 rounded-lg transition-colors duration-200 group cursor-pointer"
            >
              <img 
                src={show.art || FALLBACK_ART_URL} 
                alt={show.title}
                className="w-12 h-12 rounded-md mr-4 object-cover flex-shrink-0"
                onError={(e) => { e.currentTarget.src = FALLBACK_ART_URL; }}
              />
              <div className="flex-1 overflow-hidden">
                <p className="font-semibold text-white truncate">{show.title}</p>
              </div>
            </div>
          ))}
        </div>
      </>
    );
  }

  // View for selected show's episodes
  const renderEpisodesList = () => {
    if (!selectedShow) return null;

    const renderContent = () => {
      if (isEpisodesLoading) {
        return <div className="flex justify-center py-8"><Loader /></div>;
      }
      if (episodesError) {
        return <div className="text-center text-red-400 py-8">{episodesError}</div>;
      }
      if (episodes.length > 0) {
        return (
          <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
            {episodes.map((episode) => (
              <div key={episode.id} className="flex items-center bg-white/5 hover:bg-white/10 p-3 rounded-lg transition-colors duration-200 group">
                <img 
                  src={episode.art || FALLBACK_ART_URL} 
                  alt={episode.title}
                  className="w-12 h-12 rounded-md mr-4 object-cover flex-shrink-0"
                  onError={(e) => { e.currentTarget.src = FALLBACK_ART_URL; }}
                />
                <div className="flex-1 overflow-hidden">
                  <p className="font-semibold text-white truncate">{episode.title}</p>
                   <p className="text-sm text-gray-400 truncate">
                    {new Date(episode.published_at * 1000).toLocaleDateString()}
                  </p>
                </div>
                <button
                  onClick={() => onPlayEpisode(episode)}
                  className="ml-4 p-2 rounded-full text-gray-400 bg-white/10 hover:bg-blue-600 hover:text-white transition-colors"
                  aria-label={`Play ${episode.title}`}
                  title={`Play ${episode.title}`}
                >
                  <PlayIcon />
                </button>
              </div>
            ))}
          </div>
        );
      }
      return <div className="text-center text-gray-500 py-8">No episodes found for this show.</div>;
    };
    
    return (
      <>
        <div className="flex items-center mb-4">
          <button 
            onClick={() => setSelectedShow(null)}
            className="p-2 rounded-full hover:bg-white/10 transition-colors mr-2"
            aria-label="Back to shows"
          >
            <ChevronLeftIcon />
          </button>
          <h2 className="text-xl font-bold text-gray-300 truncate">{selectedShow.title}</h2>
        </div>
        {renderContent()}
      </>
    );
  }

  return (
    <div className="w-full max-w-md">
      {selectedShow ? renderEpisodesList() : renderShowsList()}
    </div>
  );
};

export default MissedShows;
