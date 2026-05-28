import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase, createAdminSupabase } from '@/lib/supabase';

export const runtime = 'nodejs';

function dfsAuth() {
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

  // Submit review task to DataForSEO
  const postRes = await fetch(
    'https://api.dataforseo.com/v3/business_data/google/reviews/task_post',
    {
      method: 'POST',
      headers: { Authorization: dfsAuth(), 'Content-Type': 'application/json' },
      body: JSON.stringify([{
        keyword:       searchQuery.trim(),
        location_code: 2826,
        language_code: 'en',
        depth:         100,
        sort_by:       'newest',
      }]),
    },
  );

  const postData = await postRes.json() as {
    tasks?: { id?: string; status_code: number; status_message: string }[];
  };

  const task = postData.tasks?.[0];
  if (!task?.id || task.status_code !== 20100) {
    return NextResponse.json(
      { error: 'Failed to submit task', detail: task?.status_message },
      { status: 502 },
    );
  }

  // Persist search query so it pre-fills next time
  await admin
    .from('google_connections')
    .upsert({ practice_id: practiceId, search_query: searchQuery.trim() }, { onConflict: 'practice_id' });

  return NextResponse.json({ taskId: task.id, status: 'pending' });
}
