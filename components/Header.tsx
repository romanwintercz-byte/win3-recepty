import React from 'react';
import { PlusIcon, LightBulbIcon, CalendarDaysIcon } from './icons';
import { Logo } from './Logo';

interface HeaderProps {
    onAddRecipe: () => void;
    onSearch: (query: string) => void;
    onOpenFridge: () => void;
    currentView: 'recipes' | 'planner';
    onSetView: (view: 'recipes' | 'planner') => void;
}

const Header: React.FC<HeaderProps> = ({ onAddRecipe, onSearch, onOpenFridge, currentView, onSetView }) => {
    return (
        <header className="bg-white shadow-md sticky top-0 z-20">
            <div className="container mx-auto px-4 py-4 md:px-8 flex flex-col md:flex-row justify-between items-center gap-4">
                <button onClick={() => onSetView('recipes')} className="flex items-center gap-3 text-2xl font-bold text-emerald-600 transition-transform hover:scale-105">
                    <Logo className="w-10 h-10 text-emerald-500"/>
                    <h1>Win3 Recepty</h1>
                </button>
                <div className="flex items-center gap-2 w-full md:w-auto">
                    {currentView === 'recipes' && (
                        <input
                            type="search"
                            placeholder="Hledat recepty nebo štítky..."
                            onChange={(e) => onSearch(e.target.value)}
                            className="w-full md:w-64 px-4 py-2 border border-stone-300 rounded-full focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
                        />
                    )}
                     <button 
                        onClick={() => onSetView('planner')}
                        className={`flex items-center gap-2 px-4 py-2 font-semibold rounded-full transition-colors shadow focus:outline-none focus:ring-2 focus:ring-offset-2 whitespace-nowrap ${
                            currentView === 'planner' 
                            ? 'bg-emerald-500 text-white focus:ring-emerald-500' 
                            : 'bg-stone-200 text-stone-700 hover:bg-stone-300 focus:ring-stone-400'
                        }`}
                        title="Týdenní plánovač"
                    >
                        <CalendarDaysIcon className="w-5 h-5" />
                        <span className="hidden sm:inline">Plánovač</span>
                    </button>
                     <button 
                        onClick={onOpenFridge}
                        className="flex items-center gap-2 px-4 py-2 bg-amber-400 text-white font-semibold rounded-full hover:bg-amber-500 transition-colors shadow focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 whitespace-nowrap"
                        title="Co uvařit z toho, co mám doma?"
                    >
                        <LightBulbIcon className="w-5 h-5" />
                        <span className="hidden sm:inline">Co uvařit?</span>
                    </button>
                    <button 
                        onClick={onAddRecipe}
                        className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white font-semibold rounded-full hover:bg-emerald-600 transition-colors shadow focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 whitespace-nowrap"
                    >
                        <PlusIcon className="w-5 h-5" />
                        <span className="hidden sm:inline">Přidat</span>
                    </button>
                </div>
            </div>
        </header>
    );
};

export default Header;
