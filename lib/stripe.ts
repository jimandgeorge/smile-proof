import Stripe from 'stripe';

let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!_stripe) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) throw new Error('STRIPE_SECRET_KEY is not set');
    _stripe = new Stripe(key, { apiVersion: '2026-04-22.dahlia' });
  }
  return _stripe;
}

export const PLANS = {
  growth: {
    name: 'Growth',
    priceGbp: 49,
    priceId: () => {
      const id = process.env.STRIPE_GROWTH_MONTHLY_PRICE_ID;
      if (!id) throw new Error('STRIPE_GROWTH_MONTHLY_PRICE_ID is not set');
      return id;
    },
    features: [
      'Practice insights & analytics',
      'AI reply generation',
      'Review invite tool',
      'Score trend tracking',
      'Email alerts',
    ],
  },
  pro: {
    name: 'Pro',
    priceGbp: 99,
    priceId: () => {
      const id = process.env.STRIPE_PRO_MONTHLY_PRICE_ID;
      if (!id) throw new Error('STRIPE_PRO_MONTHLY_PRICE_ID is not set');
      return id;
    },
    features: [
      'Everything in Growth',
      'Priority support',
      'Advanced sentiment analysis',
      'Multi-location reporting',
      'Custom review widgets',
    ],
  },
} as const;

export type PlanKey = keyof typeof PLANS;
