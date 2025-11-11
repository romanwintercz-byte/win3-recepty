import React from 'react';
import { Recipe } from '../types';
import { ClockIcon, UsersIcon, TagIcon, PencilSquareIcon, TrashIcon, PhotoIcon, PlayCircleIcon } from './icons';
import Rating from './Rating';

interface RecipeDetailProps {
    recipe: Recipe;
    onClose: () => void;
    onEdit: (recipe: Recipe) => void;
    onDelete: (id: string) => void;
    onRatingChange: (id: string, newRating: number) => void;
    onStartCooking: (recipe: Recipe) => void;
}

const RecipeDetail: React.FC<RecipeDetailProps> = ({ recipe, onEdit, onDelete, onRatingChange, onStartCooking }) => {
    const totalTime = (recipe.prepTime || 0) + (recipe.cookTime || 0);

    return (
        <div className="p-6 md:p-8">
            <div className="md:grid md:grid-cols-3 md:gap-8">
                <div className="md:col-span-1">
                    {recipe.imageUrl ? (
                         <img src={recipe.imageUrl} alt={recipe.title} className="w-full h-auto object-cover rounded-lg shadow-lg mb-4" />
                    ) : (
                        <div className="w-full aspect-video bg-stone-200 flex items-center justify-center rounded-lg shadow-lg mb-4">
                            <PhotoIcon className="w-24 h-24 text-stone-400" />
                        </div>
                    )}
                     <div className="space-y-3 text-stone-600">
                        {totalTime > 0 && (
                             <div className="flex items-center gap-3">
                                <ClockIcon className="w-6 h-6 text-emerald-500" />
                                <div>
                                    <span className="font-semibold">Celkový čas:</span> {totalTime} min
                                    <p className="text-sm text-stone-500">Příprava: {recipe.prepTime || 'N/A'} min, Vaření: {recipe.cookTime || 'N/A'} min</p>
                                </div>
                            </div>
                        )}
                        {recipe.servings && (
                            <div className="flex items-center gap-3">
                                <UsersIcon className="w-6 h-6 text-emerald-500" />
                                <div><span className="font-semibold">Počet porcí:</span> {recipe.servings}</div>
                            </div>
                        )}
                        <div className="flex items-start gap-3">
                             <TagIcon className="w-6 h-6 text-emerald-500 mt-1" />
                             <div>
                                <span className="font-semibold">Štítky:</span>
                                <div className="flex flex-wrap gap-2 mt-1">
                                    {recipe.tags.map(tag => (
                                        <span key={tag} className="text-xs bg-emerald-100 text-emerald-800 px-2 py-1 rounded-full">{tag}</span>
                                    ))}
                                </div>
                            </div>
                        </div>
                     </div>
                </div>

                <div className="md:col-span-2 mt-6 md:mt-0">
                    <h2 className="text-3xl font-bold text-stone-800 mb-2">{recipe.title}</h2>
                    <div className="mb-4">
                        <Rating rating={recipe.rating} onRatingChange={(newRating) => onRatingChange(recipe.id, newRating)} size="lg" />
                    </div>
                    <p className="text-sm text-stone-500 mb-4">Zdroj: {recipe.sourceType}</p>
                    <p className="text-stone-600 mb-6">{recipe.description}</p>
                    
                    <button 
                        onClick={() => onStartCooking(recipe)}
                        className="w-full flex items-center justify-center gap-3 px-4 py-3 mb-6 bg-emerald-500 text-white text-lg font-bold rounded-lg hover:bg-emerald-600 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                    >
                        <PlayCircleIcon className="w-8 h-8" />
                        Zahájit vaření
                    </button>

                    <div className="mb-6">
                        <h3 className="text-xl font-semibold border-b-2 border-emerald-500 pb-2 mb-3">Ingredience</h3>
                        <ul className="list-disc list-inside space-y-2 text-stone-700">
                            {recipe.ingredients.map((ing, i) => <li key={i}>{ing}</li>)}
                        </ul>
                    </div>
                    
                    <div>
                        <h3 className="text-xl font-semibold border-b-2 border-emerald-500 pb-2 mb-3">Postup</h3>
                        <ol className="list-decimal list-inside space-y-3 text-stone-700">
                            {recipe.instructions.map((inst, i) => <li key={i}>{inst}</li>)}
                        </ol>
                    </div>

                    <div className="mt-8 flex justify-end gap-3">
                        <button onClick={() => onEdit(recipe)} className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white font-semibold rounded-full hover:bg-blue-600 transition-colors shadow">
                            <PencilSquareIcon className="w-5 h-5" /> Upravit
                        </button>
                        <button onClick={() => onDelete(recipe.id)} className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white font-semibold rounded-full hover:bg-red-600 transition-colors shadow">
                            <TrashIcon className="w-5 h-5" /> Smazat
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RecipeDetail;