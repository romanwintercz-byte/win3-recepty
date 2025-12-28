
import React, { useState, useEffect } from 'react';
import { Adventure, SourceType } from '../types';
import { SparklesIcon, XMarkIcon, PlusIcon, TrashIcon } from './icons';
import { extractAdventureFromText } from '../services/geminiService';

interface Props {
  editing?: Adventure | null;
  onSave: (a: Adventure) => void;
  onClose: () => void;
}

const AdventureForm: React.FC<Props> = ({ editing, onSave, onClose }) => {
  const [formData, setFormData] = useState<Omit<Adventure, 'id' | 'rating'>>({
    title: '',
    description: '',
    imageUrl: '',
    sourceType: SourceType.MANUAL,
    waypoints: [''],
    briefingSteps: [''],
    difficulty: 'Střední',
    tags: [],
    distanceKm: 0,
    durationHours: 0
  });
  const [importText, setImportText] = useState('');
  const [isImporting, setIsImporting] = useState(false);

  useEffect(() => {
    if (editing) {
      const { id, rating, ...rest } = editing;
      setFormData(rest);
    }
  }, [editing]);

  const handleAIImport = async () => {
    if (!importText.trim()) return;
    setIsImporting(true);
    try {
      const result = await extractAdventureFromText(importText);
      setFormData(prev => ({
        ...prev,
        ...result,
        sourceType: SourceType.AI_IMPORTED
      }));
      setImportText('');
    } catch (e) {
      alert('Chyba při importu AI.');
    } finally {
      setIsImporting(false);
    }
  };

  const updateList = (field: 'waypoints' | 'briefingSteps', index: number, value: string) => {
    const next = [...formData[field]];
    next[index] = value;
    setFormData(prev => ({ ...prev, [field]: next }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      id: editing?.id || Date.now().toString(),
      rating: editing?.rating || 0,
      waypoints: formData.waypoints.filter(i => i.trim()),
      briefingSteps: formData.briefingSteps.filter(i => i.trim()),
    } as Adventure);
  };

  return (
    <div className="p-6 md:p-10 max-h-[85vh] overflow-y-auto bg-stone-900 text-stone-200">
      <h2 className="text-3xl font-black italic uppercase text-white mb-8 border-b-2 border-orange-600 inline-block">
        {editing ? 'Upravit trasu' : 'Nová expedice'}
      </h2>

      <div className="mb-10 bg-indigo-900/20 p-6 rounded-[32px] border border-indigo-500/30">
        <div className="flex items-center gap-2 mb-4 text-indigo-400 font-bold uppercase italic text-sm">
          <SparklesIcon className="w-5 h-5" />
          <h3>AI Import itineráře</h3>
        </div>
        <textarea 
          placeholder="Vložte text s popisem trasy, body zájmu nebo poznámky z webu..."
          className="w-full bg-stone-800 border-none rounded-2xl p-4 text-sm focus:ring-2 focus:ring-indigo-500 outline-none h-24 text-white"
          value={importText}
          onChange={(e) => setImportText(e.target.value)}
        />
        <button 
          type="button"
          onClick={handleAIImport}
          disabled={isImporting}
          className="mt-3 bg-indigo-600 text-white px-6 py-2 rounded-xl text-xs font-black uppercase italic hover:bg-indigo-500 disabled:opacity-50 transition-all shadow-lg shadow-indigo-900/40"
        >
          {isImporting ? 'Analyzuji...' : 'Extrahovat data'}
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div>
              <label className="block text-[10px] font-black uppercase text-stone-500 mb-2 tracking-widest">Název dobrodružství</label>
              <input 
                required
                className="w-full bg-stone-800 border border-stone-700 rounded-xl p-4 focus:ring-2 focus:ring-orange-500 outline-none text-white"
                value={formData.title}
                onChange={e => setFormData(p => ({ ...p, title: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase text-stone-500 mb-2 tracking-widest">Krátký popis</label>
              <textarea 
                className="w-full bg-stone-800 border border-stone-700 rounded-xl p-4 focus:ring-2 focus:ring-orange-500 outline-none h-24 text-white"
                value={formData.description}
                onChange={e => setFormData(p => ({ ...p, description: e.target.value }))}
              />
            </div>
          </div>
          <div className="space-y-6">
            <div>
              <label className="block text-[10px] font-black uppercase text-stone-500 mb-2 tracking-widest">URL titulní fotky</label>
              <input 
                className="w-full bg-stone-800 border border-stone-700 rounded-xl p-4 focus:ring-2 focus:ring-orange-500 outline-none text-white"
                value={formData.imageUrl}
                onChange={e => setFormData(p => ({ ...p, imageUrl: e.target.value }))}
                placeholder="https://images.unsplash.com/..."
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-[10px] font-black uppercase text-stone-500 mb-1">Vzdálenost (km)</label>
                <input type="number" className="w-full bg-stone-800 border border-stone-700 rounded-xl p-3 text-white" value={formData.distanceKm} onChange={e => setFormData(p => ({ ...p, distanceKm: +e.target.value }))} />
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase text-stone-500 mb-1">Čas (h)</label>
                <input type="number" className="w-full bg-stone-800 border border-stone-700 rounded-xl p-3 text-white" value={formData.durationHours} onChange={e => setFormData(p => ({ ...p, durationHours: +e.target.value }))} />
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase text-stone-500 mb-1">Obtížnost</label>
                <select 
                  className="w-full bg-stone-800 border border-stone-700 rounded-xl p-3 text-white" 
                  value={formData.difficulty} 
                  onChange={e => setFormData(p => ({ ...p, difficulty: e.target.value as any }))}
                >
                  <option value="Lehká">Lehká</option>
                  <option value="Střední">Střední</option>
                  <option value="Expert">Expert</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <div className="flex justify-between items-center mb-4">
              <label className="text-[10px] font-black uppercase text-stone-500 tracking-widest">Waypoints (Zastávky)</label>
              <button type="button" onClick={() => setFormData(p => ({ ...p, waypoints: [...p.waypoints, ''] }))} className="text-orange-500 font-black text-xs uppercase italic hover:text-white transition-colors">+ Přidat bod</button>
            </div>
            <div className="space-y-3">
              {formData.waypoints.map((wp, i) => (
                <div key={i} className="flex gap-2">
                  <input className="flex-1 bg-stone-800 border border-stone-700 rounded-xl p-3 text-sm text-white" value={wp} onChange={e => updateList('waypoints', i, e.target.value)} placeholder={`Bod ${i+1}`} />
                  <button type="button" onClick={() => setFormData(p => ({ ...p, waypoints: p.waypoints.filter((_, idx) => idx !== i) }))} className="text-stone-600 hover:text-red-500"><TrashIcon className="w-5 h-5" /></button>
                </div>
              ))}
            </div>
          </div>
          <div>
            <div className="flex justify-between items-center mb-4">
              <label className="text-[10px] font-black uppercase text-stone-500 tracking-widest">Itinerář / Briefing</label>
              <button type="button" onClick={() => setFormData(p => ({ ...p, briefingSteps: [...p.briefingSteps, ''] }))} className="text-orange-500 font-black text-xs uppercase italic hover:text-white transition-colors">+ Přidat krok</button>
            </div>
            <div className="space-y-3">
              {formData.briefingSteps.map((step, i) => (
                <div key={i} className="flex gap-2">
                  <span className="w-8 h-8 flex-shrink-0 bg-stone-700 rounded-lg flex items-center justify-center text-xs font-black text-orange-500 italic">{i+1}</span>
                  <textarea className="flex-1 bg-stone-800 border border-stone-700 rounded-xl p-3 text-sm h-20 text-white" value={step} onChange={e => updateList('briefingSteps', i, e.target.value)} placeholder="Instrukce pro jezdce..." />
                  <button type="button" onClick={() => setFormData(p => ({ ...p, briefingSteps: p.briefingSteps.filter((_, idx) => idx !== i) }))} className="text-stone-600 hover:text-red-500"><TrashIcon className="w-5 h-5" /></button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-4 pt-10 border-t border-stone-800">
          <button type="button" onClick={onClose} className="px-8 py-3 text-stone-500 font-black uppercase italic text-sm hover:text-white">Zrušit</button>
          <button type="submit" className="px-12 py-4 bg-orange-600 text-white font-black uppercase italic rounded-2xl hover:bg-orange-500 shadow-xl shadow-orange-900/30 transition-all active:scale-95">Uložit expedici</button>
        </div>
      </form>
    </div>
  );
};

export default AdventureForm;
