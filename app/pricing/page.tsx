import Link from 'next/link';

const C = {
  bg:      '#07070e',
  surface: '#0d0d12',
  card:    '#13131a',
  border:  'rgba(255,255,255,0.07)',
  border2: 'rgba(255,255,255,0.12)',
  text:    '#edeef5',
  mid:     'rgba(237,238,245,0.72)',
  soft:    'rgba(237,238,245,0.48)',
  faint:   'rgba(237,238,245,0.22)',
  xfaint:  'rgba(237,238,245,0.1)',
  accent:  '#34d399',
  accentPale: 'rgba(52,211,153,0.08)',
  accentBorder: 'rgba(52,211,153,0.18)',
  gold:    '#f59e0b',
};

type FeatureValue = true | false | string;

type FeatureRow = {
  label: string;
  practice: FeatureValue;
  enterprise: FeatureValue;
};

type FeatureSection = {
  heading: string;
  rows: FeatureRow[];
};

const FEATURES: FeatureSection[] = [
  {
    heading: 'Google Intelligence',
    rows: [
      { label: 'Google Reviews import',      practice: true,       enterprise: true },
      { label: 'Automated review sync',       practice: true,       enterprise: true },
      { label: 'Review volume tracking',      practice: true,       enterprise: true },
      { label: 'Multi-location import',       practice: false,      enterprise: true },
    ],
  },
  {
    heading: 'AI & Insights',
    rows: [
      { label: 'AI intelligence reports',     practice: true,       enterprise: true },
      { label: 'Patient experience scoring',  practice: true,       enterprise: true },
      { label: 'Patient theme analysis',      practice: true,       enterprise: true },
      { label: 'AI management summaries',     practice: true,       enterprise: true },
      { label: 'Trend monitoring',            practice: true,       enterprise: true },
      { label: 'Alerts & recommendations',    practice: true,       enterprise: true },
      { label: 'Executive reporting',         practice: false,      enterprise: true },
    ],
  },
  {
    heading: 'Benchmarking',
    rows: [
      { label: 'Local ranking',               practice: 'Basic',    enterprise: 'Advanced' },
      { label: 'Cross-practice comparison',   practice: false,      enterprise: true },
      { label: 'Regional insights',           practice: false,      enterprise: true },
      { label: 'Identify under-performers',   practice: false,      enterprise: true },
    ],
  },
  {
    heading: 'Operations',
    rows: [
      { label: 'Review response tools',       practice: true,       enterprise: true },
      { label: 'Reputation risk monitoring',  practice: false,      enterprise: true },
      { label: 'Central group oversight',     practice: false,      enterprise: true },
    ],
  },
  {
    heading: 'Support',
    rows: [
      { label: 'Standard support',            practice: true,       enterprise: true },
      { label: 'Priority support',            practice: false,      enterprise: true },
      { label: 'Custom onboarding',           practice: false,      enterprise: true },
      { label: 'Dedicated account manager',   practice: false,      enterprise: true },
    ],
  },
];

function Check() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-label="Included">
      <circle cx="8" cy="8" r="7" stroke={C.accent} strokeWidth="1.2" />
      <polyline points="5,8 7,10.5 11,5.5" stroke={C.accent} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Dash() {
  return <span style={{ color: C.xfaint, fontSize: 16, lineHeight: 1 }}>—</span>;
}

function Cell({ value }: { value: FeatureValue }) {
  if (value === true)  return <Check />;
  if (value === false) return <Dash />;
  return <span style={{ fontSize: 11, fontWeight: 600, color: C.accent, fontFamily: 'var(--font-body)', background: C.accentPale, border: `1px solid ${C.accentBorder}`, borderRadius: 20, padding: '2px 8px', whiteSpace: 'nowrap' }}>{value}</span>;
}

export default function PricingPage() {
  return (
    <main style={{ background: C.bg, minHeight: '100vh' }}>

      {/* ── Hero ─────────────────────────────────────────────────── */}
      <section style={{ padding: 'clamp(72px,8vw,110px) 24px 64px', position: 'relative', overflow: 'hidden' }}>
        {/* Grid overlay */}
        <div style={{ position: 'absolute', inset: 0, backgroundImage: `linear-gradient(${C.accentPale} 1px, transparent 1px), linear-gradient(90deg, ${C.accentPale} 1px, transparent 1px)`, backgroundSize: '64px 64px', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: '-10%', left: '50%', transform: 'translateX(-50%)', width: 800, height: 400, background: 'radial-gradient(ellipse, rgba(52,211,153,0.04) 0%, transparent 70%)', pointerEvents: 'none' }} />

        <div style={{ maxWidth: 680, margin: '0 auto', textAlign: 'center', position: 'relative' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '5px 14px', borderRadius: 100, background: C.accentPale, border: `1px solid ${C.accentBorder}`, marginBottom: 28 }}>
            <span style={{ width: 5, height: 5, borderRadius: '50%', background: C.accent, display: 'inline-block', boxShadow: '0 0 6px rgba(52,211,153,0.8)' }} />
            <span style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: C.accent, fontFamily: 'var(--font-body)' }}>Pricing</span>
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(36px,4.5vw,58px)', fontWeight: 800, color: C.text, lineHeight: 1.06, letterSpacing: '-0.03em', margin: '0 0 18px' }}>
            Two tiers.<br />No complexity.
          </h1>
          <p style={{ fontSize: 'clamp(15px,1.6vw,17px)', color: C.soft, lineHeight: 1.7, fontFamily: 'var(--font-body)', margin: '0 auto', maxWidth: 440 }}>
            Built for independent practices and multi-site groups. We know exactly who this is for.
          </p>
        </div>
      </section>

      {/* ── Plan cards ───────────────────────────────────────────── */}
      <section style={{ padding: '0 24px 80px' }}>
        <div style={{ maxWidth: 860, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 16 }}>

          {/* Practice */}
          <div style={{ background: C.card, border: `1.5px solid ${C.border2}`, borderRadius: 18, padding: '36px 32px', display: 'flex', flexDirection: 'column' }}>
            <div style={{ marginBottom: 28 }}>
              <p style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.14em', textTransform: 'uppercase', color: C.accent, fontFamily: 'var(--font-body)', marginBottom: 14 }}>Practice</p>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 10 }}>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: 52, fontWeight: 800, color: C.text, letterSpacing: '-0.04em', lineHeight: 1 }}>£99</span>
                <span style={{ fontSize: 14, color: C.soft, fontFamily: 'var(--font-body)' }}>/month</span>
              </div>
              <p style={{ fontSize: 13, color: C.soft, fontFamily: 'var(--font-body)', lineHeight: 1.6, marginBottom: 6 }}>
                For growing practices and single-location clinics.
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 8px', marginTop: 10 }}>
                {['Independent practices', 'Single-location clinics', 'Small groups'].map(t => (
                  <span key={t} style={{ fontSize: 11, color: C.faint, fontFamily: 'var(--font-body)', background: C.xfaint, borderRadius: 20, padding: '3px 10px' }}>{t}</span>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 11, marginBottom: 32, flex: 1 }}>
              {[
                'Google review intelligence',
                'AI summaries & recommendations',
                'Patient experience scoring',
                'Trend monitoring & alerts',
                'Review response tools',
                'Local benchmarking',
              ].map(f => (
                <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Check />
                  <span style={{ fontSize: 13.5, color: C.mid, fontFamily: 'var(--font-body)' }}>{f}</span>
                </div>
              ))}
            </div>

            <Link href="/auth/signup" style={{ display: 'block', padding: '13px 0', borderRadius: 10, background: C.accent, color: '#07070e', fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: 700, textDecoration: 'none', textAlign: 'center', letterSpacing: '-0.01em' }}>
              Get started
            </Link>
            <p style={{ textAlign: 'center', fontSize: 12, color: C.faint, fontFamily: 'var(--font-body)', marginTop: 10 }}>Cancel any time</p>
          </div>

          {/* Enterprise */}
          <div style={{ background: 'linear-gradient(145deg, #0e1f17 0%, #0a1710 100%)', border: `1.5px solid rgba(52,211,153,0.18)`, borderRadius: 18, padding: '36px 32px', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: -60, right: -60, width: 240, height: 240, background: 'radial-gradient(circle, rgba(52,211,153,0.06) 0%, transparent 70%)', pointerEvents: 'none' }} />
            <div style={{ position: 'relative' }}>
              <p style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.14em', textTransform: 'uppercase', color: C.accent, fontFamily: 'var(--font-body)', marginBottom: 14 }}>Enterprise</p>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 10 }}>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: 52, fontWeight: 800, color: C.text, letterSpacing: '-0.04em', lineHeight: 1 }}>Custom</span>
              </div>
              <p style={{ fontSize: 13, color: C.soft, fontFamily: 'var(--font-body)', lineHeight: 1.6, marginBottom: 6 }}>
                Centralised patient reputation intelligence across your entire group.
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 8px', marginTop: 10 }}>
                {['Multi-site groups', 'DSOs', 'Regional operators'].map(t => (
                  <span key={t} style={{ fontSize: 11, color: C.faint, fontFamily: 'var(--font-body)', background: 'rgba(52,211,153,0.06)', border: '1px solid rgba(52,211,153,0.12)', borderRadius: 20, padding: '3px 10px' }}>{t}</span>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 11, marginBottom: 32, flex: 1, marginTop: 28 }}>
              {[
                'Everything in Practice',
                'Multi-location intelligence',
                'Cross-practice benchmarking',
                'Regional performance insights',
                'Central reputation oversight',
                'Executive management reporting',
                'Priority support & custom onboarding',
              ].map(f => (
                <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Check />
                  <span style={{ fontSize: 13.5, color: C.mid, fontFamily: 'var(--font-body)' }}>{f}</span>
                </div>
              ))}
            </div>

            <Link href="/contact" style={{ display: 'block', padding: '13px 0', borderRadius: 10, background: 'rgba(52,211,153,0.1)', border: `1.5px solid rgba(52,211,153,0.25)`, color: C.accent, fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: 700, textDecoration: 'none', textAlign: 'center', letterSpacing: '-0.01em' }}>
              Contact sales
            </Link>
            <p style={{ textAlign: 'center', fontSize: 12, color: C.faint, fontFamily: 'var(--font-body)', marginTop: 10 }}>Annual billing available</p>
          </div>

        </div>
      </section>

      {/* ── Feature table ─────────────────────────────────────────── */}
      <section style={{ padding: '0 24px 100px', borderTop: `1px solid ${C.border}` }}>
        <div style={{ maxWidth: 860, margin: '0 auto' }}>

          {/* Table header */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 140px 140px', gap: 0, paddingTop: 48, marginBottom: 8, position: 'sticky', top: 0, background: C.bg, zIndex: 10, paddingBottom: 16, borderBottom: `1px solid ${C.border}` }}>
            <div />
            <div style={{ textAlign: 'center' }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: C.accent, fontFamily: 'var(--font-body)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Practice</span>
            </div>
            <div style={{ textAlign: 'center' }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: C.accent, fontFamily: 'var(--font-body)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Enterprise</span>
            </div>
          </div>

          {FEATURES.map(section => (
            <div key={section.heading}>
              {/* Section heading */}
              <div style={{ padding: '24px 0 10px' }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: C.faint, fontFamily: 'var(--font-body)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>{section.heading}</span>
              </div>
              {/* Rows */}
              {section.rows.map((row, i) => (
                <div key={row.label} style={{ display: 'grid', gridTemplateColumns: '1fr 140px 140px', gap: 0, padding: '11px 0', borderTop: `1px solid ${i === 0 ? 'transparent' : C.border}` }}>
                  <span style={{ fontSize: 13.5, color: C.mid, fontFamily: 'var(--font-body)' }}>{row.label}</span>
                  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <Cell value={row.practice} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <Cell value={row.enterprise} />
                  </div>
                </div>
              ))}
            </div>
          ))}

        </div>
      </section>

      {/* ── Bottom CTA ────────────────────────────────────────────── */}
      <section style={{ padding: 'clamp(64px,8vw,96px) 24px', borderTop: `1px solid ${C.border}`, textAlign: 'center' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(28px,3.5vw,42px)', fontWeight: 800, color: C.text, letterSpacing: '-0.03em', margin: '0 0 16px', lineHeight: 1.1 }}>
          Ready to get started?
        </h2>
        <p style={{ fontSize: 15, color: C.soft, lineHeight: 1.7, fontFamily: 'var(--font-body)', margin: '0 auto 36px', maxWidth: 400 }}>
          Claim your practice free and upgrade when you're ready.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/auth/signup" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '13px 28px', borderRadius: 10, background: C.accent, color: '#07070e', fontSize: 14, fontWeight: 700, fontFamily: 'var(--font-body)', textDecoration: 'none', letterSpacing: '-0.01em' }}>
            Get started free
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
          </Link>
          <Link href="/contact" style={{ display: 'inline-flex', alignItems: 'center', padding: '13px 28px', borderRadius: 10, background: 'rgba(255,255,255,0.05)', border: `1px solid ${C.border2}`, color: C.soft, fontSize: 14, fontWeight: 600, fontFamily: 'var(--font-body)', textDecoration: 'none' }}>
            Talk to sales
          </Link>
        </div>
      </section>

    </main>
  );
}
