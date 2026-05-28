const dimensions = [
  { label: 'Communication',       score: 4.8 },
  { label: 'Nervous patient care', score: 4.6 },
  { label: 'Treatment outcomes',   score: 4.7 },
  { label: 'Wait times',           score: 4.2 },
  { label: 'Booking experience',   score: 4.5 },
  { label: 'Pricing transparency', score: 4.4 },
  { label: 'Staff friendliness',   score: 4.9 },
];

function scoreColor(s: number) {
  return s >= 4.5 ? '#34d399' : s >= 4.0 ? '#fbbf24' : '#f87171';
}

export default function IntelligenceDashboardSection() {
  return (
    <section style={{ background: '#07070e', padding: 'clamp(72px, 10vw, 110px) 24px', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>

        <div className="grid gap-14 items-start lg:grid-cols-2" style={{ marginBottom: 48 }}>
          {/* Left: copy */}
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#34d399', opacity: 0.8, fontFamily: 'var(--font-body)', marginBottom: 14 }}>
              Practice intelligence
            </div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(28px, 3.2vw, 42px)', fontWeight: 800, color: '#edeef5', lineHeight: 1.1, letterSpacing: '-0.03em', margin: '0 0 18px' }}>
              Turn patient feedback into operational insight.
            </h2>
            <p style={{ fontSize: 15, color: 'rgba(237,238,245,0.5)', lineHeight: 1.65, fontFamily: 'var(--font-body)', margin: '0 0 28px' }}>
              SmileProof analyses every patient review across 7 clinical and operational dimensions — surfacing patterns that would take weeks to identify manually.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
              {[
                'Understand exactly what patients experience at your practice',
                'Identify recurring issues before they affect your reputation',
                'Benchmark across every clinical and operational dimension',
                'Generate AI management summaries your team can act on',
              ].map(item => (
                <div key={item} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                  <div style={{
                    width: 16, height: 16, borderRadius: '50%',
                    background: 'rgba(52,211,153,0.12)', border: '1px solid rgba(52,211,153,0.28)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0, marginTop: 1,
                  }}>
                    <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5" /></svg>
                  </div>
                  <span style={{ fontSize: 13.5, color: 'rgba(237,238,245,0.58)', fontFamily: 'var(--font-body)', lineHeight: 1.5 }}>{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right: dimension scores */}
          <div className="grid gap-3 grid-cols-2">
            {dimensions.map(({ label, score }) => (
              <div key={label} style={{
                background: '#111119', border: '1px solid rgba(255,255,255,0.07)',
                borderRadius: 10, padding: '14px 16px',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 9 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: 'rgba(237,238,245,0.65)', fontFamily: 'var(--font-body)', lineHeight: 1.3, maxWidth: 100 }}>{label}</div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 800, color: scoreColor(score), letterSpacing: '-0.03em' }}>{score.toFixed(1)}</div>
                </div>
                <div style={{ height: 3, background: 'rgba(255,255,255,0.07)', borderRadius: 2 }}>
                  <div style={{ width: `${(score / 5) * 100}%`, height: '100%', background: scoreColor(score), borderRadius: 2, opacity: 0.7 }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* AI management summary preview */}
        <div style={{
          background: '#111119', border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: 14, padding: '28px 32px', position: 'relative', overflow: 'hidden',
        }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg, #34d399, #059669)' }} />
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 18 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 9,
              background: 'rgba(52,211,153,0.09)', border: '1px solid rgba(52,211,153,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" /></svg>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 10.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#34d399', fontFamily: 'var(--font-body)', marginBottom: 9, opacity: 0.8 }}>
                AI Management Summary
              </div>
              <p style={{ fontSize: 14, color: 'rgba(237,238,245,0.6)', lineHeight: 1.72, fontFamily: 'var(--font-body)', margin: 0, maxWidth: 720 }}>
                &ldquo;Patients consistently highlight the team&rsquo;s warmth and clinical thoroughness as key strengths. Communication around treatment plans scores particularly highly, though a recurring theme around appointment wait times suggests a scheduling review could improve the experience for anxious patients. Prioritise responding to the 3 recent reviews mentioning wait times — this pattern is visible in both SmileProof and Google data.&rdquo;
              </p>
              <div style={{ fontSize: 11, color: 'rgba(237,238,245,0.22)', fontFamily: 'var(--font-body)', marginTop: 10 }}>
                Generated from 118 reviews · Updated today
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
