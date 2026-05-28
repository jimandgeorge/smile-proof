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
      {/* Browser chrome */}
      <div style={{
        position: 'relative',
        background: '#0f0f18', borderRadius: 14,
        border: '1px solid rgba(255,255,255,0.1)',
        overflow: 'hidden',
        boxShadow: '0 40px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04)',
      }}>
        {/* Toolbar */}
        <div style={{
          padding: '10px 14px', background: '#0b0b14',
          borderBottom: '1px solid rgba(255,255,255,0.07)',
          display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <div style={{ display: 'flex', gap: 5 }}>
            {['#ef4444', '#f59e0b', '#22c55e'].map(c => (
              <div key={c} style={{ width: 8, height: 8, borderRadius: '50%', background: c, opacity: 0.65 }} />
            ))}
          </div>
          <div style={{
            flex: 1, background: 'rgba(255,255,255,0.05)', borderRadius: 5,
            padding: '3px 10px', fontSize: 10, color: 'rgba(237,238,245,0.25)',
            fontFamily: 'var(--font-body)',
          }}>
            beta.smileproof.co.uk/practices/rosyth-dental/dashboard
          </div>
        </div>

        {/* Layout */}
        <div style={{ display: 'flex', height: 390 }}>
          {/* Sidebar */}
          <div style={{
            width: 136, background: '#080810',
            borderRight: '1px solid rgba(255,255,255,0.05)',
            padding: '14px 0', flexShrink: 0,
          }}>
            <div style={{ padding: '0 12px 12px', borderBottom: '1px solid rgba(255,255,255,0.05)', marginBottom: 10 }}>
              <div style={{ fontSize: 10.5, fontWeight: 700, color: '#edeef5', fontFamily: 'var(--font-body)' }}>Rosyth Dental</div>
              <div style={{ fontSize: 9, color: 'rgba(237,238,245,0.3)', fontFamily: 'var(--font-body)', marginTop: 1 }}>Rosyth · mixed</div>
            </div>
            {[
              { label: 'Practice Health', active: true },
              { label: 'Intelligence', active: false },
              { label: 'Profile', active: false },
              { label: 'Settings', active: false },
            ].map(({ label, active }) => (
              <div key={label} style={{
                padding: '6px 12px',
                fontSize: 10.5, fontFamily: 'var(--font-body)',
                fontWeight: active ? 600 : 400,
                color: active ? '#34d399' : 'rgba(237,238,245,0.35)',
                background: active ? 'rgba(52,211,153,0.07)' : 'transparent',
                borderLeft: active ? '2px solid #34d399' : '2px solid transparent',
              }}>{label}</div>
            ))}
          </div>

          {/* Main */}
          <div style={{ flex: 1, padding: 14, background: '#0d0d12', overflowY: 'hidden' }}>
            <div style={{ fontSize: 12.5, fontWeight: 700, color: '#edeef5', fontFamily: 'var(--font-display)', marginBottom: 10, letterSpacing: '-0.02em' }}>Practice Health</div>

            {/* Rating card */}
            <div style={{
              background: 'linear-gradient(135deg, #1a3829 0%, #0e1c14 100%)',
              borderRadius: 8, padding: '11px 14px',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 7,
            }}>
              <div>
                <div style={{ fontSize: 8, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(255,255,255,0.4)', marginBottom: 2, fontFamily: 'var(--font-body)' }}>Overall rating</div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 3 }}>
                  <span style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 800, color: 'white', letterSpacing: '-0.04em', lineHeight: 1 }}>4.8</span>
                  <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', fontFamily: 'var(--font-body)' }}>/5</span>
                </div>
                <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)', fontFamily: 'var(--font-body)', marginTop: 1 }}>86 Google reviews</div>
              </div>
              <div style={{ display: 'flex', gap: 14, paddingLeft: 14, borderLeft: '1px solid rgba(255,255,255,0.1)' }}>
                {[{ l: 'This month', v: '4', c: 'white' }, { l: 'Response', v: '91%', c: '#4ade80' }].map(({ l, v, c }) => (
                  <div key={l} style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 8, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'rgba(255,255,255,0.35)', fontFamily: 'var(--font-body)', marginBottom: 1 }}>{l}</div>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 800, color: c, letterSpacing: '-0.03em' }}>{v}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Google bar */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '6px 10px', background: '#17171f',
              border: '1px solid rgba(255,255,255,0.07)', borderRadius: 6, marginBottom: 10,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <div style={{ width: 14, height: 14, borderRadius: 3, background: 'rgba(66,133,244,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <span style={{ fontSize: 7.5, fontWeight: 900, color: '#4285F4' }}>G</span>
                </div>
                <span style={{ fontSize: 9.5, fontWeight: 600, color: 'rgba(237,238,245,0.55)', fontFamily: 'var(--font-body)' }}>Google Reviews</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: 12, fontWeight: 700, color: '#edeef5' }}>4.6</span>
                <span style={{ fontSize: 8.5, color: '#fbbf24', letterSpacing: 0 }}>★★★★★</span>
                <span style={{ fontSize: 9, color: 'rgba(237,238,245,0.3)', fontFamily: 'var(--font-body)' }}>86 reviews · AI analysed</span>
              </div>
            </div>

            {/* Dimension scores */}
            <div style={{ fontSize: 8.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(237,238,245,0.3)', fontFamily: 'var(--font-body)', marginBottom: 7 }}>Dimension scores</div>
            {[
              { label: 'Communication', score: 4.8, w: '92%' },
              { label: 'Nervous patients', score: 4.6, w: '88%' },
              { label: 'Treatment outcomes', score: 4.7, w: '90%' },
              { label: 'Wait times', score: 4.2, w: '80%' },
              { label: 'Staff friendliness', score: 4.9, w: '95%' },
            ].map(({ label, score, w }) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 5 }}>
                <div style={{ fontSize: 9, color: 'rgba(237,238,245,0.45)', fontFamily: 'var(--font-body)', width: 100, flexShrink: 0 }}>{label}</div>
                <div style={{ flex: 1, height: 3, background: 'rgba(255,255,255,0.06)', borderRadius: 2, overflow: 'hidden' }}>
                  <div style={{ width: w, height: '100%', background: 'linear-gradient(90deg, #34d399, #059669)', borderRadius: 2 }} />
                </div>
                <div style={{ fontSize: 9, fontWeight: 700, color: '#34d399', fontFamily: 'var(--font-body)', width: 22, textAlign: 'right' }}>{score}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
