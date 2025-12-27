
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Recipe, WeeklyPlan, SourceType, DayOfWeek, MealType } from './types';
import Header from './components/Header';
import RecipeList from './components/RecipeList';
import RecipeDetail from './components/RecipeDetail';
import RecipeForm from './components/RecipeForm';
import MagicFridgeModal from './components/MagicFridgeModal';
import WeeklyPlanner from './components/WeeklyPlanner';
import ShoppingListModal from './components/ShoppingListModal';
import CookingModeModal from './components/CookingModeModal';
import Modal from './components/Modal';

const INITIAL_RECIPES: Recipe[] = [
  {
    id: '1',
    title: 'Špagety Carbonara',
    description: 'Pravé italské špagety s vejci a guanciale.',
    imageUrl: 'https://picsum.photos/seed/carbonara/600/400',
    sourceType: SourceType.MANUAL,
    ingredients: ['200g špaget', '100g pancetty', '2 vejce', '50g parmazánu', 'pepř'],
    instructions: ['Uvařte špagety.', 'Orestujte pancettu.', 'Smíchejte vejce se sýrem.', 'Vše spojte mimo oheň.'],
    prepTime: 10,
    cookTime: 15,
    servings: 2,
    tags: ['itálie', 'rychlovka', 'těstoviny'],
    rating: 5,
  }
];

const App: React.FC = () => {
  const [recipes, setRecipes] = useState<Recipe[]>(() => {
    try {
      const saved = localStorage.getItem('recipes');
      return saved ? JSON.parse(saved) : INITIAL_RECIPES;
    } catch (e) {
      console.error("Failed to load recipes from localStorage", e);
      return INITIAL_RECIPES;
    }
  });

  const [weeklyPlan, setWeeklyPlan] = useState<WeeklyPlan>(() => {
    try {
      const saved = localStorage.getItem('weeklyPlan');
      return saved ? JSON.parse(saved) : {};
    } catch (e) {
      console.error("Failed to load plan from localStorage", e);
      return {};
    }
  });
  
  const [activeModal, setActiveModal] = useState<'detail' | 'form' | 'fridge' | 'shopping' | 'cooking' | null>(null);
  const [selectedRecipeId, setSelectedRecipeId] = useState<string | null>(null);
  const [recipeToEdit, setRecipeToEdit] = useState<Recipe | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentView, setCurrentView] = useState<'recipes' | 'planner'>('recipes');

  useEffect(() => {
    localStorage.setItem('recipes', JSON.stringify(recipes));
  }, [recipes]);

  useEffect(() => {
    localStorage.setItem('weeklyPlan', JSON.stringify(weeklyPlan));
  }, [weeklyPlan]);

  const handleSaveRecipe = useCallback((recipe: Recipe) => {
    setRecipes(prev => {
      const idx = prev.findIndex(r => r.id === recipe.id);
      if (idx > -1) {
        const next = [...prev];
        next[idx] = recipe;
        return next;
      }
      return [recipe, ...prev];
    });
    setActiveModal(null);
  }, []);

  const handleDeleteRecipe = useCallback((id: string) => {
    if (confirm('Opravdu chcete recept smazat?')) {
      setRecipes(prev => prev.filter(r => r.id !== id));
      setActiveModal(null);
    }
  }, []);

  const handleUpdatePlan = useCallback((day: DayOfWeek, meal: MealType, recipeId: string | null) => {
    setWeeklyPlan(prev => ({
      ...prev,
      [day]: { ...(prev[day] || {}), [meal]: recipeId }
    }));
  }, []);

  const filteredRecipes = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return recipes.filter(r => 
      r.title.toLowerCase().includes(q) || 
      (r.tags && r.tags.some(t => t.toLowerCase().includes(q)))
    );
  }, [recipes, searchQuery]);

  const selectedRecipe = useMemo(() => 
    recipes.find(r => r.id === selectedRecipeId), [recipes, selectedRecipeId]
  );

  return (
    <div className="min-h-screen pb-20">
      <Header 
        onAddRecipe={() => { setRecipeToEdit(null); setActiveModal('form'); }}
        onSearch={setSearchQuery}
        onOpenFridge={() => setActiveModal('fridge')}
        currentView={currentView}
        onSetView={setCurrentView}
      />

      <main className="container mx-auto px-4 pt-6">
        {currentView === 'recipes' ? (
          <RecipeList 
            recipes={filteredRecipes} 
            onSelectRecipe={(id) => { setSelectedRecipeId(id); setActiveModal('detail'); }} 
          />
        ) : (
          <WeeklyPlanner 
            allRecipes={recipes}
            weeklyPlan={weeklyPlan}
            onUpdatePlan={handleUpdatePlan}
            onGenerateShoppingList={() => setActiveModal('shopping')}
            onResetPlan={() => setWeeklyPlan({})}
          />
        )}
      </main>

      {activeModal === 'detail' && selectedRecipe && (
        <Modal onClose={() => setActiveModal(null)}>
          <RecipeDetail 
            recipe={selectedRecipe}
            onEdit={() => { setRecipeToEdit(selectedRecipe); setActiveModal('form'); }}
            onDelete={() => handleDeleteRecipe(selectedRecipe.id)}
            onStartCooking={() => setActiveModal('cooking')}
          />
        </Modal>
      )}

      {activeModal === 'form' && (
        <Modal onClose={() => setActiveModal(null)}>
          <RecipeForm 
            recipeToEdit={recipeToEdit}
            onSave={handleSaveRecipe}
            onClose={() => setActiveModal(null)}
          />
        </Modal>
      )}

      {activeModal === 'fridge' && (
        <Modal onClose={() => setActiveModal(null)}>
          <MagicFridgeModal 
            allRecipes={recipes}
            onSaveRecipe={handleSaveRecipe}
            onSelectRecipe={(id) => { setSelectedRecipeId(id); setActiveModal('detail'); }}
          />
        </Modal>
      )}

      {activeModal === 'shopping' && (
        <Modal onClose={() => setActiveModal(null)}>
          <ShoppingListModal 
            recipes={recipes.filter(r => 
              (Object.values(weeklyPlan) as Array<WeeklyPlan[string]>).some(day => 
                day?.lunch === r.id || day?.dinner === r.id
              )
            )}
          />
        </Modal>
      )}

      {activeModal === 'cooking' && selectedRecipe && (
        <CookingModeModal 
          recipe={selectedRecipe}
          onClose={() => setActiveModal(null)}
        />
      )}
    </div>
  );
};

export default App;
