import Link from 'next/link';

const tiers = [
  {
    name: 'Practice',
    description: 'Practice intelligence for independent dental practices.',
    cta: 'Start with a Demo',
    href: '/contact',
    features: [
      'AI sentiment analysis',
      'Google review intelligence',
      'Patient trust scoring',
      'Operational recommendations',
      'Trend monitoring',
      'Reputation reporting',
    ],
    accent: false,
  },
  {
    name: 'Enterprise',
    description: 'Multi-location intelligence for dental groups and DSOs.',
    cta: 'Contact Sales',
    href: '/contact',
    features: [
      'Multi-location oversight',
      'Cross-location benchmarking',
      'Executive reporting',
      'Org-wide sentiment tracking',
      'Onboarding support',
      'Custom integrations',
    ],
    accent: true,
  },
];

export default function PricingPreviewSection() {
  return (
    <section style={{ background: '#0a0a14', padding: 'clamp(72px, 10vw, 110px) 24px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', maxWidth: 540, margin: '0 auto 52px' }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(237,238,245,0.3)', fontFamily: 'var(--font-body)', marginBottom: 14 }}>Pricing</div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(28px, 3.2vw, 40px)', fontWeight: 800, color: '#edeef5', lineHeight: 1.1, letterSpacing: '-0.03em', margin: '0 0 14px' }}>
            Intelligence for every stage of growth.
          </h2>
          <p style={{ fontSize: 15, color: 'rgba(237,238,245,0.48)', lineHeight: 1.65, fontFamily: 'var(--font-body)', margin: 0 }}>
            From independent practices to dental groups, SmileProof scales with your organisation.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2" style={{ maxWidth: 820, margin: '0 auto' }}>
          {tiers.map(({ name, description, cta, href, features, accent }) => (
            <div key={name} style={{
              background: accent ? 'rgba(52,211,153,0.04)' : '#111119',
              border: accent ? '1px solid rgba(52,211,153,0.2)' : '1px solid rgba(255,255,255,0.08)',
              borderRadius: 14, padding: '28px 26px', position: 'relative', overflow: 'hidden',
            }}>
              {accent && (
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg, #34d399, #059669)' }} />
              )}
              <div style={{ marginBottom: 6 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: accent ? '#34d399' : '#edeef5', fontFamily: 'var(--font-body)', letterSpacing: '-0.01em' }}>{name}</span>
              </div>
              <p style={{ fontSize: 13.5, color: 'rgba(237,238,245,0.45)', lineHeight: 1.55, fontFamily: 'var(--font-body)', margin: '0 0 22px' }}>{description}</p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 9, marginBottom: 26 }}>
                {features.map(f => (
                  <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                    <div style={{
                      width: 15, height: 15, borderRadius: '50%',
                      background: accent ? 'rgba(52,211,153,0.12)' : 'rgba(255,255,255,0.06)',
                      border: accent ? '1px solid rgba(52,211,153,0.28)' : '1px solid rgba(255,255,255,0.1)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                    }}>
                      <svg width="7" height="7" viewBox="0 0 24 24" fill="none" stroke={accent ? '#34d399' : 'rgba(237,238,245,0.4)'} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5" /></svg>
                    </div>
                    <span style={{ fontSize: 13, color: 'rgba(237,238,245,0.55)', fontFamily: 'var(--font-body)' }}>{f}</span>
                  </div>
                ))}
              </div>

              <Link href={href} style={{
                display: 'inline-flex', alignItems: 'center', gap: 7,
                padding: '10px 18px', borderRadius: 8,
                background: accent ? '#34d399' : 'rgba(255,255,255,0.06)',
                border: accent ? 'none' : '1px solid rgba(255,255,255,0.1)',
                color: accent ? '#07070e' : 'rgba(237,238,245,0.7)',
                fontSize: 13.5, fontWeight: 700, fontFamily: 'var(--font-body)',
                textDecoration: 'none', letterSpacing: '-0.01em',
              }}>
                {cta}
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
