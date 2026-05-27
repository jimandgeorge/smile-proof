import { NextRequest, NextResponse } from 'next/server';
import { createAdminSupabase } from '@/lib/supabase';
import crypto from 'crypto';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  const code  = req.nextUrl.searchParams.get('code');
  const state = req.nextUrl.searchParams.get('state');
  const error = req.nextUrl.searchParams.get('error');

  if (error) {
    return NextResponse.redirect(new URL('/practices?google_error=access_denied', req.url));
  }
  if (!code || !state) {
    return NextResponse.json({ error: 'Missing code or state' }, { status: 400 });
  }

  // Verify state signature
  const secret = process.env.CRON_SECRET ?? 'fallback';
  const [payload, sig] = state.split('.');
  const expectedSig = crypto.createHmac('sha256', secret).update(payload).digest('base64url');
  if (sig !== expectedSig) return NextResponse.json({ error: 'Invalid state' }, { status: 400 });

  const { practiceId, ts } = JSON.parse(Buffer.from(payload, 'base64url').toString()) as {
    practiceId: string; userId: string; ts: number;
  };
  if (Date.now() - ts > 10 * 60 * 1000) {
    return NextResponse.json({ error: 'OAuth session expired, please try again' }, { status: 400 });
  }

  // Exchange code for tokens
  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id:     process.env.GOOGLE_CLIENT_ID ?? '',
      client_secret: process.env.GOOGLE_CLIENT_SECRET ?? '',
      redirect_uri:  process.env.GOOGLE_REDIRECT_URI ?? '',
      grant_type:    'authorization_code',
    }),
  });

  const tokens = await tokenRes.json() as {
    access_token: string; refresh_token?: string; expires_in: number; error?: string;
  };

  if (!tokenRes.ok || !tokens.access_token) {
    return NextResponse.json({ error: tokens.error ?? 'Token exchange failed' }, { status: 500 });
  }

  const expiresAt = new Date(Date.now() + tokens.expires_in * 1000).toISOString();
  const admin = createAdminSupabase();

  // Upsert connection — location will be set after user picks it
  await admin.from('google_connections').upsert({
    practice_id:      practiceId,
    access_token:     tokens.access_token,
    refresh_token:    tokens.refresh_token ?? null,
    token_expires_at: expiresAt,
    connected_at:     new Date().toISOString(),
  }, { onConflict: 'practice_id' });

  // Redirect to the practice dashboard settings, with a flag to show location picker
  const { data: practice } = await admin
    .from('practices')
    .select('slug')
    .eq('id', practiceId)
    .single();

  const slug = practice?.slug ?? practiceId;
  return NextResponse.redirect(
    new URL(`/practices/${slug}/dashboard?tab=settings&google=pick_location`, req.url)
  );
}
