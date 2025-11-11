import React from 'react';
import { Recipe } from '../types';
import RecipeCard from './RecipeCard';

interface RecipeListProps {
    recipes: Recipe[];
    onSelectRecipe: (id: string) => void;
}

const RecipeList: React.FC<RecipeListProps> = ({ recipes, onSelectRecipe }) => {
    if (recipes.length === 0) {
        return (
            <div className="text-center py-20">
                <h2 className="text-2xl font-semibold text-stone-500">Nebyly nalezeny žádné recepty</h2>
                <p className="text-stone-400 mt-2">Zkuste upravit vyhledávání nebo přidejte nový recept!</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
            {recipes.map(recipe => (
                <RecipeCard key={recipe.id} recipe={recipe} onSelectRecipe={onSelectRecipe} />
            ))}
        </div>
    );
};

export default RecipeList;