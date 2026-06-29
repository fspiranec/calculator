'use client';

import { useEffect, useReducer, useState } from 'react';
import { useRouter } from 'next/navigation';
import { User } from '@supabase/supabase-js';
import Dashboard from '@/components/Dashboard';
import ProgressPage from '@/components/ProgressPage';
import Settings from '@/components/Settings';
import AddEntryModal from '@/components/AddEntryModal';
import { starterFoods } from '@/lib/foods';
import { defaultData } from '@/lib/db';
import { fetchUserData, saveUserData } from '@/lib/database';
import { getCurrentUser } from '@/lib/auth';
import { reducer } from '@/lib/storage';
import { Goals } from '@/types';
import { todayKey } from '@/lib/nutrition';

type Tab = 'today' | 'calendar' | 'add' | 'progress' | 'settings';

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [data, dispatch] = useReducer(reducer, defaultData);
  const [ready, setReady] = useState(false);
  const [selectedDate, setSelectedDate] = useState(todayKey());
  const [activeTab, setActiveTab] = useState<Tab>('today');
  const [goals, setGoals] = useState<Goals>({ calories: 2000, protein: 150, carbs: 200, fat: 60 });
  const [error, setError] = useState('');
  const [saveError, setSaveError] = useState('');

  useEffect(() => {
    getCurrentUser().then(async (currentUser) => {
      if (!currentUser) {
        router.replace('/login');
        return;
      }
      setUser(currentUser);
      try {
        dispatch({ type: 'replace', data: await fetchUserData(currentUser.id) });
      } catch (fetchError) {
        setSaveError(fetchError instanceof Error ? fetchError.message : 'Could not load Supabase data.');
      } finally {
        setReady(true);
      }
    });
  }, [router]);

  useEffect(() => {
    if (!ready || !user) return;
    const handle = setTimeout(() => {
      saveUserData(user.id, data).then(() => setSaveError('')).catch((saveError) => setSaveError(saveError instanceof Error ? saveError.message : 'Could not save Supabase data.'));
    }, 500);
    return () => clearTimeout(handle);
  }, [data, ready, user]);

  if (!ready) return <main className="flex min-h-screen items-center justify-center p-4 text-slate-500">Loading your secure dashboard...</main>;
  if (!user) return null;

  if (!data.goals) {
    return <main className="flex min-h-screen items-center justify-center p-4"><section className="w-full max-w-md rounded-3xl bg-white p-6 shadow-soft"><p className="font-semibold text-clean-700">Welcome</p><h1 className="text-3xl font-black">Set your daily goals</h1><p className="mt-2 text-slate-500">These goals are saved to your private Supabase account.</p><div className="mt-5 grid grid-cols-2 gap-3">{(['calories', 'protein', 'carbs', 'fat'] as const).map((key) => <label key={key} className="text-sm capitalize">{key}<input className="mt-1 w-full rounded-2xl border p-3" type="number" min="1" value={goals[key]} onChange={(event) => setGoals((current) => ({ ...current, [key]: Number(event.target.value) }))} /></label>)}</div>{error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}<button className="mt-5 w-full rounded-2xl bg-clean-600 p-4 font-bold text-white" onClick={() => Object.values(goals).some((value) => value <= 0) ? setError('Goals must be greater than 0.') : dispatch({ type: 'setGoals', goals })}>Start tracking</button></section></main>;
  }

  return <main className="mx-auto min-h-screen max-w-5xl px-4 pb-28 pt-5"><header className="mb-5 flex items-center justify-between"><div><p className="text-sm font-semibold text-clean-700">Private Supabase account</p><h1 className="text-3xl font-black tracking-tight">Clean Macro Tracker</h1></div></header>{saveError ? <div className="mb-4 rounded-2xl bg-red-50 p-3 text-sm text-red-700">{saveError}</div> : null}{activeTab === 'today' || activeTab === 'calendar' ? <Dashboard data={data} dispatch={dispatch} selectedDate={selectedDate} setSelectedDate={setSelectedDate} onOpenAdd={() => setActiveTab('add')} /> : null}{activeTab === 'add' ? <AddEntryModal open date={selectedDate} foods={[...data.customFoods, ...starterFoods]} onClose={() => setActiveTab('today')} onSave={(entry) => { dispatch({ type: 'addEntry', entry }); setActiveTab('today'); }} /> : null}{activeTab === 'progress' ? <ProgressPage data={data} selectedDate={selectedDate} dispatch={dispatch} /> : null}{activeTab === 'settings' ? <Settings data={data} user={user} onGoals={(goals) => dispatch({ type: 'setGoals', goals })} onCustomFood={(food) => dispatch({ type: 'addCustomFood', food })} onImport={(data) => dispatch({ type: 'replace', data })} onReset={() => dispatch({ type: 'reset' })} /> : null}<nav className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 px-2 py-2 backdrop-blur"><div className="mx-auto grid max-w-5xl grid-cols-5 gap-1">{(['today', 'calendar', 'add', 'progress', 'settings'] as Tab[]).map((tab) => <button key={tab} className={`rounded-2xl px-2 py-3 text-xs font-bold capitalize ${activeTab === tab ? 'bg-clean-600 text-white' : 'text-slate-600'}`} onClick={() => setActiveTab(tab)}>{tab === 'add' ? 'Add Food' : tab}</button>)}</div></nav></main>;
}
