import { NextRequest, NextResponse } from 'next/server';
import { createAdminSupabase, createServerSupabase } from '@/lib/supabase';

function makeSlug(name: string): string {
  const base = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48);
  const suffix = Math.random().toString(36).slice(2, 7);
  return `${base}-${suffix}`;
}

export async function POST(request: NextRequest) {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const admin = createAdminSupabase();

  // Prevent creating a second practice
  const { data: existing } = await admin
    .from('practices')
    .select('slug')
    .eq('claimed_by_user_id', user.id)
    .limit(1)
    .maybeSingle();

  if (existing?.slug) {
    return NextResponse.json({ slug: existing.slug });
  }

  const body = await request.json();
  const { name, city, postcode, practice_type } = body;

  if (!name?.trim() || !city?.trim()) {
    return NextResponse.json({ error: 'Name and city are required' }, { status: 400 });
  }

  const slug = makeSlug(name.trim());

  const { data: practice, error } = await admin
    .from('practices')
    .insert({
      slug,
      name: name.trim(),
      city: city.trim(),
      postcode: postcode?.trim() || null,
      practice_type: practice_type || 'mixed',
      claimed_by_user_id: user.id,
      subscription_status: 'free',
    })
    .select('slug')
    .single();

  if (error) {
    console.error('Practice create error:', error);
    return NextResponse.json({ error: 'Failed to create practice' }, { status: 500 });
  }

  return NextResponse.json({ slug: practice.slug });
}
