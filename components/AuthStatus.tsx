'use client';

import { User } from '@supabase/supabase-js';

export default function AuthStatus({ user, status, lastSyncAt }: { user: User | null; status: string; lastSyncAt?: string }) {
  return <div className="rounded-2xl bg-slate-50 p-3 text-sm"><p><b>Mode:</b> {user ? `Signed in as ${user.email}` : 'Local only'}</p><p><b>Sync status:</b> {status}</p><p><b>Last synced:</b> {lastSyncAt ? new Date(lastSyncAt).toLocaleString() : 'Never'}</p></div>;
}
