'use server';

import { createAdminSupabase } from '@/lib/supabase';
import { requireAdminSession } from '@/lib/admin';
import { revalidatePath } from 'next/cache';

export async function toggleFeatured(practiceId: string, current: boolean) {
  await requireAdminSession();
  const supabase = createAdminSupabase();
  await supabase.from('practices').update({ is_featured: !current }).eq('id', practiceId);
  revalidatePath('/admin/practices');
}

export async function toggleVisibility(practiceId: string, hide: boolean) {
  await requireAdminSession();
  const supabase = createAdminSupabase();
  await supabase.from('practices').update({ hidden: hide }).eq('id', practiceId);
  revalidatePath('/admin/practices');
}
