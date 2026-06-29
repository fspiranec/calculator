'use client';

import { useEffect, useState } from 'react';
import { WeightEntry } from '@/types';

export default function WeightEntryForm({ date, entry, onSave, onDelete }: { date: string; entry?: WeightEntry; onSave: (entry: WeightEntry) => void; onDelete: (date: string) => void }) {
  const [weightKg, setWeightKg] = useState(entry?.weightKg?.toString() ?? '');
  const [note, setNote] = useState(entry?.note ?? '');
  const [error, setError] = useState('');

  useEffect(() => {
    setWeightKg(entry?.weightKg?.toString() ?? '');
    setNote(entry?.note ?? '');
    setError('');
  }, [date, entry]);

  return (
    <section className="rounded-3xl bg-white p-5 shadow-soft">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-clean-700">Daily weight</p>
          <h2 className="text-xl font-bold">{entry ? `${entry.weightKg.toFixed(1)} kg` : 'No weight logged'}</h2>
          {entry?.note ? <p className="text-sm text-slate-500">{entry.note}</p> : null}
        </div>
      </div>
      <form
        className="mt-4 space-y-3"
        onSubmit={(event) => {
          event.preventDefault();
          const value = Number(weightKg);
          if (!Number.isFinite(value) || value <= 0) {
            setError('Weight must be greater than 0 kg.');
            return;
          }
          const now = new Date().toISOString();
          onSave({ date, weightKg: Math.round(value * 10) / 10, note: note.trim() || undefined, createdAt: entry?.createdAt ?? now, updatedAt: now });
        }}
      >
        <div className="grid gap-3 sm:grid-cols-[1fr_2fr]">
          <label className="text-sm font-medium text-slate-600">
            Weight kg
            <input className="mt-1 w-full rounded-2xl border border-slate-200 p-3" type="number" min="0.1" step="0.1" value={weightKg} onChange={(event) => setWeightKg(event.target.value)} />
          </label>
          <label className="text-sm font-medium text-slate-600">
            Note optional
            <input className="mt-1 w-full rounded-2xl border border-slate-200 p-3" placeholder="morning fasted, after workout..." value={note} onChange={(event) => setNote(event.target.value)} />
          </label>
        </div>
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        <div className="flex gap-2">
          <button className="flex-1 rounded-2xl bg-clean-600 p-3 font-bold text-white">Save weight</button>
          {entry ? <button type="button" className="rounded-2xl bg-red-50 px-4 font-bold text-red-700" onClick={() => onDelete(date)}>Delete</button> : null}
        </div>
      </form>
    </section>
  );
}
