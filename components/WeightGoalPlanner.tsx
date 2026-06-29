'use client';

import { useMemo, useState } from 'react';
import { WeightEntry } from '@/types';
import { todayKey } from '@/lib/nutrition';
import { latestWeight } from '@/lib/weight';

const caloriesPerKg = 7700;
const dayMs = 24 * 60 * 60 * 1000;
const rawDateDiffDays = (from: string, to: string) => Math.ceil((new Date(`${to}T00:00:00`).getTime() - new Date(`${from}T00:00:00`).getTime()) / dayMs);
const dateDiffDays = (from: string, to: string) => Math.max(1, rawDateDiffDays(from, to));
const addMonths = (date: Date, months: number) => new Date(date.getFullYear(), date.getMonth() + months, date.getDate());
const key = (date: Date) => date.toISOString().slice(0, 10);

export default function WeightGoalPlanner({ entries }: { entries: WeightEntry[] }) {
  const latest = latestWeight(entries);
  const startDate = todayKey();
  const [targetWeight, setTargetWeight] = useState(latest ? String(Math.max(1, Math.round((latest.weightKg - 5) * 10) / 10)) : '');
  const [targetDate, setTargetDate] = useState(key(addMonths(new Date(), 3)));

  const plan = useMemo(() => {
    if (!latest) return null;
    const goal = Number(targetWeight);
    if (!Number.isFinite(goal) || goal <= 0 || !targetDate || rawDateDiffDays(startDate, targetDate) <= 0) return null;
    const days = dateDiffDays(startDate, targetDate);
    const totalChange = goal - latest.weightKg;
    const dailyChange = totalChange / days;
    const weeklyChange = dailyChange * 7;
    const dailyCalories = Math.round((totalChange * caloriesPerKg) / days);
    const months = Math.max(1, Math.ceil(days / 30));
    const rows = Array.from({ length: months + 1 }, (_, index) => {
      const rowDate = index === months ? new Date(`${targetDate}T00:00:00`) : addMonths(new Date(`${startDate}T00:00:00`), index);
      const elapsed = Math.min(days, Math.max(0, rawDateDiffDays(startDate, key(rowDate))));
      const expectedWeight = latest.weightKg + dailyChange * elapsed;
      const closestActual = entries.filter((entry) => entry.date <= key(rowDate)).sort((a, b) => b.date.localeCompare(a.date))[0];
      const difference = closestActual ? closestActual.weightKg - expectedWeight : null;
      return { date: key(rowDate), expectedWeight, actualWeight: closestActual?.weightKg, difference };
    });
    return { days, totalChange, weeklyChange, dailyCalories, rows };
  }, [entries, latest, startDate, targetDate, targetWeight]);

  if (!latest) return <section className="rounded-3xl bg-white p-5 shadow-soft"><h2 className="text-xl font-bold">Weight goal planner</h2><p className="mt-2 text-sm text-slate-500">Add a weight entry first to calculate a target timeline.</p></section>;

  return <section className="rounded-3xl bg-white p-5 shadow-soft"><h2 className="text-xl font-bold">Weight goal planner</h2><p className="mt-1 text-sm text-slate-500">Set a target weight and date to estimate the calorie change and monthly weight path.</p><div className="mt-4 grid grid-cols-2 gap-3"><label className="text-sm font-medium text-slate-600">Goal weight kg<input className="mt-1 w-full rounded-2xl border p-3" type="number" min="1" step="0.1" value={targetWeight} onChange={(event) => setTargetWeight(event.target.value)} /></label><label className="text-sm font-medium text-slate-600">Goal date<input className="mt-1 w-full rounded-2xl border p-3" type="date" value={targetDate} onChange={(event) => setTargetDate(event.target.value)} /></label></div>{plan ? <><div className="mt-4 grid gap-2 sm:grid-cols-3"><div className="rounded-2xl bg-clean-50 p-3"><p className="text-xs text-slate-500">Target change</p><p className="text-xl font-black">{plan.totalChange >= 0 ? '+' : ''}{plan.totalChange.toFixed(1)} kg</p></div><div className="rounded-2xl bg-slate-50 p-3"><p className="text-xs text-slate-500">Weekly pace</p><p className="text-xl font-black">{plan.weeklyChange >= 0 ? '+' : ''}{plan.weeklyChange.toFixed(2)} kg</p></div><div className="rounded-2xl bg-slate-900 p-3 text-white"><p className="text-xs text-slate-300">Daily calories vs maintenance</p><p className="text-xl font-black">{plan.dailyCalories >= 0 ? '+' : ''}{plan.dailyCalories} kcal</p></div></div><div className="mt-4 overflow-x-auto"><table className="w-full min-w-[520px] text-left text-sm"><thead><tr className="border-b text-slate-500"><th className="py-2">Month/date</th><th>Should be</th><th>Actual</th><th>Status line</th></tr></thead><tbody>{plan.rows.map((row) => <tr key={row.date} className="border-b border-slate-100"><td className="py-2 font-semibold">{row.date}</td><td>{row.expectedWeight.toFixed(1)} kg</td><td>{row.actualWeight ? `${row.actualWeight.toFixed(1)} kg` : '—'}</td><td>{row.difference === null ? 'No weigh-in yet' : row.difference <= 0 ? `${Math.abs(row.difference).toFixed(1)} kg ahead/on track` : `${row.difference.toFixed(1)} kg behind`}</td></tr>)}</tbody></table></div></> : <p className="mt-3 text-sm text-red-600">Enter a valid goal weight and a future date.</p>}</section>;
}
