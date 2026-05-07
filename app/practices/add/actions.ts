'use server';

import { createAdminSupabase } from '@/lib/supabase';
import { redirect } from 'next/navigation';
import { z } from 'zod';

const Schema = z.object({
  name: z.string().min(2, 'Practice name is required'),
  address_line1: z.string().min(2, 'Address is required'),
  address_line2: z.string().optional(),
  city: z.string().min(2, 'City is required'),
  postcode: z.string().min(5, 'Postcode is required'),
  country: z.enum(['england', 'scotland', 'wales', 'northern_ireland']),
  practice_type: z.enum(['nhs', 'private', 'mixed']),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  website: z.string().url().optional().or(z.literal('')),
  submitter_email: z.string().email().optional().or(z.literal('')),
  notes: z.string().optional(),
});

export async function submitPractice(formData: FormData) {
  const raw = Object.fromEntries(formData.entries());
  const parsed = Schema.safeParse(raw);

  if (!parsed.success) {
    redirect('/practices/add?error=validation');
  }

  const d = parsed.data;
  const supabase = createAdminSupabase();

  const { error } = await supabase.from('practice_submissions').insert({
    name: d.name,
    address_line1: d.address_line1,
    address_line2: d.address_line2 || null,
    city: d.city,
    postcode: d.postcode.toUpperCase(),
    country: d.country,
    practice_type: d.practice_type,
    phone: d.phone || null,
    email: d.email || null,
    website: d.website || null,
    submitter_email: d.submitter_email || null,
    notes: d.notes || null,
  });

  if (error) redirect('/practices/add?error=server');

  redirect('/practices/add?submitted=1');
}
