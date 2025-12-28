
import React from 'react';
import { Adventure } from '../types';
import { ClockIcon, MapIcon, SparklesIcon } from './icons';

interface Props {
  adventures: Adventure[];
  onSelect: (id: string) => void;
}

// Utility to wrap MapIcon if missing
const LocationIcon = (props: any) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
  </svg>
);

const AdventureList: React.FC<Props> = ({ adventures, onSelect }) => {
  if (adventures.length === 0) {
    return (
      <div className="text-center py-20 opacity-40">
        <SparklesIcon className="w-12 h-12 mx-auto mb-4" />
        <p className="text-lg">Žádné trasy k objevování.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
      {adventures.map(adv => (
        <div 
          key={adv.id}
          onClick={() => onSelect(adv.id)}
          className="bg-stone-900 rounded-[32px] overflow-hidden shadow-xl hover:shadow-orange-900/20 transition-all cursor-pointer border border-stone-800 flex flex-col group relative"
        >
          <div className="relative aspect-video overflow-hidden">
            <img 
              src={adv.imageUrl || 'https://picsum.photos/seed/ride/800/450'} 
              alt={adv.title}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-stone-900 via-transparent to-transparent opacity-80" />
            <div className="absolute top-4 left-4 flex gap-2">
              <span className={`px-3 py-1 text-[10px] font-black uppercase rounded-lg shadow-lg ${
                adv.difficulty === 'Expert' ? 'bg-red-600 text-white' : 
                adv.difficulty === 'Střední' ? 'bg-orange-500 text-white' : 'bg-emerald-500 text-white'
              }`}>
                {adv.difficulty}
              </span>
            </div>
          </div>
          <div className="p-6">
            <h3 className="text-xl font-bold text-white mb-2 group-hover:text-orange-500 transition-colors">{adv.title}</h3>
            <p className="text-stone-400 text-sm mb-6 line-clamp-2 italic leading-relaxed">"{adv.description}"</p>
            <div className="flex items-center justify-between text-stone-500 text-xs font-bold uppercase tracking-widest border-t border-stone-800 pt-4">
              <div className="flex items-center gap-2">
                <ClockIcon className="w-4 h-4 text-orange-500" />
                <span>{adv.durationHours} h</span>
              </div>
              <div className="flex items-center gap-2">
                <LocationIcon className="w-4 h-4 text-orange-500" />
                <span>{adv.distanceKm} km</span>
              </div>
              <div className="flex gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className={`w-1.5 h-1.5 rounded-full ${i < adv.rating ? 'bg-orange-500' : 'bg-stone-700'}`} />
                ))}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default AdventureList;
