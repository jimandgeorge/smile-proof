'use client';

import { useState } from 'react';
import Link from 'next/link';

const tiers = [
  {
    name: 'Free',
    monthly: 0,
    annual: 0,
    annualTotal: 0,
    cta: 'Claim your listing',
    ctaHref: '/search',
    highlight: false,
    features: [
      'Claim your listing',
      'Read and respond to all reviews',
      'Dashboard: rating, scores, 30-day views',
      'Six-dimension patient scoring',
      'Search visibility & local ranking',
      'Basic 2–3 sentence AI summary',
    ],
    missing: [
      'Patient invite tool',
      'Website badge',
      'AI sentiment themes',
      'Extended analytics',
      'Homepage featured placement',
    ],
  },
  {
    name: 'Pro',
    monthly: 99,
    annual: 83,
    annualTotal: 990,
    cta: 'Start Pro',
    ctaHref: '/search',
    highlight: true,
    badge: 'Most popular',
    features: [
      'Everything in Free',
      'Patient invite tool — send branded email invites',
      'Website badge embed — live rating on your site',
      'AI patient sentiment themes',
      'Extended analytics — 6 months history',
      'Email notifications for new reviews',
      '2–3 sentence AI summary, auto-updated',
    ],
    missing: [
      'Homepage featured placement',
      'In-depth AI summary',
    ],
  },
  {
    name: 'Featured',
    monthly: 149,
    annual: 124,
    annualTotal: 1490,
    cta: 'Get Featured',
    ctaHref: '/search',
    highlight: false,
    badge: 'Best visibility',
    features: [
      'Everything in Pro',
      'Homepage featured placement in relevant sections',
      'In-depth AI summary — 4–5 sentences, richer insight',
      'Priority AI regeneration — refreshes within 24 hours',
      '"Featured" badge on your public listing',
      'Priority support',
    ],
    missing: [],
  },
];

export default function PricingSection() {
  const [annual, setAnnual] = useState(false);

  return (
    <section style={{ maxWidth: 1040, margin: '0 auto', padding: '80px 24px' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 48 }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(24px,3vw,34px)', fontWeight: 700, color: 'var(--ink)', letterSpacing: '-0.02em', marginBottom: 12 }}>
          Simple, honest pricing
        </h2>
        <p style={{ fontSize: 15, color: 'var(--ink-soft)', lineHeight: 1.6, marginBottom: 24 }}>
          Free forever for the basics. Pay only when you want to grow.
        </p>

        {/* Toggle */}
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 12, background: 'var(--cream)', border: '1.5px solid var(--cream-dark)', borderRadius: 50, padding: '6px 6px 6px 16px' }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: annual ? 'var(--ink-soft)' : 'var(--ink)' }}>Monthly</span>
          <button
            onClick={() => setAnnual(a => !a)}
            style={{
              width: 44, height: 24, borderRadius: 12,
              background: annual ? 'var(--forest)' : '#d1cbc3',
              border: 'none', cursor: 'pointer', position: 'relative', transition: 'background 0.2s',
              flexShrink: 0,
            }}
            aria-label="Toggle annual billing"
          >
            <span style={{
              position: 'absolute', top: 3, left: annual ? 23 : 3,
              width: 18, height: 18, borderRadius: '50%', background: 'white',
              transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
            }} />
          </button>
          <span style={{ fontSize: 13, fontWeight: 600, color: annual ? 'var(--ink)' : 'var(--ink-soft)' }}>Annual</span>
          {annual && (
            <span style={{ fontSize: 11, fontWeight: 700, background: 'var(--forest)', color: 'white', borderRadius: 20, padding: '2px 9px', marginRight: 6 }}>
              2 months free
            </span>
          )}
        </div>
      </div>

      {/* Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16, alignItems: 'stretch' }}>
        {tiers.map((tier) => {
          const price = annual ? tier.annual : tier.monthly;
          return (
            <div
              key={tier.name}
              style={{
                background: tier.highlight ? 'var(--forest)' : 'white',
                border: tier.highlight ? 'none' : '1.5px solid var(--cream-dark)',
                borderRadius: 16,
                padding: '28px 24px',
                boxShadow: tier.highlight ? '0 8px 32px rgba(28,69,53,0.25)' : 'var(--shadow-card)',
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              {tier.badge && (
                <span style={{
                  position: 'absolute', top: -11, left: '50%', transform: 'translateX(-50%)',
                  fontSize: 11, fontWeight: 700, padding: '3px 12px', borderRadius: 20,
                  background: tier.highlight ? 'var(--cream)' : 'var(--forest)',
                  color: tier.highlight ? 'var(--forest)' : 'var(--cream)',
                  whiteSpace: 'nowrap',
                }}>
                  {tier.badge}
                </span>
              )}

              {/* Name + price */}
              <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: tier.highlight ? 'rgba(255,255,255,0.6)' : 'var(--ink-soft)', marginBottom: 8 }}>
                {tier.name}
              </p>

              {price === 0 ? (
                <div style={{ marginBottom: 6 }}>
                  <span style={{ fontFamily: 'var(--font-display)', fontSize: 40, fontWeight: 700, color: tier.highlight ? 'var(--cream)' : 'var(--ink)', lineHeight: 1 }}>Free</span>
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 4 }}>
                  <span style={{ fontFamily: 'var(--font-display)', fontSize: 40, fontWeight: 700, color: tier.highlight ? 'var(--cream)' : 'var(--ink)', lineHeight: 1 }}>
                    £{price}
                  </span>
                  <span style={{ fontSize: 13, color: tier.highlight ? 'rgba(255,255,255,0.6)' : 'var(--ink-soft)' }}>/mo</span>
                </div>
              )}

              {annual && price > 0 && (
                <p style={{ fontSize: 12, color: tier.highlight ? 'rgba(255,255,255,0.55)' : 'var(--ink-soft)', marginBottom: 20 }}>
                  £{tier.annualTotal}/yr — save £{(tier.monthly * 12) - tier.annualTotal}
                </p>
              )}
              {(!annual || price === 0) && <div style={{ marginBottom: 20 }} />}

              {/* CTA */}
              <Link
                href={tier.ctaHref}
                style={{
                  display: 'block', textAlign: 'center', padding: '11px 0',
                  borderRadius: 8, fontSize: 14, fontWeight: 600, textDecoration: 'none',
                  background: tier.highlight ? 'var(--cream)' : 'var(--forest)',
                  color: tier.highlight ? 'var(--forest)' : 'var(--cream)',
                  marginBottom: 24,
                }}
              >
                {tier.cta} →
              </Link>

              {/* Features */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>
                {tier.features.map(f => (
                  <div key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                    <span style={{ color: tier.highlight ? 'rgba(255,255,255,0.7)' : 'var(--forest)', fontWeight: 700, flexShrink: 0, marginTop: 1, fontSize: 13 }}>✓</span>
                    <span style={{ fontSize: 13, color: tier.highlight ? 'rgba(255,255,255,0.85)' : 'var(--ink-soft)', lineHeight: 1.5 }}>{f}</span>
                  </div>
                ))}
                {tier.missing.map(f => (
                  <div key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                    <span style={{ color: tier.highlight ? 'rgba(255,255,255,0.25)' : '#ccc', flexShrink: 0, marginTop: 1, fontSize: 13 }}>✕</span>
                    <span style={{ fontSize: 13, color: tier.highlight ? 'rgba(255,255,255,0.3)' : '#bbb', lineHeight: 1.5 }}>{f}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Footnote */}
      <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--ink-faint)', marginTop: 28 }}>
        No credit card required to claim your free listing. Pro and Featured billed monthly or annually. Cancel any time.
      </p>
    </section>
  );
}
