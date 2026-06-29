export type ServingType = 'per100g' | 'perPiece';
export type MealType = 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack' | 'Other';
export type Sex = 'male' | 'female';
export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'veryActive' | 'athlete';
export type GoalType = 'maintain' | 'lose' | 'gain';
export type CalorieGoal = 'maintain' | 'loseSlow' | 'loseStandard' | 'gainSlow' | 'gainStandard';
export type SyncStatus = 'local' | 'pending' | 'synced' | 'error';
export type CloudSyncStatus = 'local-only' | 'syncing' | 'synced' | 'offline' | 'failed' | 'pending';

export type MacroSet = { calories: number; protein: number; carbs: number; fat: number };
export type Goals = MacroSet;

export type FoodItem = MacroSet & {
  id: string;
  name: string;
  category: string;
  servingType: ServingType;
  defaultServingGrams?: number;
  isCustom?: boolean;
  localId?: string;
  remoteId?: string;
  syncStatus?: SyncStatus;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string;
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
  localId?: string;
  remoteId?: string;
  syncStatus?: SyncStatus;
  deletedAt?: string;
};

export type WeightEntry = {
  date: string;
  weightKg: number;
  note?: string;
  createdAt: string;
  updatedAt: string;
  localId?: string;
  remoteId?: string;
  syncStatus?: SyncStatus;
  deletedAt?: string;
};

export type UserProfile = {
  sex?: Sex;
  age?: number;
  heightCm?: number;
  activityLevel?: ActivityLevel;
  goal?: CalorieGoal;
  updatedAt?: string;
};

export type AppData = {
  version: 1;
  goals: Goals | null;
  userProfile: UserProfile;
  customFoods: FoodItem[];
  entries: FoodEntry[];
  weightEntries: WeightEntry[];
  syncMetadata: SyncMetadata;
};

export type BackupData = {
  version: 1;
  exportedAt: string;
  source: 'local' | 'supabase';
  goals: Goals | null;
  userProfile: UserProfile;
  customFoods: FoodItem[];
  foodEntries: FoodEntry[];
  weightEntries: WeightEntry[];
  syncMetadata: SyncMetadata;
};

export type SyncMetadata = {
  deviceId: string;
  lastSyncAt?: string;
  status: CloudSyncStatus;
  pendingChanges: number;
  lastError?: string;
};

export const mealTypes: MealType[] = ['Breakfast', 'Lunch', 'Dinner', 'Snack', 'Other'];
