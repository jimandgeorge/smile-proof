import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase, createAdminSupabase } from '@/lib/supabase';

export const runtime = 'nodejs';

function authHeader() {
  const login    = process.env.DATAFORSEO_LOGIN    ?? '';
  const password = process.env.DATAFORSEO_PASSWORD ?? '';
  return `Basic ${Buffer.from(`${login}:${password}`).toString('base64')}`;
}

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

  const res = await fetch('https://api.dataforseo.com/v3/business_data/google/reviews/task_post', {
    method: 'POST',
    headers: {
      'Authorization': authHeader(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify([{
      keyword:       searchQuery.trim(),
      location_name: 'United Kingdom',
      language_name: 'English',
      depth:         100,
      sort_by:       'newest',
    }]),
  });

  if (!res.ok) {
    const body = await res.text();
    return NextResponse.json({ error: 'DataForSEO request failed', detail: body }, { status: 502 });
  }

  const data = await res.json() as { tasks?: { id: string; status_code: number }[] };
  const taskId = data.tasks?.[0]?.id;

  if (!taskId) {
    return NextResponse.json({ error: 'No task ID returned', detail: data }, { status: 502 });
  }

  await admin
    .from('google_connections')
    .upsert({ practice_id: practiceId, search_query: searchQuery.trim() }, { onConflict: 'practice_id' });

  return NextResponse.json({ requestId: taskId, status: 'pending' });
}
