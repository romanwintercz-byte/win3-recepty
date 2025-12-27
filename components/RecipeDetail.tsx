
import React from 'react';
import { Recipe } from '../types';
import { ClockIcon, UsersIcon, TrashIcon, PencilIcon, PlayIcon } from './icons';

interface RecipeDetailProps {
  recipe: Recipe;
  onEdit: () => void;
  onDelete: () => void;
  onStartCooking: () => void;
}

const RecipeDetail: React.FC<RecipeDetailProps> = ({ recipe, onEdit, onDelete, onStartCooking }) => {
  return (
    <div className="flex flex-col">
      <div className="relative h-64 sm:h-80 overflow-hidden">
        <img 
          src={recipe.imageUrl || 'https://picsum.photos/seed/food/800/600'} 
          alt={recipe.title} 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-6 left-6 right-6 text-white">
          <h2 className="text-3xl font-bold mb-2">{recipe.title}</h2>
          <div className="flex gap-4 text-sm opacity-90">
            <div className="flex items-center gap-1.5">
              <ClockIcon className="w-5 h-5" />
              <span>{ (recipe.prepTime || 0) + (recipe.cookTime || 0) } min</span>
            </div>
            <div className="flex items-center gap-1.5">
              <UsersIcon className="w-5 h-5" />
              <span>{recipe.servings} porce</span>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 md:p-10">
        <div className="flex justify-between items-start mb-10">
          <div className="flex-1">
            <p className="text-lg text-stone-600 italic mb-6 leading-relaxed">"{recipe.description}"</p>
            <div className="flex flex-wrap gap-2 mb-8">
              {recipe.tags.map(t => (
                <span key={t} className="px-3 py-1 bg-stone-100 text-stone-600 text-xs font-semibold rounded-full">#{t}</span>
              ))}
            </div>
          </div>
          <div className="flex gap-2 ml-4">
            <button onClick={onEdit} className="p-2 text-stone-400 hover:text-emerald-600 transition-colors"><PencilIcon className="w-6 h-6" /></button>
            <button onClick={onDelete} className="p-2 text-stone-400 hover:text-red-600 transition-colors"><TrashIcon className="w-6 h-6" /></button>
          </div>
        </div>

        <button 
          onClick={onStartCooking}
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all active:scale-[0.98] shadow-xl shadow-emerald-200 mb-12"
        >
          <PlayIcon className="w-6 h-6" />
          ZAČÍT VAŘIT
        </button>

        <div className="grid md:grid-cols-5 gap-12">
          <div className="md:col-span-2">
            <h3 className="text-xl font-bold text-stone-800 mb-6 flex items-center gap-2">
              <span className="w-2 h-2 bg-emerald-500 rounded-full" />
              Ingredience
            </h3>
            <ul className="space-y-4">
              {recipe.ingredients.map((ing, i) => (
                <li key={i} className="flex items-center gap-3 text-stone-700 group">
                  <div className="w-1.5 h-1.5 bg-stone-300 rounded-full group-hover:bg-emerald-400 transition-colors" />
                  {ing}
                </li>
              ))}
            </ul>
          </div>
          <div className="md:col-span-3">
            <h3 className="text-xl font-bold text-stone-800 mb-6 flex items-center gap-2">
              <span className="w-2 h-2 bg-emerald-500 rounded-full" />
              Postup
            </h3>
            <div className="space-y-8">
              {recipe.instructions.map((inst, i) => (
                <div key={i} className="flex gap-4">
                  <span className="flex-shrink-0 w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center text-sm">
                    {i + 1}
                  </span>
                  <p className="text-stone-700 leading-relaxed pt-1">{inst}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecipeDetail;
