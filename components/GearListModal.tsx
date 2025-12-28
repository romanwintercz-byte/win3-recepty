
import React, { useState, useEffect } from 'react';
import { Adventure, GearList } from '../types';
import { generateGearList } from '../services/geminiService';
import { SparklesIcon } from './icons';

interface Props {
  adventures: Adventure[];
}

const GearListModal: React.FC<Props> = ({ adventures }) => {
  const [list, setList] = useState<GearList | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (adventures.length === 0) {
        setLoading(false);
        return;
      }
      try {
        const res = await generateGearList(adventures);
        setList(res);
      } catch (e) {
        alert('Chyba při generování seznamu.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [adventures]);

  if (loading) {
    return (
      <div className="p-24 text-center bg-stone-950 min-h-[500px] flex flex-col items-center justify-center">
        <SparklesIcon className="w-16 h-16 text-orange-500 animate-pulse mb-8" />
        <h3 className="text-3xl font-black text-white italic uppercase tracking-tighter">Sestavuji výbavu...</h3>
        <p className="text-stone-500 mt-4 font-bold uppercase text-[10px] tracking-widest">AI analyzuje trasy a vybírá nářadí a oblečení</p>
      </div>
    );
  }

  if (!list || list.length === 0) {
    return (
      <div className="p-24 text-center text-stone-500 bg-stone-950">
        <p className="italic text-xl">V plánu nejsou žádné vyjížďky. Napřed si naplánuj trasu v kalendáři.</p>
      </div>
    );
  }

  return (
    <div className="p-10 md:p-16 max-h-[85vh] overflow-y-auto bg-stone-950 text-stone-200">
      <div className="flex items-center gap-6 mb-12">
        <div className="bg-orange-600 p-4 rounded-3xl text-white shadow-lg shadow-orange-900/40">
          <SparklesIcon className="w-10 h-10" />
        </div>
        <div>
          <h2 className="text-4xl font-black text-white italic uppercase tracking-tighter">Seznam výbavy</h2>
          <p className="text-stone-500 font-bold uppercase text-[10px] tracking-widest mt-1">Doporučení pro tvé naplánované expedice</p>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-8">
        {list.map(cat => (
          <div key={cat.category} className="bg-stone-900/50 rounded-[40px] p-8 border border-stone-800 shadow-xl">
            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-orange-500 mb-6 border-b border-stone-800 pb-4 italic">{cat.category}</h4>
            <ul className="space-y-4">
              {cat.items.map((item, idx) => (
                <li key={idx} className="flex justify-between items-center group">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-stone-700 rounded-full group-hover:bg-orange-600 transition-colors" />
                    <span className="text-sm font-bold text-stone-300 group-hover:text-white transition-colors">{item.name}</span>
                  </div>
                  <span className="text-[10px] font-black uppercase italic text-stone-500 bg-stone-800 px-3 py-1 rounded-lg border border-stone-700">{item.quantity}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="mt-16 flex justify-center">
        <button 
          onClick={() => window.print()}
          className="bg-white text-stone-900 px-12 py-4 rounded-2xl font-black italic uppercase text-lg hover:bg-orange-500 hover:text-white transition-all active:scale-95 shadow-2xl"
        >
          Vytisknout Checklist
        </button>
      </div>
    </div>
  );
};

export default GearListModal;
