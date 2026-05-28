import Link from 'next/link';

const FREE_FEATURES = [
  'Practice dashboard access',
  'Google Reviews import',
  'Practice snapshot & snapshot metrics',
  'Claim & verify your practice',
];

const PRO_FEATURES = [
  'Everything in Free',
  'AI intelligence reports',
  'Patient theme analysis',
  'Category score breakdown',
  'Local ranking & benchmarking',
  'Profile views analytics',
  'Priority support',
];

const FAQS = [
  {
    q: 'Is there a free trial?',
    a: 'Yes — claiming your practice and importing Google Reviews is completely free, with no time limit.',
  },
  {
    q: 'Can I cancel at any time?',
    a: "Yes. Cancel from the billing section of your dashboard and you'll keep access until the end of your billing period. No questions asked.",
  },
  {
    q: 'What happens to my data if I cancel?',
    a: 'Your practice profile and imported reviews remain intact. You can reactivate Pro at any time and pick up where you left off.',
  },
  {
    q: 'Do you offer group or multi-location pricing?',
    a: 'Yes — get in touch and we\'ll put together a plan that fits your group.',
  },
];

function Check({ dark = false }: { dark?: boolean }) {
  return (
    <div style={{ width: 18, height: 18, borderRadius: '50%', background: dark ? 'rgba(245,158,11,0.2)' : 'var(--forest-pale)', border: dark ? '1.5px solid rgba(245,158,11,0.4)' : '1.5px solid rgba(28,69,53,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}>
      <svg width="8" height="8" viewBox="0 0 10 10" fill="none">
        <polyline points="2,5 4,7.5 8,2.5" stroke={dark ? '#f59e0b' : 'var(--forest)'} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}

export default function PricingPage() {
  return (
    <main style={{ background: 'var(--cream)' }}>

      {/* ── Hero ── */}
      <section style={{ background: 'linear-gradient(150deg, #122d21 0%, #1c4535 45%, #24594a 100%)', padding: '80px 24px 88px', position: 'relative', overflow: 'hidden' }}>
        <span aria-hidden style={{ position: 'absolute', top: -160, right: -120, width: 480, height: 480, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,0.05) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ maxWidth: 620, margin: '0 auto', textAlign: 'center', position: 'relative' }}>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 11, fontWeight: 800, letterSpacing: '0.13em', textTransform: 'uppercase', color: '#6ee7b7', marginBottom: 16 }}>
            Pricing
          </p>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(34px,5vw,52px)', fontWeight: 800, color: 'white', letterSpacing: '-0.03em', lineHeight: 1.1, marginBottom: 18 }}>
            Simple, transparent pricing.
          </h1>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 'clamp(15px,2vw,18px)', color: 'rgba(255,255,255,0.62)', lineHeight: 1.65, maxWidth: 480, margin: '0 auto' }}>
            Start free. Upgrade when you need the full intelligence suite.
          </p>
        </div>
      </section>

      {/* ── Plans ── */}
      <section style={{ padding: '72px 24px', borderBottom: '1px solid var(--cream-dark)' }}>
        <div style={{ maxWidth: 860, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20, alignItems: 'start' }}>

          {/* Free */}
          <div style={{ background: 'white', border: '1.5px solid var(--cream-dark)', borderRadius: 16, padding: '32px 28px' }}>
            <div style={{ marginBottom: 24 }}>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: 11, fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--forest)', marginBottom: 10 }}>Free</p>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 6 }}>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: 44, fontWeight: 800, color: 'var(--ink)', letterSpacing: '-0.03em' }}>£0</span>
                <span style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--ink-soft)' }}>/month</span>
              </div>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--ink-soft)', lineHeight: 1.55 }}>
                Get started with your practice dashboard at no cost.
              </p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 28 }}>
              {FREE_FEATURES.map(f => (
                <div key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                  <Check />
                  <span style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--ink)', lineHeight: 1.4 }}>{f}</span>
                </div>
              ))}
            </div>
            <Link
              href="/auth/signup"
              style={{ display: 'block', width: '100%', padding: '12px 0', borderRadius: 10, border: '1.5px solid rgba(28,69,53,0.25)', background: 'transparent', color: 'var(--forest)', fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: 700, textDecoration: 'none', textAlign: 'center', boxSizing: 'border-box' }}
            >
              Get started free
            </Link>
          </div>

          {/* Pro */}
          <div style={{ background: 'var(--forest)', border: '1.5px solid var(--forest)', borderRadius: 16, padding: '32px 28px', position: 'relative' }}>
            <div style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', background: '#f59e0b', color: 'white', fontSize: 10, fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', padding: '4px 12px', borderRadius: 20, fontFamily: 'var(--font-body)', whiteSpace: 'nowrap' }}>
              Recommended
            </div>
            <div style={{ marginBottom: 24 }}>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: 11, fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.55)', marginBottom: 10 }}>Pro</p>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 6 }}>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: 44, fontWeight: 800, color: 'white', letterSpacing: '-0.03em' }}>£99</span>
                <span style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'rgba(255,255,255,0.55)' }}>/month</span>
              </div>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'rgba(255,255,255,0.6)', lineHeight: 1.55 }}>
                Full AI intelligence suite for practices serious about growth.
              </p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 28 }}>
              {PRO_FEATURES.map(f => (
                <div key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                  <Check dark />
                  <span style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'rgba(255,255,255,0.85)', lineHeight: 1.4 }}>{f}</span>
                </div>
              ))}
            </div>
            <Link
              href="/auth/signup"
              style={{ display: 'block', width: '100%', padding: '12px 0', borderRadius: 10, background: '#f59e0b', color: 'white', fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: 700, textDecoration: 'none', textAlign: 'center', boxSizing: 'border-box' }}
            >
              Start with Pro
            </Link>
          </div>

        </div>

        <p style={{ textAlign: 'center', fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--ink-soft)', marginTop: 24 }}>
          Cancel any time · No setup fees · Questions?{' '}
          <a href="mailto:hello@smileproof.co.uk" style={{ color: 'var(--forest)', fontWeight: 600, textDecoration: 'none' }}>
            hello@smileproof.co.uk
          </a>
        </p>
      </section>

      {/* ── FAQ ── */}
      <section style={{ padding: '72px 24px', background: 'var(--forest-pale)', borderTop: '1px solid rgba(28,69,53,0.1)' }}>
        <div style={{ maxWidth: 680, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 44 }}>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 11, fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--forest)', marginBottom: 10 }}>FAQ</p>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(22px,3vw,30px)', fontWeight: 800, color: 'var(--ink)', letterSpacing: '-0.025em' }}>
              Common questions
            </h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {FAQS.map(({ q, a }) => (
              <div key={q} style={{ background: 'white', border: '1.5px solid rgba(28,69,53,0.12)', borderRadius: 12, padding: '20px 24px' }}>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: 15, fontWeight: 700, color: 'var(--ink)', marginBottom: 8, lineHeight: 1.4 }}>{q}</p>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--ink-soft)', lineHeight: 1.65, margin: 0 }}>{a}</p>
              </div>
            ))}
          </div>
          <p style={{ textAlign: 'center', fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--ink-soft)', marginTop: 36 }}>
            More questions?{' '}
            <Link href="/contact" style={{ color: 'var(--forest)', fontWeight: 600, textDecoration: 'none' }}>
              Get in touch →
            </Link>
          </p>
        </div>
      </section>

    </main>
  );
}
