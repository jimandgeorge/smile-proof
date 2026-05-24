import { NextRequest, NextResponse } from 'next/server';
import { createAdminSupabase } from '@/lib/supabase';
import { getStripe } from '@/lib/stripe';
import type Stripe from 'stripe';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get('stripe-signature');
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!sig || !webhookSecret) {
    return NextResponse.json({ error: 'Missing signature or webhook secret' }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(body, sig, webhookSecret);
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  const admin = createAdminSupabase();

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      const practiceId = session.metadata?.practice_id;
      const plan = session.metadata?.plan;
      if (!practiceId || !plan) break;

      await admin.from('practices').update({
        subscription_status:    'active',
        subscription_plan:      plan,
        stripe_customer_id:     session.customer as string,
        stripe_subscription_id: session.subscription as string,
      }).eq('id', practiceId);
      break;
    }

    case 'customer.subscription.updated': {
      const sub = event.data.object as Stripe.Subscription;
      const practiceId = sub.metadata?.practice_id;
      if (!practiceId) break;

      const status = sub.status === 'active' || sub.status === 'trialing' ? 'active' : 'cancelled';
      await admin.from('practices').update({ subscription_status: status }).eq('id', practiceId);
      break;
    }

    case 'customer.subscription.deleted': {
      const sub = event.data.object as Stripe.Subscription;
      const practiceId = sub.metadata?.practice_id;
      if (!practiceId) break;

      await admin.from('practices').update({
        subscription_status:    'cancelled',
        stripe_subscription_id: null,
      }).eq('id', practiceId);
      break;
    }
  }

  return NextResponse.json({ received: true });
}
