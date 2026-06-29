'use client';

import { useEffect, useMemo, useState } from 'react';
import { ActivityLevel, CalorieGoal, Goals, Sex, UserProfile } from '@/types';
import { activityMultipliers, goalCalories, macroRanges, recommendedTargets, calculateBmr } from '@/lib/metabolism';

const goalLabels: Record<CalorieGoal, string> = {
  maintain: 'Maintain', loseSlow: 'Lose slow', loseStandard: 'Lose standard', gainSlow: 'Gain slow', gainStandard: 'Gain standard',
};

export default function CalorieNeedsCalculator({ latestWeightKg, profile, onProfile, onApplyGoals }: { latestWeightKg?: number; profile: UserProfile; onProfile: (profile: UserProfile) => void; onApplyGoals: (goals: Goals) => void }) {
  const [sex, setSex] = useState<Sex>(profile.sex ?? 'male');
  const [age, setAge] = useState(profile.age?.toString() ?? '30');
  const [heightCm, setHeightCm] = useState(profile.heightCm?.toString() ?? '180');
  const [weightKg, setWeightKg] = useState(latestWeightKg?.toString() ?? '80');
  const [activityLevel, setActivityLevel] = useState<ActivityLevel>(profile.activityLevel ?? 'moderate');
  const [goal, setGoal] = useState<CalorieGoal>(profile.goal ?? 'maintain');

  useEffect(() => { if (latestWeightKg) setWeightKg(latestWeightKg.toString()); }, [latestWeightKg]);
  useEffect(() => { onProfile({ sex, age: Number(age), heightCm: Number(heightCm), activityLevel, goal }); }, [sex, age, heightCm, activityLevel, goal, onProfile]);

  const result = useMemo(() => {
    const input = { sex, age: Number(age), heightCm: Number(heightCm), weightKg: Number(weightKg), activityLevel, goal };
    if (input.age <= 0 || input.heightCm <= 0 || input.weightKg <= 0) return null;
    const bmr = calculateBmr(input.sex, input.age, input.heightCm, input.weightKg);
    const tdee = bmr * activityMultipliers[input.activityLevel].multiplier;
    const suggestedCalories = Math.round(goalCalories(tdee, input.goal));
    const ranges = macroRanges(input.weightKg);
    const algorithm = recommendedTargets(input);
    return { bmr: Math.round(bmr), tdee: Math.round(tdee), suggestedCalories, ranges, algorithm };
  }, [sex, age, heightCm, weightKg, activityLevel, goal]);

  return (
    <section className="rounded-3xl bg-white p-5 shadow-soft">
      <h2 className="text-xl font-bold">Calorie Needs</h2>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <label className="text-sm font-medium text-slate-600">Sex<select className="mt-1 w-full rounded-2xl border p-3" value={sex} onChange={(event) => setSex(event.target.value as Sex)}><option value="male">Male</option><option value="female">Female</option></select></label>
        <label className="text-sm font-medium text-slate-600">Age<input className="mt-1 w-full rounded-2xl border p-3" type="number" min="1" value={age} onChange={(event) => setAge(event.target.value)} /></label>
        <label className="text-sm font-medium text-slate-600">Height cm<input className="mt-1 w-full rounded-2xl border p-3" type="number" min="1" value={heightCm} onChange={(event) => setHeightCm(event.target.value)} /></label>
        <label className="text-sm font-medium text-slate-600">Current weight kg<input className="mt-1 w-full rounded-2xl border p-3" type="number" min="0.1" step="0.1" value={weightKg} onChange={(event) => setWeightKg(event.target.value)} /></label>
        <label className="text-sm font-medium text-slate-600 sm:col-span-2">Activity<select className="mt-1 w-full rounded-2xl border p-3" value={activityLevel} onChange={(event) => setActivityLevel(event.target.value as ActivityLevel)}>{Object.entries(activityMultipliers).map(([key, value]) => <option key={key} value={key}>{value.label}</option>)}</select></label>
        <label className="text-sm font-medium text-slate-600 sm:col-span-2">Goal<select className="mt-1 w-full rounded-2xl border p-3" value={goal} onChange={(event) => setGoal(event.target.value as CalorieGoal)}>{Object.entries(goalLabels).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select></label>
      </div>
      {result ? (
        <div className="mt-4 space-y-3">
          <div className="grid grid-cols-3 gap-2 text-center"><div className="rounded-2xl bg-slate-50 p-3"><p className="text-xs text-slate-500">BMR</p><p className="font-black">{result.bmr}</p></div><div className="rounded-2xl bg-slate-50 p-3"><p className="text-xs text-slate-500">TDEE</p><p className="font-black">{result.tdee}</p></div><div className="rounded-2xl bg-clean-50 p-3"><p className="text-xs text-slate-500">Goal kcal</p><p className="font-black">{result.suggestedCalories}</p></div></div>
          <p className="text-sm text-slate-600">Protein range: {result.ranges.protein}. Fat range: {result.ranges.fat}. Suggested carbs are calculated from remaining calories after protein and fat.</p>
          <div className="rounded-2xl bg-slate-900 p-4 text-white"><p className="text-sm text-slate-300">App target algorithm</p><p className="text-lg font-bold">{result.algorithm.targets.calories} kcal · P {result.algorithm.targets.protein}g · C {result.algorithm.targets.carbs}g · F {result.algorithm.targets.fat}g</p>{result.algorithm.warning ? <p className="mt-1 text-sm text-amber-200">{result.algorithm.warning}</p> : null}</div>
          <button className="w-full rounded-2xl bg-clean-600 p-3 font-bold text-white" onClick={() => onApplyGoals(result.algorithm.targets)}>Apply these targets to my daily goals</button>
        </div>
      ) : <p className="mt-3 text-sm text-red-600">Enter positive age, height and weight values.</p>}
    </section>
  );
}
