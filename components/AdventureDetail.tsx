
import React from 'react';
import { Adventure } from '../types';
import { ClockIcon, TrashIcon, PencilIcon, PlayIcon } from './icons';

interface Props {
  adventure: Adventure;
  onEdit: () => void;
  onDelete: () => void;
  onStartRide: () => void;
}

const AdventureDetail: React.FC<Props> = ({ adventure, onEdit, onDelete, onStartRide }) => {
  return (
    <div className="flex flex-col bg-stone-900 max-h-[90vh] overflow-y-auto">
      <div className="relative h-72 sm:h-96 overflow-hidden">
        <img src={adventure.imageUrl} alt={adventure.title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-stone-900 via-stone-900/40 to-transparent" />
        <div className="absolute bottom-8 left-8 right-8">
          <div className="flex items-center gap-3 mb-3">
             <span className="bg-orange-500 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase">{adventure.difficulty}</span>
             {adventure.tags.map(t => <span key={t} className="text-stone-300 text-xs font-bold uppercase tracking-tighter">#{t}</span>)}
          </div>
          <h2 className="text-4xl sm:text-6xl font-black text-white italic uppercase tracking-tighter mb-4">{adventure.title}</h2>
          <div className="flex gap-6 text-sm font-bold text-stone-300 uppercase">
            <span className="flex items-center gap-2"><ClockIcon className="w-5 h-5 text-orange-500" /> {adventure.durationHours} h</span>
            <span className="flex items-center gap-2"><ClockIcon className="w-5 h-5 text-orange-500" /> {adventure.distanceKm} km</span>
          </div>
        </div>
      </div>

      <div className="p-8 md:p-12">
        <div className="flex justify-between items-start mb-12">
          <p className="text-xl text-stone-400 italic leading-relaxed max-w-2xl">"{adventure.description}"</p>
          <div className="flex gap-3">
            <button onClick={onEdit} className="p-3 bg-stone-800 rounded-xl text-stone-400 hover:text-white transition-all"><PencilIcon className="w-6 h-6" /></button>
            <button onClick={onDelete} className="p-3 bg-stone-800 rounded-xl text-stone-400 hover:text-red-500 transition-all"><TrashIcon className="w-6 h-6" /></button>
          </div>
        </div>

        <button 
          onClick={onStartRide}
          className="w-full bg-orange-600 hover:bg-orange-500 text-white py-5 rounded-2xl font-black italic uppercase text-xl flex items-center justify-center gap-4 transition-all active:scale-[0.98] shadow-2xl shadow-orange-900/40 mb-16"
        >
          <PlayIcon className="w-8 h-8" />
          START EXPEDICE
        </button>

        <div className="grid md:grid-cols-2 gap-16">
          <div>
            <h3 className="text-2xl font-black text-white mb-8 italic uppercase border-b border-orange-600 inline-block pb-2">Body trasy</h3>
            <div className="space-y-6">
              {adventure.waypoints.map((wp, i) => (
                <div key={i} className="flex items-center gap-4 group">
                  <div className="w-3 h-3 bg-orange-600 rounded-full group-hover:scale-150 transition-transform" />
                  <span className="text-lg font-bold text-stone-200">{wp}</span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-black text-white mb-8 italic uppercase border-b border-orange-600 inline-block pb-2">Itinerář / Briefing</h3>
            <div className="space-y-8">
              {adventure.briefingSteps.map((step, i) => (
                <div key={i} className="flex gap-5">
                  <span className="flex-shrink-0 w-10 h-10 rounded-2xl bg-stone-800 text-orange-500 font-black flex items-center justify-center text-lg">{i + 1}</span>
                  <p className="text-stone-400 leading-relaxed pt-2">{step}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdventureDetail;
