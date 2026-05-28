import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase, createAdminSupabase } from '@/lib/supabase';

export const runtime = 'nodejs';

function dfsAuth() {
  const login    = process.env.DATAFORSEO_LOGIN    ?? '';
  const password = process.env.DATAFORSEO_PASSWORD ?? '';
  return `Basic ${Buffer.from(`${login}:${password}`).toString('base64')}`;
}

export async function GET(req: NextRequest) {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });

  const taskId    = req.nextUrl.searchParams.get('taskId');
  const practiceId = req.nextUrl.searchParams.get('practiceId');
  if (!taskId || !practiceId) return NextResponse.json({ error: 'Missing params' }, { status: 400 });

  const admin = createAdminSupabase();

  const { data: practice } = await admin
    .from('practices')
    .select('claimed_by_user_id')
    .eq('id', practiceId)
    .single();

  if (!practice || practice.claimed_by_user_id !== user.id) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 403 });
  }

  // Check if task is ready
  const readyRes = await fetch(
    'https://api.dataforseo.com/v3/business_data/google/reviews/tasks_ready',
    { headers: { Authorization: dfsAuth() } },
  );
  const readyData = await readyRes.json() as {
    tasks?: { result?: { id: string }[] }[];
  };

  const readyIds = readyData.tasks?.[0]?.result?.map(r => r.id) ?? [];
  if (!readyIds.includes(taskId)) {
    return NextResponse.json({ status: 'pending' });
  }

  // Fetch results
  const getRes = await fetch(
    `https://api.dataforseo.com/v3/business_data/google/reviews/task_get/advanced/${taskId}`,
    { headers: { Authorization: dfsAuth() } },
  );
  const getData = await getRes.json() as {
    tasks?: {
      status_code: number;
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

  const result = getData.tasks?.[0]?.result?.[0];
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
      practice_id:       practiceId,
      google_location_id: placeId,
      last_synced_at:    new Date().toISOString(),
      review_count:      count ?? rows.length,
    }, { onConflict: 'practice_id' });

  return NextResponse.json({ status: 'complete', imported: rows.length, total: count ?? rows.length });
}
