
export enum SourceType {
  MANUAL = 'Vlastní plán',
  AI_GENERATED = 'Navrženo AI',
  AI_IMPORTED = 'Importováno AI',
}

export interface Adventure {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  sourceType: SourceType;
  waypoints: string[];
  briefingSteps: string[];
  distanceKm?: number;
  durationHours?: number;
  difficulty: 'Lehká' | 'Střední' | 'Expert';
  tags: string[];
  rating: number;
}

export interface AdventureSuggestionResult {
  matchedAdventureIds: string[];
  newAdventureSuggestion: Omit<Adventure, 'id' | 'sourceType' | 'rating'> | null;
}

export type DayOfWeek = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
export type RideType = 'short' | 'long';

export interface TourPlan {
  [day: string]: {
      [ride in RideType]?: string | null;
  };
}

export interface GearListItem {
  name: string;
  quantity: string;
}

export interface GearCategory {
  category: string;
  items: GearListItem[];
}

export type GearList = GearCategory[];

// Added missing Recipe types
export interface Recipe {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  sourceType: SourceType;
  ingredients: string[];
  instructions: string[];
  prepTime: number;
  cookTime: number;
  servings: number;
  tags: string[];
  rating: number;
}

export interface RecipeSuggestionResult {
  matchedRecipeIds: string[];
  newRecipeSuggestion: Omit<Recipe, 'id' | 'sourceType' | 'rating'> | null;
}

export type MealType = 'lunch' | 'dinner';

export interface WeeklyPlan {
  [day: string]: {
      [meal in MealType]?: string | null;
  };
}

export type ShoppingList = GearList;
