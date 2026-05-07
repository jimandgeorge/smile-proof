'use server';

import { headers } from 'next/headers';
import { createAdminSupabase } from '@/lib/supabase';

async function fingerprint() {
  const h = await headers();
  const ip = h.get('x-forwarded-for')?.split(',')[0].trim() ?? h.get('x-real-ip') ?? 'unknown';
  return ip;
}

export async function toggleVote(reviewId: string) {
  const fp = await fingerprint();
  const admin = createAdminSupabase();

  const { error } = await admin
    .from('review_votes')
    .insert({ review_id: reviewId, voter_fingerprint: fp });

  if (error?.code === '23505') {
    // Already voted — remove it
    await admin
      .from('review_votes')
      .delete()
      .eq('review_id', reviewId)
      .eq('voter_fingerprint', fp);

    await admin.rpc('decrement_helpful', { rid: reviewId });
    return { voted: false };
  }

  await admin.rpc('increment_helpful', { rid: reviewId });
  return { voted: true };
}

export async function submitFlag(reviewId: string, reason: string, details: string) {
  if (!reason) return { error: 'Please select a reason.' };
  const admin = createAdminSupabase();
  const { error } = await admin.from('review_flags').insert({
    review_id: reviewId,
    reason,
    details: details.trim() || null,
  });
  if (error) return { error: error.message };
  return { success: true };
}
