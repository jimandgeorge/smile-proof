import { NextRequest, NextResponse } from 'next/server';
import { createAdminSupabase, createServerSupabase } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });

  const formData = await req.formData();
  const file = formData.get('file') as File | null;
  const practiceId = formData.get('practiceId') as string | null;
  const practiceSlug = formData.get('practiceSlug') as string | null;

  if (!file || !practiceId || !practiceSlug) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  }
  if (file.size > 2 * 1024 * 1024) {
    return NextResponse.json({ error: 'Image must be under 2 MB' }, { status: 400 });
  }
  if (!file.type.startsWith('image/')) {
    return NextResponse.json({ error: 'Please select an image file' }, { status: 400 });
  }

  const admin = createAdminSupabase();

  const { data: practice } = await admin
    .from('practices')
    .select('claimed_by_user_id')
    .eq('id', practiceId)
    .single();

  if (!practice || practice.claimed_by_user_id !== user.id) {
    return NextResponse.json({ error: 'You do not own this practice' }, { status: 403 });
  }

  const ext = file.name.split('.').pop() ?? 'png';
  const path = `${practiceId}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  const { error: uploadError } = await admin.storage
    .from('practice-logos')
    .upload(path, buffer, { upsert: true, contentType: file.type });

  if (uploadError) return NextResponse.json({ error: uploadError.message }, { status: 500 });

  const { data: { publicUrl } } = admin.storage.from('practice-logos').getPublicUrl(path);

  const { error: updateError } = await admin
    .from('practices')
    .update({ logo_url: publicUrl })
    .eq('id', practiceId);

  if (updateError) return NextResponse.json({ error: updateError.message }, { status: 500 });

  return NextResponse.json({ url: publicUrl });
}
