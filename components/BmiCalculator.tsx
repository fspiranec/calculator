'use client';

import { useEffect, useMemo, useState } from 'react';
import { calculateBmi, bmiCategory } from '@/lib/bmi';

export default function BmiCalculator({ latestWeightKg, heightCm }: { latestWeightKg?: number; heightCm?: number }) {
  const [height, setHeight] = useState(heightCm?.toString() ?? '180');
  const [weight, setWeight] = useState(latestWeightKg?.toString() ?? '');

  useEffect(() => { if (latestWeightKg) setWeight(latestWeightKg.toString()); }, [latestWeightKg]);
  useEffect(() => { if (heightCm) setHeight(heightCm.toString()); }, [heightCm]);

  const result = useMemo(() => {
    const h = Number(height);
    const w = Number(weight);
    if (h <= 0 || w <= 0) return null;
    const bmi = calculateBmi(h, w);
    return { bmi, category: bmiCategory(bmi) };
  }, [height, weight]);

  return (
    <section className="rounded-3xl bg-white p-5 shadow-soft">
      <h2 className="text-xl font-bold">BMI calculator</h2>
      <div className="mt-3 grid grid-cols-2 gap-3">
        <label className="text-sm font-medium text-slate-600">Height cm<input className="mt-1 w-full rounded-2xl border p-3" type="number" min="1" value={height} onChange={(event) => setHeight(event.target.value)} /></label>
        <label className="text-sm font-medium text-slate-600">Weight kg<input className="mt-1 w-full rounded-2xl border p-3" type="number" min="0.1" step="0.1" value={weight} onChange={(event) => setWeight(event.target.value)} /></label>
      </div>
      {result ? <div className="mt-4 rounded-2xl bg-clean-50 p-4"><p className="text-3xl font-black">{result.bmi.toFixed(1)}</p><p className="font-semibold text-clean-700">{result.category}</p></div> : null}
      <p className="mt-3 text-xs text-slate-500">BMI is a rough indicator and does not account for muscle mass, body composition or individual health context.</p>
    </section>
  );
}
