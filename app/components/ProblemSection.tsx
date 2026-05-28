const problems = [
  {
    title: 'Fragmented reviews',
    body: 'Patient feedback is scattered across Google, NHS platforms, and social channels — with no unified view of what patients actually experience.',
  },
  {
    title: 'No operational visibility',
    body: 'Star ratings don\'t tell you whether wait times, communication, or treatment quality are driving satisfaction or frustration.',
  },
  {
    title: 'Unclear patient sentiment',
    body: 'Without AI analysis, recurring themes in patient feedback go unnoticed. The signal is there — but impossible to extract manually.',
  },
  {
    title: 'No actionable insight',
    body: 'Most platforms stop at aggregating scores. None help you understand what to fix, what to improve, or how to convert more patients.',
  },
];

const icons = [
  <svg key={0} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(248,113,113,0.85)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" /></svg>,
  <svg key={1} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(248,113,113,0.85)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24M1 1l22 22" /></svg>,
  <svg key={2} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(248,113,113,0.85)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M12 8v4M12 16h.01" /></svg>,
  <svg key={3} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(248,113,113,0.85)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 17 13.5 8.5 8.5 13.5 2 7" /><polyline points="16 17 22 17 22 11" /></svg>,
];

export default function ProblemSection() {
  return (
    <section style={{ background: '#0a0a14', padding: 'clamp(64px, 8vw, 100px) 24px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ maxWidth: 560, marginBottom: 52 }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(237,238,245,0.3)', fontFamily: 'var(--font-body)', marginBottom: 14 }}>The problem</div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(26px, 3vw, 40px)', fontWeight: 800, color: '#edeef5', lineHeight: 1.12, letterSpacing: '-0.03em', margin: '0 0 14px' }}>
            Most review platforms stop at star ratings.
          </h2>
          <p style={{ fontSize: 15, color: 'rgba(237,238,245,0.48)', lineHeight: 1.68, fontFamily: 'var(--font-body)', margin: 0 }}>
            Collecting stars is easy. Understanding what they mean — and what to do about them — is where every other platform falls short.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {problems.map(({ title, body }, i) => (
            <div key={title} style={{
              background: '#111119', border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: 12, padding: '22px 20px 24px',
            }}>
              <div style={{
                width: 36, height: 36, borderRadius: 9,
                background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.14)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14,
              }}>
                {icons[i]}
              </div>
              <div style={{ fontSize: 13.5, fontWeight: 700, color: '#edeef5', fontFamily: 'var(--font-body)', marginBottom: 8, letterSpacing: '-0.01em' }}>{title}</div>
              <div style={{ fontSize: 12.5, color: 'rgba(237,238,245,0.42)', lineHeight: 1.62, fontFamily: 'var(--font-body)' }}>{body}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
