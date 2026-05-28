import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase, createAdminSupabase } from '@/lib/supabase';

export const runtime = 'nodejs';

function apiKey() { return process.env.OUTSCRAPER_API_KEY ?? ''; }

export async function GET(req: NextRequest) {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });

  const requestId  = req.nextUrl.searchParams.get('requestId');
  const practiceId = req.nextUrl.searchParams.get('practiceId');
  if (!requestId || !practiceId) return NextResponse.json({ error: 'Missing params' }, { status: 400 });

  const admin = createAdminSupabase();

  const { data: practice } = await admin
    .from('practices')
    .select('claimed_by_user_id')
    .eq('id', practiceId)
    .single();

  if (!practice || practice.claimed_by_user_id !== user.id) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 403 });
  }

  // Check Outscraper request status
  const statusRes = await fetch(
    `https://api.app.outscraper.com/requests/${requestId}`,
    { headers: { 'X-API-KEY': apiKey() } },
  );

  if (!statusRes.ok) {
    return NextResponse.json({ error: 'Failed to check status' }, { status: 502 });
  }

  const statusData = await statusRes.json() as {
    id: string;
    status: string;
    data?: { place_id?: string; reviews_data?: {
      review_id: string;
      author_title?: string;
      review_rating?: number;
      review_text?: string;
      review_datetime?: string;
    }[] }[][];
  };

  if (statusData.status !== 'Success') {
    return NextResponse.json({ status: 'pending' });
  }

  // Process results
  const business = statusData.data?.[0]?.[0];
  const reviews  = business?.reviews_data ?? [];
  const placeId  = business?.place_id ?? null;

  if (reviews.length === 0) {
    return NextResponse.json({ status: 'complete', imported: 0, total: 0 });
  }

  const rows = reviews.map(r => ({
    practice_id:   practiceId,
    source:        'google',
    external_id:   r.review_id,
    reviewer_name: r.author_title ?? null,
    rating:        r.review_rating ?? null,
    body:          r.review_text ?? null,
    published_at:  r.review_datetime ?? null,
  }));

  await admin
    .from('external_reviews')
    .upsert(rows, { onConflict: 'source,external_id' });

  const { count } = await admin
    .from('external_reviews')
    .select('id', { count: 'exact', head: true })
    .eq('practice_id', practiceId)
    .eq('source', 'google');

  await admin
    .from('google_connections')
    .upsert({
      practice_id:        practiceId,
      google_location_id: placeId,
      last_synced_at:     new Date().toISOString(),
      review_count:       count ?? rows.length,
    }, { onConflict: 'practice_id' });

  return NextResponse.json({ status: 'complete', imported: rows.length, total: count ?? rows.length });
}
