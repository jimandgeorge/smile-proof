import { NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase';

export async function GET() {
  const supabase = await createServerSupabase();
  await supabase.auth.signOut();
  return NextResponse.redirect(new URL('/auth/login', process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'));
}
