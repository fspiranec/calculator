'use client';
import { useState } from 'react';
import { FoodItem } from '@/types';
export default function FoodSearch({ foods, onSelect }: { foods: FoodItem[]; onSelect: (f: FoodItem)=>void }) {
 const [q,setQ]=useState(''); const filtered=foods.filter((f)=>f.name.toLowerCase().includes(q.toLowerCase()));
 return <div><input className="w-full rounded-2xl border border-slate-200 p-3" placeholder="Search clean foods..." value={q} onChange={(e)=>setQ(e.target.value)} /> <div className="mt-3 max-h-64 space-y-2 overflow-auto">{filtered.length?filtered.map((f)=><button key={f.id} onClick={()=>onSelect(f)} className="w-full rounded-2xl bg-slate-50 p-3 text-left hover:bg-clean-50"><b>{f.name}</b><span className="block text-sm text-slate-500">{f.category} · {f.calories} kcal · P {f.protein} C {f.carbs} F {f.fat} {f.servingType==='per100g'?'/ 100g':'/ piece'}</span></button>):<div className="rounded-2xl bg-slate-50 p-4 text-center text-slate-500">No food found. Create custom food in Settings.</div>}</div></div>;
}
