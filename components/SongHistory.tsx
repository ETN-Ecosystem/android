import React from 'react';
import type { SongHistoryItem } from '../types';

interface SongHistoryProps {
  history: SongHistoryItem[];
}

const SongHistory: React.FC<SongHistoryProps> = ({ history }) => {
  if (!history || history.length === 0) {
    return null;
  }
  
  const FALLBACK_ART_URL = 'https://picsum.photos/100/100';

  // Filter out any history items that might be missing song data
  const validHistory = history.filter(item => item && item.song);

  return (
    <div className="w-full max-w-md">
      <h2 className="text-xl font-bold text-gray-300 mb-4 text-center">Recently Played</h2>
      <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
        {validHistory.map((item) => (
          <div key={item.sh_id} className="flex items-center bg-white/5 hover:bg-white/10 p-3 rounded-lg transition-colors duration-200">
            <img 
              src={item.song.art || FALLBACK_ART_URL} 
              alt={item.song.album || 'Album art'} 
              className="w-12 h-12 rounded-md mr-4 object-cover flex-shrink-0"
              onError={(e) => { e.currentTarget.src = FALLBACK_ART_URL; }}
            />
            <div className="flex-1 overflow-hidden">
              <p className="font-semibold text-white truncate">{item.song.title || 'Unknown Title'}</p>
              <p className="text-sm text-gray-400 truncate">{item.song.artist || 'Unknown Artist'}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SongHistory;
