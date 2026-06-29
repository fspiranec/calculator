import { AppData, FoodEntry, FoodItem, Goals, UserProfile, WeightEntry } from '@/types';
import { defaultData } from './db';
import { markPending, updateSyncMeta } from './sync';

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
      return updateSyncMeta({ ...data, goals: action.goals }, 'pending');
    case 'setProfile':
      return updateSyncMeta({ ...data, userProfile: { ...data.userProfile, ...action.profile, updatedAt: new Date().toISOString() } }, 'pending');
    case 'addEntry':
      return updateSyncMeta({ ...data, entries: [markPending(action.entry), ...data.entries] }, 'pending');
    case 'updateEntry':
      return updateSyncMeta({ ...data, entries: data.entries.map((entry) => (entry.id === action.entry.id ? markPending(action.entry) : entry)) }, 'pending');
    case 'deleteEntry':
      return updateSyncMeta({ ...data, entries: data.entries.filter((entry) => entry.id !== action.id) }, 'pending');
    case 'addCustomFood':
      return updateSyncMeta({ ...data, customFoods: [markPending(action.food), ...data.customFoods] }, 'pending');
    case 'updateCustomFood':
      return updateSyncMeta({ ...data, customFoods: data.customFoods.map((food) => (food.id === action.food.id ? markPending(action.food) : food)) }, 'pending');
    case 'upsertWeight':
      return updateSyncMeta({
        ...data,
        weightEntries: [markPending({ ...action.entry, id: action.entry.localId ?? action.entry.date }), ...data.weightEntries.filter((entry) => entry.date !== action.entry.date)].sort((a, b) => b.date.localeCompare(a.date)),
      }, 'pending');
    case 'deleteWeight':
      return updateSyncMeta({ ...data, weightEntries: data.weightEntries.filter((entry) => entry.date !== action.date) }, 'pending');
    case 'replace':
      return action.data;
    case 'reset':
      return defaultData;
  }
};
