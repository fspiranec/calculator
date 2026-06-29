export type ServingType = 'per100g' | 'perPiece';
export type MealType = 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack' | 'Other';
export type MacroSet = { calories: number; protein: number; carbs: number; fat: number };
export type FoodItem = MacroSet & { id: string; name: string; category: string; servingType: ServingType; defaultServingGrams?: number; isCustom?: boolean };
export type FoodEntry = MacroSet & { id: string; date: string; mealType: MealType; name: string; sourceFoodId?: string; quantity?: number; unit?: 'g' | 'piece'; createdAt: string; updatedAt: string };
export type Goals = MacroSet;
export type AppData = { goals: Goals | null; customFoods: FoodItem[]; entries: FoodEntry[]; version: 1 };
export const mealTypes: MealType[] = ['Breakfast', 'Lunch', 'Dinner', 'Snack', 'Other'];
