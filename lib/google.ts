import { SupabaseClient } from '@supabase/supabase-js';

interface GoogleConn {
  access_token: string;
  refresh_token?: string | null;
  token_expires_at?: string | null;
}

export async function refreshGoogleToken(
  admin: SupabaseClient,
  practiceId: string,
  conn: GoogleConn,
): Promise<string> {
  const expiresAt = conn.token_expires_at ? new Date(conn.token_expires_at).getTime() : 0;
  const isExpired = Date.now() >= expiresAt - 60_000; // refresh 1 min before expiry

  if (!isExpired) return conn.access_token;

  if (!conn.refresh_token) throw new Error('No refresh token available');

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id:     process.env.GOOGLE_CLIENT_ID ?? '',
      client_secret: process.env.GOOGLE_CLIENT_SECRET ?? '',
      refresh_token: conn.refresh_token,
      grant_type:    'refresh_token',
    }),
  });

  const tokens = await res.json() as {
    access_token?: string;
    expires_in?: number;
    error?: string;
  };

  if (!res.ok || !tokens.access_token) {
    throw new Error(`Token refresh failed: ${tokens.error ?? 'unknown'}`);
  }

  const newExpiresAt = new Date(Date.now() + (tokens.expires_in ?? 3600) * 1000).toISOString();

  await admin
    .from('google_connections')
    .update({ access_token: tokens.access_token, token_expires_at: newExpiresAt })
    .eq('practice_id', practiceId);

  return tokens.access_token;
}
