'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getSupabaseClient } from '@/lib/supabase/client';

export default function AuthForm({ mode }: { mode: 'login' | 'signup' }) {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const isLogin = mode === 'login';
  const submit = async () => {
    const supabase = getSupabaseClient();
    if (!supabase) return setError('Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.');
    if (!email || password.length < 6) return setError('Enter an email and a password with at least 6 characters.');
    const result = isLogin ? await supabase.auth.signInWithPassword({ email, password }) : await supabase.auth.signUp({ email, password });
    if (result.error) return setError(result.error.message);
    router.replace('/dashboard');
    router.refresh();
  };
  const google = async () => {
    const supabase = getSupabaseClient();
    await supabase?.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: `${location.origin}/dashboard` } });
  };
  return <section className="mx-auto flex min-h-screen max-w-md flex-col justify-center p-4"><div className="rounded-3xl bg-white p-6 shadow-soft"><p className="font-semibold text-clean-700">Clean Macro Tracker</p><h1 className="mt-1 text-3xl font-black">{isLogin ? 'Log in' : 'Create account'}</h1><p className="mt-2 text-sm text-slate-500">Accounts are required so your calorie, macro and weight data can sync securely across devices.</p><div className="mt-5 space-y-3"><input className="w-full rounded-2xl border p-3" placeholder="email@example.com" value={email} onChange={(event) => setEmail(event.target.value)} /><input className="w-full rounded-2xl border p-3" type="password" placeholder="Password" value={password} onChange={(event) => setPassword(event.target.value)} /><button className="w-full rounded-2xl bg-clean-600 p-3 font-bold text-white" onClick={submit}>{isLogin ? 'Log in' : 'Sign up'}</button><button className="w-full rounded-2xl bg-slate-100 p-3 font-bold" onClick={google}>Continue with Google</button>{error ? <p className="text-sm text-red-600">{error}</p> : null}</div><p className="mt-4 text-sm text-slate-600">{isLogin ? 'No account?' : 'Already have an account?'} <Link className="font-bold text-clean-700" href={isLogin ? '/signup' : '/login'}>{isLogin ? 'Sign up' : 'Log in'}</Link></p></div></section>;
}
