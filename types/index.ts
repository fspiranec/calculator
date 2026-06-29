export type ServingType = 'per100g' | 'perPiece';
export type MealType = 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack' | 'Other';
export type Sex = 'male' | 'female';
export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'veryActive' | 'athlete';
export type GoalType = 'maintain' | 'lose' | 'gain';
export type CalorieGoal = 'maintain' | 'loseSlow' | 'loseStandard' | 'gainSlow' | 'gainStandard';

export type MacroSet = { calories: number; protein: number; carbs: number; fat: number };
export type Goals = MacroSet;

export type FoodItem = MacroSet & {
  id: string;
  name: string;
  category: string;
  servingType: ServingType;
  defaultServingGrams?: number;
  isCustom?: boolean;
};

export type FoodEntry = MacroSet & {
  id: string;
  date: string;
  mealType: MealType;
  name: string;
  sourceFoodId?: string;
  quantity?: number;
  unit?: 'g' | 'piece';
  createdAt: string;
  updatedAt: string;
};

export type WeightEntry = {
  date: string;
  weightKg: number;
  note?: string;
  createdAt: string;
  updatedAt: string;
};

export type UserProfile = {
  sex?: Sex;
  age?: number;
  heightCm?: number;
  activityLevel?: ActivityLevel;
  goal?: CalorieGoal;
};

export type AppData = {
  version: 1;
  goals: Goals | null;
  userProfile: UserProfile;
  customFoods: FoodItem[];
  entries: FoodEntry[];
  weightEntries: WeightEntry[];
};

export type BackupData = {
  version: 1;
  exportedAt: string;
  goals: Goals | null;
  userProfile: UserProfile;
  customFoods: FoodItem[];
  foodEntries: FoodEntry[];
  weightEntries: WeightEntry[];
};

export const mealTypes: MealType[] = ['Breakfast', 'Lunch', 'Dinner', 'Snack', 'Other'];
