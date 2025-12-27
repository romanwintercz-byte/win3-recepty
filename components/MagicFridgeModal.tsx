
import React, { useState } from 'react';
import { Recipe, RecipeSuggestionResult, SourceType } from '../types';
import { suggestRecipeFromIngredients, generateRecipeImage } from '../services/geminiService';
import { SparklesIcon, PlusIcon, PhotoIcon } from './icons';

interface MagicFridgeModalProps {
  allRecipes: Recipe[];
  onSaveRecipe: (r: Recipe) => void;
  onSelectRecipe: (id: string) => void;
}

const MagicFridgeModal: React.FC<MagicFridgeModalProps> = ({ allRecipes, onSaveRecipe, onSelectRecipe }) => {
  const [ingredients, setIngredients] = useState('');
  const [loading, setLoading] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);
  const [result, setResult] = useState<RecipeSuggestionResult | null>(null);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!ingredients.trim()) return;
    setLoading(true);
    setGeneratedImageUrl(null);
    try {
      const res = await suggestRecipeFromIngredients(ingredients, allRecipes);
      setResult(res);
      
      if (res.newRecipeSuggestion) {
        setImageLoading(true);
        try {
          const imgUrl = await generateRecipeImage(res.newRecipeSuggestion.title);
          setGeneratedImageUrl(imgUrl);
        } catch (e) {
          console.error("Image generation failed", e);
        } finally {
          setImageLoading(false);
        }
      }
    } catch (e) {
      alert('Chyba při hledání receptu.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSuggested = () => {
    if (result?.newRecipeSuggestion) {
      const r: Recipe = {
        ...result.newRecipeSuggestion,
        id: Date.now().toString(),
        sourceType: SourceType.AI_IMPORTED,
        rating: 0,
        imageUrl: generatedImageUrl || 'https://picsum.photos/seed/ai-food/600/400'
      };
      onSaveRecipe(r);
      alert('Recept uložen!');
    }
  };

  return (
    <div className="p-10">
      <div className="text-center mb-10">
        <div className="inline-block p-4 bg-amber-100 rounded-3xl text-amber-600 mb-4">
          <SparklesIcon className="w-10 h-10" />
        </div>
        <h2 className="text-3xl font-bold text-stone-800">Kouzelná lednička</h2>
        <p className="text-stone-500 max-w-sm mx-auto mt-2">Napište suroviny, které máte doma a AI vám najde nejlepší využití.</p>
      </div>

      <div className="mb-8">
        <textarea 
          placeholder="Např. kuřecí maso, rýže, brokolice, cibule..."
          className="w-full bg-stone-100 border-none rounded-3xl p-6 text-lg focus:ring-2 focus:ring-amber-500 outline-none min-h-[120px]"
          value={ingredients}
          onChange={(e) => setIngredients(e.target.value)}
        />
        <button 
          onClick={handleSearch}
          disabled={loading || !ingredients.trim()}
          className="w-full mt-4 bg-amber-500 hover:bg-amber-600 text-white py-4 rounded-2xl font-bold transition-all active:scale-[0.98] disabled:opacity-50"
        >
          {loading ? 'Hledám řešení...' : 'Co můžu uvařit?'}
        </button>
      </div>

      {result && (
        <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
          {result.matchedRecipeIds.length > 0 && (
            <div>
              <h3 className="text-sm font-bold uppercase text-stone-400 mb-4">Máme pro vás shodu v kuchařce:</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {result.matchedRecipeIds.map(id => {
                  const r = allRecipes.find(x => x.id === id);
                  if (!r) return null;
                  return (
                    <div 
                      key={id} 
                      onClick={() => onSelectRecipe(id)}
                      className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl cursor-pointer hover:bg-emerald-100 transition-colors"
                    >
                      <p className="font-bold text-emerald-800">{r.title}</p>
                      <p className="text-xs text-emerald-600">Existující recept</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {result.newRecipeSuggestion && (
            <div className="bg-stone-50 p-6 rounded-3xl border border-stone-200">
              <div className="flex flex-col md:flex-row gap-6 mb-4">
                 <div className="md:w-1/3 aspect-[4/3] rounded-2xl overflow-hidden bg-stone-200 flex items-center justify-center relative shadow-inner">
                    {imageLoading ? (
                        <div className="text-center">
                            <SparklesIcon className="w-8 h-8 text-amber-500 animate-spin mx-auto mb-2" />
                            <p className="text-[10px] font-bold text-stone-400 uppercase">Generuji foto...</p>
                        </div>
                    ) : generatedImageUrl ? (
                        <img src={generatedImageUrl} alt={result.newRecipeSuggestion.title} className="w-full h-full object-cover" />
                    ) : (
                        <PhotoIcon className="w-12 h-12 text-stone-300" />
                    )}
                 </div>
                 <div className="flex-1">
                    <div className="flex justify-between items-start mb-2">
                        <h3 className="text-xl font-bold text-stone-800">{result.newRecipeSuggestion.title}</h3>
                        <button 
                        onClick={handleSaveSuggested}
                        className="flex items-center gap-2 bg-white text-stone-800 px-4 py-2 rounded-full text-xs font-bold border border-stone-200 hover:bg-stone-100"
                        >
                        <PlusIcon className="w-4 h-4" /> Uložit
                        </button>
                    </div>
                    <p className="text-stone-600 text-sm mb-4 leading-relaxed">{result.newRecipeSuggestion.description}</p>
                 </div>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-[10px] font-bold uppercase text-stone-400 mb-2">Suroviny</p>
                  <ul className="text-xs space-y-1 text-stone-700">
                    {result.newRecipeSuggestion.ingredients.map((i, idx) => <li key={idx}>• {i}</li>)}
                  </ul>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase text-stone-400 mb-2">Zkrácený postup</p>
                  <ol className="text-xs space-y-1 text-stone-700 list-decimal list-inside">
                    {result.newRecipeSuggestion.instructions.map((i, idx) => <li key={idx} className="line-clamp-1">{i}</li>)}
                  </ol>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MagicFridgeModal;
