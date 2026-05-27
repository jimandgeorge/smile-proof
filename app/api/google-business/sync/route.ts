import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase, createAdminSupabase } from '@/lib/supabase';
import { refreshGoogleToken } from '@/lib/google';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });

  const { practiceId } = await req.json() as { practiceId: string };
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
    .select('access_token, refresh_token, token_expires_at, google_location_id')
    .eq('practice_id', practiceId)
    .single();

  if (!conn) return NextResponse.json({ error: 'No Google connection found' }, { status: 404 });
  if (!conn.google_location_id) return NextResponse.json({ error: 'No location selected' }, { status: 400 });

  const accessToken = await refreshGoogleToken(admin, practiceId, conn);

  // Fetch reviews from Google — paginate up to 200
  let nextPageToken: string | undefined;
  let imported = 0;

  do {
    const url = new URL(`https://mybusiness.googleapis.com/v4/${conn.google_location_id}/reviews`);
    url.searchParams.set('pageSize', '50');
    if (nextPageToken) url.searchParams.set('pageToken', nextPageToken);

    const res = await fetch(url.toString(), {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!res.ok) {
      const body = await res.text();
      return NextResponse.json({ error: 'Failed to fetch reviews', detail: body }, { status: 502 });
    }

    const data = await res.json() as {
      reviews?: {
        reviewId: string;
        reviewer?: { displayName?: string };
        starRating?: string;
        comment?: string;
        createTime?: string;
      }[];
      nextPageToken?: string;
    };

    const reviews = data.reviews ?? [];

    const starMap: Record<string, number> = {
      ONE: 1, TWO: 2, THREE: 3, FOUR: 4, FIVE: 5,
    };

    const rows = reviews.map(r => ({
      practice_id:   practiceId,
      source:        'google',
      external_id:   r.reviewId,
      reviewer_name: r.reviewer?.displayName ?? null,
      rating:        r.starRating ? (starMap[r.starRating] ?? null) : null,
      body:          r.comment ?? null,
      published_at:  r.createTime ?? null,
    }));

    if (rows.length > 0) {
      await admin
        .from('external_reviews')
        .upsert(rows, { onConflict: 'source,external_id' });
      imported += rows.length;
    }

    nextPageToken = data.nextPageToken;
  } while (nextPageToken && imported < 200);

  // Count total google reviews for this practice
  const { count } = await admin
    .from('external_reviews')
    .select('id', { count: 'exact', head: true })
    .eq('practice_id', practiceId)
    .eq('source', 'google');

  await admin
    .from('google_connections')
    .update({ last_synced_at: new Date().toISOString(), review_count: count ?? imported })
    .eq('practice_id', practiceId);

  return NextResponse.json({ imported, total: count ?? imported });
}
