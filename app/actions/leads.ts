'use server';

import { z } from 'zod';
import { createAdminSupabase } from '@/lib/supabase';

const LeadSchema = z.object({
  email: z.string().email().max(200).trim(),
  treatment_interest: z.string().max(100).trim().optional(),
  postcode: z.string().max(10).trim().optional(),
  source: z.string().max(50).trim().optional(),
});

export async function submitPatientLead(
  formData: FormData
): Promise<{ success?: true; error?: string }> {
  const parsed = LeadSchema.safeParse({
    email: formData.get('email'),
    treatment_interest: formData.get('treatment_interest') || undefined,
    postcode: formData.get('postcode') || undefined,
    source: formData.get('source') || 'homepage',
  });

  if (!parsed.success) return { error: 'Please enter a valid email address.' };

  const admin = createAdminSupabase();
  const { error } = await admin.from('patient_leads').insert(parsed.data);
  if (error) return { error: 'Something went wrong — please try again.' };

  return { success: true };
}
