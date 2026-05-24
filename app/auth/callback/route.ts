import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase, createAdminSupabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const reviewId = searchParams.get('review');
  const claimId = searchParams.get('claim');

  if (!code) {
    return NextResponse.redirect(`${origin}/?error=missing_code`);
  }

  const supabase = await createServerSupabase();
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error || !data.user) {
    return NextResponse.redirect(`${origin}/?error=auth_failed`);
  }

  const admin = createAdminSupabase();

  // Link a submitted review to the verified user
  if (reviewId) {
    await admin
      .from('reviews')
      .update({
        reviewer_user_id: data.user.id,
        verification_status: 'verified',
        verified_at: new Date().toISOString(),
        verification_method: 'email_forward',
      })
      .eq('id', reviewId)
      .eq('reviewer_email', data.user.email!);

    return NextResponse.redirect(`${origin}/reviews/${reviewId}/verified`);
  }

  // Queue a practice claim for admin approval
  if (claimId) {
    const { data: practice } = await admin
      .from('practices')
      .select('slug, claimed_by_user_id')
      .eq('id', claimId)
      .single();

    if (practice && !practice.claimed_by_user_id) {
      await admin
        .from('practices')
        .update({
          claim_pending_user_id: data.user.id,
          claim_pending_email: data.user.email,
          claim_pending_at: new Date().toISOString(),
        })
        .eq('id', claimId)
        .is('claimed_by_user_id', null);
    }

    const slug = practice?.slug ?? '';
    const next = encodeURIComponent(`/practices/${slug}/claim?submitted=1`);
    return NextResponse.redirect(`${origin}/auth/set-password?next=${next}`);
  }

  // Redirect to the user's practice dashboard if they have a claimed practice
  const { data: practice } = await admin
    .from('practices')
    .select('slug')
    .eq('claimed_by_user_id', data.user.id)
    .limit(1)
    .maybeSingle();

  if (practice?.slug) {
    return NextResponse.redirect(`${origin}/practices/${practice.slug}/dashboard`);
  }

  return NextResponse.redirect(`${origin}/`);
}
