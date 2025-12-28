
import React from 'react';
import { PlusIcon, LightBulbIcon, CalendarIcon } from './icons';

interface HeaderProps {
  onAdd: () => void;
  onSearch: (q: string) => void;
  onOpenGarage: () => void;
  currentView: 'explore' | 'planner';
  onSetView: (v: 'explore' | 'planner') => void;
}

const Header: React.FC<HeaderProps> = ({ onAdd, onSearch, onOpenGarage, currentView, onSetView }) => {
  return (
    <header className="bg-stone-900/90 backdrop-blur-md shadow-2xl sticky top-0 z-30 px-4 py-4 border-b border-stone-800">
      <div className="container mx-auto flex flex-wrap items-center justify-between gap-4">
        <div 
          className="flex items-center gap-3 cursor-pointer group" 
          onClick={() => onSetView('explore')}
        >
          <div className="bg-orange-600 p-2 rounded-xl text-white group-hover:rotate-12 transition-transform shadow-lg shadow-orange-900/40">
            <PlusIcon className="w-6 h-6 rotate-45" />
          </div>
          <h1 className="text-xl font-black tracking-tighter text-white uppercase italic">Win3 Motoraid</h1>
        </div>

        <div className="flex-1 max-w-md">
          <input 
            type="text" 
            placeholder="Hledat cesty, tagy..." 
            className="w-full px-5 py-2.5 bg-stone-800 border border-stone-700 rounded-full focus:ring-2 focus:ring-orange-500 outline-none transition-all text-sm text-stone-100 placeholder-stone-500"
            onChange={(e) => onSearch(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => onSetView('planner')}
            className={`p-2.5 rounded-xl transition-all ${currentView === 'planner' ? 'bg-orange-600 text-white shadow-lg shadow-orange-900/30' : 'bg-stone-800 text-stone-400 hover:text-white'}`}
            title="Plánovač tras"
          >
            <CalendarIcon className="w-6 h-6" />
          </button>
          <button 
            onClick={onOpenGarage}
            className="p-2.5 rounded-xl bg-indigo-600 text-white hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-900/30"
            title="Kouzelná garáž"
          >
            <LightBulbIcon className="w-6 h-6" />
          </button>
          <button 
            onClick={onAdd}
            className="bg-white text-stone-900 px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-orange-500 hover:text-white transition-all active:scale-95"
          >
            <PlusIcon className="w-5 h-5" />
            <span className="hidden md:inline">Naplánovat trasu</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
