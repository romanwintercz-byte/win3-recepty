
import React from 'react';
import { Recipe } from '../types';
import { ClockIcon, UsersIcon, PhotoIcon } from './icons';
import Rating from './Rating';

interface RecipeCardProps {
    recipe: Recipe;
    onSelectRecipe: (id: string) => void;
}

const RecipeCard: React.FC<RecipeCardProps> = ({ recipe, onSelectRecipe }) => {
    const totalTime = (recipe.prepTime || 0) + (recipe.cookTime || 0);

    return (
        <div 
            onClick={() => onSelectRecipe(recipe.id)}
            className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer hover:shadow-xl transition-shadow duration-300 transform hover:-translate-y-1 flex flex-col"
        >
            {recipe.imageUrl ? (
                <img src={recipe.imageUrl} alt={recipe.title} className="w-full h-48 object-cover" />
            ) : (
                <div className="w-full h-48 bg-stone-200 flex items-center justify-center">
                    <PhotoIcon className="w-16 h-16 text-stone-400" />
                </div>
            )}
            <div className="p-4 flex flex-col flex-grow">
                <h3 className="text-lg font-bold truncate">{recipe.title}</h3>
                <p className="text-sm text-stone-600 mt-1 h-10 overflow-hidden flex-grow">{recipe.description}</p>
                <div className="mt-4 flex justify-between items-center text-sm text-stone-500">
                    <div className="flex items-center gap-1.5">
                        <ClockIcon className="w-4 h-4" />
                        <span>{totalTime > 0 ? `${totalTime} min` : 'N/A'}</span>
                    </div>
                     <div className="flex items-center gap-1.5">
                        <UsersIcon className="w-4 h-4" />
                        <span>{recipe.servings || 'N/A'}</span>
                    </div>
                    <Rating rating={recipe.rating} size="sm" />
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                    {recipe.tags.slice(0, 3).map(tag => (
                        <span key={tag} className="text-xs bg-emerald-100 text-emerald-800 px-2 py-1 rounded-full">{tag}</span>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default RecipeCard;