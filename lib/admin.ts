import { createServerSupabase } from './supabase';

export async function requireAdmin(): Promise<void> {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  const adminEmail = process.env.ADMIN_EMAIL;
  if (!user || !adminEmail || user.email !== adminEmail) {
    throw new Error('Forbidden');
  }
}

export async function isAdmin(): Promise<boolean> {
  try {
    const supabase = await createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();
    const adminEmail = process.env.ADMIN_EMAIL;
    return !!user && !!adminEmail && user.email === adminEmail;
  } catch {
    return false;
  }
}
