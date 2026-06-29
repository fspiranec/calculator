'use client';

import { useState } from 'react';
import { getSupabaseClient } from '@/lib/supabase/client';

export default function AuthModal({ open, onClose, onAuthed }: { open: boolean; onClose: () => void; onAuthed: () => void }) {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  if (!open) return null;

  const submit = async () => {
    const supabase = getSupabaseClient();
    if (!supabase) return setMessage('Supabase is not configured. Add the public URL and anon key first.');
    if (!email || password.length < 6) return setMessage('Enter an email and a password with at least 6 characters.');
    const result = mode === 'signin' ? await supabase.auth.signInWithPassword({ email, password }) : await supabase.auth.signUp({ email, password });
    if (result.error) return setMessage(result.error.message);
    setMessage(mode === 'signup' ? 'Account created. Check email confirmation if enabled, then sync.' : 'Signed in.');
    onAuthed();
    onClose();
  };

  return <div className="fixed inset-0 z-50 bg-slate-950/40 p-4"><section className="mx-auto mt-16 max-w-md rounded-3xl bg-white p-5 shadow-soft"><div className="flex items-center justify-between"><h2 className="text-xl font-bold">Cloud sync</h2><button className="rounded-full bg-slate-100 px-3 py-1" onClick={onClose}>Close</button></div><p className="mt-2 text-sm text-slate-500">Sign in only if you want optional Supabase cloud sync. You can continue local-only without an account.</p><div className="mt-4 grid grid-cols-2 gap-2"><button className={`rounded-2xl p-3 font-semibold ${mode === 'signin' ? 'bg-clean-600 text-white' : 'bg-slate-100'}`} onClick={() => setMode('signin')}>Sign in</button><button className={`rounded-2xl p-3 font-semibold ${mode === 'signup' ? 'bg-clean-600 text-white' : 'bg-slate-100'}`} onClick={() => setMode('signup')}>Sign up</button></div><div className="mt-4 space-y-3"><input className="w-full rounded-2xl border p-3" placeholder="email@example.com" value={email} onChange={(event) => setEmail(event.target.value)} /><input className="w-full rounded-2xl border p-3" type="password" placeholder="Password" value={password} onChange={(event) => setPassword(event.target.value)} /><button className="w-full rounded-2xl bg-clean-600 p-3 font-bold text-white" onClick={submit}>{mode === 'signin' ? 'Sign in' : 'Create account'}</button><button className="w-full rounded-2xl bg-slate-100 p-3 font-bold" onClick={onClose}>Continue without account</button>{message ? <p className="text-sm text-slate-600">{message}</p> : null}</div></section></div>;
}
