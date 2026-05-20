'use client';

import { useState } from 'react';
import Link from 'next/link';

type Plan = {
  id: string;
  name: string;
  role: string;
  tagline: string;
  monthly?: number;
  annual?: number;
  annualTotal?: number;
  priceLabel?: string;
  priceNote: string;
  cta: string;
  ctaHref: string;
  badge?: string;
  tone: 'light' | 'soft' | 'dark' | 'group';
  features: string[];
  upgradeHint?: string;
};

const PLANS: Plan[] = [
  {
    id: 'free',
    name: 'Free',
    role: 'Presence',
    tagline: 'Establish your patient presence online.',
    monthly: 0,
    annual: 0,
    annualTotal: 0,
    priceNote: 'Free forever',
    cta: 'Claim your profile',
    ctaHref: '/search',
    tone: 'light',
    features: [
      'Claimed practice profile',
      'Respond to patient reviews',
      'Basic dashboard access',
      'Basic profile visibility',
      'Six-dimension patient scoring',
    ],
    upgradeHint: 'Add review collection tools when you are ready to build momentum.',
  },
  {
    id: 'growth',
    name: 'Growth',
    role: 'Reputation building',
    tagline: 'Build trust and strengthen your online reputation.',
    monthly: 49,
    annual: 39,
    annualTotal: 468,
    priceNote: 'For clinics collecting reviews consistently',
    cta: 'Start Growth',
    ctaHref: '/search',
    tone: 'soft',
    features: [
      'Everything in Free',
      'Patient invite tools',
      'QR review media pack',
      'SMS/email review templates',
      'Website trust badge',
      'Basic AI profile summary',
      'Basic analytics',
      'Local search visibility',
    ],
    upgradeHint: 'Best next step once your team wants a reliable review workflow.',
  },
  {
    id: 'pro',
    name: 'Pro',
    role: 'Patient intelligence + lead generation',
    tagline: 'Turn patient trust into visibility, insights, and growth.',
    monthly: 99,
    annual: 83,
    annualTotal: 990,
    priceNote: 'For practices turning reputation into new enquiries',
    cta: 'Start Pro',
    ctaHref: '/search',
    badge: 'Recommended',
    tone: 'dark',
    features: [
      'Everything in Growth',
      'AI reputation intelligence',
      'AI opportunities & patient trends',
      'Advanced analytics',
      'Enhanced treatment search placement',
      'Extended AI summaries',
      'Email alerts',
      'Consultation enquiry tools',
      'Lead generation features',
      'Treatment intent insights',
    ],
    upgradeHint: 'Built for clinics that want patient insight and measurable enquiry growth.',
  },
  {
    id: 'multi',
    name: 'Multi-location',
    role: 'Operational visibility',
    tagline: 'For dental groups and multi-location practices.',
    priceLabel: 'Custom',
    priceNote: 'Operational intelligence across every location',
    cta: 'Talk to us',
    ctaHref: 'mailto:hello@smileproof.co.uk',
    tone: 'group',
    features: [
      'Everything in Pro',
      'Group dashboard',
      'Cross-practice analytics',
      'Centralised reporting',
      'Group-level AI sentiment',
      'Bulk invite tools',
      'Dedicated onboarding/support',
    ],
    upgradeHint: 'See performance, patient sentiment, and review activity across the group.',
  },
];

function CheckIcon({ color }: { color: string }) {
  return (
    <span style={{ color, fontWeight: 800, flexShrink: 0, marginTop: 1, fontSize: 13 }}>
      {'\u2713'}
    </span>
  );
}

function PlanCard({ plan, annual }: { plan: Plan; annual: boolean }) {
  const isDark = plan.tone === 'dark' || plan.tone === 'group';
  const price = plan.priceLabel ?? (plan.monthly === 0 ? 'Free' : `£${annual ? plan.annual : plan.monthly}`);
  const showMonthlySuffix = !plan.priceLabel && plan.monthly !== 0;
  const annualSaving = plan.monthly && plan.annualTotal ? (plan.monthly * 12) - plan.annualTotal : 0;

  const surface =
    plan.tone === 'dark'
      ? {
          background: 'linear-gradient(160deg, #173a2c 0%, #1c4535 48%, #2c624d 100%)',
          border: '1.5px solid rgba(110,231,183,0.32)',
          shadow: '0 16px 44px rgba(28,69,53,0.28)',
          transform: 'translateY(-10px)',
        }
      : plan.tone === 'group'
        ? {
            background: 'linear-gradient(160deg, #101815 0%, #1b2f25 100%)',
            border: '1.5px solid rgba(201,150,58,0.35)',
            shadow: '0 12px 36px rgba(0,0,0,0.22)',
            transform: 'translateY(0)',
          }
        : plan.tone === 'soft'
          ? {
              background: 'var(--forest-pale)',
              border: '1.5px solid rgba(28,69,53,0.2)',
              shadow: 'var(--shadow-card)',
              transform: 'translateY(0)',
            }
          : {
              background: 'white',
              border: '1.5px solid var(--cream-dark)',
              shadow: 'var(--shadow-card)',
              transform: 'translateY(0)',
            };

  return (
    <div
      style={{
        background: surface.background,
        border: surface.border,
        borderRadius: 14,
        padding: plan.tone === 'dark' ? '30px 24px' : '26px 22px',
        boxShadow: surface.shadow,
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        transform: surface.transform,
        minHeight: plan.tone === 'dark' ? 590 : 560,
      }}
    >
      {plan.badge && (
        <span
          style={{
            position: 'absolute',
            top: -12,
            left: '50%',
            transform: 'translateX(-50%)',
            fontSize: 11,
            fontWeight: 800,
            padding: '4px 13px',
            borderRadius: 999,
            background: 'var(--cream)',
            color: 'var(--forest)',
            boxShadow: '0 4px 14px rgba(0,0,0,0.12)',
            whiteSpace: 'nowrap',
          }}
        >
          {plan.badge}
        </span>
      )}

      <p style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.09em', textTransform: 'uppercase', color: isDark ? 'rgba(255,255,255,0.55)' : 'var(--forest)', margin: '0 0 8px' }}>
        {plan.role}
      </p>
      <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 800, color: isDark ? 'white' : 'var(--ink)', letterSpacing: '-0.02em', margin: '0 0 8px' }}>
        {plan.name}
      </h3>
      <p style={{ fontSize: 13, color: isDark ? 'rgba(255,255,255,0.68)' : 'var(--ink-soft)', lineHeight: 1.45, minHeight: 38, margin: '0 0 18px' }}>
        {plan.tagline}
      </p>

      <div style={{ display: 'flex', alignItems: 'baseline', gap: 5, marginBottom: 5 }}>
        <span style={{ fontFamily: 'var(--font-display)', fontSize: plan.priceLabel ? 34 : 40, fontWeight: 800, color: isDark ? 'var(--cream)' : 'var(--ink)', lineHeight: 1 }}>
          {price}
        </span>
        {showMonthlySuffix && (
          <span style={{ fontSize: 13, color: isDark ? 'rgba(255,255,255,0.58)' : 'var(--ink-soft)' }}>/mo</span>
        )}
      </div>

      <p style={{ fontSize: 12, color: isDark ? 'rgba(255,255,255,0.48)' : 'var(--ink-faint)', minHeight: 34, margin: '0 0 18px', lineHeight: 1.45 }}>
        {annual && annualSaving > 0 ? `Billed annually - save £${annualSaving}` : plan.priceNote}
      </p>

      {plan.upgradeHint && (
        <div
          style={{
            borderRadius: 10,
            padding: '10px 12px',
            marginBottom: 18,
            background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(28,69,53,0.06)',
            border: isDark ? '1px solid rgba(255,255,255,0.12)' : '1px solid rgba(28,69,53,0.12)',
          }}
        >
          <p style={{ fontSize: 12, color: isDark ? 'rgba(255,255,255,0.72)' : 'var(--ink-mid)', lineHeight: 1.45, margin: 0 }}>
            {plan.upgradeHint}
          </p>
        </div>
      )}

      {plan.ctaHref.startsWith('mailto:') ? (
        <a
          href={plan.ctaHref}
          style={{
            display: 'block',
            textAlign: 'center',
            padding: '11px 0',
            borderRadius: 8,
            fontSize: 14,
            fontWeight: 700,
            textDecoration: 'none',
            background: isDark ? 'rgba(255,255,255,0.1)' : 'var(--forest)',
            color: isDark ? 'rgba(255,255,255,0.92)' : 'white',
            border: isDark ? '1.5px solid rgba(255,255,255,0.22)' : 'none',
            marginBottom: 22,
          }}
        >
          {plan.cta} {'\u2192'}
        </a>
      ) : (
        <Link
          href={plan.ctaHref}
          style={{
            display: 'block',
            textAlign: 'center',
            padding: '11px 0',
            borderRadius: 8,
            fontSize: 14,
            fontWeight: 700,
            textDecoration: 'none',
            background: plan.tone === 'dark' ? 'var(--cream)' : plan.tone === 'light' ? 'transparent' : 'var(--forest)',
            color: plan.tone === 'dark' ? 'var(--forest)' : plan.tone === 'light' ? 'var(--forest)' : 'white',
            border: plan.tone === 'light' ? '1.5px solid var(--forest)' : 'none',
            marginBottom: 22,
          }}
        >
          {plan.cta} {'\u2192'}
        </Link>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 9, flex: 1 }}>
        {plan.features.map((feature) => (
          <div key={feature} style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
            <CheckIcon color={plan.tone === 'group' ? 'var(--gold)' : isDark ? 'rgba(255,255,255,0.78)' : 'var(--forest)'} />
            <span style={{ fontSize: 13, color: isDark ? 'rgba(255,255,255,0.84)' : 'var(--ink-soft)', lineHeight: 1.45 }}>
              {feature}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function PricingSection() {
  const [annual, setAnnual] = useState(false);

  return (
    <section style={{ maxWidth: 1220, margin: '0 auto', padding: '84px 24px 88px' }}>
      <div style={{ textAlign: 'center', marginBottom: 52 }}>
        <p style={{ fontSize: 12, fontWeight: 800, letterSpacing: '0.11em', textTransform: 'uppercase', color: 'var(--forest)', marginBottom: 10 }}>
          Pricing that grows with your reputation
        </p>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(26px,3vw,38px)', fontWeight: 800, color: 'var(--ink)', letterSpacing: '-0.025em', marginBottom: 12 }}>
          From patient presence to patient acquisition
        </h2>
        <p style={{ fontSize: 15, color: 'var(--ink-soft)', lineHeight: 1.65, margin: '0 auto 24px', maxWidth: 650 }}>
          Claim your profile for free, then add the tools that help patients trust you, choose you, and enquire with confidence.
        </p>

        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 12, background: 'white', border: '1.5px solid var(--cream-dark)', borderRadius: 50, padding: '6px 6px 6px 16px', boxShadow: '0 2px 12px rgba(28,69,53,0.06)' }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: annual ? 'var(--ink-soft)' : 'var(--ink)' }}>Monthly</span>
          <button
            onClick={() => setAnnual(a => !a)}
            style={{
              width: 44,
              height: 24,
              borderRadius: 12,
              background: annual ? 'var(--forest)' : '#d1cbc3',
              border: 'none',
              cursor: 'pointer',
              position: 'relative',
              transition: 'background 0.2s',
              flexShrink: 0,
            }}
            aria-label="Toggle annual billing"
          >
            <span style={{
              position: 'absolute',
              top: 3,
              left: annual ? 23 : 3,
              width: 18,
              height: 18,
              borderRadius: '50%',
              background: 'white',
              transition: 'left 0.2s',
              boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
            }} />
          </button>
          <span style={{ fontSize: 13, fontWeight: 700, color: annual ? 'var(--ink)' : 'var(--ink-soft)' }}>Annual</span>
          {annual && (
            <span style={{ fontSize: 11, fontWeight: 800, background: 'var(--forest)', color: 'white', borderRadius: 20, padding: '2px 9px', marginRight: 6 }}>
              2 months free
            </span>
          )}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 16, alignItems: 'stretch' }}>
        {PLANS.map((plan) => (
          <PlanCard key={plan.id} plan={plan} annual={annual} />
        ))}
      </div>

      <div style={{ marginTop: 32, display: 'flex', justifyContent: 'center' }}>
        <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--ink-soft)', lineHeight: 1.55, maxWidth: 720 }}>
          No credit card required to claim your Free profile. Growth keeps review building accessible; Pro adds intelligence, treatment visibility, and enquiry tools when you are ready to grow.
        </p>
      </div>
    </section>
  );
}
