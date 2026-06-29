import { AppData, FoodEntry, FoodItem, Goals, UserProfile, WeightEntry } from '@/types';
import { defaultData } from './db';
import { getSupabaseClient } from './supabase/client';

const assertOk = ({ error }: { error: unknown }) => {
  if (error) throw error instanceof Error ? error : new Error(JSON.stringify(error));
};
const fromGoals = (row: any): Goals | null => row ? { calories: row.calorie_goal, protein: Number(row.protein_goal), carbs: Number(row.carbs_goal), fat: Number(row.fat_goal) } : null;
const toGoals = (userId: string, goals: Goals) => ({ user_id: userId, calorie_goal: goals.calories, protein_goal: goals.protein, carbs_goal: goals.carbs, fat_goal: goals.fat });
const fromProfile = (row: any): UserProfile => row ? { sex: row.sex ?? undefined, age: row.age ?? undefined, heightCm: row.height_cm ? Number(row.height_cm) : undefined, activityLevel: row.activity_level ?? undefined, goal: row.goal ?? row.fitness_goal ?? undefined, updatedAt: row.updated_at, calorieAdjustment: row.calorie_adjustment ?? undefined } : {};
const toProfile = (userId: string, profile: UserProfile) => ({ user_id: userId, sex: profile.sex ?? null, age: profile.age ?? null, height_cm: profile.heightCm ?? null, activity_level: profile.activityLevel ?? null, goal: profile.goal ?? null, calorie_adjustment: profile.calorieAdjustment ?? null });
const fromFood = (row: any): FoodItem => ({ id: row.id, remoteId: row.id, name: row.name, category: row.category ?? 'Custom', servingType: row.serving_type, defaultServingGrams: row.default_serving_grams ? Number(row.default_serving_grams) : undefined, calories: Number(row.calories), protein: Number(row.protein), carbs: Number(row.carbs), fat: Number(row.fat), isCustom: true, createdAt: row.created_at, updatedAt: row.updated_at, syncStatus: 'synced' });
const toFood = (userId: string, food: FoodItem) => ({ user_id: userId, name: food.name, category: food.category, serving_type: food.servingType, default_serving_grams: food.defaultServingGrams ?? null, calories: food.calories, protein: food.protein, carbs: food.carbs, fat: food.fat });
const mealToDb = (meal: string) => meal.toLowerCase();
const mealFromDb = (meal: string) => (meal.charAt(0).toUpperCase() + meal.slice(1)) as FoodEntry['mealType'];
const fromEntry = (row: any): FoodEntry => ({ id: row.id, remoteId: row.id, date: row.date, mealType: mealFromDb(row.meal_type), sourceFoodId: row.food_id ?? undefined, name: row.food_name, quantity: row.quantity ? Number(row.quantity) : undefined, unit: row.quantity_unit ?? undefined, calories: Number(row.calories), protein: Number(row.protein), carbs: Number(row.carbs), fat: Number(row.fat), createdAt: row.created_at, updatedAt: row.updated_at, syncStatus: 'synced' });
const toEntry = (userId: string, entry: FoodEntry) => ({ user_id: userId, date: entry.date, meal_type: mealToDb(entry.mealType), food_id: null, food_name: entry.name, quantity: entry.quantity ?? null, quantity_unit: entry.unit ?? null, calories: entry.calories, protein: entry.protein, carbs: entry.carbs, fat: entry.fat, source: entry.sourceFoodId ? 'predefined' : 'manual' });
const fromWeight = (row: any): WeightEntry => ({ date: row.date, remoteId: row.id, weightKg: Number(row.weight_kg), note: row.note ?? undefined, createdAt: row.created_at, updatedAt: row.updated_at, syncStatus: 'synced' });
const toWeight = (userId: string, entry: WeightEntry) => ({ user_id: userId, date: entry.date, weight_kg: entry.weightKg, note: entry.note ?? null });

export const fetchUserData = async (userId: string): Promise<AppData> => {
  const supabase = getSupabaseClient();
  if (!supabase) throw new Error('Supabase is not configured.');
  const [{ data: goals, error: goalsError }, { data: profile, error: profileError }, { data: foods, error: foodsError }, { data: entries, error: entriesError }, { data: weights, error: weightsError }] = await Promise.all([
    supabase.from('user_goals').select('*').eq('user_id', userId).maybeSingle(),
    supabase.from('user_profile_settings').select('*').eq('user_id', userId).maybeSingle(),
    supabase.from('custom_foods').select('*').eq('user_id', userId),
    supabase.from('food_entries').select('*').eq('user_id', userId),
    supabase.from('weight_entries').select('*').eq('user_id', userId),
  ]);
  [goalsError, profileError, foodsError, entriesError, weightsError].forEach((error) => { if (error) throw error; });
  return { ...defaultData, goals: fromGoals(goals), userProfile: fromProfile(profile), customFoods: (foods ?? []).map(fromFood), entries: (entries ?? []).map(fromEntry), weightEntries: (weights ?? []).map(fromWeight), syncMetadata: { ...defaultData.syncMetadata, status: 'synced', pendingChanges: 0, lastSyncAt: new Date().toISOString() } };
};

export const saveUserData = async (userId: string, data: AppData) => {
  const supabase = getSupabaseClient();
  if (!supabase) throw new Error('Supabase is not configured.');
  if (data.goals) assertOk(await supabase.from('user_goals').upsert(toGoals(userId, data.goals), { onConflict: 'user_id' }));
  assertOk(await supabase.from('user_profile_settings').upsert(toProfile(userId, data.userProfile), { onConflict: 'user_id' }));
  for (const table of ['custom_foods', 'food_entries', 'weight_entries']) assertOk(await supabase.from(table).delete().eq('user_id', userId));
  if (data.customFoods.length) assertOk(await supabase.from('custom_foods').insert(data.customFoods.map((food) => toFood(userId, food))));
  if (data.entries.length) assertOk(await supabase.from('food_entries').insert(data.entries.map((entry) => toEntry(userId, entry))));
  if (data.weightEntries.length) assertOk(await supabase.from('weight_entries').insert(data.weightEntries.map((entry) => toWeight(userId, entry))));
};

export const deleteMyAppData = async (userId: string) => {
  const supabase = getSupabaseClient();
  if (!supabase) throw new Error('Supabase is not configured.');
  await Promise.all(['user_goals', 'user_profile_settings', 'custom_foods', 'food_entries', 'weight_entries'].map((table) => supabase.from(table).delete().eq('user_id', userId)));
};
