import { AppData, FoodEntry, FoodItem, Goals, SyncStatus, UserProfile, WeightEntry } from '@/types';
import { getSupabaseClient } from './supabase/client';

type SyncDecision = 'merge' | 'replaceLocal' | 'uploadLocal' | 'localOnly';
const now = () => new Date().toISOString();
const localId = (id?: string) => id ?? `local-${crypto.randomUUID?.() ?? Date.now()}`;
const newer = <T extends { updatedAt?: string; updated_at?: string }>(a?: T, b?: T) => {
  if (!a) return b;
  if (!b) return a;
  return new Date((a.updatedAt ?? a.updated_at) || 0) >= new Date((b.updatedAt ?? b.updated_at) || 0) ? a : b;
};

export const hasLocalUserData = (data: AppData) => Boolean(data.goals || data.entries.length || data.weightEntries.length || data.customFoods.length);

export const markPending = <T extends { id?: string; localId?: string; syncStatus?: SyncStatus; updatedAt?: string }>(record: T): T => ({
  ...record,
  localId: record.localId ?? localId(record.id),
  syncStatus: 'pending' as SyncStatus,
  updatedAt: now(),
});

export const updateSyncMeta = (data: AppData, status: AppData['syncMetadata']['status'], lastError?: string): AppData => ({
  ...data,
  syncMetadata: {
    ...data.syncMetadata,
    status,
    lastSyncAt: status === 'synced' ? now() : data.syncMetadata.lastSyncAt,
    pendingChanges: [...data.entries, ...data.weightEntries, ...data.customFoods].filter((item) => item.syncStatus === 'pending' || item.syncStatus === 'error').length,
    lastError,
  },
});

const toGoalsRow = (userId: string, goals: Goals) => ({ user_id: userId, calorie_goal: goals.calories, protein_goal: goals.protein, carbs_goal: goals.carbs, fat_goal: goals.fat, updated_at: now() });
const fromGoalsRow = (row: any): Goals | null => row ? { calories: row.calorie_goal, protein: Number(row.protein_goal), carbs: Number(row.carbs_goal), fat: Number(row.fat_goal) } : null;
const toProfileRow = (userId: string, profile: UserProfile) => ({ user_id: userId, sex: profile.sex ?? null, age: profile.age ?? null, height_cm: profile.heightCm ?? null, activity_level: profile.activityLevel ?? null, goal: profile.goal ?? null, updated_at: profile.updatedAt ?? now() });
const fromProfileRow = (row: any): UserProfile => row ? { sex: row.sex ?? undefined, age: row.age ?? undefined, heightCm: row.height_cm ? Number(row.height_cm) : undefined, activityLevel: row.activity_level ?? undefined, goal: row.goal ?? undefined, updatedAt: row.updated_at } : {};
const toFoodRow = (userId: string, food: FoodItem) => ({ user_id: userId, local_id: food.localId ?? food.id, name: food.name, category: food.category, serving_type: food.servingType, default_serving_grams: food.defaultServingGrams ?? null, calories: food.calories, protein: food.protein, carbs: food.carbs, fat: food.fat, updated_at: food.updatedAt ?? now(), deleted_at: food.deletedAt ?? null });
const fromFoodRow = (row: any): FoodItem => ({ id: row.local_id ?? row.id, localId: row.local_id ?? row.id, remoteId: row.id, name: row.name, category: row.category ?? 'Custom', servingType: row.serving_type, defaultServingGrams: row.default_serving_grams ? Number(row.default_serving_grams) : undefined, calories: Number(row.calories), protein: Number(row.protein), carbs: Number(row.carbs), fat: Number(row.fat), isCustom: true, syncStatus: 'synced', createdAt: row.created_at, updatedAt: row.updated_at, deletedAt: row.deleted_at ?? undefined });
const toEntryRow = (userId: string, entry: FoodEntry) => ({ user_id: userId, local_id: entry.localId ?? entry.id, date: entry.date, meal_type: entry.mealType, food_id: entry.sourceFoodId ?? null, food_name: entry.name, quantity: entry.quantity ?? null, quantity_unit: entry.unit ?? null, calories: entry.calories, protein: entry.protein, carbs: entry.carbs, fat: entry.fat, source: entry.sourceFoodId ? 'food' : 'manual', updated_at: entry.updatedAt, deleted_at: entry.deletedAt ?? null });
const fromEntryRow = (row: any): FoodEntry => ({ id: row.local_id ?? row.id, localId: row.local_id ?? row.id, remoteId: row.id, date: row.date, mealType: row.meal_type, sourceFoodId: row.food_id ?? undefined, name: row.food_name, quantity: row.quantity ? Number(row.quantity) : undefined, unit: row.quantity_unit ?? undefined, calories: Number(row.calories), protein: Number(row.protein), carbs: Number(row.carbs), fat: Number(row.fat), createdAt: row.created_at, updatedAt: row.updated_at, syncStatus: 'synced', deletedAt: row.deleted_at ?? undefined });
const toWeightRow = (userId: string, entry: WeightEntry) => ({ user_id: userId, local_id: entry.localId ?? entry.date, date: entry.date, weight_kg: entry.weightKg, note: entry.note ?? null, updated_at: entry.updatedAt, deleted_at: entry.deletedAt ?? null });
const fromWeightRow = (row: any): WeightEntry => ({ date: row.date, localId: row.local_id ?? row.date, remoteId: row.id, weightKg: Number(row.weight_kg), note: row.note ?? undefined, createdAt: row.created_at, updatedAt: row.updated_at, syncStatus: 'synced', deletedAt: row.deleted_at ?? undefined });

export const downloadCloudData = async (userId: string, base: AppData): Promise<AppData> => {
  const supabase = getSupabaseClient();
  if (!supabase) throw new Error('Supabase is not configured.');
  const [{ data: goals }, { data: profile }, { data: foods }, { data: entries }, { data: weights }, { data: meta }] = await Promise.all([
    supabase.from('user_goals').select('*').eq('user_id', userId).maybeSingle(),
    supabase.from('user_profile_settings').select('*').eq('user_id', userId).maybeSingle(),
    supabase.from('custom_foods').select('*').eq('user_id', userId).is('deleted_at', null),
    supabase.from('food_entries').select('*').eq('user_id', userId).is('deleted_at', null),
    supabase.from('weight_entries').select('*').eq('user_id', userId).is('deleted_at', null),
    supabase.from('sync_metadata').select('*').eq('user_id', userId).maybeSingle(),
  ]);
  return { ...base, goals: fromGoalsRow(goals), userProfile: fromProfileRow(profile), customFoods: (foods ?? []).map(fromFoodRow), entries: (entries ?? []).map(fromEntryRow), weightEntries: (weights ?? []).map(fromWeightRow), syncMetadata: { ...base.syncMetadata, status: 'synced', lastSyncAt: meta?.last_sync_at ?? now(), pendingChanges: 0 } };
};

const mergeData = (local: AppData, cloud: AppData): AppData => {
  const foodMap = new Map<string, FoodItem>();
  [...cloud.customFoods, ...local.customFoods].forEach((food) => foodMap.set((food.localId ?? food.id).toLowerCase(), newer(foodMap.get((food.localId ?? food.id).toLowerCase()), food)!));
  local.customFoods.forEach((food) => foodMap.set(food.name.trim().toLowerCase(), newer(foodMap.get(food.name.trim().toLowerCase()), food)!));
  const entryMap = new Map<string, FoodEntry>();
  [...cloud.entries, ...local.entries].forEach((entry) => entryMap.set(`${entry.localId ?? entry.id}-${entry.date}-${entry.name}`, newer(entryMap.get(`${entry.localId ?? entry.id}-${entry.date}-${entry.name}`), entry)!));
  const weightMap = new Map<string, WeightEntry>();
  [...cloud.weightEntries, ...local.weightEntries].forEach((entry) => weightMap.set(entry.date, newer(weightMap.get(entry.date), entry)!));
  return { ...local, goals: local.goals ?? cloud.goals, userProfile: { ...cloud.userProfile, ...local.userProfile }, customFoods: [...foodMap.values()].filter((x) => !x.deletedAt), entries: [...entryMap.values()].filter((x) => !x.deletedAt), weightEntries: [...weightMap.values()].filter((x) => !x.deletedAt) };
};

export const uploadCloudData = async (userId: string, data: AppData): Promise<AppData> => {
  const supabase = getSupabaseClient();
  if (!supabase) throw new Error('Supabase is not configured.');
  await supabase.from('profiles').upsert({ id: userId, updated_at: now() });
  if (data.goals) await supabase.from('user_goals').upsert(toGoalsRow(userId, data.goals), { onConflict: 'user_id' });
  await supabase.from('user_profile_settings').upsert(toProfileRow(userId, data.userProfile), { onConflict: 'user_id' });
  if (data.customFoods.length) await supabase.from('custom_foods').upsert(data.customFoods.map((food) => toFoodRow(userId, food)), { onConflict: 'user_id,local_id' });
  if (data.entries.length) await supabase.from('food_entries').upsert(data.entries.map((entry) => toEntryRow(userId, entry)), { onConflict: 'user_id,local_id' });
  if (data.weightEntries.length) await supabase.from('weight_entries').upsert(data.weightEntries.map((entry) => toWeightRow(userId, entry)), { onConflict: 'user_id,date' });
  await supabase.from('sync_metadata').upsert({ user_id: userId, device_id: data.syncMetadata.deviceId, last_sync_at: now(), updated_at: now() }, { onConflict: 'user_id,device_id' });
  return updateSyncMeta({ ...data, customFoods: data.customFoods.map((x) => ({ ...x, syncStatus: 'synced' })), entries: data.entries.map((x) => ({ ...x, syncStatus: 'synced' })), weightEntries: data.weightEntries.map((x) => ({ ...x, syncStatus: 'synced' })) }, 'synced');
};

export const syncWithCloud = async (userId: string, local: AppData, decision: SyncDecision = 'merge') => {
  if (!navigator.onLine) return updateSyncMeta(local, 'offline', 'Device is offline.');
  if (decision === 'localOnly') return updateSyncMeta(local, 'local-only');
  const cloud = await downloadCloudData(userId, local);
  if (decision === 'replaceLocal') return updateSyncMeta(cloud, 'synced');
  const merged = decision === 'uploadLocal' ? local : mergeData(local, cloud);
  return uploadCloudData(userId, merged);
};

export const deleteCloudData = async (userId: string) => {
  const supabase = getSupabaseClient();
  if (!supabase) throw new Error('Supabase is not configured.');
  await Promise.all(['user_goals', 'user_profile_settings', 'custom_foods', 'food_entries', 'weight_entries', 'sync_metadata'].map((table) => supabase.from(table).delete().eq('user_id', userId)));
};
