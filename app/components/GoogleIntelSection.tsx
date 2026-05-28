const GoogleIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
  </svg>
);

export default function GoogleIntelSection() {
  return (
    <section style={{ background: '#0a0a14', padding: 'clamp(64px, 8vw, 100px) 24px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div className="grid gap-14 items-center lg:grid-cols-2">

          {/* Copy */}
          <div>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '5px 13px', borderRadius: 100,
              background: 'rgba(66,133,244,0.08)', border: '1px solid rgba(66,133,244,0.2)',
              marginBottom: 22,
            }}>
              <GoogleIcon />
              <span style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '0.08em', color: '#4285F4', fontFamily: 'var(--font-body)', textTransform: 'uppercase' }}>Google Review Intelligence</span>
            </div>

            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(26px, 3vw, 40px)', fontWeight: 800, color: '#edeef5', lineHeight: 1.1, letterSpacing: '-0.03em', margin: '0 0 16px' }}>
              Google review intelligence built in.
            </h2>
            <p style={{ fontSize: 15, color: 'rgba(237,238,245,0.5)', lineHeight: 1.65, fontFamily: 'var(--font-body)', margin: '0 0 22px' }}>
              Practices can securely connect Google reviews to unlock instant AI-powered reputation insight and operational analysis. Imported reviews are used exclusively for intelligence and reporting — not public duplication.
            </p>

            {/* Privacy note */}
            <div style={{ background: 'rgba(52,211,153,0.05)', border: '1px solid rgba(52,211,153,0.15)', borderRadius: 10, padding: '11px 14px', marginBottom: 24 }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginTop: 1, flexShrink: 0 }}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
                <span style={{ fontSize: 12.5, color: 'rgba(237,238,245,0.6)', fontFamily: 'var(--font-body)', lineHeight: 1.55 }}>
                  <strong style={{ color: '#34d399' }}>Privacy-first:</strong> Google reviews are used exclusively for AI intelligence analysis — never duplicated publicly or shown to patients on SmileProof.
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                'Instantly populate your intelligence dashboard from existing reviews',
                'Surface sentiment patterns across a larger review corpus',
                'Understand your full reputation picture in one place',
                'Reviews stay private — never shown publicly on SmileProof',
              ].map(item => (
                <div key={item} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                  <div style={{
                    width: 16, height: 16, borderRadius: '50%',
                    background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.22)',
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

          {/* Visual mockup */}
          <div style={{ background: '#111119', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, padding: 24 }}>
            {/* Connected status */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18, paddingBottom: 16, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(66,133,244,0.1)', border: '1px solid rgba(66,133,244,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <GoogleIcon />
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#edeef5', fontFamily: 'var(--font-body)' }}>Google Reviews Connected</div>
                <div style={{ fontSize: 11, color: 'rgba(237,238,245,0.32)', fontFamily: 'var(--font-body)', marginTop: 1 }}>86 reviews imported · Updated today</div>
              </div>
              <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 5, padding: '4px 10px', borderRadius: 100, background: 'rgba(52,211,153,0.09)', border: '1px solid rgba(52,211,153,0.2)' }}>
                <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#34d399', display: 'inline-block', boxShadow: '0 0 5px rgba(52,211,153,0.7)' }} />
                <span style={{ fontSize: 10.5, fontWeight: 600, color: '#34d399', fontFamily: 'var(--font-body)' }}>Active</span>
              </div>
            </div>

            {/* Blended stats */}
            <div className="grid grid-cols-3 gap-3" style={{ marginBottom: 16 }}>
              {[
                { label: 'Google avg', value: '4.6', sub: '86 reviews' },
                { label: 'SmileProof avg', value: '4.8', sub: '32 reviews' },
                { label: 'Blended', value: '4.7', sub: '118 total' },
              ].map(({ label, value, sub }) => (
                <div key={label} style={{ background: '#17171f', borderRadius: 9, padding: '10px 12px' }}>
                  <div style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(237,238,245,0.28)', fontFamily: 'var(--font-body)', marginBottom: 5 }}>{label}</div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 800, color: '#34d399', letterSpacing: '-0.03em' }}>{value}</div>
                  <div style={{ fontSize: 10, color: 'rgba(237,238,245,0.28)', fontFamily: 'var(--font-body)', marginTop: 1 }}>{sub}</div>
                </div>
              ))}
            </div>

            {/* AI insight */}
            <div style={{ background: '#17171f', borderRadius: 9, padding: '13px 15px', borderLeft: '2px solid #34d399' }}>
              <div style={{ fontSize: 9.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'rgba(52,211,153,0.65)', fontFamily: 'var(--font-body)', marginBottom: 7 }}>AI insight</div>
              <p style={{ fontSize: 12.5, color: 'rgba(237,238,245,0.52)', lineHeight: 1.65, fontFamily: 'var(--font-body)', margin: 0 }}>
                &ldquo;Cross-platform analysis confirms communication as a consistent strength. Google reviews highlight a pattern of praise around nervous patient care that aligns strongly with SmileProof data.&rdquo;
              </p>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
