
export enum SourceType {
  MANUAL = 'Ručně zadaný',
  AI_IMPORTED = 'Importováno AI',
}

export interface Recipe {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  sourceType: SourceType;
  ingredients: string[];
  instructions: string[];
  prepTime?: number;
  cookTime?: number;
  servings?: number;
  tags: string[];
  rating: number;
}

export interface RecipeSuggestionResult {
  matchedRecipeIds: string[];
  newRecipeSuggestion: Omit<Recipe, 'id' | 'sourceType' | 'rating'> | null;
}

export type DayOfWeek = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
export type MealType = 'lunch' | 'dinner';

export interface WeeklyPlan {
  [day: string]: {
      [meal in MealType]?: string | null;
  };
}

export interface ShoppingListItem {
  name: string;
  quantity: string;
}

export interface ShoppingListCategory {
  category: string;
  items: ShoppingListItem[];
}

export type ShoppingList = ShoppingListCategory[];
