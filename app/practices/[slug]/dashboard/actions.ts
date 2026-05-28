'use server';

import { createAdminSupabase, getUserFromToken } from '@/lib/supabase';
import { revalidatePath } from 'next/cache';
import Anthropic from '@anthropic-ai/sdk';

// ── AI Opportunities ──────────────────────────────────────────────────────────

export type SentimentTheme = {
  topic: string;
  sentiment: 'positive' | 'negative' | 'mixed';
  count: number;
  example: string;
};

export type OpportunityStrength   = { category: string; text: string; mention_count?: number; quote?: string };
export type OpportunityWeakness   = { category: string; text: string; pct_mentions?: number; quote?: string };
export type OpportunityAction     = { category: string; recommendation: string; rationale: string; impact?: 'high_impact' | 'quick_win' | 'monitor'; evidence?: string };
export type OpportunityCategoryScores = Record<string, number>;

export type OpportunityInsightData = {
  id: string;
  generated_at: string;
  review_count: number;
  management_summary: string | null;
  themes: SentimentTheme[];
  strengths: OpportunityStrength[];
  weaknesses: OpportunityWeakness[];
  opportunities: OpportunityAction[];
  category_scores: OpportunityCategoryScores;
};

const OPPORTUNITIES_COOLDOWN_MS = 60 * 60 * 1000;  // 1 hour

export async function generateOpportunityInsights(
  accessToken: string,
  practiceId: string,
  practiceSlug: string,
): Promise<{ insights?: OpportunityInsightData; error?: string }> {
  const user = await getUserFromToken(accessToken);
  if (!user) return { error: 'You must be logged in.' };

  const admin = createAdminSupabase();
  const { data: practice } = await admin
    .from('practices')
    .select('name, claimed_by_user_id')
    .eq('id', practiceId)
    .single();

  if (!practice || practice.claimed_by_user_id !== user.id) return { error: 'You do not own this practice.' };

  // Check cooldown against last generation
  const { data: existing } = await admin
    .from('practice_opportunity_insights')
    .select('id, generated_at')
    .eq('practice_id', practiceId)
    .maybeSingle();

  if (existing?.generated_at) {
    const elapsed = Date.now() - new Date(existing.generated_at).getTime();
    if (elapsed < OPPORTUNITIES_COOLDOWN_MS) {
      const hoursLeft = Math.ceil((OPPORTUNITIES_COOLDOWN_MS - elapsed) / 3600000);
      return { error: `Insights were generated recently. Try again in ${hoursLeft} hour${hoursLeft !== 1 ? 's' : ''}.` };
    }
  }

  const { data: googleReviews } = await admin
    .from('external_reviews')
    .select('rating, body')
    .eq('practice_id', practiceId)
    .eq('source', 'google')
    .not('body', 'is', null)
    .order('published_at', { ascending: false })
    .limit(100);

  type GoogleReview = { rating: number | null; body: string | null };
  type UnifiedReview = { rating: number | null; body: string; source: 'google' };

  const unified: UnifiedReview[] = (googleReviews ?? []).map((r: GoogleReview) => ({
    rating: r.rating, body: r.body!, source: 'google' as const,
  }));

  if (unified.length < 2) {
    return { error: 'At least 2 Google reviews are needed to generate insights.' };
  }

  const reviewText = unified
    .map((r, i) => {
      const body = r.body.length > 400 ? r.body.slice(0, 400) + '…' : r.body;
      return `[${i + 1}] Rating: ${r.rating ?? '?'}/5 · "${body}"`;
    })
    .join('\n\n');

  const prompt = `You are a practice intelligence analyst reviewing ${unified.length} Google reviews for "${practice.name}", a UK dental practice.

Produce a structured JSON analysis. Return ONLY valid JSON — no markdown, no explanation.

Schema:
{
  "strengths": [2–4 items: {"category": string, "text": string, "mention_count": number}],
  "weaknesses": [1–3 items: {"category": string, "text": string, "pct_mentions": number}],
  "opportunities": [2–4 items: {"category": string, "recommendation": string, "rationale": string}],
  "category_scores": {"communication": 1–5, "wait_times": 1–5, "nervous_patients": 1–5, "pricing_transparency": 1–5, "treatment_satisfaction": 1–5, "staff_friendliness": 1–5, "booking_experience": 1–5}
}

Rules:
- category must be one of: communication, wait_times, nervous_patients, pricing_transparency, treatment_satisfaction, staff_friendliness, booking_experience
- strengths.text: factual observation starting with "Patients" or "Reviews show"
- weaknesses: only include categories with genuine negative signal; pct_mentions = % of reviews mentioning it negatively (0–100)
- opportunities.recommendation: clear imperative action (e.g. "Display NHS band charges at reception.")
- opportunities.rationale: 1 sentence explaining why, grounded in the data
- category_scores: score all 7; infer from review content where explicit ratings are absent

Reviews:
${reviewText}`;

  let raw: string;
  try {
    const client = new Anthropic();
    const message = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1200,
      messages: [{ role: 'user', content: prompt }],
    });
    raw = message.content.find((b) => b.type === 'text')?.text ?? '';
  } catch (e: any) {
    return { error: `AI error: ${e?.message ?? 'unknown'}` };
  }

  let parsed: { strengths: any[]; weaknesses: any[]; opportunities: any[]; category_scores: Record<string, number> };
  try {
    const jsonStr = raw.match(/\{[\s\S]*\}/)?.[0] ?? raw;
    parsed = JSON.parse(jsonStr);
    if (!parsed.strengths || !parsed.category_scores) throw new Error('Unexpected shape');
  } catch {
    return { error: 'Failed to parse AI response. Please try again.' };
  }

  const now = new Date().toISOString();
  const { data: upserted, error: dbError } = await admin
    .from('practice_opportunity_insights')
    .upsert({
      practice_id: practiceId,
      generated_at: now,
      review_count: unified.length,
      strengths: parsed.strengths ?? [],
      weaknesses: parsed.weaknesses ?? [],
      opportunities: parsed.opportunities ?? [],
      category_scores: parsed.category_scores ?? {},
    }, { onConflict: 'practice_id' })
    .select()
    .single();

  if (dbError || !upserted) return { error: dbError?.message ?? 'Failed to save insights.' };

  revalidatePath(`/practices/${practiceSlug}/dashboard`);
  return {
    insights: {
      id: upserted.id,
      generated_at: upserted.generated_at,
      review_count: upserted.review_count,
      management_summary: upserted.management_summary ?? null,
      strengths: upserted.strengths,
      weaknesses: upserted.weaknesses,
      opportunities: upserted.opportunities,
      category_scores: upserted.category_scores,
      themes: upserted.themes ?? [],
    },
  };
}

export async function generatePracticeIntelligence(
  accessToken: string,
  practiceId: string,
  practiceSlug: string,
): Promise<{ insights?: OpportunityInsightData; error?: string }> {
  const user = await getUserFromToken(accessToken);
  if (!user) return { error: 'You must be logged in.' };

  const admin = createAdminSupabase();
  const { data: practice } = await admin
    .from('practices')
    .select('name, claimed_by_user_id')
    .eq('id', practiceId)
    .single();

  if (!practice || practice.claimed_by_user_id !== user.id) return { error: 'You do not own this practice.' };

  const { data: existing } = await admin
    .from('practice_opportunity_insights')
    .select('id, generated_at')
    .eq('practice_id', practiceId)
    .maybeSingle();

  if (existing?.generated_at) {
    const elapsed = Date.now() - new Date(existing.generated_at).getTime();
    if (elapsed < OPPORTUNITIES_COOLDOWN_MS) {
      const hoursLeft = Math.ceil((OPPORTUNITIES_COOLDOWN_MS - elapsed) / 3600000);
      return { error: `Report was generated recently. Try again in ${hoursLeft} hour${hoursLeft !== 1 ? 's' : ''}.` };
    }
  }

  const { data: googleReviews } = await admin
    .from('external_reviews')
    .select('rating, body')
    .eq('practice_id', practiceId)
    .eq('source', 'google')
    .not('body', 'is', null)
    .order('published_at', { ascending: false })
    .limit(100);

  type GR = { rating: number | null; body: string | null };
  type UR = { rating: number | null; body: string; source: 'google' };

  const unified: UR[] = (googleReviews ?? []).map((r: GR) => ({
    rating: r.rating, body: r.body!, source: 'google' as const,
  }));

  if (unified.length < 2) {
    return { error: 'At least 2 Google reviews are needed to generate a report.' };
  }

  const reviewText = unified
    .map((r, i) => {
      const body = r.body.length > 400 ? r.body.slice(0, 400) + '…' : r.body;
      return `[${i + 1}] Rating ${r.rating ?? '?'}/5 · "${body}"`;
    })
    .join('\n\n');

  const confidenceNote = unified.length < 5
    ? `IMPORTANT: Only ${unified.length} reviews — use hedged language ("appears to", "in the available reviews"). Do not state patterns as definitive facts.`
    : unified.length < 15
    ? `Note: ${unified.length} reviews — patterns are forming but may not be fully representative yet.`
    : '';

  const prompt = `Analyse ${unified.length} Google reviews for "${practice.name}", a UK dental practice. Return a single JSON object.

Return ONLY valid JSON — no markdown, no preamble.
${confidenceNote}

Schema:
{
  "management_summary": string (2–3 sentences of executive prose: what patients consistently praise, main friction points, and one improvement focus — plain English, no bullet points, no hedging),
  "themes": [4–6 items: {"topic": string (2–4 words, plain English), "sentiment": "positive"|"negative"|"mixed", "count": number, "example": string (real quote under 80 chars)}],
  "strengths": [2–3 items: {"category": string, "text": string (plain English, what the reviews actually show), "mention_count": number, "quote": string (real patient quote under 80 chars)}],
  "weaknesses": [0–2 items, only where genuine negative signal exists: {"category": string, "text": string, "pct_mentions": number, "quote": string (real patient quote under 80 chars)}],
  "opportunities": [2–3 items, ordered by priority: {"category": string, "recommendation": string (specific imperative under 12 words), "rationale": string (one factual sentence grounded in the reviews), "impact": "high_impact"|"quick_win"|"monitor", "evidence": string (e.g. '3 patients mentioned X' or short real quote)}],
  "category_scores": {"communication": 1–5, "wait_times": 1–5, "nervous_patients": 1–5, "pricing_transparency": 1–5, "treatment_satisfaction": 1–5, "staff_friendliness": 1–5, "booking_experience": 1–5}
}

Rules:
- Use plain, direct language — no consultant phrases, no marketing speak
- Ground every insight in what reviews actually say
- strengths/weaknesses category: one of: communication, wait_times, nervous_patients, pricing_transparency, treatment_satisfaction, staff_friendliness, booking_experience
- strengths.text: describe the pattern directly (e.g. "Anxious patients consistently feel reassured" not "Your anxiety management is excellent")
- weaknesses.pct_mentions: approximate % of reviews containing negative signal on that topic
- opportunities ordered: high_impact (core experience issue) first, quick_win (easy fix) second, monitor (emerging pattern) last
- opportunities.recommendation: specific and actionable (e.g. "Post waiting time estimates on the booking confirmation email." not "Improve wait time communication.")
- category_scores: score all 7 based on review content; infer conservatively where data is thin

Reviews:
${reviewText}`;

  let raw: string;
  try {
    const client = new Anthropic();
    const message = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 4096,
      messages: [{ role: 'user', content: prompt }],
    });
    raw = message.content.find((b) => b.type === 'text')?.text ?? '';
  } catch (e: any) {
    return { error: `AI error: ${e?.message ?? 'unknown'}` };
  }

  let parsed: { management_summary?: string; themes: any[]; strengths: any[]; weaknesses: any[]; opportunities: any[]; category_scores: Record<string, number> };
  try {
    const stripped = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/, '');
    const jsonStr = stripped.match(/\{[\s\S]*\}/)?.[0] ?? stripped;
    parsed = JSON.parse(jsonStr);
    if (!parsed.strengths || !parsed.category_scores || !parsed.themes) throw new Error('Unexpected shape');
  } catch {
    return { error: `Failed to parse AI response: ${raw.slice(0, 120)}` };
  }

  const now = new Date().toISOString();
  const { data: upserted, error: dbError } = await admin
    .from('practice_opportunity_insights')
    .upsert({
      practice_id:        practiceId,
      generated_at:       now,
      review_count:       unified.length,
      management_summary: parsed.management_summary ?? null,
      themes:             parsed.themes ?? [],
      strengths:          parsed.strengths ?? [],
      weaknesses:         parsed.weaknesses ?? [],
      opportunities:      parsed.opportunities ?? [],
      category_scores:    parsed.category_scores ?? {},
    }, { onConflict: 'practice_id' })
    .select()
    .single();

  if (dbError || !upserted) return { error: dbError?.message ?? 'Failed to save report.' };

  revalidatePath(`/practices/${practiceSlug}/dashboard`);
  return {
    insights: {
      id:                 upserted.id,
      generated_at:       upserted.generated_at,
      review_count:       upserted.review_count,
      management_summary: upserted.management_summary ?? null,
      themes:             upserted.themes,
      strengths:          upserted.strengths,
      weaknesses:         upserted.weaknesses,
      opportunities:      upserted.opportunities,
      category_scores:    upserted.category_scores,
    },
  };
}

export async function updatePracticeServices(
  accessToken: string,
  practiceId: string,
  practiceSlug: string,
  serviceIds: string[],
): Promise<{ success?: true; error?: string }> {
  const user = await getUserFromToken(accessToken);
  if (!user) return { error: 'You must be logged in.' };

  const admin = createAdminSupabase();
  const { data: practice } = await admin
    .from('practices')
    .select('claimed_by_user_id')
    .eq('id', practiceId)
    .single();

  if (!practice || practice.claimed_by_user_id !== user.id) {
    return { error: 'You do not own this practice.' };
  }

  await admin.from('practice_services').delete().eq('practice_id', practiceId);

  if (serviceIds.length > 0) {
    const { error } = await admin.from('practice_services').insert(
      serviceIds.map(service_id => ({ practice_id: practiceId, service_id })),
    );
    if (error) return { error: error.message };
  }

  revalidatePath(`/practices/${practiceSlug}/dashboard`);
  revalidatePath('/');
  return { success: true };
}

export async function unclaimPractice(
  accessToken: string,
  practiceId: string,
  practiceSlug: string,
): Promise<{ error?: string; success?: true }> {
  const user = await getUserFromToken(accessToken);
  if (!user) return { error: 'You must be logged in.' };

  const admin = createAdminSupabase();
  const { data: practice } = await admin
    .from('practices')
    .select('claimed_by_user_id')
    .eq('id', practiceId)
    .single();

  if (!practice || practice.claimed_by_user_id !== user.id) {
    return { error: 'You do not own this practice.' };
  }

  const { error: unclaimErr } = await admin
    .from('practices')
    .update({
      claimed_by_user_id:     null,
      claimed_at:             null,
      stripe_customer_id:     null,
      stripe_subscription_id: null,
      subscription_status:    'free',
      subscription_plan:      'free',
    })
    .eq('id', practiceId);

  if (unclaimErr) return { error: unclaimErr.message };

  await admin.auth.admin.deleteUser(user.id);

  return { success: true };
}

export async function savePracticeLogoUrl(
  accessToken: string,
  practiceId: string,
  practiceSlug: string,
  logoUrl: string,
): Promise<{ success?: true; error?: string }> {
  const user = await getUserFromToken(accessToken);
  if (!user) return { error: 'You must be logged in.' };

  const admin = createAdminSupabase();
  const { data: practice } = await admin
    .from('practices')
    .select('claimed_by_user_id')
    .eq('id', practiceId)
    .single();

  if (!practice || practice.claimed_by_user_id !== user.id) {
    return { error: 'You do not own this practice.' };
  }

  const { error } = await admin
    .from('practices')
    .update({ logo_url: logoUrl })
    .eq('id', practiceId);

  if (error) return { error: error.message };
  revalidatePath(`/practices/${practiceSlug}/dashboard`);
  return { success: true };
}

// ── Team management ────────────────────────────────────────────────────────────

async function verifyPracticeOwner(accessToken: string, practiceId: string) {
  const user = await getUserFromToken(accessToken);
  if (!user) return null;
  const admin = createAdminSupabase();
  const { data: practice } = await admin.from('practices').select('claimed_by_user_id').eq('id', practiceId).single();
  if (!practice || practice.claimed_by_user_id !== user.id) return null;
  return user;
}

function toSlug(name: string, gdc: string | null): string {
  const base = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  return gdc ? `${base}-gdc-${gdc}` : base;
}

export async function addDentistToTeam(
  accessToken: string,
  practiceId: string,
  fullName: string,
  gdcNumber: string | null,
  specialisms: string[],
  practiceSlug: string,
): Promise<{ dentist?: { dentistId: string; fullName: string; gdcNumber: string | null; specialisms: string[]; slug: string }; error?: string }> {
  const user = await verifyPracticeOwner(accessToken, practiceId);
  if (!user) return { error: 'Unauthorised.' };

  const admin = createAdminSupabase();

  let dentistId: string;
  let slug: string;

  if (gdcNumber) {
    const { data: existing } = await admin.from('dentists').select('id, slug').eq('gdc_number', gdcNumber).maybeSingle();
    if (existing) {
      dentistId = existing.id;
      slug = existing.slug;
      await admin.from('dentists').update({ full_name: fullName, specialisms }).eq('id', dentistId);
    } else {
      slug = toSlug(fullName, gdcNumber);
      const { data: inserted, error } = await admin.from('dentists')
        .insert({ full_name: fullName, gdc_number: gdcNumber, specialisms, slug })
        .select('id').single();
      if (error || !inserted) return { error: error?.message ?? 'Failed to create dentist record.' };
      dentistId = inserted.id;
    }
  } else {
    const baseSlug = toSlug(fullName, null);
    const { data: collision } = await admin.from('dentists').select('id').eq('slug', baseSlug).maybeSingle();
    slug = collision ? `${baseSlug}-${practiceId.slice(0, 8)}` : baseSlug;
    const { data: inserted, error } = await admin.from('dentists')
      .insert({ full_name: fullName, gdc_number: null, specialisms, slug })
      .select('id').single();
    if (error || !inserted) return { error: error?.message ?? 'Failed to create dentist record.' };
    dentistId = inserted.id;
  }

  await admin.from('practice_dentists').upsert(
    { practice_id: practiceId, dentist_id: dentistId, active: true },
    { onConflict: 'practice_id,dentist_id' },
  );

  revalidatePath(`/practices/${practiceSlug}/dashboard`);
  return { dentist: { dentistId, fullName, gdcNumber, specialisms, slug } };
}

export async function removeDentistFromPractice(
  accessToken: string,
  practiceId: string,
  dentistId: string,
  practiceSlug: string,
): Promise<{ error?: string }> {
  const user = await verifyPracticeOwner(accessToken, practiceId);
  if (!user) return { error: 'Unauthorised.' };

  const admin = createAdminSupabase();
  await admin.from('practice_dentists')
    .update({ active: false })
    .eq('practice_id', practiceId)
    .eq('dentist_id', dentistId);

  revalidatePath(`/practices/${practiceSlug}/dashboard`);
  return {};
}

export async function updateDentistRecord(
  accessToken: string,
  dentistId: string,
  gdcNumber: string | null,
  specialisms: string[],
  practiceSlug: string,
): Promise<{ error?: string }> {
  const user = await getUserFromToken(accessToken);
  if (!user) return { error: 'Unauthorised.' };

  const admin = createAdminSupabase();

  const { data: link } = await admin.from('practice_dentists')
    .select('practices(claimed_by_user_id)')
    .eq('dentist_id', dentistId)
    .eq('active', true)
    .limit(1)
    .maybeSingle();

  const owner = (link?.practices as any)?.claimed_by_user_id;
  if (owner !== user.id) return { error: 'Unauthorised.' };

  await admin.from('dentists').update({ gdc_number: gdcNumber, specialisms }).eq('id', dentistId);

  revalidatePath(`/practices/${practiceSlug}/dashboard`);
  return {};
}
