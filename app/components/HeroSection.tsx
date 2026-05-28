import Link from 'next/link';

export default function HeroSection() {
  return (
    <section style={{
      background: 'linear-gradient(160deg, #0c0c18 0%, #07070e 65%)',
      paddingTop: 'clamp(72px, 10vw, 112px)',
      paddingBottom: 0,
      paddingLeft: 24,
      paddingRight: 24,
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

        {/* ── Copy ── */}
        <div style={{ maxWidth: 820 }}>
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
            fontSize: 'clamp(40px, 5.5vw, 72px)',
            fontWeight: 800, color: '#edeef5',
            lineHeight: 1.04, letterSpacing: '-0.035em',
            margin: '0 0 24px',
          }}>
            Patient reputation intelligence for modern dental practices.
          </h1>

          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 20, marginBottom: 36 }}>
            <p style={{
              fontSize: 'clamp(15px, 1.5vw, 17px)',
              color: 'rgba(237,238,245,0.5)', lineHeight: 1.7,
              margin: 0, fontFamily: 'var(--font-body)', maxWidth: 480,
            }}>
              Connect your Google Reviews, run AI analysis, and surface the operational insight your practice needs — in minutes.
            </p>
          </div>

          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
            <Link href="/auth/signup" style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '12px 22px', borderRadius: 9,
              background: '#34d399', color: '#07070e',
              fontSize: 14, fontWeight: 700, fontFamily: 'var(--font-body)',
              textDecoration: 'none', letterSpacing: '-0.01em',
            }}>
              Start free trial
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
            </Link>
            <Link href="/pricing" style={{
              display: 'inline-flex', alignItems: 'center',
              padding: '12px 22px', borderRadius: 9,
              background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
              color: 'rgba(237,238,245,0.65)', fontSize: 14, fontWeight: 600,
              fontFamily: 'var(--font-body)', textDecoration: 'none',
            }}>
              View pricing
            </Link>
          </div>
        </div>

        {/* ── Dashboard screenshot ── */}
        <div style={{ marginTop: 64, position: 'relative' }}>
          {/* Glow behind screenshot */}
          <div style={{
            position: 'absolute', top: '10%', left: '50%',
            transform: 'translateX(-50%)',
            width: '80%', height: '60%',
            background: 'radial-gradient(ellipse, rgba(52,211,153,0.06) 0%, transparent 70%)',
            filter: 'blur(40px)', pointerEvents: 'none',
          }} />
          <div style={{
            position: 'relative',
            borderRadius: '14px 14px 0 0',
            border: '1px solid rgba(255,255,255,0.1)',
            borderBottom: 'none',
            overflow: 'hidden',
            boxShadow: '0 -4px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.04)',
          }}>
            <img
              src="/hero-dashboard.png"
              alt="SmileProof practice intelligence dashboard"
              style={{ width: '100%', display: 'block' }}
            />
          </div>
        </div>

      </div>
    </section>
  );
}
