export default function EnterpriseSection() {
  return (
    <section style={{ background: '#07070e', padding: 'clamp(72px, 10vw, 110px) 24px', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div className="grid gap-14 items-center lg:grid-cols-2">

          {/* Left: multi-location mockup */}
          <div style={{ background: '#111119', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, padding: 24, order: 0 }} className="lg:order-first">
            <div style={{ fontSize: 10.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(237,238,245,0.3)', fontFamily: 'var(--font-body)', marginBottom: 16 }}>
              Group overview · 4 locations
            </div>
            {[
              { name: 'Riverside Dental', city: 'Manchester', score: 4.8, trend: '+0.2' },
              { name: 'Central Practice', city: 'Leeds', score: 4.5, trend: '+0.1' },
              { name: 'Parkside Dental', city: 'Sheffield', score: 4.3, trend: '-0.1' },
              { name: 'Northgate Dental', city: 'York', score: 4.7, trend: '+0.3' },
            ].map(({ name, city, score, trend }) => {
              const isPositive = trend.startsWith('+');
              return (
                <div key={name} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#edeef5', fontFamily: 'var(--font-body)' }}>{name}</div>
                    <div style={{ fontSize: 11, color: 'rgba(237,238,245,0.32)', fontFamily: 'var(--font-body)', marginTop: 1 }}>{city}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 800, color: score >= 4.6 ? '#34d399' : score >= 4.3 ? '#fbbf24' : '#f87171', letterSpacing: '-0.03em' }}>{score.toFixed(1)}</div>
                    <div style={{ fontSize: 10.5, fontWeight: 600, color: isPositive ? '#34d399' : '#f87171', fontFamily: 'var(--font-body)', marginTop: 1 }}>{trend}</div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right: copy */}
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#34d399', opacity: 0.8, fontFamily: 'var(--font-body)', marginBottom: 14 }}>
              Enterprise
            </div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(28px, 3.2vw, 42px)', fontWeight: 800, color: '#edeef5', lineHeight: 1.1, letterSpacing: '-0.03em', margin: '0 0 18px' }}>
              Centralised reputation intelligence for dental groups.
            </h2>
            <p style={{ fontSize: 15, color: 'rgba(237,238,245,0.5)', lineHeight: 1.65, fontFamily: 'var(--font-body)', margin: '0 0 28px' }}>
              SmileProof gives group operators and multi-location practices visibility into patient sentiment, operational trends, and reputation performance across the organisation. Compare locations, identify operational risks, and surface opportunities for improvement through one centralised intelligence platform.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
              {[
                'Cross-location sentiment benchmarking',
                'Group-wide operational risk identification',
                'Executive reporting and trend summaries',
                'Custom integrations and onboarding support',
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

        </div>
      </div>
    </section>
  );
}
