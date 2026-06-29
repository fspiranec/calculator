import { FoodEntry, FoodItem, MacroSet } from '@/types';
export const todayKey = () => toDateKey(new Date());
export const toDateKey = (date: Date) => date.toISOString().slice(0, 10);
export const displayDate = (key: string) => new Date(`${key}T00:00:00`).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
export const addDays = (key: string, days: number) => { const d = new Date(`${key}T00:00:00`); d.setDate(d.getDate() + days); return toDateKey(d); };
const roundMacro = (value: number) => Math.round(value * 10) / 10;
export const roundMacros = (m: MacroSet): MacroSet => ({ calories: Math.round(m.calories), protein: roundMacro(m.protein), carbs: roundMacro(m.carbs), fat: roundMacro(m.fat) });
export const calculateFoodMacros = (food: FoodItem, quantity: number): MacroSet => {
  const factor = food.servingType === 'per100g' ? quantity / 100 : quantity;
  return roundMacros({ calories: food.calories * factor, protein: food.protein * factor, carbs: food.carbs * factor, fat: food.fat * factor });
};
export const sumEntries = (entries: FoodEntry[]): MacroSet => roundMacros(entries.reduce((a, e) => ({ calories: a.calories + e.calories, protein: a.protein + e.protein, carbs: a.carbs + e.carbs, fat: a.fat + e.fat }), { calories: 0, protein: 0, carbs: 0, fat: 0 }));
export const uid = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
