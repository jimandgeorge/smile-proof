'use server';

import { createServerSupabase, createAdminSupabase } from '@/lib/supabase';

export async function requestClaim(practiceId: string, email: string) {
  // Check practice exists and isn't already claimed
  const admin = createAdminSupabase();
  const { data: practice } = await admin
    .from('practices')
    .select('id, name, claimed_by_user_id')
    .eq('id', practiceId)
    .single();

  if (!practice) return { error: 'Practice not found.' };
  if (practice.claimed_by_user_id) return { error: 'This practice has already been claimed.' };

  const supabase = await createServerSupabase();
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback?claim=${practiceId}`,
    },
  });

  if (error) return { error: error.message };
  return { success: true };
}
