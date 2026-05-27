import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase, createAdminSupabase } from '@/lib/supabase';
import { refreshGoogleToken } from '@/lib/google';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });

  const practiceId = req.nextUrl.searchParams.get('practiceId');
  if (!practiceId) return NextResponse.json({ error: 'Missing practiceId' }, { status: 400 });

  const admin = createAdminSupabase();

  const { data: practice } = await admin
    .from('practices')
    .select('claimed_by_user_id')
    .eq('id', practiceId)
    .single();

  if (!practice || practice.claimed_by_user_id !== user.id) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 403 });
  }

  const { data: conn } = await admin
    .from('google_connections')
    .select('access_token, refresh_token, token_expires_at')
    .eq('practice_id', practiceId)
    .single();

  if (!conn) return NextResponse.json({ error: 'No Google connection found' }, { status: 404 });

  const accessToken = await refreshGoogleToken(admin, practiceId, conn);

  // Fetch accounts
  const accountsRes = await fetch(
    'https://mybusinessaccountmanagement.googleapis.com/v1/accounts',
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );
  if (!accountsRes.ok) {
    const body = await accountsRes.json().catch(() => ({}));
    return NextResponse.json({ error: 'Failed to fetch Google accounts', status: accountsRes.status, detail: body }, { status: 502 });
  }
  const { accounts = [] } = await accountsRes.json() as { accounts?: { name: string; accountName: string }[] };

  // Fetch locations for each account
  const locations: { id: string; name: string; address: string }[] = [];
  for (const account of accounts.slice(0, 5)) {
    const locRes = await fetch(
      `https://mybusinessbusinessinformation.googleapis.com/v1/${account.name}/locations?readMask=name,title,storefrontAddress`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    if (!locRes.ok) continue;
    const { locations: locs = [] } = await locRes.json() as {
      locations?: { name: string; title: string; storefrontAddress?: { addressLines?: string[]; locality?: string } }[]
    };
    for (const loc of locs) {
      const addrParts = [
        ...(loc.storefrontAddress?.addressLines ?? []),
        loc.storefrontAddress?.locality,
      ].filter(Boolean);
      locations.push({
        id:      loc.name,
        name:    loc.title,
        address: addrParts.join(', '),
      });
    }
  }

  return NextResponse.json({ locations });
}
