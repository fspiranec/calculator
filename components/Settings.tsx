'use client';

import { useState } from 'react';
import { User } from '@supabase/supabase-js';
import { AppData, Goals } from '@/types';
import { deleteMyAppData } from '@/lib/database';
import CustomFoodForm from './CustomFoodForm';
import DataSettings from './DataSettings';
import UserMenu from './UserMenu';

export default function Settings({ data, user, onGoals, onCustomFood, onImport, onReset }: { data: AppData; user: User; onGoals: (goals: Goals) => void; onCustomFood: (food: any) => void; onImport: (data: AppData) => void; onReset: () => void }) {
  const [goals, setGoals] = useState(data.goals ?? { calories: 2000, protein: 150, carbs: 200, fat: 60 });
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const update = (key: keyof Goals, value: number) => setGoals((current) => ({ ...current, [key]: value }));

  return <div className="space-y-5"><UserMenu user={user} /><section className="space-y-4 rounded-3xl bg-white p-5 shadow-soft"><h2 className="text-xl font-bold">Daily goals</h2><div className="grid grid-cols-2 gap-2">{(['calories', 'protein', 'carbs', 'fat'] as const).map((key) => <label key={key} className="text-sm capitalize">Daily {key}<input className="mt-1 w-full rounded-2xl border p-3" type="number" min="1" value={goals[key]} onChange={(event) => update(key, Number(event.target.value))} /></label>)}</div>{error ? <p className="text-sm text-red-600">{error}</p> : null}<button className="w-full rounded-2xl bg-clean-600 p-3 font-bold text-white" onClick={() => Object.values(goals).some((value) => value <= 0) ? setError('Goals must be greater than 0.') : onGoals(goals)}>Save goals</button></section><section className="rounded-3xl bg-white p-5 shadow-soft"><h2 className="mb-3 text-xl font-bold">Create custom food</h2><CustomFoodForm onSave={onCustomFood} /></section><DataSettings data={data} onImport={onImport} onReset={onReset} /><section className="rounded-3xl bg-white p-5 shadow-soft"><h2 className="text-xl font-bold">Delete my account data</h2><p className="mt-2 text-sm text-slate-600">This deletes your app data from Supabase: custom foods, food entries, weight entries, goals and profile settings. It does not delete predefined foods or your Supabase Auth user.</p><button className="mt-3 w-full rounded-2xl bg-red-50 p-3 font-bold text-red-700" onClick={async () => { if (confirm('Delete all of your Clean Macro Tracker app data? This cannot be undone.')) { await deleteMyAppData(user.id); onReset(); setMessage('Your app data was deleted.'); } }}>Delete my account data</button>{message ? <p className="mt-2 text-sm font-semibold text-clean-700">{message}</p> : null}</section></div>;
}
