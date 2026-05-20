'use server';

import { createAdminSupabase, createServerSupabase } from '@/lib/supabase';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import Anthropic from '@anthropic-ai/sdk';
import { sendReviewInviteEmail } from '@/lib/email';
import { z } from 'zod';

export async function respondToReview(reviewId: string, practiceId: string, body: string, practiceSlug: string) {
  if (!body.trim()) return { error: 'Response cannot be empty.' };

  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'You must be logged in to respond.' };

  const admin = createAdminSupabase();

  const { data: practice } = await admin
    .from('practices')
    .select('claimed_by_user_id')
    .eq('id', practiceId)
    .single();

  if (!practice || practice.claimed_by_user_id !== user.id) {
    return { error: 'You do not own this practice.' };
  }

  const { error } = await admin.from('practice_responses').upsert(
    { review_id: reviewId, practice_id: practiceId, body: body.trim(), responder_user_id: user.id },
    { onConflict: 'review_id' }
  );

  if (error) return { error: error.message };
  revalidatePath(`/practices/${practiceSlug}/dashboard`);
  return { success: true };
}

export async function generateReviewResponse(
  reviewBody: string,
  reviewTitle: string | null,
  rating: number,
  practiceName: string,
  practiceId: string,
): Promise<{ text?: string; error?: string }> {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'You must be logged in.' };

  const admin = createAdminSupabase();
  const { data: practice } = await admin
    .from('practices')
    .select('claimed_by_user_id, subscription_status')
    .eq('id', practiceId)
    .single();

  if (!practice || practice.claimed_by_user_id !== user.id) {
    return { error: 'You do not own this practice.' };
  }
  if (practice.subscription_status !== 'active') {
    return { error: 'AI replies require a Pro subscription.' };
  }

  const client = new Anthropic();

  const reviewSnippet = [reviewTitle ? `Title: "${reviewTitle}"` : null, `Review: "${reviewBody}"`, `Rating: ${rating}/5`]
    .filter(Boolean)
    .join('\n');

  let message;
  try {
    message = await client.messages.create({
      model: 'claude-opus-4-7',
      max_tokens: 2048,
      thinking: { type: 'adaptive' },
      messages: [
        {
          role: 'user',
          content: `You are helping ${practiceName}, a UK dental practice, write a professional public response to a patient review. Write a warm, genuine reply in 2-3 sentences. Address the patient's specific experience, thank them, and end positively. Do not use placeholders. Do not start with "Dear" or "Dear Patient". Return only the response text, nothing else.\n\n${reviewSnippet}`,
        },
      ],
    });
  } catch (e: any) {
    return { error: `AI error: ${e?.message ?? 'Unknown error'}` };
  }

  const text = message.content.find((b: any) => b.type === 'text')?.text ?? '';
  if (!text) return { error: 'No response generated.' };
  return { text };
}

export type SentimentTheme = {
  topic: string;
  sentiment: 'positive' | 'negative' | 'mixed';
  count: number;
  example: string;
};

export async function generateSentimentThemes(
  practiceId: string,
  practiceSlug: string,
): Promise<{ themes?: SentimentTheme[]; error?: string }> {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'You must be logged in.' };

  const admin = createAdminSupabase();
  const { data: practice } = await admin
    .from('practices')
    .select('claimed_by_user_id, subscription_status, ai_insights_updated_at')
    .eq('id', practiceId)
    .single();

  if (!practice || practice.claimed_by_user_id !== user.id) return { error: 'You do not own this practice.' };
  if (practice.subscription_status !== 'active') return { error: 'AI insights require a Pro subscription.' };

  const THEMES_COOLDOWN_MS = 60 * 60 * 1000; // 1 hour
  if (practice.ai_insights_updated_at) {
    const msSinceLast = Date.now() - new Date(practice.ai_insights_updated_at).getTime();
    if (msSinceLast < THEMES_COOLDOWN_MS) {
      const minutesLeft = Math.ceil((THEMES_COOLDOWN_MS - msSinceLast) / 60000);
      return { error: `Analysis was generated recently. Try again in ${minutesLeft} minute${minutesLeft !== 1 ? 's' : ''}.` };
    }
  }

  const { data: reviews } = await admin
    .from('reviews')
    .select('body')
    .eq('practice_id', practiceId)
    .eq('moderation_status', 'published')
    .limit(40);

  if (!reviews || reviews.length < 3) return { error: 'Need at least 3 published reviews to generate themes.' };

  const reviewText = reviews.map((r, i) => `Review ${i + 1}: "${r.body}"`).join('\n\n');

  let raw: string;
  try {
    const client = new Anthropic();
    const message = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      messages: [{
        role: 'user',
        content: `Analyse these ${reviews.length} patient reviews for a UK dental practice and identify recurring themes. Return ONLY a JSON array — no markdown, no explanation.

Each item: { "topic": string (2-4 words), "sentiment": "positive"|"negative"|"mixed", "count": number (how many reviews mention it), "example": string (one short quote under 100 chars from an actual review) }

Include 4-8 themes total. Focus on topics patients clearly care about: staff attitude, pain management, wait times, cleanliness, value, communication, anxiety handling, results quality.

Reviews:
${reviewText}

Return only: [{"topic":"...","sentiment":"...","count":0,"example":"..."},...]`,
      }],
    });
    raw = message.content.find((b) => b.type === 'text')?.text ?? '';
  } catch (e: any) {
    return { error: `AI error: ${e?.message ?? 'unknown'}` };
  }

  let themes: SentimentTheme[];
  try {
    themes = JSON.parse(raw.match(/\[[\s\S]*\]/)?.[0] ?? raw);
    if (!Array.isArray(themes)) throw new Error('Not an array');
  } catch {
    return { error: 'Failed to parse AI response.' };
  }

  await admin
    .from('practices')
    .update({
      ai_insights: { themes, generated_at: new Date().toISOString() },
      ai_insights_updated_at: new Date().toISOString(),
    })
    .eq('id', practiceId);

  revalidatePath(`/practices/${practiceSlug}/dashboard`);
  return { themes };
}

// ── AI Opportunities ──────────────────────────────────────────────────────────

export type OpportunityStrength   = { category: string; text: string; mention_count?: number; quote?: string };
export type OpportunityWeakness   = { category: string; text: string; pct_mentions?: number; quote?: string };
export type OpportunityAction     = { category: string; recommendation: string; rationale: string; impact?: 'high_impact' | 'quick_win' | 'monitor'; evidence?: string };
export type OpportunityCategoryScores = Record<string, number>;

export type OpportunityInsightData = {
  id: string;
  generated_at: string;
  review_count: number;
  themes: SentimentTheme[];
  strengths: OpportunityStrength[];
  weaknesses: OpportunityWeakness[];
  opportunities: OpportunityAction[];
  category_scores: OpportunityCategoryScores;
};

const OPPORTUNITIES_COOLDOWN_FREE_MS = 6 * 60 * 60 * 1000;  // 6 hours
const OPPORTUNITIES_COOLDOWN_PAID_MS = 60 * 60 * 1000;       // 1 hour

export async function generateOpportunityInsights(
  practiceId: string,
  practiceSlug: string,
): Promise<{ insights?: OpportunityInsightData; error?: string }> {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'You must be logged in.' };

  const admin = createAdminSupabase();
  const { data: practice } = await admin
    .from('practices')
    .select('name, claimed_by_user_id, subscription_status')
    .eq('id', practiceId)
    .single();

  if (!practice || practice.claimed_by_user_id !== user.id) return { error: 'You do not own this practice.' };

  const isPaid = practice.subscription_status === 'active';
  const cooldownMs = isPaid ? OPPORTUNITIES_COOLDOWN_PAID_MS : OPPORTUNITIES_COOLDOWN_FREE_MS;

  // Check cooldown against last generation
  const { data: existing } = await admin
    .from('practice_opportunity_insights')
    .select('id, generated_at')
    .eq('practice_id', practiceId)
    .maybeSingle();

  if (existing?.generated_at) {
    const elapsed = Date.now() - new Date(existing.generated_at).getTime();
    if (elapsed < cooldownMs) {
      const hoursLeft = Math.ceil((cooldownMs - elapsed) / 3600000);
      return { error: `Insights were generated recently. Try again in ${hoursLeft} hour${hoursLeft !== 1 ? 's' : ''}.` };
    }
  }

  const { data: reviews } = await admin
    .from('reviews')
    .select('rating_overall, title, body')
    .eq('practice_id', practiceId)
    .eq('moderation_status', 'published')
    .order('created_at', { ascending: false })
    .limit(50);

  if (!reviews || reviews.length < 2) {
    return { error: 'At least 2 published reviews are needed to generate insights.' };
  }

  const reviewText = reviews
    .map((r, i) => {
      const title = r.title ? `Title: "${r.title}" · ` : '';
      const body = r.body.length > 400 ? r.body.slice(0, 400) + '…' : r.body;
      return `[${i + 1}] Rating: ${r.rating_overall}/5 · ${title}"${body}"`;
    })
    .join('\n\n');

  const prompt = `You are a practice intelligence analyst reviewing ${reviews.length} patient reviews for "${practice.name}", a UK dental practice.

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
      review_count: reviews.length,
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
      strengths: upserted.strengths,
      weaknesses: upserted.weaknesses,
      opportunities: upserted.opportunities,
      category_scores: upserted.category_scores,
      themes: upserted.themes ?? [],
    },
  };
}

export async function generatePracticeIntelligence(
  practiceId: string,
  practiceSlug: string,
): Promise<{ insights?: OpportunityInsightData; error?: string }> {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'You must be logged in.' };

  const admin = createAdminSupabase();
  const { data: practice } = await admin
    .from('practices')
    .select('name, claimed_by_user_id, subscription_status')
    .eq('id', practiceId)
    .single();

  if (!practice || practice.claimed_by_user_id !== user.id) return { error: 'You do not own this practice.' };

  const isPaid = practice.subscription_status === 'active';
  const cooldownMs = isPaid ? OPPORTUNITIES_COOLDOWN_PAID_MS : OPPORTUNITIES_COOLDOWN_FREE_MS;

  const { data: existing } = await admin
    .from('practice_opportunity_insights')
    .select('id, generated_at')
    .eq('practice_id', practiceId)
    .maybeSingle();

  if (existing?.generated_at) {
    const elapsed = Date.now() - new Date(existing.generated_at).getTime();
    if (elapsed < cooldownMs) {
      const hoursLeft = Math.ceil((cooldownMs - elapsed) / 3600000);
      return { error: `Report was generated recently. Try again in ${hoursLeft} hour${hoursLeft !== 1 ? 's' : ''}.` };
    }
  }

  const { data: reviews } = await admin
    .from('reviews')
    .select('rating_overall, title, body')
    .eq('practice_id', practiceId)
    .eq('moderation_status', 'published')
    .order('created_at', { ascending: false })
    .limit(50);

  if (!reviews || reviews.length < 2) {
    return { error: 'At least 2 published reviews are needed to generate a report.' };
  }

  const reviewText = reviews
    .map((r, i) => {
      const title = r.title ? `Title: "${r.title}" · ` : '';
      const body = r.body.length > 400 ? r.body.slice(0, 400) + '…' : r.body;
      return `[${i + 1}] Rating ${r.rating_overall}/5 · ${title}"${body}"`;
    })
    .join('\n\n');

  const confidenceNote = reviews.length < 5
    ? `IMPORTANT: Only ${reviews.length} reviews — use hedged language ("appears to", "in the available reviews"). Do not state patterns as definitive facts.`
    : reviews.length < 15
    ? `Note: ${reviews.length} reviews — patterns are forming but may not be fully representative yet.`
    : '';

  const prompt = `Analyse ${reviews.length} patient reviews for "${practice.name}", a UK dental practice. Return a single JSON object.

Return ONLY valid JSON — no markdown, no preamble.
${confidenceNote}

Schema:
{
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

  let parsed: { themes: any[]; strengths: any[]; weaknesses: any[]; opportunities: any[]; category_scores: Record<string, number> };
  try {
    // Strip markdown code fences if present, then extract the JSON object
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
      practice_id:    practiceId,
      generated_at:   now,
      review_count:   reviews.length,
      themes:         parsed.themes ?? [],
      strengths:      parsed.strengths ?? [],
      weaknesses:     parsed.weaknesses ?? [],
      opportunities:  parsed.opportunities ?? [],
      category_scores: parsed.category_scores ?? {},
    }, { onConflict: 'practice_id' })
    .select()
    .single();

  if (dbError || !upserted) return { error: dbError?.message ?? 'Failed to save report.' };

  revalidatePath(`/practices/${practiceSlug}/dashboard`);
  return {
    insights: {
      id:              upserted.id,
      generated_at:    upserted.generated_at,
      review_count:    upserted.review_count,
      themes:          upserted.themes,
      strengths:       upserted.strengths,
      weaknesses:      upserted.weaknesses,
      opportunities:   upserted.opportunities,
      category_scores: upserted.category_scores,
    },
  };
}

export async function updatePracticeServices(
  practiceId: string,
  practiceSlug: string,
  serviceIds: string[],
): Promise<{ success?: true; error?: string }> {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
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
  revalidatePath(`/practices/${practiceSlug}`);
  revalidatePath('/');
  return { success: true };
}

export async function unclaimPractice(
  practiceId: string,
  practiceSlug: string,
): Promise<{ error?: string }> {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
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
    .update({ claimed_by_user_id: null })
    .eq('id', practiceId);

  if (error) return { error: error.message };

  redirect(`/practices/${practiceSlug}`);
}

export async function savePracticeLogoUrl(
  practiceId: string,
  practiceSlug: string,
  logoUrl: string,
): Promise<{ success?: true; error?: string }> {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
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
  revalidatePath(`/practices/${practiceSlug}`);
  revalidatePath(`/practices/${practiceSlug}/dashboard`);
  return { success: true };
}

const InviteSchema = z.object({
  email: z.string().email(),
  name: z.string().max(80).optional(),
});

export async function sendReviewInvite(
  practiceId: string,
  practiceSlug: string,
  practiceName: string,
  formData: FormData,
): Promise<{ success?: true; error?: string }> {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
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

  const parsed = InviteSchema.safeParse({
    email: formData.get('email'),
    name: formData.get('name') || undefined,
  });
  if (!parsed.success) return { error: 'Please enter a valid email address.' };
  const { email, name } = parsed.data;

  const { data: invite, error: insertError } = await admin
    .from('review_invites')
    .insert({ practice_id: practiceId, patient_email: email, patient_name: name ?? null })
    .select('token')
    .single();

  if (insertError || !invite) return { error: 'Failed to create invite.' };

  try {
    await sendReviewInviteEmail({
      to: email,
      patientName: name ?? null,
      practiceName,
      practiceSlug,
      token: invite.token,
    });
  } catch {
    return { error: 'Invite saved but email failed to send. Check your RESEND_API_KEY.' };
  }

  revalidatePath(`/practices/${practiceSlug}/dashboard`);
  return { success: true };
}

export async function markEnquiriesRead(practiceId: string): Promise<{ error?: string }> {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Unauthorized' };

  const admin = createAdminSupabase();
  const { data: practice } = await admin
    .from('practices').select('claimed_by_user_id').eq('id', practiceId).single();
  if (!practice || practice.claimed_by_user_id !== user.id) return { error: 'Unauthorized' };

  await admin
    .from('practice_enquiries')
    .update({ read_at: new Date().toISOString() })
    .eq('practice_id', practiceId)
    .is('read_at', null);

  return {};
}

// ── Team management ────────────────────────────────────────────────────────────

async function verifyPracticeOwner(practiceId: string) {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
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
  practiceId: string,
  fullName: string,
  gdcNumber: string | null,
  specialisms: string[],
  practiceSlug: string,
): Promise<{ dentist?: { dentistId: string; fullName: string; gdcNumber: string | null; specialisms: string[]; slug: string }; error?: string }> {
  const user = await verifyPracticeOwner(practiceId);
  if (!user) return { error: 'Unauthorised.' };

  const admin = createAdminSupabase();

  // Check for existing dentist by GDC number
  let dentistId: string;
  let slug: string;

  if (gdcNumber) {
    const { data: existing } = await admin.from('dentists').select('id, slug').eq('gdc_number', gdcNumber).maybeSingle();
    if (existing) {
      dentistId = existing.id;
      slug = existing.slug;
      // Update name/specialisms in case they've changed
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
    // No GDC — create a new record (slug may collide; append practice id suffix if needed)
    const baseSlug = toSlug(fullName, null);
    const { data: collision } = await admin.from('dentists').select('id').eq('slug', baseSlug).maybeSingle();
    slug = collision ? `${baseSlug}-${practiceId.slice(0, 8)}` : baseSlug;
    const { data: inserted, error } = await admin.from('dentists')
      .insert({ full_name: fullName, gdc_number: null, specialisms, slug })
      .select('id').single();
    if (error || !inserted) return { error: error?.message ?? 'Failed to create dentist record.' };
    dentistId = inserted.id;
  }

  // Link dentist to practice
  await admin.from('practice_dentists').upsert(
    { practice_id: practiceId, dentist_id: dentistId, active: true },
    { onConflict: 'practice_id,dentist_id' },
  );

  revalidatePath(`/practices/${practiceSlug}/dashboard`);
  return { dentist: { dentistId, fullName, gdcNumber, specialisms, slug } };
}

export async function removeDentistFromPractice(
  practiceId: string,
  dentistId: string,
  practiceSlug: string,
): Promise<{ error?: string }> {
  const user = await verifyPracticeOwner(practiceId);
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
  dentistId: string,
  gdcNumber: string | null,
  specialisms: string[],
  practiceSlug: string,
): Promise<{ error?: string }> {
  const admin = createAdminSupabase();

  // Verify caller owns a practice linked to this dentist
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Unauthorised.' };

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