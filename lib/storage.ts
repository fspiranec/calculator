import { AppData, FoodEntry, FoodItem, Goals, UserProfile, WeightEntry } from '@/types';
import { defaultData } from './db';

export type DataAction =
  | { type: 'setGoals'; goals: Goals }
  | { type: 'setProfile'; profile: UserProfile }
  | { type: 'addEntry'; entry: FoodEntry }
  | { type: 'updateEntry'; entry: FoodEntry }
  | { type: 'deleteEntry'; id: string }
  | { type: 'addCustomFood'; food: FoodItem }
  | { type: 'updateCustomFood'; food: FoodItem }
  | { type: 'upsertWeight'; entry: WeightEntry }
  | { type: 'deleteWeight'; date: string }
  | { type: 'replace'; data: AppData }
  | { type: 'reset' };

export const reducer = (data: AppData, action: DataAction): AppData => {
  switch (action.type) {
    case 'setGoals':
      return { ...data, goals: action.goals };
    case 'setProfile':
      return { ...data, userProfile: { ...data.userProfile, ...action.profile } };
    case 'addEntry':
      return { ...data, entries: [action.entry, ...data.entries] };
    case 'updateEntry':
      return { ...data, entries: data.entries.map((entry) => (entry.id === action.entry.id ? action.entry : entry)) };
    case 'deleteEntry':
      return { ...data, entries: data.entries.filter((entry) => entry.id !== action.id) };
    case 'addCustomFood':
      return { ...data, customFoods: [action.food, ...data.customFoods] };
    case 'updateCustomFood':
      return { ...data, customFoods: data.customFoods.map((food) => (food.id === action.food.id ? action.food : food)) };
    case 'upsertWeight':
      return {
        ...data,
        weightEntries: [action.entry, ...data.weightEntries.filter((entry) => entry.date !== action.entry.date)].sort((a, b) => b.date.localeCompare(a.date)),
      };
    case 'deleteWeight':
      return { ...data, weightEntries: data.weightEntries.filter((entry) => entry.date !== action.date) };
    case 'replace':
      return action.data;
    case 'reset':
      return defaultData;
  }
};
