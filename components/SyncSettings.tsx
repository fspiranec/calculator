'use client';

import { useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { AppData } from '@/types';
import { getSupabaseClient, isSupabaseConfigured } from '@/lib/supabase/client';
import { deleteCloudData, hasLocalUserData, syncWithCloud, updateSyncMeta } from '@/lib/sync';
import AuthModal from './AuthModal';
import AuthStatus from './AuthStatus';

type Decision = 'merge' | 'replaceLocal' | 'uploadLocal' | 'localOnly';

export default function SyncSettings({ data, onData, onResetLocal }: { data: AppData; onData: (data: AppData) => void; onResetLocal: () => void }) {
  const [user, setUser] = useState<User | null>(null);
  const [authOpen, setAuthOpen] = useState(false);
  const [decision, setDecision] = useState<Decision>('merge');
  const [message, setMessage] = useState('');
  const configured = isSupabaseConfigured();

  const refreshUser = async () => {
    const supabase = getSupabaseClient();
    if (!supabase) return;
    const { data: auth } = await supabase.auth.getUser();
    setUser(auth.user);
  };

  useEffect(() => {
    refreshUser();
    const supabase = getSupabaseClient();
    const listener = supabase?.auth.onAuthStateChange(() => refreshUser()).data;
    return () => listener?.subscription.unsubscribe();
  }, []);

  const syncNow = async (syncDecision = decision) => {
    if (!user) return setAuthOpen(true);
    try {
      onData(updateSyncMeta(data, 'syncing'));
      const synced = await syncWithCloud(user.id, data, syncDecision);
      onData(synced);
      setMessage('Sync completed.');
    } catch (error) {
      onData(updateSyncMeta(data, navigator.onLine ? 'failed' : 'offline', error instanceof Error ? error.message : 'Sync failed.'));
      setMessage(error instanceof Error ? error.message : 'Sync failed.');
    }
  };

  return <section className="space-y-4 rounded-3xl bg-white p-5 shadow-soft"><div><h2 className="text-xl font-bold">Cloud Sync</h2><p className="mt-1 text-sm text-slate-600">Cloud sync lets you use the same data across devices. Local data still remains available on this device. Export a backup before deleting local or cloud data.</p></div>{!configured ? <div className="rounded-2xl bg-amber-50 p-3 text-sm text-amber-800">Supabase is optional and not configured. Local-only mode still works.</div> : null}<AuthStatus user={user} status={data.syncMetadata.status} lastSyncAt={data.syncMetadata.lastSyncAt} />{!user ? <div className="space-y-2"><p className="text-sm text-slate-600">You are using local-only mode. Your data is stored only in this browser/device.</p><button className="w-full rounded-2xl bg-clean-600 p-3 font-bold text-white" onClick={() => setAuthOpen(true)}>Create account / Sign in to enable cloud sync</button></div> : <div className="space-y-3"><div className="rounded-2xl bg-clean-50 p-3 text-sm"><p className="font-bold">Sync decision</p><p className="text-slate-600">Recommended: merge local data with cloud data. Local data found: {hasLocalUserData(data) ? 'yes' : 'no'}.</p><select className="mt-2 w-full rounded-2xl border p-3" value={decision} onChange={(event) => setDecision(event.target.value as Decision)}><option value="merge">Merge local data with cloud data (recommended)</option><option value="replaceLocal">Replace local data with cloud data</option><option value="uploadLocal">Upload local data to cloud</option><option value="localOnly">Keep using local only</option></select></div><button className="w-full rounded-2xl bg-clean-600 p-3 font-bold text-white" onClick={() => syncNow()}>Sync now</button><button className="w-full rounded-2xl bg-slate-100 p-3 font-bold" onClick={async () => { await getSupabaseClient()?.auth.signOut(); setUser(null); }}>Logout</button><button className="w-full rounded-2xl bg-slate-100 p-3 font-bold" onClick={onResetLocal}>Delete local data</button><button className="w-full rounded-2xl bg-red-50 p-3 font-bold text-red-700" onClick={async () => { if (confirm('Delete all cloud data for this account? Export a backup first.')) { await deleteCloudData(user.id); setMessage('Cloud data deleted.'); } }}>Delete cloud data</button></div>}{message ? <p className="text-sm font-semibold text-clean-700">{message}</p> : null}<AuthModal open={authOpen} onClose={() => setAuthOpen(false)} onAuthed={refreshUser} /></section>;
}
