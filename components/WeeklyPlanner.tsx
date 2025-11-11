import React, { useState } from 'react';
import { Recipe, WeeklyPlan, DayOfWeek, MealType } from '../types';
import { PhotoIcon, XCircleIcon, ClipboardDocumentListIcon, ArrowPathIcon } from './icons';

interface WeeklyPlannerProps {
    allRecipes: Recipe[];
    weeklyPlan: WeeklyPlan;
    onUpdatePlan: (day: DayOfWeek, meal: MealType, recipeId: string | null) => void;
    onGenerateShoppingList: () => void;
    onResetPlan: () => void;
}

const DraggableRecipe: React.FC<{ recipe: Recipe }> = ({ recipe }) => {
    const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
        e.dataTransfer.setData('recipeId', recipe.id);
    };

    return (
        <div
            draggable
            onDragStart={handleDragStart}
            className="p-2 border rounded-md bg-white hover:bg-emerald-50 cursor-grab active:cursor-grabbing flex items-center gap-2 shadow-sm"
        >
            {recipe.imageUrl ? (
                <img src={recipe.imageUrl} alt={recipe.title} className="w-10 h-10 object-cover rounded" />
            ) : (
                 <div className="w-10 h-10 bg-stone-200 flex items-center justify-center rounded">
                    <PhotoIcon className="w-6 h-6 text-stone-400" />
                </div>
            )}
            <span className="text-sm font-medium text-stone-700 truncate">{recipe.title}</span>
        </div>
    );
};

const PlannerSlot: React.FC<{
    day: DayOfWeek,
    meal: MealType,
    recipe: Recipe | null,
    onDrop: (recipeId: string) => void,
    onRemove: () => void
}> = ({ recipe, onDrop, onRemove }) => {
    const [isOver, setIsOver] = useState(false);

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsOver(true);
    };

    const handleDragLeave = () => {
        setIsOver(false);
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsOver(false);
        const recipeId = e.dataTransfer.getData('recipeId');
        if (recipeId) {
            onDrop(recipeId);
        }
    };

    return (
        <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`h-28 border border-dashed rounded-lg flex flex-col justify-center items-center p-2 text-center transition-colors ${
                isOver ? 'border-emerald-500 bg-emerald-100' : 'border-stone-300 bg-stone-100'
            }`}
        >
            {recipe ? (
                <div className="bg-white p-2 rounded-md shadow-sm w-full h-full flex flex-col justify-between relative group">
                    <p className="text-sm font-bold text-stone-800 leading-tight">{recipe.title}</p>
                    <div className="text-xs text-stone-500">
                        {recipe.tags.slice(0, 2).join(', ')}
                    </div>
                     <button 
                        onClick={onRemove}
                        className="absolute -top-1 -right-1 text-red-500 hover:text-red-700 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                        <XCircleIcon className="w-6 h-6 bg-white rounded-full" />
                    </button>
                </div>
            ) : (
                <span className="text-sm text-stone-400">Přetáhněte recept</span>
            )}
        </div>
    );
};

const WeeklyPlanner: React.FC<WeeklyPlannerProps> = ({ allRecipes, weeklyPlan, onUpdatePlan, onGenerateShoppingList, onResetPlan }) => {
    const days: DayOfWeek[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    const dayNames: Record<DayOfWeek, string> = {
        monday: 'Pondělí',
        tuesday: 'Úterý',
        wednesday: 'Středa',
        thursday: 'Čtvrtek',
        friday: 'Pátek',
        saturday: 'Sobota',
        sunday: 'Neděle'
    };
    const mealNames: Record<MealType, string> = {
        lunch: 'Oběd',
        dinner: 'Večeře'
    };

    const getRecipeById = (id: string | null) => allRecipes.find(r => r.id === id) || null;
    
    const isPlanEmpty = Object.keys(weeklyPlan).length === 0 || Object.values(weeklyPlan).every(day => !day.lunch && !day.dinner);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <div className="lg:col-span-1 p-4 bg-white rounded-lg shadow-md">
                <h2 className="text-xl font-bold mb-4">Vaše Recepty</h2>
                <div className="space-y-2 max-h-[70vh] overflow-y-auto pr-2">
                    {allRecipes.map(recipe => (
                        <DraggableRecipe key={recipe.id} recipe={recipe} />
                    ))}
                </div>
            </div>

            <div className="lg:col-span-3">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
                    <h2 className="text-2xl font-bold text-stone-800">Týdenní Plánovač</h2>
                    <div className="flex gap-2">
                         <button 
                            onClick={onResetPlan}
                            disabled={isPlanEmpty}
                            className="flex items-center gap-2 px-4 py-2 bg-stone-200 text-stone-700 font-semibold rounded-full hover:bg-stone-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow"
                         >
                            <ArrowPathIcon className="w-5 h-5" /> Smazat Plán
                         </button>
                         <button
                            onClick={onGenerateShoppingList}
                            disabled={isPlanEmpty}
                            className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white font-semibold rounded-full hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow"
                         >
                            <ClipboardDocumentListIcon className="w-5 h-5" /> Vytvořit nákupní seznam
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4">
                    {days.map(day => (
                        <div key={day} className="p-3 bg-white rounded-lg shadow-md space-y-3">
                            <h3 className="font-bold text-center text-emerald-700">{dayNames[day]}</h3>
                            <div className="space-y-3">
                                <div>
                                    <h4 className="text-sm font-semibold text-stone-600 mb-1">{mealNames.lunch}</h4>
                                    <PlannerSlot
                                        day={day}
                                        meal="lunch"
                                        recipe={getRecipeById(weeklyPlan[day]?.lunch)}
                                        onDrop={(recipeId) => onUpdatePlan(day, 'lunch', recipeId)}
                                        onRemove={() => onUpdatePlan(day, 'lunch', null)}
                                    />
                                </div>
                                <div>
                                    <h4 className="text-sm font-semibold text-stone-600 mb-1">{mealNames.dinner}</h4>
                                    <PlannerSlot
                                        day={day}
                                        meal="dinner"
                                        recipe={getRecipeById(weeklyPlan[day]?.dinner)}
                                        onDrop={(recipeId) => onUpdatePlan(day, 'dinner', recipeId)}
                                        onRemove={() => onUpdatePlan(day, 'dinner', null)}
                                    />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default WeeklyPlanner;
