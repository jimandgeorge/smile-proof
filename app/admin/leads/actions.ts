'use server';

import { createAdminSupabase } from '@/lib/supabase';
import { requireAdminSession } from '@/lib/admin';
import { revalidatePath } from 'next/cache';

export async function markEnquiryRead(enquiryId: string) {
  await requireAdminSession();
  const supabase = createAdminSupabase();
  await supabase
    .from('practice_enquiries')
    .update({ read_at: new Date().toISOString() })
    .eq('id', enquiryId);
  revalidatePath('/admin/leads');
}
