'use server';

import { createServerSupabase, createAdminSupabase } from '@/lib/supabase';

export async function verifyWebsiteClaim(practiceId: string, email: string, websiteUrl: string) {
  const admin = createAdminSupabase();
  const { data: practice } = await admin
    .from('practices')
    .select('id, name, claimed_by_user_id')
    .eq('id', practiceId)
    .single();

  if (!practice) return { error: 'Practice not found.' };
  if (practice.claimed_by_user_id) return { error: 'This practice has already been claimed.' };

  // Fetch the practice website and look for the verification meta tag
  let html: string;
  try {
    const res = await fetch(websiteUrl, {
      signal: AbortSignal.timeout(10000),
      headers: { 'User-Agent': 'SmileProof-Verification/1.0' },
    });
    html = await res.text();
  } catch {
    return { error: 'Could not reach your website. Please check the URL and try again.' };
  }

  const token = `sp-${practiceId}`;
  if (!html.includes(`content="${token}"`)) {
    return { error: 'Verification tag not found. Make sure the snippet is in the <head> of your homepage and the page has been saved.' };
  }

  // Tag confirmed — send magic link
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
