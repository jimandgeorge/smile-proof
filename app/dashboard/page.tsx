import { redirect } from 'next/navigation';
import { createAdminSupabase, createServerSupabase } from '@/lib/supabase';

export default async function DashboardRedirect() {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/auth/login');

  const admin = createAdminSupabase();

  const { data: claimed } = await admin
    .from('practices')
    .select('slug')
    .eq('claimed_by_user_id', user.id)
    .maybeSingle();

  if (claimed?.slug) redirect(`/practices/${claimed.slug}/dashboard`);

  const { data: pending } = await admin
    .from('practices')
    .select('slug')
    .eq('claim_pending_user_id', user.id)
    .is('claimed_by_user_id', null)
    .maybeSingle();

  if (pending?.slug) redirect(`/practices/${pending.slug}/claim?submitted=1`);

  redirect('/for-dentists');
}
