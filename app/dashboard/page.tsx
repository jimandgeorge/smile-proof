import { redirect } from 'next/navigation';
import { createAdminSupabase, createServerSupabase } from '@/lib/supabase';

export default async function DashboardRedirect() {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/auth/login');

  const admin = createAdminSupabase();
  const { data: practice } = await admin
    .from('practices')
    .select('slug')
    .eq('claimed_by_user_id', user.id)
    .single();

  if (!practice) redirect('/for-dentists');

  redirect(`/practices/${practice.slug}/dashboard`);
}
