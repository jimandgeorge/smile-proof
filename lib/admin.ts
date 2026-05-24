import { createServerSupabase } from './supabase';
import { hashAdminPassword } from './adminHash';

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

export async function requireAdminSession(): Promise<void> {
  const { cookies } = await import('next/headers');
  const jar = await cookies();
  const token = jar.get('admin_session')?.value;
  const password = process.env.ADMIN_PASSWORD;
  if (!token || !password) throw new Error('Forbidden');
  const expected = await hashAdminPassword(password);
  if (token !== expected) throw new Error('Forbidden');
}
