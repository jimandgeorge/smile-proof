import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase, createAdminSupabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');

  if (!code) {
    return NextResponse.redirect(`${origin}/auth/login?error=missing_code`);
  }

  const supabase = await createServerSupabase();
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error || !data.user) {
    return NextResponse.redirect(`${origin}/auth/login?error=auth_failed`);
  }

  const admin = createAdminSupabase();

  // If user already has a practice, send them to their dashboard
  const { data: practice } = await admin
    .from('practices')
    .select('slug')
    .eq('claimed_by_user_id', data.user.id)
    .limit(1)
    .maybeSingle();

  if (practice?.slug) {
    return NextResponse.redirect(`${origin}/practices/${practice.slug}/dashboard`);
  }

  return NextResponse.redirect(`${origin}/onboarding`);
}
