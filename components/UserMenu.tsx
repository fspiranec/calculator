'use client';

import { useRouter } from 'next/navigation';
import { User } from '@supabase/supabase-js';
import { signOut } from '@/lib/auth';

export default function UserMenu({ user }: { user: User }) {
  const router = useRouter();
  return <div className="rounded-3xl bg-white p-4 shadow-soft"><p className="text-sm text-slate-500">Logged in as</p><p className="font-bold">{user.email}</p><button className="mt-3 w-full rounded-2xl bg-slate-900 p-3 font-bold text-white" onClick={async () => { await signOut(); router.replace('/login'); router.refresh(); }}>Logout</button></div>;
}
