import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase, createAdminSupabase } from '@/lib/supabase';
import crypto from 'crypto';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  const practiceId = req.nextUrl.searchParams.get('practiceId');
  if (!practiceId) return NextResponse.json({ error: 'Missing practiceId' }, { status: 400 });

  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.redirect(new URL('/auth/login', req.url));

  // Verify user owns this practice
  const admin = createAdminSupabase();
  const { data: practice } = await admin
    .from('practices')
    .select('id, claimed_by_user_id')
    .eq('id', practiceId)
    .single();

  if (!practice || practice.claimed_by_user_id !== user.id) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 403 });
  }

  const secret = process.env.CRON_SECRET ?? 'fallback';
  const payload = Buffer.from(JSON.stringify({ practiceId, userId: user.id, ts: Date.now() })).toString('base64url');
  const sig = crypto.createHmac('sha256', secret).update(payload).digest('base64url');
  const state = `${payload}.${sig}`;

  const params = new URLSearchParams({
    client_id:     process.env.GOOGLE_CLIENT_ID ?? '',
    redirect_uri:  process.env.GOOGLE_REDIRECT_URI ?? '',
    response_type: 'code',
    scope:         'https://www.googleapis.com/auth/business.manage',
    access_type:   'offline',
    prompt:        'consent',
    state,
  });

  return NextResponse.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params}`);
}
