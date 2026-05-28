import Link from 'next/link';

const features = [
  { label: 'Verified reviews', desc: 'Every review is tied to a real patient appointment — no fake ratings.' },
  { label: 'Treatment focus', desc: 'Filter by Invisalign, implants, NHS, and more.' },
  { label: 'Nervous-friendly', desc: 'Find practices that specialise in anxious patient care.' },
  { label: 'AI summaries', desc: 'Get the key insights from hundreds of reviews at a glance.' },
];

export default function ForPatientsSection() {
  return (
    <section style={{ background: '#0a0a14', padding: 'clamp(64px, 8vw, 96px) 24px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div className="grid gap-12 items-center lg:grid-cols-2">

          <div>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(237,238,245,0.3)', fontFamily: 'var(--font-body)', marginBottom: 14 }}>For patients</div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(26px, 3vw, 36px)', fontWeight: 800, color: '#edeef5', lineHeight: 1.14, letterSpacing: '-0.03em', margin: '0 0 14px' }}>
              Find a dental practice you can trust.
            </h2>
            <p style={{ fontSize: 15, color: 'rgba(237,238,245,0.48)', lineHeight: 1.65, fontFamily: 'var(--font-body)', margin: '0 0 26px' }}>
              Every practice on SmileProof is reviewed by real, verified patients. Browse by treatment, location, or what matters most to you.
            </p>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <Link href="/find" style={{
                display: 'inline-flex', alignItems: 'center', gap: 7,
                padding: '11px 20px', borderRadius: 9,
                background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)',
                color: 'rgba(237,238,245,0.78)', fontSize: 13.5, fontWeight: 600,
                fontFamily: 'var(--font-body)', textDecoration: 'none',
              }}>
                Find a dentist
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
              </Link>
              <Link href="/search" style={{
                display: 'inline-flex', alignItems: 'center',
                padding: '11px 20px', borderRadius: 9,
                color: 'rgba(237,238,245,0.4)', fontSize: 13.5, fontWeight: 600,
                fontFamily: 'var(--font-body)', textDecoration: 'none',
              }}>
                Browse all practices
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {features.map(({ label, desc }) => (
              <div key={label} style={{
                background: '#111119', border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: 10, padding: '16px 16px 18px',
              }}>
                <div style={{ fontSize: 12.5, fontWeight: 700, color: '#edeef5', fontFamily: 'var(--font-body)', marginBottom: 5 }}>{label}</div>
                <div style={{ fontSize: 12, color: 'rgba(237,238,245,0.38)', lineHeight: 1.55, fontFamily: 'var(--font-body)' }}>{desc}</div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
}
