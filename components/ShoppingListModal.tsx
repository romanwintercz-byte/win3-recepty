
import React, { useState, useEffect } from 'react';
import { Recipe, ShoppingList } from '../types';
import { generateShoppingList } from '../services/geminiService';
import { SparklesIcon } from './icons';

interface ShoppingListModalProps {
  recipes: Recipe[];
}

const ShoppingListModal: React.FC<ShoppingListModalProps> = ({ recipes }) => {
  const [list, setList] = useState<ShoppingList | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (recipes.length === 0) {
        setLoading(false);
        return;
      }
      try {
        const res = await generateShoppingList(recipes);
        setList(res);
      } catch (e) {
        alert('Chyba při generování seznamu.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [recipes]);

  if (loading) {
    return (
      <div className="p-20 text-center">
        <SparklesIcon className="w-12 h-12 text-emerald-600 animate-pulse mx-auto mb-6" />
        <h3 className="text-xl font-bold text-stone-800">Generuji seznam pomocí AI...</h3>
        <p className="text-stone-500 mt-2">Slučuji ingredience z vybraných receptů.</p>
      </div>
    );
  }

  if (!list || list.length === 0) {
    return <div className="p-20 text-center text-stone-500">V plánu nejsou žádné recepty.</div>;
  }

  return (
    <div className="p-10 max-h-[85vh] overflow-y-auto">
      <div className="flex items-center gap-4 mb-10">
        <div className="bg-emerald-600 p-3 rounded-2xl text-white">
          <SparklesIcon className="w-8 h-8" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-stone-800">Nákupní seznam</h2>
          <p className="text-stone-500">Sdružené položky podle kategorií.</p>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-8">
        {list.map(cat => (
          <div key={cat.category} className="bg-stone-50 rounded-3xl p-6">
            <h4 className="text-xs font-black uppercase tracking-widest text-stone-400 mb-4 border-b border-stone-200 pb-2">{cat.category}</h4>
            <ul className="space-y-3">
              {cat.items.map((item, idx) => (
                <li key={idx} className="flex justify-between items-center text-stone-800">
                  <span className="text-sm font-medium">{item.name}</span>
                  <span className="text-xs text-stone-400 bg-white px-2 py-1 rounded-lg border border-stone-100">{item.quantity}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="mt-12 flex justify-center">
        <button 
          onClick={() => window.print()}
          className="bg-stone-800 text-white px-10 py-3 rounded-full font-bold hover:bg-stone-900 transition-all active:scale-95"
        >
          Vytisknout seznam
        </button>
      </div>
    </div>
  );
};

export default ShoppingListModal;
