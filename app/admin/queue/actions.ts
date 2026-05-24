'use server';

import { after } from 'next/server';
import { createAdminSupabase } from '@/lib/supabase';
import { requireAdminSession } from '@/lib/admin';
import { revalidatePath } from 'next/cache';

export async function moderateReview(reviewId: string, action: 'publish' | 'hide' | 'remove') {
  await requireAdminSession();
  const supabase = createAdminSupabase();
  const statusMap = { publish: 'published', hide: 'hidden', remove: 'removed' } as const;

  const { data: review, error } = await supabase
    .from('reviews')
    .update({
      moderation_status: statusMap[action],
      ...(action === 'publish' ? { published_at: new Date().toISOString() } : {}),
    })
    .eq('id', reviewId)
    .select('practice_id')
    .single();

  if (error) throw new Error(error.message);

  if (action === 'publish' && review?.practice_id) {
    const practiceId = review.practice_id;
    after(async () => {
      const { maybeRefreshPracticeSummary } = await import('@/lib/ai');
      await maybeRefreshPracticeSummary(practiceId);
    });
  }

  revalidatePath('/admin/queue');
}

export async function approvePracticeSubmission(submissionId: string) {
  await requireAdminSession();
  const supabase = createAdminSupabase();

  const { data: sub, error: fetchErr } = await supabase
    .from('practice_submissions')
    .select('*')
    .eq('id', submissionId)
    .single();

  if (fetchErr || !sub) throw new Error('Submission not found');

  // Generate unique slug
  const base = slugify(`${sub.name}-${sub.city}`);
  let slug = base;
  let suffix = 2;
  while (true) {
    const { data: existing } = await supabase
      .from('practices')
      .select('id')
      .eq('slug', slug)
      .maybeSingle();
    if (!existing) break;
    slug = `${base}-${suffix++}`;
  }

  const { data: practice, error: insertErr } = await supabase
    .from('practices')
    .insert({
      slug,
      name: sub.name,
      address_line1: sub.address_line1,
      address_line2: sub.address_line2,
      city: sub.city,
      postcode: sub.postcode,
      practice_type: sub.practice_type,
      phone: sub.phone,
      email: sub.email,
      website: sub.website,
    })
    .select('id')
    .single();

  if (insertErr) throw new Error(insertErr.message);

  await supabase
    .from('practice_submissions')
    .update({
      status: 'approved',
      practice_id: practice.id,
      reviewed_at: new Date().toISOString(),
    })
    .eq('id', submissionId);

  revalidatePath('/admin/queue');
}

export async function rejectPracticeSubmission(submissionId: string) {
  await requireAdminSession();
  const supabase = createAdminSupabase();

  await supabase
    .from('practice_submissions')
    .update({ status: 'rejected', reviewed_at: new Date().toISOString() })
    .eq('id', submissionId);

  revalidatePath('/admin/queue');
}

export async function approveClaim(practiceId: string) {
  await requireAdminSession();
  const supabase = createAdminSupabase();

  const { data: practice } = await supabase
    .from('practices')
    .select('claim_pending_user_id')
    .eq('id', practiceId)
    .single();

  if (!practice?.claim_pending_user_id) throw new Error('No pending claim found.');

  const { error } = await supabase
    .from('practices')
    .update({
      claimed_by_user_id: practice.claim_pending_user_id,
      claimed_at: new Date().toISOString(),
      claim_pending_user_id: null,
      claim_pending_email: null,
      claim_pending_at: null,
    })
    .eq('id', practiceId);

  if (error) throw new Error(error.message);
  revalidatePath('/admin/queue');
}

export async function rejectClaim(practiceId: string) {
  await requireAdminSession();
  const supabase = createAdminSupabase();

  const { error } = await supabase
    .from('practices')
    .update({
      claim_pending_user_id: null,
      claim_pending_email: null,
      claim_pending_at: null,
    })
    .eq('id', practiceId);

  if (error) throw new Error(error.message);
  revalidatePath('/admin/queue');
}

function slugify(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}
