import { WeightEntry } from '@/types';
import { addDays, todayKey } from './nutrition';

export type PeriodKey = '7' | '14' | '21' | '30' | '90' | 'all' | 'custom';
export type PeriodRange = { period: PeriodKey; startDate?: string; endDate?: string };

export const sortWeightEntries = (entries: WeightEntry[]) => [...entries].sort((a, b) => a.date.localeCompare(b.date));
export const latestWeight = (entries: WeightEntry[]) => sortWeightEntries(entries).at(-1);

export const getPeriodBounds = (range: PeriodRange) => {
  if (range.period === 'all') return { start: undefined, end: undefined };
  if (range.period === 'custom') return { start: range.startDate, end: range.endDate };
  return { start: addDays(todayKey(), -(Number(range.period) - 1)), end: todayKey() };
};

export const filterWeightsByPeriod = (entries: WeightEntry[], range: PeriodRange) => {
  const { start, end } = getPeriodBounds(range);
  return sortWeightEntries(entries).filter((entry) => (!start || entry.date >= start) && (!end || entry.date <= end));
};

export const weightStats = (allEntries: WeightEntry[], periodEntries: WeightEntry[]) => {
  const sortedAll = sortWeightEntries(allEntries);
  const sortedPeriod = sortWeightEntries(periodEntries);
  const weights = sortedPeriod.map((entry) => entry.weightKg);
  const first = sortedAll[0];
  const latest = sortedAll.at(-1);
  const periodFirst = sortedPeriod[0];
  const periodLatest = sortedPeriod.at(-1);

  return {
    latest,
    starting: first,
    totalChange: latest && first ? latest.weightKg - first.weightKg : null,
    periodChange: periodLatest && periodFirst ? periodLatest.weightKg - periodFirst.weightKg : null,
    lowest: weights.length ? Math.min(...weights) : null,
    highest: weights.length ? Math.max(...weights) : null,
    average: weights.length ? weights.reduce((sum, value) => sum + value, 0) / weights.length : null,
    count: weights.length,
  };
};

export const withMovingAverage = (entries: WeightEntry[]) => {
  const sorted = sortWeightEntries(entries);
  return sorted.map((entry, index) => {
    const window = sorted.slice(Math.max(0, index - 6), index + 1);
    const movingAverage = window.length >= 7 ? window.reduce((sum, item) => sum + item.weightKg, 0) / window.length : undefined;
    return { ...entry, movingAverage: movingAverage ? Number(movingAverage.toFixed(1)) : undefined };
  });
};
