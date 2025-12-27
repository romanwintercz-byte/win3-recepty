
import React from 'react';
import { Recipe } from '../types';
import { ClockIcon, UsersIcon, SparklesIcon } from './icons';

interface RecipeListProps {
  recipes: Recipe[];
  onSelectRecipe: (id: string) => void;
}

const RecipeList: React.FC<RecipeListProps> = ({ recipes, onSelectRecipe }) => {
  if (recipes.length === 0) {
    return (
      <div className="text-center py-20">
        <SparklesIcon className="w-12 h-12 text-stone-300 mx-auto mb-4" />
        <p className="text-stone-500 text-lg">Žádné recepty k zobrazení.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {recipes.map(recipe => (
        <div 
          key={recipe.id}
          onClick={() => onSelectRecipe(recipe.id)}
          className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all cursor-pointer border border-stone-100 flex flex-col group"
        >
          <div className="relative aspect-[4/3] overflow-hidden">
            <img 
              src={recipe.imageUrl || 'https://picsum.photos/seed/food/600/400'} 
              alt={recipe.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute top-3 left-3 flex gap-2">
              {recipe.tags.slice(0, 2).map(tag => (
                <span key={tag} className="px-2 py-1 bg-white/90 backdrop-blur-sm text-emerald-800 text-[10px] font-bold uppercase rounded-lg shadow-sm">
                  {tag}
                </span>
              ))}
            </div>
          </div>
          <div className="p-5 flex flex-col flex-1">
            <h3 className="text-lg font-bold text-stone-800 mb-2 line-clamp-1">{recipe.title}</h3>
            <p className="text-stone-500 text-sm mb-4 line-clamp-2">{recipe.description}</p>
            <div className="mt-auto flex items-center justify-between pt-4 border-t border-stone-50 text-stone-400 text-xs">
              <div className="flex items-center gap-1.5">
                <ClockIcon className="w-4 h-4" />
                <span>{ (recipe.prepTime || 0) + (recipe.cookTime || 0) } min</span>
              </div>
              <div className="flex items-center gap-1.5">
                <UsersIcon className="w-4 h-4" />
                <span>{recipe.servings || 'N/A'}</span>
              </div>
              <div className="flex gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className={`w-2 h-2 rounded-full ${i < recipe.rating ? 'bg-amber-400' : 'bg-stone-200'}`} />
                ))}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default RecipeList;
