import { NextRequest, NextResponse } from 'next/server';
import { createAdminSupabase, createServerSupabase } from '@/lib/supabase';
import { getStripe } from '@/lib/stripe';

export async function POST(req: NextRequest) {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });

  const { slug } = await req.json() as { slug: string };
  if (!slug) return NextResponse.json({ error: 'Missing slug' }, { status: 400 });

  const admin = createAdminSupabase();
  const { data: practice } = await admin
    .from('practices')
    .select('id, claimed_by_user_id, stripe_customer_id')
    .eq('slug', slug)
    .single();

  if (!practice) return NextResponse.json({ error: 'Practice not found' }, { status: 404 });
  if (practice.claimed_by_user_id !== user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const customerId = (practice as any).stripe_customer_id;
  if (!customerId) return NextResponse.json({ error: 'No billing account found' }, { status: 400 });

  const stripe = getStripe();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://smileproof.co.uk';

  const portalSession = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${siteUrl}/practices/${slug}/dashboard`,
  });

  return NextResponse.json({ url: portalSession.url });
}
