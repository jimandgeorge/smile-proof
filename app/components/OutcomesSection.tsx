const outcomes = [
  {
    title: 'Improve patient trust',
    body: 'AI analysis of patient feedback pinpoints exactly where your practice excels — and where to improve — giving your team the insight to deliver consistently better care.',
    icon: <svg key={0} width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>,
  },
  {
    title: 'Strengthen treatment conversion',
    body: 'Treatment-focused reviews help prospective patients understand the experience before they book — reducing hesitation and improving conversion.',
    icon: <svg key={1} width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" /></svg>,
  },
  {
    title: 'Identify operational friction',
    body: 'Spot recurring issues around wait times, communication gaps, or booking before they affect your CQC rating or Google score.',
    icon: <svg key={2} width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>,
  },
  {
    title: 'Strengthen your Google presence',
    body: 'Deep AI analysis of your Google Reviews helps you understand what patients are saying, respond strategically, and stand out in a competitive local market.',
    icon: <svg key={3} width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>,
  },
  {
    title: 'Generate better enquiries',
    body: 'Patients who arrive via reputation data are better informed and more ready to commit to treatment — reducing no-shows and improving case acceptance.',
    icon: <svg key={4} width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" /></svg>,
  },
  {
    title: 'Monitor patient sentiment',
    body: 'Track how patient perception shifts over time — by month, by treatment type, and across clinical dimensions — so trends never catch you off guard.',
    icon: <svg key={5} width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></svg>,
  },
];

export default function OutcomesSection() {
  return (
    <section style={{ background: '#07070e', padding: 'clamp(72px, 10vw, 110px) 24px', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', maxWidth: 540, margin: '0 auto 52px' }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(237,238,245,0.3)', fontFamily: 'var(--font-body)', marginBottom: 14 }}>Business outcomes</div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(28px, 3.2vw, 40px)', fontWeight: 800, color: '#edeef5', lineHeight: 1.1, letterSpacing: '-0.03em', margin: '0 0 14px' }}>
            Measurable outcomes for modern dental practices.
          </h2>
          <p style={{ fontSize: 15, color: 'rgba(237,238,245,0.48)', lineHeight: 1.65, fontFamily: 'var(--font-body)', margin: 0 }}>
            SmileProof is built around the outcomes that matter to practice owners and group operators — not vanity metrics.
          </p>
        </div>

        {/* 3×2 grid with dividers */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 0,
          background: 'rgba(255,255,255,0.06)',
          borderRadius: 14,
          overflow: 'hidden',
          border: '1px solid rgba(255,255,255,0.06)',
        }} className="grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {outcomes.map(({ title, body, icon }) => (
            <div key={title} style={{ background: '#0d0d16', padding: '28px 26px', borderRight: '1px solid rgba(255,255,255,0.06)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{
                width: 34, height: 34, borderRadius: 8,
                background: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.15)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14,
              }}>
                {icon}
              </div>
              <div style={{ fontSize: 14.5, fontWeight: 700, color: '#edeef5', fontFamily: 'var(--font-body)', marginBottom: 8, letterSpacing: '-0.01em' }}>{title}</div>
              <div style={{ fontSize: 12.5, color: 'rgba(237,238,245,0.42)', lineHeight: 1.62, fontFamily: 'var(--font-body)' }}>{body}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
