import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase, createAdminSupabase } from '@/lib/supabase';

export const runtime = 'nodejs';

function apiKey() { return process.env.OUTSCRAPER_API_KEY ?? ''; }

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

  // Submit async request to Outscraper
  const params = new URLSearchParams({
    query:        searchQuery.trim(),
    reviewsLimit: '200',
    sort:         'newest',
    language:     'en',
    async:        'true',
  });

  const res = await fetch(
    `https://api.app.outscraper.com/maps/reviews-v3?${params}`,
    { headers: { 'X-API-KEY': apiKey() } },
  );

  if (!res.ok) {
    const body = await res.text();
    return NextResponse.json({ error: 'Outscraper request failed', detail: body }, { status: 502 });
  }

  const data = await res.json() as { id?: string; status?: string };

  if (!data.id) {
    return NextResponse.json({ error: 'No request ID returned', detail: data }, { status: 502 });
  }

  // Persist search query
  await admin
    .from('google_connections')
    .upsert({ practice_id: practiceId, search_query: searchQuery.trim() }, { onConflict: 'practice_id' });

  return NextResponse.json({ requestId: data.id, status: 'pending' });
}
