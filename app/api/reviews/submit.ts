// app/api/reviews/submit.ts
// Server action for review submission. Use from a form via the `action={submitReview}` prop.

'use server';

import { createAdminSupabase, createServerSupabase } from '@/lib/supabase';
import { sendNewReviewNotification } from '@/lib/email';
import { redirect } from 'next/navigation';
import { z } from 'zod';

const ReviewSchema = z.object({
  practice_id: z.string().uuid(),
  dentist_id: z.string().uuid().optional().nullable(),
  treatment_id: z.string().uuid().optional().nullable(),
  reviewer_email: z.string().email(),
  reviewer_display_name: z.string().max(60).optional(),
  rating_overall: z.coerce.number().int().min(1).max(5),
  rating_pain_management: z.coerce.number().int().min(1).max(5).optional().nullable(),
  rating_communication: z.coerce.number().int().min(1).max(5).optional().nullable(),
  rating_cost_transparency: z.coerce.number().int().min(1).max(5).optional().nullable(),
  rating_cleanliness: z.coerce.number().int().min(1).max(5).optional().nullable(),
  rating_anxiety_handling: z.coerce.number().int().min(1).max(5).optional().nullable(),
  rating_treatment_results: z.coerce.number().int().min(1).max(5).optional().nullable(),
  title: z.string().max(120).optional(),
  body: z.string().min(30).max(4000),
  treatment_date: z.string().optional(), // YYYY-MM-DD
  // Optional price report
  price_amount_pounds: z.coerce.number().positive().optional(),
  price_payment_type: z.enum(['nhs', 'private', 'insurance']).optional(),
  nhs_status: z.enum(['yes', 'no', 'unsure']).optional(),
});

export async function submitReview(_prevState: unknown, formData: FormData) {
  const raw = Object.fromEntries(formData.entries());
  const parsed = ReviewSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.flatten() };
  }
  const data = parsed.data;
  const admin = createAdminSupabase();
  const supabase = await createServerSupabase();

  // Insert review (moderation_status defaults to 'pending')
  const { data: review, error } = await admin
    .from('reviews')
    .insert({
      practice_id: data.practice_id,
      dentist_id: data.dentist_id ?? null,
      treatment_id: data.treatment_id ?? null,
      reviewer_email: data.reviewer_email,
      reviewer_display_name: data.reviewer_display_name ?? null,
      rating_overall: data.rating_overall,
      rating_pain_management: data.rating_pain_management ?? null,
      rating_communication: data.rating_communication ?? null,
      rating_cost_transparency: data.rating_cost_transparency ?? null,
      rating_cleanliness: data.rating_cleanliness ?? null,
      rating_anxiety_handling: data.rating_anxiety_handling ?? null,
      rating_treatment_results: data.rating_treatment_results ?? null,
      title: data.title ?? null,
      body: data.body,
      treatment_date: data.treatment_date ?? null,
      nhs_status: data.nhs_status ?? null,
    })
    .select('id')
    .single();

  if (error) return { error: { _form: [error.message] } };

  // Optional: schedule follow-up reminder
  const followupOptedIn = formData.get('followup_opted_in') === 'true';
  if (followupOptedIn) {
    const remindAt = new Date();
    remindAt.setMonth(remindAt.getMonth() + 3);
    await admin
      .from('reviews')
      .update({ followup_opted_in: true, followup_remind_at: remindAt.toISOString() })
      .eq('id', review.id);
  }

  // Optional: insert linked price report
  if (data.price_amount_pounds && data.price_payment_type && data.treatment_id && data.treatment_date) {
    await admin.from('price_reports').insert({
      review_id: review.id,
      practice_id: data.practice_id,
      treatment_id: data.treatment_id,
      amount_pence: Math.round(data.price_amount_pounds * 100),
      payment_type: data.price_payment_type,
      date_of_treatment: data.treatment_date,
    });
  }

  // Notify practice owner of new review (non-blocking)
  void (async () => {
    try {
      const { data: practice } = await admin
        .from('practices')
        .select('name, slug, claimed_by_user_id')
        .eq('id', data.practice_id)
        .single();
      if (!practice?.claimed_by_user_id) return;
      const { data: { user } } = await admin.auth.admin.getUserById(practice.claimed_by_user_id);
      if (!user?.email) return;
      await sendNewReviewNotification({
        to: user.email,
        practiceName: practice.name,
        practiceSlug: practice.slug,
        reviewerName: data.reviewer_display_name ?? null,
        ratingOverall: data.rating_overall,
        reviewTitle: data.title ?? null,
        reviewBody: data.body,
      });
    } catch {}
  })();

  // Trigger magic-link email so reviewer can verify ownership
  await supabase.auth.signInWithOtp({
    email: data.reviewer_email,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback?review=${review.id}`,
    },
  });

  redirect(`/reviews/${review.id}/submitted`);
}
