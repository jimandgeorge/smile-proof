import Anthropic from '@anthropic-ai/sdk';
import { createAdminSupabase } from '@/lib/supabase';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export const SUMMARY_MIN_REVIEWS = 5;
// Minimum days between regenerations even when new reviews arrive.
// Prevents thrashing when a practice gets many reviews in a short period.
const SUMMARY_REGEN_DAYS = 7;

// Cooldown for featured practices — regenerate more aggressively as they get priority treatment
const FEATURED_REGEN_DAYS = 1;

type ReviewInput = {
  rating_overall: number;
  body: string;
  verification_status: string;
};

/**
 * Single source of truth for AI summary generation guards.
 * Safe to call fire-and-forget via after(). Never call on page load.
 *
 * Eligibility:
 *   - >= SUMMARY_MIN_REVIEWS published reviews, OR
 *   - claimed practice (lowered threshold: >= 1 review), OR
 *   - featured practice (lowered threshold: >= 1 review)
 *
 * Will skip (return early) if:
 *   - practice is not eligible
 *   - review count hasn't changed AND featured mode hasn't changed
 *   - last generation was within cooldown (1 day for featured, 7 days otherwise)
 */
export async function maybeRefreshPracticeSummary(practiceId: string): Promise<void> {
  const admin = createAdminSupabase();

  // Fetch review count and practice metadata in parallel
  const [countResult, practiceResult] = await Promise.all([
    admin
      .from('reviews')
      .select('id', { count: 'exact', head: true })
      .eq('practice_id', practiceId)
      .eq('moderation_status', 'published'),
    admin
      .from('practices')
      .select('name, claimed_by_user_id, is_featured')
      .eq('id', practiceId)
      .single(),
  ]);

  const reviewCount = countResult.count ?? 0;
  const isClaimed = !!practiceResult.data?.claimed_by_user_id;
  const isFeatured = !!practiceResult.data?.is_featured;

  // ── Eligibility guard ──────────────────────────────────────────────────────
  const eligible =
    reviewCount >= SUMMARY_MIN_REVIEWS ||
    ((isClaimed || isFeatured) && reviewCount >= 1);
  if (!eligible) return;

  // ── Staleness guards ───────────────────────────────────────────────────────
  const { data: existing } = await admin
    .from('practice_ai_summaries')
    .select('review_count_at_generation, last_generated_at, generated_for_featured')
    .eq('practice_id', practiceId)
    .maybeSingle();

  // If featured mode changed we must regenerate regardless of review count
  const modeChanged = isFeatured !== (existing?.generated_for_featured ?? false);

  // No new reviews and mode hasn't changed — nothing to improve
  if (!modeChanged && existing && existing.review_count_at_generation >= reviewCount) return;

  // Generated recently — wait for cooldown to expire before spending tokens.
  // Featured practices use a shorter cooldown so they stay current.
  if (existing?.last_generated_at) {
    const daysSinceLast =
      (Date.now() - new Date(existing.last_generated_at).getTime()) /
      (1000 * 60 * 60 * 24);
    const cooldownDays = isFeatured ? FEATURED_REGEN_DAYS : SUMMARY_REGEN_DAYS;
    if (daysSinceLast < cooldownDays) return;
  }

  // ── Generate ───────────────────────────────────────────────────────────────
  const { data: reviews } = await admin
    .from('reviews')
    .select('rating_overall, body, verification_status')
    .eq('practice_id', practiceId)
    .eq('moderation_status', 'published')
    .order('created_at', { ascending: false })
    .limit(20);

  if (!reviews?.length || !practiceResult.data) return;

  const text = await generatePracticeSummary(practiceResult.data.name, reviews, isFeatured);
  if (!text) return;

  await admin.from('practice_ai_summaries').upsert(
    {
      practice_id: practiceId,
      summary: text,
      review_count_at_generation: reviewCount,
      last_generated_at: new Date().toISOString(),
      generated_for_featured: isFeatured,
    },
    { onConflict: 'practice_id' },
  );
}

export async function generatePracticeSummary(
  practiceName: string,
  reviews: ReviewInput[],
  isFeatured = false,
): Promise<string | null> {
  if (!reviews.length) return null;

  const reviewText = reviews
    .slice(0, 20)
    .map(
      (r, i) =>
        `Review ${i + 1} (${r.rating_overall}/5${r.verification_status === 'verified' ? ', verified' : ''}): ${r.body}`,
    )
    .join('\n\n');

  const prompt = isFeatured
    ? `You are summarising patient reviews for a featured UK dental practice listing. Write 4–5 balanced sentences summarising what patients consistently say about "${practiceName}". Cover: overall patient experience, standout strengths (e.g. specific treatments, staff warmth, anxiety handling, waiting times), any recurring concerns, and what kind of patient this practice suits best. Do not use bullet points. Do not invent details not in the reviews. Write in third person, present tense.`
    : `You are summarising patient reviews for a UK dental practice listing. Write 2–3 balanced sentences summarising what patients say about "${practiceName}". Mention standout positives and any recurring concerns honestly. Do not use bullet points. Do not invent details not in the reviews. Write in third person, present tense.`;

  const response = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: isFeatured ? 500 : 300,
    messages: [
      {
        role: 'user',
        content: `${prompt}\n\nReviews:\n${reviewText}`,
      },
    ],
  });

  const text = response.content.find((b) => b.type === 'text');
  return text?.text ?? null;
}
