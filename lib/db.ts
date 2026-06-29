import { AppData } from '@/types';

const DB_NAME = 'clean-macro-tracker-db';
const STORE = 'app';
const DATA_KEY = 'data';
const LEGACY_KEY = 'clean-macro-tracker:v1';

export const defaultData: AppData = {
  version: 1,
  goals: null,
  userProfile: {},
  customFoods: [],
  entries: [],
  weightEntries: [],
};

const normalizeData = (value: Partial<AppData> | null | undefined): AppData => ({
  ...defaultData,
  ...value,
  userProfile: value?.userProfile ?? {},
  customFoods: value?.customFoods ?? [],
  entries: value?.entries ?? [],
  weightEntries: value?.weightEntries ?? [],
});

const openDatabase = () =>
  new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => request.result.createObjectStore(STORE);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });

const readFromDb = async (): Promise<AppData | null> => {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readonly');
    const request = tx.objectStore(STORE).get(DATA_KEY);
    request.onsuccess = () => resolve(request.result ? normalizeData(request.result as AppData) : null);
    request.onerror = () => reject(request.error);
    tx.oncomplete = () => db.close();
  });
};

export const saveDataToDb = async (data: AppData) => {
  const db = await openDatabase();
  return new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite');
    tx.objectStore(STORE).put(normalizeData(data), DATA_KEY);
    tx.oncomplete = () => {
      db.close();
      resolve();
    };
    tx.onerror = () => reject(tx.error);
  });
};

export const loadDataFromDb = async (): Promise<AppData> => {
  if (typeof window === 'undefined') return defaultData;
  const existing = await readFromDb();
  if (existing) return existing;

  const legacy = localStorage.getItem(LEGACY_KEY);
  if (legacy) {
    try {
      const migrated = normalizeData(JSON.parse(legacy) as AppData);
      await saveDataToDb(migrated);
      localStorage.removeItem(LEGACY_KEY);
      return migrated;
    } catch {
      return defaultData;
    }
  }

  return defaultData;
};

export const resetDb = async () => saveDataToDb(defaultData);
