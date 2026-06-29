'use client';

import { Dispatch, useCallback, useMemo, useState } from 'react';
import { AppData, Goals, UserProfile, WeightEntry } from '@/types';
import { PeriodRange, filterWeightsByPeriod, latestWeight, weightStats } from '@/lib/weight';
import WeightEntryForm from './WeightEntryForm';
import PeriodFilter from './PeriodFilter';
import WeightChart from './WeightChart';
import BmiCalculator from './BmiCalculator';
import CalorieNeedsCalculator from './CalorieNeedsCalculator';

const format = (value: number | null | undefined, suffix = ' kg') => (typeof value === 'number' ? `${value.toFixed(1)}${suffix}` : '—');
const change = (value: number | null) => (typeof value === 'number' ? `${value >= 0 ? '+' : ''}${value.toFixed(1)} kg` : '—');

export default function ProgressPage({ data, selectedDate, dispatch }: { data: AppData; selectedDate: string; dispatch: Dispatch<any> }) {
  const [range, setRange] = useState<PeriodRange>({ period: '30' });
  const rangeError = range.period === 'custom' && range.startDate && range.endDate && range.startDate > range.endDate ? 'Start date must be before or equal to end date.' : '';
  const periodEntries = useMemo(() => (rangeError ? [] : filterWeightsByPeriod(data.weightEntries, range)), [data.weightEntries, range, rangeError]);
  const stats = weightStats(data.weightEntries, periodEntries);
  const todayWeight = data.weightEntries.find((entry) => entry.date === selectedDate);
  const latest = latestWeight(data.weightEntries);

  const saveWeight = useCallback((entry: WeightEntry) => dispatch({ type: 'upsertWeight', entry }), [dispatch]);
  const setProfile = useCallback((profile: UserProfile) => dispatch({ type: 'setProfile', profile }), [dispatch]);
  const applyGoals = useCallback((goals: Goals) => dispatch({ type: 'setGoals', goals }), [dispatch]);

  return (
    <div className="space-y-5">
      <WeightEntryForm date={selectedDate} entry={todayWeight} onSave={saveWeight} onDelete={(date) => dispatch({ type: 'deleteWeight', date })} />
      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Latest" value={format(stats.latest?.weightKg)} />
        <Stat label="Starting" value={format(stats.starting?.weightKg)} />
        <Stat label="Total change" value={change(stats.totalChange)} />
        <Stat label="Period change" value={change(stats.periodChange)} />
        <Stat label="Lowest" value={format(stats.lowest)} />
        <Stat label="Highest" value={format(stats.highest)} />
        <Stat label="Average" value={format(stats.average)} />
        <Stat label="Entries" value={String(stats.count)} />
      </section>
      <PeriodFilter range={range} onChange={setRange} error={rangeError} />
      <WeightChart entries={periodEntries} />
      <BmiCalculator latestWeightKg={latest?.weightKg} heightCm={data.userProfile.heightCm} />
      <CalorieNeedsCalculator latestWeightKg={latest?.weightKg} profile={data.userProfile} onProfile={setProfile} onApplyGoals={applyGoals} />
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return <div className="rounded-3xl bg-white p-4 shadow-soft"><p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p><p className="mt-1 text-2xl font-black">{value}</p></div>;
}
