import { AppData, BackupData } from '@/types';
import { defaultData } from './db';

export const createBackup = (data: AppData): BackupData => ({
  version: 1,
  exportedAt: new Date().toISOString(),
  goals: data.goals,
  userProfile: data.userProfile,
  customFoods: data.customFoods,
  foodEntries: data.entries,
  weightEntries: data.weightEntries,
});

export const backupToJson = (data: AppData) => JSON.stringify(createBackup(data), null, 2);

export const parseBackup = (raw: string): AppData => {
  const parsed = JSON.parse(raw) as Partial<BackupData>;
  if (parsed.version !== 1 || !Array.isArray(parsed.customFoods) || !Array.isArray(parsed.foodEntries) || !Array.isArray(parsed.weightEntries)) {
    throw new Error('This file is not a valid Clean Macro Tracker backup.');
  }

  return {
    ...defaultData,
    goals: parsed.goals ?? null,
    userProfile: parsed.userProfile ?? {},
    customFoods: parsed.customFoods,
    entries: parsed.foodEntries,
    weightEntries: parsed.weightEntries,
  };
};
