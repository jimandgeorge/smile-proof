export default function AIInsightSection() {
  return (
    <section style={{ background: '#0a0a14', padding: 'clamp(72px, 10vw, 110px) 24px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div className="grid gap-14 items-center lg:grid-cols-2">

          {/* Left: copy */}
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#34d399', opacity: 0.8, fontFamily: 'var(--font-body)', marginBottom: 14 }}>
              Sentiment analysis
            </div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(28px, 3.2vw, 42px)', fontWeight: 800, color: '#edeef5', lineHeight: 1.1, letterSpacing: '-0.03em', margin: '0 0 18px' }}>
              AI-powered patient sentiment analysis.
            </h2>
            <p style={{ fontSize: 15, color: 'rgba(237,238,245,0.5)', lineHeight: 1.65, fontFamily: 'var(--font-body)', margin: 0 }}>
              SmileProof continuously analyses patient feedback to uncover hidden patterns that impact patient satisfaction, trust, and conversion. From communication concerns to treatment confidence trends, the platform helps practices identify opportunities for operational improvement before they affect growth.
            </p>
          </div>

          {/* Right: sentiment visual */}
          <div style={{ background: '#111119', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, padding: 24 }}>
            <div style={{ fontSize: 10.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(237,238,245,0.3)', fontFamily: 'var(--font-body)', marginBottom: 16 }}>
              Sentiment breakdown
            </div>
            {[
              { label: 'Positive', pct: 74, color: '#34d399' },
              { label: 'Neutral', pct: 19, color: '#fbbf24' },
              { label: 'Negative', pct: 7, color: '#f87171' },
            ].map(({ label, pct, color }) => (
              <div key={label} style={{ marginBottom: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                  <span style={{ fontSize: 12.5, fontWeight: 600, color: 'rgba(237,238,245,0.65)', fontFamily: 'var(--font-body)' }}>{label}</span>
                  <span style={{ fontSize: 12.5, fontWeight: 700, color, fontFamily: 'var(--font-body)' }}>{pct}%</span>
                </div>
                <div style={{ height: 4, background: 'rgba(255,255,255,0.07)', borderRadius: 2 }}>
                  <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: 2, opacity: 0.75 }} />
                </div>
              </div>
            ))}

            <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ fontSize: 10.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(237,238,245,0.3)', fontFamily: 'var(--font-body)', marginBottom: 12 }}>
                Top themes detected
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
                {['Communication', 'Nervous patients', 'Wait times', 'Staff friendliness', 'Treatment quality'].map(tag => (
                  <span key={tag} style={{
                    fontSize: 11.5, fontWeight: 600, color: 'rgba(237,238,245,0.5)',
                    padding: '4px 10px', borderRadius: 100,
                    background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)',
                    fontFamily: 'var(--font-body)',
                  }}>{tag}</span>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
