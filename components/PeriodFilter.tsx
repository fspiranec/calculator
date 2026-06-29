'use client';

import { PeriodRange } from '@/lib/weight';

const options = [
  ['7', '7 days'], ['14', '14 days'], ['21', '21 days'], ['30', '30 days'], ['90', '90 days'], ['all', 'All time'], ['custom', 'Custom'],
] as const;

export default function PeriodFilter({ range, onChange, error }: { range: PeriodRange; onChange: (range: PeriodRange) => void; error?: string }) {
  return (
    <section className="rounded-3xl bg-white p-4 shadow-soft">
      <h3 className="font-bold">Period</h3>
      <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
        {options.map(([value, label]) => (
          <button key={value} className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold ${range.period === value ? 'bg-clean-600 text-white' : 'bg-slate-100'}`} onClick={() => onChange({ ...range, period: value })}>{label}</button>
        ))}
      </div>
      {range.period === 'custom' ? (
        <div className="mt-3 grid grid-cols-2 gap-2">
          <input aria-label="Start date" className="rounded-2xl border border-slate-200 p-3" type="date" value={range.startDate ?? ''} onChange={(event) => onChange({ ...range, startDate: event.target.value })} />
          <input aria-label="End date" className="rounded-2xl border border-slate-200 p-3" type="date" value={range.endDate ?? ''} onChange={(event) => onChange({ ...range, endDate: event.target.value })} />
        </div>
      ) : null}
      {error ? <p className="mt-2 text-sm text-red-600">{error}</p> : null}
    </section>
  );
}
