'use client';

import { useState } from 'react';
import { AppData } from '@/types';
import { backupToJson, parseBackup } from '@/lib/backup';

export default function DataSettings({ data, onImport, onReset }: { data: AppData; onImport: (data: AppData) => void; onReset: () => void }) {
  const [message, setMessage] = useState('');
  return (
    <section className="space-y-4 rounded-3xl bg-white p-5 shadow-soft">
      <h2 className="text-xl font-bold">Data</h2>
      <p className="text-sm text-slate-600">Your data is saved locally in this browser on this device. It is not uploaded to a server. It will remain after closing the app, but it can be removed if you clear browser/site data, use private browsing, change device, change browser, or reset the app. Use Export backup regularly.</p>
      <div className="grid gap-2 sm:grid-cols-3">
        <button className="rounded-2xl bg-slate-100 p-3 font-semibold" onClick={() => { const blob = new Blob([backupToJson(data)], { type: 'application/json' }); const link = document.createElement('a'); link.href = URL.createObjectURL(blob); link.download = 'clean-macro-tracker-backup.json'; link.click(); setMessage('Backup exported.'); }}>Export backup</button>
        <label className="cursor-pointer rounded-2xl bg-slate-100 p-3 text-center font-semibold">Import backup<input hidden type="file" accept="application/json" onChange={async (event) => { const file = event.target.files?.[0]; if (!file) return; try { const imported = parseBackup(await file.text()); if (confirm('Importing will overwrite your current local data. Continue?')) { onImport(imported); setMessage('Backup imported successfully.'); } } catch (error) { setMessage(error instanceof Error ? error.message : 'Import failed.'); } }} /></label>
        <button className="rounded-2xl bg-red-50 p-3 font-semibold text-red-700" onClick={() => { if (confirm('Reset all local data?')) { onReset(); setMessage('All data reset.'); } }}>Reset all data</button>
      </div>
      <div className="rounded-2xl bg-clean-50 p-3 text-sm text-slate-700"><b>Storage info:</b> {data.entries.length} food entries, {data.weightEntries.length} weight entries, {data.customFoods.length} custom foods.</div>
      {message ? <p className="text-sm font-semibold text-clean-700">{message}</p> : null}
    </section>
  );
}
