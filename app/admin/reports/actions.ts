'use server';

import { createAdminSupabase } from '@/lib/supabase';
import { requireAdminSession } from '@/lib/admin';
import { revalidatePath } from 'next/cache';

export async function resolveFlag(flagId: string) {
  await requireAdminSession();
  const supabase = createAdminSupabase();
  await supabase.from('review_flags').update({ status: 'resolved' }).eq('id', flagId);
  revalidatePath('/admin/reports');
}

export async function dismissFlag(flagId: string) {
  await requireAdminSession();
  const supabase = createAdminSupabase();
  await supabase.from('review_flags').update({ status: 'dismissed' }).eq('id', flagId);
  revalidatePath('/admin/reports');
}

export async function resolveAndHide(flagId: string, reviewId: string) {
  await requireAdminSession();
  const supabase = createAdminSupabase();
  await Promise.all([
    supabase.from('review_flags').update({ status: 'resolved' }).eq('id', flagId),
    supabase.from('reviews').update({ moderation_status: 'hidden' }).eq('id', reviewId),
  ]);
  revalidatePath('/admin/reports');
}

export async function resolveAndRemove(flagId: string, reviewId: string) {
  await requireAdminSession();
  const supabase = createAdminSupabase();
  await Promise.all([
    supabase.from('review_flags').update({ status: 'resolved' }).eq('id', flagId),
    supabase.from('reviews').update({ moderation_status: 'removed' }).eq('id', reviewId),
  ]);
  revalidatePath('/admin/reports');
}
