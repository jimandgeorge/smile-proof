'use server';

import { headers } from 'next/headers';
import { createServerSupabase, createAdminSupabase } from '@/lib/supabase';

async function getSiteUrl(): Promise<string> {
  const h = await headers();
  const proto = h.get('x-forwarded-proto') ?? 'https';
  const host  = h.get('x-forwarded-host') ?? h.get('host') ?? 'localhost:3000';
  return `${proto}://${host}`;
}

export async function verifyWebsiteClaim(practiceId: string, email: string, websiteUrl: string) {
  const admin = createAdminSupabase();
  const { data: practice } = await admin
    .from('practices')
    .select('id, name, website, claimed_by_user_id')
    .eq('id', practiceId)
    .single();

  if (!practice) return { error: 'Practice not found.' };
  if (practice.claimed_by_user_id) return { error: 'This practice has already been claimed.' };

  // Validate URL scheme and that it matches the practice's stored domain
  let parsed: URL;
  try {
    parsed = new URL(websiteUrl);
  } catch {
    return { error: 'Invalid URL.' };
  }
  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    return { error: 'URL must use http or https.' };
  }
  if (practice.website) {
    let storedHostname: string;
    try {
      storedHostname = new URL(
        practice.website.startsWith('http') ? practice.website : `https://${practice.website}`
      ).hostname.replace(/^www\./, '');
    } catch {
      storedHostname = '';
    }
    const suppliedHostname = parsed.hostname.replace(/^www\./, '');
    if (storedHostname && suppliedHostname !== storedHostname) {
      return { error: 'The URL must match the website address on your practice profile.' };
    }
  }

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

  // Tag confirmed — record pending claim then send magic link
  await admin
    .from('practices')
    .update({ claim_pending_email: email, claim_pending_at: new Date().toISOString() })
    .eq('id', practiceId);

  const siteUrl = await getSiteUrl();
  const supabase = await createServerSupabase();
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: `${siteUrl}/auth/callback` },
  });

  if (error) return { error: error.message };
  return { success: true };
}

export async function requestClaim(practiceId: string, email: string) {
  const admin = createAdminSupabase();
  const { data: practice } = await admin
    .from('practices')
    .select('id, name, claimed_by_user_id')
    .eq('id', practiceId)
    .single();

  if (!practice) return { error: 'Practice not found.' };
  if (practice.claimed_by_user_id) return { error: 'This practice has already been claimed.' };

  // Record pending claim before sending OTP so the callback can look it up by email
  await admin
    .from('practices')
    .update({ claim_pending_email: email, claim_pending_at: new Date().toISOString() })
    .eq('id', practiceId);

  const siteUrl = await getSiteUrl();
  const supabase = await createServerSupabase();
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: `${siteUrl}/auth/callback` },
  });

  if (error) return { error: error.message };
  return { success: true };
}
