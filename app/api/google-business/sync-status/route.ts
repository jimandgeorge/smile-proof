import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase, createAdminSupabase } from '@/lib/supabase';

export const runtime = 'nodejs';

function authHeader() {
  const login    = process.env.DATAFORSEO_LOGIN    ?? '';
  const password = process.env.DATAFORSEO_PASSWORD ?? '';
  return `Basic ${Buffer.from(`${login}:${password}`).toString('base64')}`;
}

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

  // Check if task is ready
  const readyRes = await fetch(
    'https://api.dataforseo.com/v3/business_data/google/reviews/tasks_ready',
    { headers: { 'Authorization': authHeader() } },
  );

  if (!readyRes.ok) {
    const body = await readyRes.text();
    return NextResponse.json({ error: 'Failed to check tasks_ready', detail: body }, { status: 502 });
  }

  const readyData = await readyRes.json() as {
    tasks?: { result?: { id: string; endpoint: string }[] }[];
  };

  const readyItems = readyData.tasks?.[0]?.result ?? [];
  const readyItem  = readyItems.find(t => t.id === requestId);
  if (!readyItem) {
    return NextResponse.json({ status: 'pending' });
  }

  // Task is ready — fetch results using DataForSEO's provided endpoint
  const statusRes = await fetch(
    `https://api.dataforseo.com${readyItem.endpoint}`,
    { headers: { 'Authorization': authHeader() } },
  );

  if (!statusRes.ok) {
    const body = await statusRes.text();
    return NextResponse.json({ error: 'Failed to fetch results', detail: body }, { status: 502 });
  }

  const statusData = await statusRes.json() as {
    tasks?: {
      status_code: number;
      result?: {
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

  const task = statusData.tasks?.[0];
  if (!task || task.status_code !== 20000) {
    return NextResponse.json({ status: 'pending' });
  }

  const items = task.result?.[0]?.items ?? [];

  if (items.length === 0) {
    return NextResponse.json({ status: 'complete', imported: 0, total: 0 });
  }

  const rows = items.map(r => ({
    practice_id:   practiceId,
    source:        'google',
    external_id:   r.review_id,
    reviewer_name: r.author_name ?? null,
    rating:        r.rating?.value ?? null,
    body:          r.review_text ?? null,
    published_at:  r.timestamp ?? null,
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
      practice_id:    practiceId,
      last_synced_at: new Date().toISOString(),
      review_count:   count ?? rows.length,
    }, { onConflict: 'practice_id' });

  return NextResponse.json({ status: 'complete', imported: rows.length, total: count ?? rows.length });
}
