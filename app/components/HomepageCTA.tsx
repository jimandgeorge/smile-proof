import Link from 'next/link';

export default function HomepageCTA() {
  return (
    <section style={{ background: '#07070e', padding: 'clamp(72px, 10vw, 110px) 24px', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
      <div style={{ maxWidth: 720, margin: '0 auto', textAlign: 'center' }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 7,
          padding: '5px 14px', borderRadius: 100,
          background: 'rgba(52,211,153,0.07)', border: '1px solid rgba(52,211,153,0.18)',
          marginBottom: 28,
        }}>
          <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#34d399', display: 'inline-block', boxShadow: '0 0 6px rgba(52,211,153,0.8)' }} />
          <span style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#34d399', fontFamily: 'var(--font-body)' }}>
            The patient intelligence layer for dentistry
          </span>
        </div>

        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(32px, 4vw, 48px)', fontWeight: 800, color: '#edeef5', lineHeight: 1.08, letterSpacing: '-0.03em', margin: '0 0 18px' }}>
          Understand what patients actually experience inside your practice.
        </h2>
        <p style={{ fontSize: 16, color: 'rgba(237,238,245,0.48)', lineHeight: 1.7, fontFamily: 'var(--font-body)', margin: '0 auto 36px', maxWidth: 460 }}>
          Turn patient feedback into operational intelligence with SmileProof.
        </p>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/contact" style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '14px 28px', borderRadius: 10,
            background: '#34d399', color: '#07070e',
            fontSize: 15, fontWeight: 700, fontFamily: 'var(--font-body)',
            textDecoration: 'none', letterSpacing: '-0.01em',
          }}>
            Book a Demo
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
          </Link>
          <Link href="/pricing" style={{
            display: 'inline-flex', alignItems: 'center',
            padding: '14px 28px', borderRadius: 10,
            background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
            color: 'rgba(237,238,245,0.65)', fontSize: 15, fontWeight: 600,
            fontFamily: 'var(--font-body)', textDecoration: 'none',
          }}>
            View pricing
          </Link>
        </div>

        <div style={{ marginTop: 28, fontSize: 12, color: 'rgba(237,238,245,0.2)', fontFamily: 'var(--font-body)' }}>
          For practice owners and group operators
        </div>
      </div>
    </section>
  );
}
