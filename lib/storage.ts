import { AppData, FoodEntry, FoodItem, Goals } from '@/types';
const KEY = 'clean-macro-tracker:v1';
export const defaultData: AppData = { version: 1, goals: null, customFoods: [], entries: [] };
export const loadData = (): AppData => {
 if (typeof window === 'undefined') return defaultData;
 try { const raw = localStorage.getItem(KEY); return raw ? { ...defaultData, ...JSON.parse(raw) } : defaultData; } catch { return defaultData; }
};
export const saveData = (data: AppData) => { if (typeof window !== 'undefined') localStorage.setItem(KEY, JSON.stringify(data)); };
export const exportData = (data: AppData) => JSON.stringify(data, null, 2);
export const importData = (raw: string): AppData => {
 const parsed = JSON.parse(raw) as AppData;
 if (!parsed || parsed.version !== 1 || !Array.isArray(parsed.entries) || !Array.isArray(parsed.customFoods)) throw new Error('This does not look like a Clean Macro Tracker export.');
 return { ...defaultData, ...parsed };
};
export type DataAction =
 | { type: 'setGoals'; goals: Goals }
 | { type: 'addEntry'; entry: FoodEntry }
 | { type: 'updateEntry'; entry: FoodEntry }
 | { type: 'deleteEntry'; id: string }
 | { type: 'addCustomFood'; food: FoodItem }
 | { type: 'updateCustomFood'; food: FoodItem }
 | { type: 'replace'; data: AppData }
 | { type: 'reset' };
export const reducer = (data: AppData, action: DataAction): AppData => {
 switch (action.type) {
  case 'setGoals': return { ...data, goals: action.goals };
  case 'addEntry': return { ...data, entries: [action.entry, ...data.entries] };
  case 'updateEntry': return { ...data, entries: data.entries.map((e) => e.id === action.entry.id ? action.entry : e) };
  case 'deleteEntry': return { ...data, entries: data.entries.filter((e) => e.id !== action.id) };
  case 'addCustomFood': return { ...data, customFoods: [action.food, ...data.customFoods] };
  case 'updateCustomFood': return { ...data, customFoods: data.customFoods.map((f) => f.id === action.food.id ? action.food : f) };
  case 'replace': return action.data;
  case 'reset': return defaultData;
 }
};
