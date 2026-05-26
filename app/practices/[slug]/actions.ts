'use server';

import { createAdminSupabase } from '@/lib/supabase';
import { sendNewEnquiryNotification } from '@/lib/email';
import { z } from 'zod';

const EnquirySchema = z.object({
  practice_id: z.string().uuid(),
  name: z.string().min(1).max(100).trim(),
  email: z.string().email().max(200).trim(),
  message: z.string().max(1000).trim().optional(),
  treatment_interest: z.string().max(100).trim().optional(),
});

export async function submitEnquiry(formData: FormData): Promise<{ success?: true; error?: string }> {
  const raw = {
    practice_id: formData.get('practice_id'),
    name: formData.get('name'),
    email: formData.get('email'),
    message: formData.get('message') || undefined,
    treatment_interest: formData.get('treatment_interest') || undefined,
  };

  const parsed = EnquirySchema.safeParse(raw);
  if (!parsed.success) return { error: 'Please fill in all required fields correctly.' };

  const admin = createAdminSupabase();
  const { error } = await admin.from('practice_enquiries').insert(parsed.data);
  if (error) return { error: 'Could not send your enquiry. Please try again.' };

  // Notify practice owner (non-blocking)
  void (async () => {
    try {
      const { data: practice } = await admin
        .from('practices')
        .select('name, slug, claimed_by_user_id')
        .eq('id', parsed.data.practice_id)
        .single();
      if (!practice?.claimed_by_user_id) return;
      const { data: { user } } = await admin.auth.admin.getUserById(practice.claimed_by_user_id);
      if (!user?.email) return;
      await sendNewEnquiryNotification({
        to: user.email,
        practiceName: practice.name,
        practiceSlug: practice.slug,
        patientName: parsed.data.name,
        patientEmail: parsed.data.email,
        message: parsed.data.message,
        treatmentInterest: parsed.data.treatment_interest,
      });
    } catch {}
  })();

  return { success: true };
}
