'use client';

import { Dispatch, useMemo, useState } from 'react';
import { AppData, FoodEntry } from '@/types';
import { starterFoods } from '@/lib/foods';
import { addDays, sumEntries, uid } from '@/lib/nutrition';
import CalendarPicker from './CalendarPicker';
import MacroProgress from './MacroProgress';
import FoodEntryList from './FoodEntryList';
import AddEntryModal from './AddEntryModal';

export default function Dashboard({ data, dispatch, selectedDate, setSelectedDate, onOpenAdd }: { data: AppData; dispatch: Dispatch<any>; selectedDate: string; setSelectedDate: (date: string) => void; onOpenAdd?: () => void }) {
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<FoodEntry | undefined>();
  const foods = [...data.customFoods, ...starterFoods];
  const entries = data.entries.filter((entry) => entry.date === selectedDate);
  const weight = data.weightEntries.find((entry) => entry.date === selectedDate);
  const totals = sumEntries(entries);
  const loggedDates = useMemo(() => new Set([...data.entries.map((entry) => entry.date), ...data.weightEntries.map((entry) => entry.date)]), [data.entries, data.weightEntries]);

  const save = (entry: FoodEntry) => {
    dispatch({ type: editing ? 'updateEntry' : 'addEntry', entry });
    setModal(false);
    setEditing(undefined);
  };
  const duplicate = (entry: FoodEntry) => dispatch({ type: 'addEntry', entry: { ...entry, id: uid(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() } });
  const copyYesterday = () => data.entries.filter((entry) => entry.date === addDays(selectedDate, -1)).forEach((entry) => dispatch({ type: 'addEntry', entry: { ...entry, id: uid(), date: selectedDate, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() } }));

  return (
    <div className="space-y-5">
      <CalendarPicker selectedDate={selectedDate} onChange={setSelectedDate} loggedDates={loggedDates} />
      {weight ? <section className="rounded-3xl bg-white p-4 shadow-soft"><p className="text-sm text-slate-500">Weight on selected day</p><p className="text-2xl font-black">{weight.weightKg.toFixed(1)} kg</p>{weight.note ? <p className="text-sm text-slate-500">{weight.note}</p> : null}</section> : null}
      <MacroProgress totals={totals} goals={data.goals!} />
      <section className="grid grid-cols-2 gap-3"><button onClick={() => (onOpenAdd ? onOpenAdd() : setModal(true))} className="rounded-3xl bg-clean-600 p-4 font-bold text-white shadow-soft">+ Add meal</button><button onClick={copyYesterday} className="rounded-3xl bg-white p-4 font-bold shadow-soft">Copy yesterday</button></section>
      <FoodEntryList entries={entries} onEdit={(entry) => { setEditing(entry); setModal(true); }} onDelete={(id) => dispatch({ type: 'deleteEntry', id })} onDuplicate={duplicate} />
      <button onClick={() => (onOpenAdd ? onOpenAdd() : setModal(true))} className="fixed bottom-20 right-5 rounded-full bg-clean-600 px-6 py-4 font-black text-white shadow-2xl sm:hidden">+ Quick add</button>
      <AddEntryModal open={modal} date={selectedDate} foods={foods} editing={editing} onClose={() => { setModal(false); setEditing(undefined); }} onSave={save} />
    </div>
  );
}
