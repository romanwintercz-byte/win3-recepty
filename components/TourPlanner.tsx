
import React from 'react';
import { Adventure, TourPlan, DayOfWeek, RideType } from '../types';
import { CalendarIcon, TrashIcon, SparklesIcon } from './icons';

interface Props {
  adventures: Adventure[];
  plan: TourPlan;
  onUpdate: (day: DayOfWeek, ride: RideType, id: string | null) => void;
  onOpenGear: () => void;
}

const DAYS: Record<DayOfWeek, string> = {
  monday: 'Pondělí', tuesday: 'Úterý', wednesday: 'Středa', thursday: 'Čtvrtek',
  friday: 'Pátek', saturday: 'Sobota', sunday: 'Neděle'
};

const TourPlanner: React.FC<Props> = ({ adventures, plan, onUpdate, onOpenGear }) => {
  return (
    <div className="max-w-7xl mx-auto py-8">
      <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6 bg-stone-900/50 p-8 rounded-[40px] border border-stone-800/50 backdrop-blur-sm">
        <div className="flex items-center gap-6">
          <div className="bg-orange-600 p-4 rounded-3xl text-white shadow-lg shadow-orange-900/40">
            <CalendarIcon className="w-10 h-10" />
          </div>
          <div>
            <h2 className="text-4xl font-black text-white italic uppercase tracking-tighter">Tour Planner</h2>
            <p className="text-stone-500 font-bold uppercase text-[10px] tracking-widest mt-1">Uspořádej si své vyjížďky na celý týden</p>
          </div>
        </div>
        <button 
          onClick={onOpenGear}
          className="bg-indigo-600 hover:bg-indigo-500 text-white px-10 py-4 rounded-2xl font-black italic uppercase text-lg transition-all active:scale-95 shadow-xl shadow-indigo-900/30 flex items-center gap-3"
        >
          <SparklesIcon className="w-6 h-6" />
          Seznam výbavy
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-5">
        {(Object.keys(DAYS) as DayOfWeek[]).map(day => (
          <div key={day} className="bg-stone-900 rounded-[32px] p-6 shadow-2xl border border-stone-800 flex flex-col group hover:border-orange-900/50 transition-colors">
            <h3 className="text-xs font-black text-orange-500 mb-8 uppercase tracking-[0.2em] italic">{DAYS[day]}</h3>
            
            <div className="space-y-8 flex-1">
              {(['short', 'long'] as RideType[]).map(type => {
                const rideId = plan[day]?.[type];
                const adventure = adventures.find(a => a.id === rideId);

                return (
                  <div key={type}>
                    <label className="text-[10px] font-black text-stone-600 uppercase block mb-3 tracking-widest">{type === 'short' ? 'Dopolední trip' : 'Hlavní jízda'}</label>
                    {adventure ? (
                      <div className="relative group rounded-2xl bg-stone-800 p-4 border border-stone-700 hover:border-orange-500/50 transition-all">
                        <p className="text-xs font-black text-white italic uppercase leading-tight pr-6">{adventure.title}</p>
                        <p className="text-[10px] text-stone-500 mt-2">{adventure.distanceKm} km</p>
                        <button 
                          onClick={() => onUpdate(day, type, null)}
                          className="absolute top-2 right-2 text-stone-600 hover:text-red-500 transition-colors"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <select 
                        className="w-full bg-stone-800 border-none rounded-xl p-3 text-[10px] font-bold text-stone-500 outline-none focus:ring-2 focus:ring-orange-600 cursor-pointer uppercase italic"
                        onChange={(e) => onUpdate(day, type, e.target.value)}
                        value=""
                      >
                        <option value="">Zvolit trasu...</option>
                        {adventures.map(a => <option key={a.id} value={a.id}>{a.title}</option>)}
                      </select>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-20 bg-gradient-to-br from-indigo-900 to-stone-900 rounded-[48px] p-12 text-white relative overflow-hidden border border-indigo-500/20 shadow-2xl">
        <div className="relative z-10">
          <h3 className="text-3xl font-black mb-6 italic uppercase flex items-center gap-4">
            <SparklesIcon className="w-10 h-10 text-orange-500" />
            Váš plán, naše starost
          </h3>
          <p className="max-w-xl opacity-60 font-medium leading-relaxed mb-10 text-lg">Po sestavení plánu stačí kliknout na "Seznam výbavy" a AI vám vygeneruje přehledný checklist nářadí, oblečení a doplňků na základě náročnosti vybraných tras.</p>
        </div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-orange-600/10 rounded-full blur-[120px] -mr-32 -mt-32" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-600/10 rounded-full blur-[80px] -ml-20 -mb-20" />
      </div>
    </div>
  );
};

export default TourPlanner;
