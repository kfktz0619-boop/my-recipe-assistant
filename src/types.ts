export type IngredientCategory = 'vegetable' | 'meat' | 'dairy' | 'seafood' | 'staple' | 'condiment' | 'other';

export interface Ingredient {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  category: IngredientCategory;
  daysUntilExpiry: number; // e.g. 1 (urgent), 3 (normal), 7 (safe)
  isSelected?: boolean;
}

export interface RecipeStep {
  stepNumber: number;
  text: string;
  tip?: string;
  timerMinutes?: number;
}

export interface RecipeUsedIngredient {
  name: string;
  amount: number;
  unit: string;
}

export interface Recipe {
  id: string;
  title: string;
  description: string;
  cookTime: number; // minutes
  difficulty: '超簡單' | '一般' | '進階';
  equipment: string;
  dietaryTags: string[];
  calories: number;
  protein: number;
  usedIngredients: RecipeUsedIngredient[];
  seasonings: string[];
  steps: RecipeStep[];
}

export interface CookHistoryItem {
  id: string;
  recipeTitle: string;
  cookedAt: string;
  deductedIngredients: RecipeUsedIngredient[];
}
