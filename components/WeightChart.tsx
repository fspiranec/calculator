'use client';

import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from 'recharts';
import { WeightEntry } from '@/types';
import { withMovingAverage } from '@/lib/weight';

export default function WeightChart({ entries }: { entries: WeightEntry[] }) {
  const data = withMovingAverage(entries).map((entry) => ({ ...entry, label: entry.date.slice(5), weightKg: Number(entry.weightKg.toFixed(1)) }));

  if (!data.length) {
    return <section className="rounded-3xl border border-dashed border-slate-300 bg-white p-8 text-center"><h3 className="font-bold">No weight data yet</h3><p className="mt-1 text-sm text-slate-500">Add body weight entries to see your progress chart.</p></section>;
  }

  return (
    <section className="rounded-3xl bg-white p-4 shadow-soft">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-bold">Weight chart</h3>
        <span className="text-xs text-slate-500">Actual + optional 7-day average</span>
      </div>
      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 12, right: 12, bottom: 8, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="label" tick={{ fontSize: 12 }} />
            <YAxis domain={['dataMin - 1', 'dataMax + 1']} tick={{ fontSize: 12 }} width={42} />
            <Tooltip formatter={(value, name) => [`${Number(value).toFixed(1)} kg`, name === 'movingAverage' ? '7-day average' : 'Weight']} labelFormatter={(_, payload) => payload?.[0]?.payload?.note ? `${payload[0].payload.date} — ${payload[0].payload.note}` : payload?.[0]?.payload?.date} />
            <Line type="monotone" dataKey="weightKg" stroke="#16a34a" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} connectNulls={false} />
            <Line type="monotone" dataKey="movingAverage" stroke="#0ea5e9" strokeWidth={2} strokeDasharray="6 6" dot={false} connectNulls={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
