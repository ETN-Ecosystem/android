
import React from 'react';
import Player from './components/Player';

const App: React.FC = () => {
  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-800 to-black text-white font-sans flex flex-col items-center">
      <div className="w-full h-full p-4">
        <Player />
      </div>
    </main>
  );
};

export default App;
