'use server';

import { createAdminSupabase } from '@/lib/supabase';

export async function submitFollowup({
  reviewId,
  token,
  body,
  rating,
}: {
  reviewId: string;
  token: string;
  body: string;
  rating: number | null;
}) {
  const admin = createAdminSupabase();

  const { data: review } = await admin
    .from('reviews')
    .select('id, followup_token, followup_submitted_at')
    .eq('id', reviewId)
    .single();

  if (!review || review.followup_token !== token) return { error: 'Invalid or expired link.' };
  if (review.followup_submitted_at) return { error: 'Follow-up already submitted.' };
  if (!body || body.trim().length < 20) return { error: 'Please write at least 20 characters.' };

  const { error } = await admin
    .from('reviews')
    .update({
      followup_body: body.trim(),
      followup_rating: rating ?? null,
      followup_submitted_at: new Date().toISOString(),
    })
    .eq('id', reviewId);

  if (error) return { error: 'Something went wrong — please try again.' };
  return { success: true };
}
