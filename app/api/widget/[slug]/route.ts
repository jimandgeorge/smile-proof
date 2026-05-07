import { NextRequest, NextResponse } from 'next/server';
import { createAdminSupabase } from '@/lib/supabase';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const admin = createAdminSupabase();

  const { data: practice } = await admin
    .from('practices')
    .select('id, name, city')
    .eq('slug', slug)
    .single();

  if (!practice) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const { data: summary } = await admin
    .from('practice_rating_summary')
    .select('avg_overall, review_count, verified_count')
    .eq('practice_id', practice.id)
    .maybeSingle();

  const data = {
    name: practice.name,
    city: practice.city,
    slug,
    avg_overall: summary?.avg_overall ? Number(Number(summary.avg_overall).toFixed(1)) : null,
    review_count: summary?.review_count ?? 0,
    verified_count: summary?.verified_count ?? 0,
    profile_url: `${process.env.NEXT_PUBLIC_SITE_URL}/practices/${slug}`,
    badge_url: `${process.env.NEXT_PUBLIC_SITE_URL}`,
  };

  return NextResponse.json(data, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
    },
  });
}
