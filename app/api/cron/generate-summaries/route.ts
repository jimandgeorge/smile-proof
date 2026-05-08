import { NextRequest, NextResponse } from 'next/server';
import { createAdminSupabase } from '@/lib/supabase';
import { maybeRefreshPracticeSummary, SUMMARY_MIN_REVIEWS } from '@/lib/ai';

export const runtime = 'nodejs';
export const maxDuration = 300; // 5 min — enough for a full batch on Vercel Pro

export async function GET(req: NextRequest) {
  // Require secret on every call — Vercel Cron sends it automatically when
  // CRON_SECRET is set; manual calls must pass Authorization: Bearer <secret>.
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return NextResponse.json({ error: 'CRON_SECRET not configured' }, { status: 500 });
  }
  const auth = req.headers.get('authorization') ?? '';
  if (auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const admin = createAdminSupabase();

  // Fetch eligible practices and existing summaries in parallel.
  // Featured practices are included even below the standard threshold (>= 1 review).
  const [summariesRes, featuredRes, existingRes] = await Promise.all([
    admin
      .from('practice_rating_summary')
      .select('practice_id, review_count')
      .gte('review_count', SUMMARY_MIN_REVIEWS),
    admin
      .from('practices')
      .select('id')
      .eq('is_featured', true)
      .gte('id', '00000000-0000-0000-0000-000000000000'), // ensure featured with any review count
    admin
      .from('practice_ai_summaries')
      .select('practice_id, review_count_at_generation, generated_for_featured'),
  ]);

  // Merge: all standard-eligible + all featured, deduplicated
  const standardIds = new Set((summariesRes.data ?? []).map(p => p.practice_id));
  const featuredIds = new Set((featuredRes.data ?? []).map(p => p.id));

  const allEligibleIds = new Set([...standardIds, ...featuredIds]);

  const existingMap = new Map(
    (existingRes.data ?? []).map(s => [s.practice_id, s]),
  );

  // Filter to those needing generation — maybeRefreshPracticeSummary applies
  // the full guard logic, so here we just skip obviously up-to-date ones.
  const toGenerate = [...allEligibleIds].filter(id => {
    const ex = existingMap.get(id);
    if (!ex) return true; // no summary yet
    // Always include featured if mode may have changed
    if (featuredIds.has(id) && !ex.generated_for_featured) return true;
    return false; // let maybeRefreshPracticeSummary decide the rest
  });

  // Process featured practices first so they always get priority
  const sorted = toGenerate.sort((a, b) => {
    const aFeatured = featuredIds.has(a) ? 0 : 1;
    const bFeatured = featuredIds.has(b) ? 0 : 1;
    return aFeatured - bFeatured;
  });

  if (sorted.length === 0) {
    return NextResponse.json({ generated: 0, skipped: allEligibleIds.size, message: 'All summaries up to date' });
  }

  // Generate sequentially to avoid hammering the AI API
  let generated = 0;
  const errors: { practice_id: string; error: string }[] = [];

  for (const practice_id of sorted) {
    try {
      await maybeRefreshPracticeSummary(practice_id);
      generated++;
    } catch (err) {
      errors.push({ practice_id, error: err instanceof Error ? err.message : String(err) });
    }
  }

  return NextResponse.json({
    generated,
    skipped: allEligibleIds.size - sorted.length,
    errors: errors.length > 0 ? errors : undefined,
  });
}
