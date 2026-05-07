'use server';

import { createAdminSupabase, createServerSupabase } from '@/lib/supabase';
import { revalidatePath } from 'next/cache';
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

  const message = await client.messages.create({
    model: 'claude-opus-4-7',
    max_tokens: 300,
    thinking: { type: 'adaptive' },
    messages: [
      {
        role: 'user',
        content: `You are helping ${practiceName}, a UK dental practice, write a professional public response to a patient review. Write a warm, genuine reply in 2-3 sentences. Address the patient's specific experience, thank them, and end positively. Do not use placeholders. Do not start with "Dear" or "Dear Patient". Return only the response text, nothing else.\n\n${reviewSnippet}`,
      },
    ],
  });

  const text = message.content.find((b) => b.type === 'text')?.text ?? '';
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

  const client = new Anthropic();
  const message = await client.messages.create({
    model: 'claude-opus-4-7',
    max_tokens: 1024,
    thinking: { type: 'adaptive' },
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

  const raw = message.content.find((b) => b.type === 'text')?.text ?? '';
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
  revalidatePath('/');
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
