import React, { useState } from 'react';
import { Recipe, RecipeSuggestionResult, SourceType } from '../types';
import { LightBulbIcon, SparklesIcon, PlusIcon } from './icons';
import RecipeCard from './RecipeCard';

interface MagicFridgeModalProps {
    onClose: () => void;
    onFindRecipes: (ingredients: string) => void;
    isLoading: boolean;
    results: RecipeSuggestionResult | null;
    error: string | null;
    allRecipes: Recipe[];
    onSelectRecipe: (id: string) => void;
    onSaveRecipe: (recipe: Recipe) => void;
}

const MagicFridgeModal: React.FC<MagicFridgeModalProps> = ({ 
    onClose, onFindRecipes, isLoading, results, error, allRecipes, onSelectRecipe, onSaveRecipe 
}) => {
    const [ingredientsText, setIngredientsText] = useState('');

    const handleFindClick = () => {
        if (ingredientsText.trim()) {
            onFindRecipes(ingredientsText);
        }
    };

    const handleSaveGeneratedRecipe = () => {
        if (results?.newRecipeSuggestion) {
            const newRecipe: Recipe = {
                id: new Date().toISOString(),
                ...results.newRecipeSuggestion,
                sourceType: SourceType.AI_IMPORTED,
                rating: 0,
                imageUrl: '',
            };
            onSaveRecipe(newRecipe);
        }
    };

    const matchedRecipes = results?.matchedRecipeIds
        .map(id => allRecipes.find(r => r.id === id))
        .filter((r): r is Recipe => !!r) || [];

    const renderContent = () => {
        if (isLoading) {
            return (
                <div className="text-center p-10">
                    <SparklesIcon className="w-12 h-12 text-emerald-500 animate-pulse mx-auto mb-4" />
                    <p className="text-lg font-semibold text-stone-700">AI přemýšlí, co byste si mohli uvařit...</p>
                    <p className="text-stone-500">To může chvilku trvat.</p>
                </div>
            );
        }

        if (error) {
            return <p className="text-red-500 text-center p-8">{error}</p>;
        }

        if (results) {
            // Case 1: Matched recipes found
            if (matchedRecipes.length > 0) {
                return (
                    <div>
                        <h3 className="text-xl font-bold text-stone-800 mb-4">Našli jsme pro vás tyto recepty:</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[50vh] overflow-y-auto p-1">
                            {matchedRecipes.map(recipe => (
                                <RecipeCard key={recipe.id} recipe={recipe} onSelectRecipe={onSelectRecipe} />
                            ))}
                        </div>
                    </div>
                );
            }
            // Case 2: New recipe suggested
            if (results.newRecipeSuggestion) {
                const suggestion = results.newRecipeSuggestion;
                return (
                    <div>
                        <h3 className="text-xl font-bold text-stone-800 mb-2">Nenašli jsme shodu, ale AI pro vás vytvořila tento recept:</h3>
                        <div className="bg-emerald-50 p-4 rounded-lg max-h-[50vh] overflow-y-auto">
                            <h4 className="text-2xl font-bold text-emerald-700">{suggestion.title}</h4>
                            <p className="text-stone-600 my-2">{suggestion.description}</p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                <div>
                                    <h5 className="font-semibold mb-2">Ingredience:</h5>
                                    <ul className="list-disc list-inside text-sm space-y-1">
                                        {suggestion.ingredients.map((ing, i) => <li key={i}>{ing}</li>)}
                                    </ul>
                                </div>
                                <div>
                                    <h5 className="font-semibold mb-2">Postup:</h5>
                                    <ol className="list-decimal list-inside text-sm space-y-1">
                                        {suggestion.instructions.map((inst, i) => <li key={i}>{inst}</li>)}
                                    </ol>
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-end mt-4">
                            <button 
                                onClick={handleSaveGeneratedRecipe}
                                className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white font-semibold rounded-full hover:bg-emerald-600 transition-colors shadow">
                                <PlusIcon className="w-5 h-5"/> Uložit tento recept
                            </button>
                        </div>
                    </div>
                );
            }
            // Case 3: Nothing found
            return (
                <div className="text-center p-10">
                    <p className="text-lg font-semibold text-stone-700">Bohužel jsme nic nenašli.</p>
                    <p className="text-stone-500">Zkuste zadat více surovin nebo upravit svůj dotaz.</p>
                </div>
            );
        }

        // Initial state
        return (
             <div className="space-y-4">
                <textarea
                    placeholder="Napište suroviny, které máte doma, oddělené čárkou. Např. kuřecí prsa, rýže, brokolice, cibule, česnek..."
                    value={ingredientsText}
                    onChange={(e) => setIngredientsText(e.target.value)}
                    rows={6}
                    className="w-full p-3 border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <button
                    onClick={handleFindClick}
                    disabled={!ingredientsText.trim()}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-emerald-500 text-white font-bold rounded-md hover:bg-emerald-600 disabled:bg-stone-300 transition-colors"
                >
                    <SparklesIcon className="w-5 h-5" /> Najít recepty
                </button>
            </div>
        );
    };

    return (
        <div className="p-6 md:p-8">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-amber-100 rounded-full">
                    <LightBulbIcon className="w-8 h-8 text-amber-500" />
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-stone-800">Kouzelná Lednička</h2>
                    <p className="text-stone-600">Řekněte mi, co máte doma, a já vám najdu nebo vytvořím recept!</p>
                </div>
            </div>
            {renderContent()}
        </div>
    );
};

export default MagicFridgeModal;
