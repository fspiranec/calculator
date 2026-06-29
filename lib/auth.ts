import { getSupabaseClient } from './supabase/client';

export const getCurrentUser = async () => {
  const supabase = getSupabaseClient();
  if (!supabase) return null;
  const { data } = await supabase.auth.getUser();
  return data.user;
};

export const signOut = async () => {
  const supabase = getSupabaseClient();
  await supabase?.auth.signOut();
};
