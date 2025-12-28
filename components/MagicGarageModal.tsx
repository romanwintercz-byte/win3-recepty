
import React, { useState } from 'react';
import { Adventure, AdventureSuggestionResult, SourceType } from '../types';
import { suggestRideFromContext, generateAdventureImage } from '../services/geminiService';
import { SparklesIcon, PlusIcon, PhotoIcon } from './icons';

interface Props {
  allAdventures: Adventure[];
  onSave: (a: Adventure) => void;
  onSelect: (id: string) => void;
}

const MagicGarageModal: React.FC<Props> = ({ allAdventures, onSave, onSelect }) => {
  const [context, setContext] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AdventureSuggestionResult | null>(null);
  const [imgUrl, setImgUrl] = useState<string | null>(null);

  const handleSuggest = async () => {
    if (!context.trim()) return;
    setLoading(true);
    try {
      const res = await suggestRideFromContext(context, allAdventures);
      setResult(res);
      if (res.newAdventureSuggestion) {
        const url = await generateAdventureImage(res.newAdventureSuggestion.title);
        setImgUrl(url);
      }
    } catch (e) {
      alert('AI teď stávkuje.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 md:p-12 bg-stone-950">
      <div className="text-center mb-12">
        <div className="inline-block p-5 bg-indigo-600 rounded-[32px] text-white mb-6 shadow-xl shadow-indigo-900/20">
          <SparklesIcon className="w-12 h-12" />
        </div>
        <h2 className="text-4xl font-black text-white italic uppercase tracking-tighter">Kouzelná garáž</h2>
        <p className="text-stone-500 mt-3 max-w-md mx-auto">Napiš kam chceš jet nebo co máš za stroj, AI navrhne ideální trip.</p>
      </div>

      <div className="mb-12">
        <textarea 
          placeholder="Např.: Mám Hondu Africa Twin a chci jet na prodloužený víkend někam do hor, kde jsou šotoliny..."
          className="w-full bg-stone-900 border border-stone-800 rounded-[32px] p-8 text-xl focus:ring-4 focus:ring-indigo-600 outline-none min-h-[160px] text-white placeholder-stone-700"
          value={context}
          onChange={(e) => setContext(e.target.value)}
        />
        <button 
          onClick={handleSuggest}
          disabled={loading || !context.trim()}
          className="w-full mt-6 bg-indigo-600 hover:bg-indigo-500 text-white py-5 rounded-2xl font-black italic uppercase text-lg transition-all active:scale-[0.98] disabled:opacity-50 shadow-2xl shadow-indigo-900/30"
        >
          {loading ? 'ANALYZUJI TERÉN...' : 'VYGENEROVAT DOBRODRUŽSTVÍ'}
        </button>
      </div>

      {result && (
        <div className="space-y-8 animate-in slide-in-from-bottom-8 duration-500">
          {result.matchedAdventureIds.length > 0 && (
            <div>
              <h3 className="text-xs font-black uppercase text-stone-600 mb-6 tracking-widest">Podobné trasy v tvém seznamu:</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {result.matchedAdventureIds.map(id => {
                  const a = allAdventures.find(x => x.id === id);
                  if (!a) return null;
                  return (
                    <div key={id} onClick={() => onSelect(id)} className="p-5 bg-stone-900 border border-stone-800 rounded-2xl cursor-pointer hover:border-indigo-500 transition-all flex items-center justify-between">
                      <span className="font-bold text-stone-200">{a.title}</span>
                      <span className="text-[10px] text-indigo-500 font-black uppercase italic">Zobrazit</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {result.newAdventureSuggestion && (
            <div className="bg-stone-900 p-8 rounded-[40px] border border-stone-800 relative overflow-hidden">
               <div className="flex flex-col md:flex-row gap-8 items-center">
                  <div className="w-full md:w-1/3 aspect-video rounded-3xl overflow-hidden bg-stone-800 flex items-center justify-center">
                    {imgUrl ? <img src={imgUrl} className="w-full h-full object-cover" /> : <PhotoIcon className="w-12 h-12 text-stone-700" />}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-3xl font-black text-white italic uppercase tracking-tighter">{result.newAdventureSuggestion.title}</h3>
                      <button 
                        onClick={() => {
                          onSave({...result.newAdventureSuggestion!, id: Date.now().toString(), sourceType: SourceType.AI_GENERATED, rating: 0, imageUrl: imgUrl || ''});
                          alert('Přidáno do tvých expedic!');
                        }}
                        className="bg-white text-stone-900 px-6 py-2 rounded-full text-xs font-black uppercase italic hover:bg-orange-500 hover:text-white transition-all"
                      >
                        Uložit výlet
                      </button>
                    </div>
                    <p className="text-stone-400 text-sm leading-relaxed italic">"{result.newAdventureSuggestion.description}"</p>
                  </div>
               </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MagicGarageModal;
