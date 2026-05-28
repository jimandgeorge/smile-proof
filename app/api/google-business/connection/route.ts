import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase, createAdminSupabase } from '@/lib/supabase';

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
    .select('last_synced_at, review_count, search_query, pending_request_id')
    .eq('practice_id', practiceId)
    .single();

  return NextResponse.json({ connection: conn ?? null });
}
