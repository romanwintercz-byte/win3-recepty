
import React from 'react';
import { PlusIcon, LightBulbIcon, CalendarIcon } from './icons';

interface HeaderProps {
  onAddRecipe: () => void;
  onSearch: (q: string) => void;
  onOpenFridge: () => void;
  currentView: 'recipes' | 'planner';
  onSetView: (v: 'recipes' | 'planner') => void;
}

const Header: React.FC<HeaderProps> = ({ onAddRecipe, onSearch, onOpenFridge, currentView, onSetView }) => {
  return (
    <header className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-30 px-4 py-3 border-b border-stone-200">
      <div className="container mx-auto flex flex-wrap items-center justify-between gap-4">
        <div 
          className="flex items-center gap-2 cursor-pointer group" 
          onClick={() => onSetView('recipes')}
        >
          <div className="bg-emerald-600 p-2 rounded-xl text-white group-hover:scale-110 transition-transform">
            <PlusIcon className="w-6 h-6 rotate-45" />
          </div>
          <h1 className="text-xl font-bold text-stone-800 hidden sm:block">Win3 Recepty</h1>
        </div>

        <div className="flex-1 max-w-md">
          <input 
            type="text" 
            placeholder="Hledat v receptech..." 
            className="w-full px-4 py-2 bg-stone-100 border-none rounded-full focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
            onChange={(e) => onSearch(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={() => onSetView(currentView === 'recipes' ? 'planner' : 'recipes')}
            className={`p-2 rounded-full transition-colors ${currentView === 'planner' ? 'bg-emerald-100 text-emerald-700' : 'bg-stone-100 text-stone-600'}`}
            title="Týdenní plánovač"
          >
            <CalendarIcon className="w-6 h-6" />
          </button>
          <button 
            onClick={onOpenFridge}
            className="p-2 rounded-full bg-amber-100 text-amber-700 hover:bg-amber-200 transition-colors"
            title="Kouzelná lednička"
          >
            <LightBulbIcon className="w-6 h-6" />
          </button>
          <button 
            onClick={onAddRecipe}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-full font-medium flex items-center gap-2 transition-all active:scale-95 shadow-lg shadow-emerald-200"
          >
            <PlusIcon className="w-5 h-5" />
            <span className="hidden md:inline">Nový recept</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
