import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase, createAdminSupabase } from '@/lib/supabase';

export const runtime = 'nodejs';

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

  const login    = process.env.DATAFORSEO_LOGIN ?? '';
  const password = process.env.DATAFORSEO_PASSWORD ?? '';
  const credentials = Buffer.from(`${login}:${password}`).toString('base64');

  const dfsRes = await fetch(
    'https://api.dataforseo.com/v3/business_data/google/reviews/live/advanced',
    {
      method: 'POST',
      headers: {
        Authorization: `Basic ${credentials}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify([{
        keyword:       searchQuery.trim(),
        location_code: 2826, // United Kingdom
        language_code: 'en',
        depth:         100,
        sort_by:       'newest',
      }]),
    },
  );

  if (!dfsRes.ok) {
    const body = await dfsRes.text();
    return NextResponse.json({ error: 'DataForSEO request failed', detail: body }, { status: 502 });
  }

  const dfsData = await dfsRes.json() as {
    tasks?: {
      status_code: number;
      status_message: string;
      result?: {
        place_id?: string;
        items?: {
          review_id: string;
          author_name?: string;
          rating?: { value?: number };
          review_text?: string;
          timestamp?: string;
        }[];
      }[];
    }[];
  };

  const task = dfsData.tasks?.[0];
  if (!task || task.status_code !== 20000) {
    return NextResponse.json({ error: task?.status_message ?? 'DataForSEO task failed' }, { status: 502 });
  }

  const result = task.result?.[0];
  const items  = result?.items ?? [];
  const placeId = result?.place_id ?? null;

  const rows = items.map(r => ({
    practice_id:   practiceId,
    source:        'google',
    external_id:   r.review_id,
    reviewer_name: r.author_name ?? null,
    rating:        r.rating?.value ?? null,
    body:          r.review_text ?? null,
    published_at:  r.timestamp ?? null,
  }));

  if (rows.length > 0) {
    await admin
      .from('external_reviews')
      .upsert(rows, { onConflict: 'source,external_id' });
  }

  const { count } = await admin
    .from('external_reviews')
    .select('id', { count: 'exact', head: true })
    .eq('practice_id', practiceId)
    .eq('source', 'google');

  await admin
    .from('google_connections')
    .upsert({
      practice_id:     practiceId,
      search_query:    searchQuery.trim(),
      google_location_id: placeId,
      last_synced_at:  new Date().toISOString(),
      review_count:    count ?? rows.length,
    }, { onConflict: 'practice_id' });

  return NextResponse.json({ imported: rows.length, total: count ?? rows.length });
}
