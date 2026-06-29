'use client';

import { useEffect, useReducer, useState } from 'react';
import Dashboard from '@/components/Dashboard';
import ProgressPage from '@/components/ProgressPage';
import Settings from '@/components/Settings';
import AddEntryModal from '@/components/AddEntryModal';
import { starterFoods } from '@/lib/foods';
import { defaultData, loadDataFromDb, saveDataToDb } from '@/lib/db';
import { reducer } from '@/lib/storage';
import { Goals } from '@/types';
import { todayKey } from '@/lib/nutrition';

type Tab = 'today' | 'calendar' | 'add' | 'progress' | 'settings';

export default function Page() {
  const [data, dispatch] = useReducer(reducer, defaultData);
  const [ready, setReady] = useState(false);
  const [selectedDate, setSelectedDate] = useState(todayKey());
  const [activeTab, setActiveTab] = useState<Tab>('today');
  const [goals, setGoals] = useState<Goals>({ calories: 2000, protein: 150, carbs: 200, fat: 60 });
  const [error, setError] = useState('');

  useEffect(() => {
    loadDataFromDb().then((loaded) => {
      dispatch({ type: 'replace', data: loaded });
      setReady(true);
    });
  }, []);

  useEffect(() => {
    if (ready) saveDataToDb(data).catch(console.error);
  }, [data, ready]);

  if (!ready) return <main className="flex min-h-screen items-center justify-center p-4 text-slate-500">Loading your local tracker...</main>;

  if (!data.goals) {
    return (
      <main className="flex min-h-screen items-center justify-center p-4">
        <section className="w-full max-w-md rounded-3xl bg-white p-6 shadow-soft">
          <p className="font-semibold text-clean-700">Welcome</p>
          <h1 className="text-3xl font-black">Set your daily goals</h1>
          <p className="mt-2 text-slate-500">Data stays only in this browser using IndexedDB. No login, no backend.</p>
          <div className="mt-5 grid grid-cols-2 gap-3">
            {(['calories', 'protein', 'carbs', 'fat'] as const).map((key) => <label key={key} className="text-sm capitalize">{key}<input className="mt-1 w-full rounded-2xl border p-3" type="number" min="1" value={goals[key]} onChange={(event) => setGoals((current) => ({ ...current, [key]: Number(event.target.value) }))} /></label>)}
          </div>
          {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}
          <button className="mt-5 w-full rounded-2xl bg-clean-600 p-4 font-bold text-white" onClick={() => Object.values(goals).some((value) => value <= 0) ? setError('Goals must be greater than 0.') : dispatch({ type: 'setGoals', goals })}>Start tracking</button>
        </section>
      </main>
    );
  }

  return (
    <main className="mx-auto min-h-screen max-w-5xl px-4 pb-28 pt-5">
      <header className="mb-5 flex items-center justify-between">
        <div><p className="text-sm font-semibold text-clean-700">No account needed</p><h1 className="text-3xl font-black tracking-tight">Clean Macro Tracker</h1></div>
      </header>
      {activeTab === 'today' || activeTab === 'calendar' ? <Dashboard data={data} dispatch={dispatch} selectedDate={selectedDate} setSelectedDate={setSelectedDate} onOpenAdd={() => setActiveTab('add')} /> : null}
      {activeTab === 'add' ? <AddEntryModal open date={selectedDate} foods={[...data.customFoods, ...starterFoods]} onClose={() => setActiveTab('today')} onSave={(entry) => { dispatch({ type: 'addEntry', entry }); setActiveTab('today'); }} /> : null}
      {activeTab === 'progress' ? <ProgressPage data={data} selectedDate={selectedDate} dispatch={dispatch} /> : null}
      {activeTab === 'settings' ? <Settings data={data} onGoals={(goals) => dispatch({ type: 'setGoals', goals })} onCustomFood={(food) => dispatch({ type: 'addCustomFood', food })} onImport={(data) => dispatch({ type: 'replace', data })} onReset={() => dispatch({ type: 'reset' })} /> : null}
      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 px-2 py-2 backdrop-blur">
        <div className="mx-auto grid max-w-5xl grid-cols-5 gap-1">
          {(['today', 'calendar', 'add', 'progress', 'settings'] as Tab[]).map((tab) => <button key={tab} className={`rounded-2xl px-2 py-3 text-xs font-bold capitalize ${activeTab === tab ? 'bg-clean-600 text-white' : 'text-slate-600'}`} onClick={() => setActiveTab(tab)}>{tab === 'add' ? 'Add Food' : tab}</button>)}
        </div>
      </nav>
    </main>
  );
}
