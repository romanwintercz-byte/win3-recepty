
import React, { useState, useEffect } from 'react';
import { Recipe, SourceType } from '../types';
import { SparklesIcon, XMarkIcon, PlusIcon, TrashIcon } from './icons';
import { extractRecipeFromText } from '../services/geminiService';

interface RecipeFormProps {
  recipeToEdit?: Recipe | null;
  onSave: (r: Recipe) => void;
  onClose: () => void;
}

const RecipeForm: React.FC<RecipeFormProps> = ({ recipeToEdit, onSave, onClose }) => {
  const [formData, setFormData] = useState<Omit<Recipe, 'id'>>({
    title: '',
    description: '',
    imageUrl: '',
    sourceType: SourceType.MANUAL,
    ingredients: [''],
    instructions: [''],
    prepTime: 10,
    cookTime: 20,
    servings: 4,
    tags: [],
    rating: 3,
  });
  const [importText, setImportText] = useState('');
  const [isImporting, setIsImporting] = useState(false);

  useEffect(() => {
    if (recipeToEdit) setFormData(recipeToEdit);
  }, [recipeToEdit]);

  const handleAIImport = async () => {
    if (!importText.trim()) return;
    setIsImporting(true);
    try {
      const result = await extractRecipeFromText(importText);
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

  const updateList = (field: 'ingredients' | 'instructions', index: number, value: string) => {
    const next = [...formData[field]];
    next[index] = value;
    setFormData(prev => ({ ...prev, [field]: next }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      id: recipeToEdit?.id || Date.now().toString(),
      ingredients: formData.ingredients.filter(i => i.trim()),
      instructions: formData.instructions.filter(i => i.trim()),
    });
  };

  return (
    <div className="p-6 md:p-10 max-h-[85vh] overflow-y-auto">
      <h2 className="text-2xl font-bold text-stone-800 mb-8">{recipeToEdit ? 'Upravit recept' : 'Nový recept'}</h2>

      <div className="mb-10 bg-emerald-50 p-6 rounded-3xl">
        <div className="flex items-center gap-2 mb-4 text-emerald-800 font-bold">
          <SparklesIcon className="w-5 h-5" />
          <h3>Chytrý import pomocí AI</h3>
        </div>
        <textarea 
          placeholder="Vložte text receptu z webu nebo vlastní poznámky..."
          className="w-full bg-white border-none rounded-2xl p-4 text-sm focus:ring-2 focus:ring-emerald-500 outline-none h-24"
          value={importText}
          onChange={(e) => setImportText(e.target.value)}
        />
        <button 
          onClick={handleAIImport}
          disabled={isImporting}
          className="mt-3 bg-emerald-600 text-white px-6 py-2 rounded-full text-sm font-bold hover:bg-emerald-700 disabled:opacity-50 transition-colors"
        >
          {isImporting ? 'Pracuji...' : 'Importovat text'}
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div>
              <label className="block text-xs font-bold uppercase text-stone-400 mb-2">Název jídla</label>
              <input 
                required
                className="w-full bg-stone-100 border-none rounded-2xl p-4 focus:ring-2 focus:ring-emerald-500 outline-none"
                value={formData.title}
                onChange={e => setFormData(p => ({ ...p, title: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-stone-400 mb-2">Popis</label>
              <textarea 
                className="w-full bg-stone-100 border-none rounded-2xl p-4 focus:ring-2 focus:ring-emerald-500 outline-none h-24"
                value={formData.description}
                onChange={e => setFormData(p => ({ ...p, description: e.target.value }))}
              />
            </div>
          </div>
          <div className="space-y-6">
            <div>
              <label className="block text-xs font-bold uppercase text-stone-400 mb-2">URL obrázku</label>
              <input 
                className="w-full bg-stone-100 border-none rounded-2xl p-4 focus:ring-2 focus:ring-emerald-500 outline-none"
                value={formData.imageUrl}
                onChange={e => setFormData(p => ({ ...p, imageUrl: e.target.value }))}
                placeholder="https://..."
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-[10px] font-bold uppercase text-stone-400 mb-1">Příprava (min)</label>
                <input type="number" className="w-full bg-stone-100 border-none rounded-xl p-3" value={formData.prepTime} onChange={e => setFormData(p => ({ ...p, prepTime: +e.target.value }))} />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase text-stone-400 mb-1">Vaření (min)</label>
                <input type="number" className="w-full bg-stone-100 border-none rounded-xl p-3" value={formData.cookTime} onChange={e => setFormData(p => ({ ...p, cookTime: +e.target.value }))} />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase text-stone-400 mb-1">Porce</label>
                <input type="number" className="w-full bg-stone-100 border-none rounded-xl p-3" value={formData.servings} onChange={e => setFormData(p => ({ ...p, servings: +e.target.value }))} />
              </div>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <div className="flex justify-between items-center mb-4">
              <label className="text-xs font-bold uppercase text-stone-400">Ingredience</label>
              <button type="button" onClick={() => setFormData(p => ({ ...p, ingredients: [...p.ingredients, ''] }))} className="text-emerald-600 font-bold text-xs">+ Přidat</button>
            </div>
            <div className="space-y-3">
              {formData.ingredients.map((ing, i) => (
                <div key={i} className="flex gap-2">
                  <input className="flex-1 bg-stone-50 border-none rounded-xl p-3 text-sm" value={ing} onChange={e => updateList('ingredients', i, e.target.value)} />
                  <button type="button" onClick={() => setFormData(p => ({ ...p, ingredients: p.ingredients.filter((_, idx) => idx !== i) }))} className="text-stone-300 hover:text-red-500"><TrashIcon className="w-5 h-5" /></button>
                </div>
              ))}
            </div>
          </div>
          <div>
            <div className="flex justify-between items-center mb-4">
              <label className="text-xs font-bold uppercase text-stone-400">Postup</label>
              <button type="button" onClick={() => setFormData(p => ({ ...p, instructions: [...p.instructions, ''] }))} className="text-emerald-600 font-bold text-xs">+ Přidat krok</button>
            </div>
            <div className="space-y-3">
              {formData.instructions.map((inst, i) => (
                <div key={i} className="flex gap-2">
                  <span className="w-8 h-8 flex-shrink-0 bg-stone-200 rounded-lg flex items-center justify-center text-xs font-bold text-stone-500">{i+1}</span>
                  <textarea className="flex-1 bg-stone-50 border-none rounded-xl p-3 text-sm h-20" value={inst} onChange={e => updateList('instructions', i, e.target.value)} />
                  <button type="button" onClick={() => setFormData(p => ({ ...p, instructions: p.instructions.filter((_, idx) => idx !== i) }))} className="text-stone-300 hover:text-red-500"><TrashIcon className="w-5 h-5" /></button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-4 pt-10">
          <button type="button" onClick={onClose} className="px-8 py-3 text-stone-400 font-bold hover:text-stone-600">Zrušit</button>
          <button type="submit" className="px-10 py-3 bg-emerald-600 text-white font-bold rounded-2xl hover:bg-emerald-700 shadow-xl shadow-emerald-100 transition-all active:scale-95">Uložit recept</button>
        </div>
      </form>
    </div>
  );
};

export default RecipeForm;
