import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase, createAdminSupabase } from '@/lib/supabase';

export const runtime = 'nodejs';
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });

  const { practiceId, searchQuery } = await req.json() as { practiceId: string; searchQuery: string };
  if (!practiceId || !searchQuery?.trim()) {
    return NextResponse.json({ error: 'Missing practiceId or searchQuery' }, { status: 400 });
  }

  const admin = createAdminSupabase();

  const { data: practice } = await admin
    .from('practices')
    .select('claimed_by_user_id')
    .eq('id', practiceId)
    .single();

  if (!practice || practice.claimed_by_user_id !== user.id) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 403 });
  }

  const params = new URLSearchParams({
    query:         searchQuery.trim(),
    reviewsLimit:  '200',
    sort:          'newest',
    language:      'en',
    cutoff:        '0',
  });

  const res = await fetch(
    `https://api.app.outscraper.com/maps/reviews-v3?${params}`,
    { headers: { 'X-API-KEY': process.env.OUTSCRAPER_API_KEY ?? '' } },
  );

  if (!res.ok) {
    const body = await res.text();
    return NextResponse.json({ error: 'Outscraper request failed', detail: body }, { status: 502 });
  }

  const data = await res.json() as {
    status: string;
    data?: { place_id?: string; reviews_data?: {
      review_id: string;
      author_title?: string;
      review_rating?: number;
      review_text?: string;
      review_datetime?: string;
    }[] }[][];
  };

  if (data.status !== 'Success') {
    return NextResponse.json({ error: 'Outscraper returned non-success', detail: data.status }, { status: 502 });
  }

  const business    = data.data?.[0]?.[0];
  const reviews     = business?.reviews_data ?? [];
  const placeId     = business?.place_id ?? null;

  if (reviews.length === 0) {
    return NextResponse.json({ error: `No reviews found for "${searchQuery}" — check the search query matches your Google Business name exactly` }, { status: 404 });
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
      practice_id:       practiceId,
      search_query:      searchQuery.trim(),
      google_location_id: placeId,
      last_synced_at:    new Date().toISOString(),
      review_count:      count ?? rows.length,
    }, { onConflict: 'practice_id' });

  return NextResponse.json({ imported: rows.length, total: count ?? rows.length });
}
