import Link from 'next/link';

export default function HeroSection() {
  return (
    <section style={{
      background: 'linear-gradient(160deg, #0c0c18 0%, #07070e 65%)',
      padding: 'clamp(80px, 10vw, 120px) 24px clamp(80px, 10vw, 120px)',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Subtle grid */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: 'linear-gradient(rgba(52,211,153,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(52,211,153,0.025) 1px, transparent 1px)',
        backgroundSize: '64px 64px',
        pointerEvents: 'none',
      }} />
      {/* Radial glow */}
      <div style={{
        position: 'absolute', top: '-10%', right: '5%',
        width: 700, height: 700,
        background: 'radial-gradient(circle, rgba(52,211,153,0.05) 0%, transparent 65%)',
        pointerEvents: 'none',
      }} />

      <div style={{ maxWidth: 1200, margin: '0 auto', position: 'relative' }}>
        <div className="grid items-center gap-12 lg:grid-cols-2">

          {/* ── Copy ── */}
          <div>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '5px 14px', borderRadius: 100,
              background: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.18)',
              marginBottom: 28,
            }}>
              <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#34d399', display: 'inline-block', boxShadow: '0 0 6px rgba(52,211,153,0.8)' }} />
              <span style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#34d399', fontFamily: 'var(--font-body)' }}>
                Practice Intelligence Platform
              </span>
            </div>

            <h1 style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(34px, 4vw, 54px)',
              fontWeight: 800, color: '#edeef5',
              lineHeight: 1.06, letterSpacing: '-0.03em',
              margin: '0 0 22px',
            }}>
              Patient reputation intelligence for modern dental practices.
            </h1>

            <p style={{
              fontSize: 'clamp(15px, 1.6vw, 17px)',
              color: 'rgba(237,238,245,0.55)', lineHeight: 1.72,
              margin: '0 0 36px', fontFamily: 'var(--font-body)', maxWidth: 460,
            }}>
              SmileProof combines verified patient reviews, AI-powered sentiment analysis, and operational insight — helping practices understand patient perception, improve trust, and drive better outcomes.
            </p>

            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
              <Link href="/auth/signup" style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '12px 22px', borderRadius: 9,
                background: '#34d399', color: '#07070e',
                fontSize: 14, fontWeight: 700, fontFamily: 'var(--font-body)',
                textDecoration: 'none', letterSpacing: '-0.01em',
              }}>
                Get started free
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
              </Link>
              <Link href="/pricing" style={{
                display: 'inline-flex', alignItems: 'center',
                padding: '12px 22px', borderRadius: 9,
                background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                color: 'rgba(237,238,245,0.72)', fontSize: 14, fontWeight: 600,
                fontFamily: 'var(--font-body)', textDecoration: 'none',
              }}>
                View pricing
              </Link>
            </div>

            <div style={{ display: 'flex', gap: 32, marginTop: 44, paddingTop: 32, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
              {([
                { value: 'AI-powered', label: 'Sentiment analysis' },
                { value: '7 dimensions', label: 'Operational insight' },
                { value: 'Google +', label: 'Review intelligence' },
              ] as const).map(({ value, label }) => (
                <div key={label}>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 700, color: '#edeef5', letterSpacing: '-0.02em' }}>{value}</div>
                  <div style={{ fontSize: 11, color: 'rgba(237,238,245,0.32)', fontFamily: 'var(--font-body)', marginTop: 2 }}>{label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Dashboard preview ── */}
          <DashboardPreview />
        </div>
      </div>
    </section>
  );
}

function DashboardPreview() {
  return (
    <div style={{ position: 'relative' }}>
      <div style={{
        position: 'absolute', inset: -30,
        background: 'radial-gradient(ellipse at 50% 50%, rgba(52,211,153,0.07) 0%, transparent 70%)',
        filter: 'blur(24px)', pointerEvents: 'none',
      }} />
      <div style={{
        position: 'relative',
        borderRadius: 14,
        border: '1px solid rgba(255,255,255,0.1)',
        overflow: 'hidden',
        boxShadow: '0 40px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04)',
      }}>
        <img
          src="/hero-dashboard.png"
          alt="SmileProof practice intelligence dashboard"
          style={{ width: '100%', display: 'block' }}
        />
      </div>
    </div>
  );
}
