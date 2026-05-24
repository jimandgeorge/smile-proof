import { NextRequest, NextResponse } from 'next/server';
import { createAdminSupabase, createServerSupabase } from '@/lib/supabase';
import { getStripe, PLANS, type PlanKey } from '@/lib/stripe';

export async function POST(req: NextRequest) {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });

  const { slug, plan } = await req.json() as { slug: string; plan: PlanKey };
  if (!slug || !plan || !PLANS[plan]) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }

  const admin = createAdminSupabase();
  const { data: practice } = await admin
    .from('practices')
    .select('id, name, claimed_by_user_id, stripe_customer_id, subscription_status')
    .eq('slug', slug)
    .single();

  if (!practice) return NextResponse.json({ error: 'Practice not found' }, { status: 404 });
  if (practice.claimed_by_user_id !== user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  if ((practice as any).subscription_status === 'active') {
    return NextResponse.json({ error: 'Already subscribed' }, { status: 400 });
  }

  const stripe = getStripe();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://smileproof.co.uk';

  let customerId: string = (practice as any).stripe_customer_id ?? '';
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      name: practice.name,
      metadata: { practice_id: practice.id, practice_slug: slug },
    });
    customerId = customer.id;
    await admin.from('practices').update({ stripe_customer_id: customerId }).eq('id', practice.id);
  }

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: 'subscription',
    line_items: [{ price: PLANS[plan].priceId(), quantity: 1 }],
    success_url: `${siteUrl}/practices/${slug}/dashboard?upgraded=1`,
    cancel_url: `${siteUrl}/practices/${slug}/upgrade`,
    metadata: { practice_id: practice.id, practice_slug: slug, plan },
    subscription_data: { metadata: { practice_id: practice.id, practice_slug: slug, plan } },
  });

  return NextResponse.json({ url: session.url });
}
