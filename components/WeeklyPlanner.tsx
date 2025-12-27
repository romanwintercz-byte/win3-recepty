
import React from 'react';
import { Recipe, WeeklyPlan, DayOfWeek, MealType } from '../types';
import { CalendarIcon, TrashIcon, SparklesIcon } from './icons';

interface WeeklyPlannerProps {
  allRecipes: Recipe[];
  weeklyPlan: WeeklyPlan;
  onUpdatePlan: (day: DayOfWeek, meal: MealType, recipeId: string | null) => void;
  onGenerateShoppingList: () => void;
  onResetPlan: () => void;
}

const DAYS: Record<DayOfWeek, string> = {
  monday: 'Pondělí', tuesday: 'Úterý', wednesday: 'Středa', thursday: 'Čtvrtek',
  friday: 'Pátek', saturday: 'Sobota', sunday: 'Neděle'
};

const WeeklyPlanner: React.FC<WeeklyPlannerProps> = ({ allRecipes, weeklyPlan, onUpdatePlan, onGenerateShoppingList, onResetPlan }) => {
  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-6">
        <div className="flex items-center gap-4">
          <div className="bg-emerald-100 p-3 rounded-2xl text-emerald-700">
            <CalendarIcon className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-stone-800">Týdenní plánovač</h2>
            <p className="text-stone-500">Uspořádejte si jídelníček na celý týden.</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button onClick={onResetPlan} className="px-6 py-3 bg-stone-100 text-stone-600 rounded-full font-bold hover:bg-stone-200 transition-colors">Smazat plán</button>
          <button onClick={onGenerateShoppingList} className="px-8 py-3 bg-emerald-600 text-white rounded-full font-bold hover:bg-emerald-700 shadow-xl shadow-emerald-100 transition-all active:scale-95">Vytvořit nákupní seznam</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4">
        {(Object.keys(DAYS) as DayOfWeek[]).map(day => (
          <div key={day} className="bg-white rounded-[32px] p-5 shadow-sm border border-stone-100">
            <h3 className="text-sm font-bold text-emerald-800 mb-6 uppercase tracking-wider">{DAYS[day]}</h3>
            
            <div className="space-y-6">
              {(['lunch', 'dinner'] as MealType[]).map(meal => {
                const rId = weeklyPlan[day]?.[meal];
                const recipe = allRecipes.find(r => r.id === rId);

                return (
                  <div key={meal}>
                    <label className="text-[10px] font-bold text-stone-300 uppercase block mb-2">{meal === 'lunch' ? 'Oběd' : 'Večeře'}</label>
                    {recipe ? (
                      <div className="relative group rounded-2xl bg-stone-50 p-3 border border-stone-100">
                        <p className="text-xs font-bold text-stone-800 line-clamp-2 pr-4">{recipe.title}</p>
                        <button 
                          onClick={() => onUpdatePlan(day, meal, null)}
                          className="absolute top-2 right-2 text-stone-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <select 
                        className="w-full bg-stone-100 border-none rounded-xl p-2 text-[10px] text-stone-500 outline-none"
                        onChange={(e) => onUpdatePlan(day, meal, e.target.value)}
                        value=""
                      >
                        <option value="">Vybrat...</option>
                        {allRecipes.map(r => <option key={r.id} value={r.id}>{r.title}</option>)}
                      </select>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-16 bg-emerald-900 rounded-[40px] p-10 text-white relative overflow-hidden">
        <div className="relative z-10">
          <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <SparklesIcon className="w-6 h-6" />
            Váš plán, náš seznam
          </h3>
          <p className="max-w-md opacity-80 leading-relaxed mb-8">Po sestavení plánu stačí kliknout na tlačítko výše a AI vám vygeneruje přehledný nákupní seznam rozdělený do kategorií.</p>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-800/50 rounded-full blur-3xl -mr-20 -mt-20" />
      </div>
    </div>
  );
};

export default WeeklyPlanner;
