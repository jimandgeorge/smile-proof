const STEPS = [
  {
    number: '01',
    title: 'Search by treatment or location',
    body: 'Enter a postcode, city, or treatment type — or let SmileProof find practices near you automatically.',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
        <circle cx="11" cy="11" r="7" stroke="var(--forest)" strokeWidth="1.6" />
        <path d="M16.5 16.5L21 21" stroke="var(--forest)" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    number: '02',
    title: 'Read real structured patient insight',
    body: 'Every practice shows ratings across pain management, cost transparency, anxiety care, and communication — not just a single star.',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke="var(--forest)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    number: '03',
    title: 'Choose with confidence',
    body: "View AI-summarised patient themes, compare practices side by side, then book a consultation directly from the profile.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" stroke="var(--forest)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        <polyline points="22 4 12 14.01 9 11.01" stroke="var(--forest)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
];

export default function HowItWorksSection() {
  return (
    <section style={{ background: 'white', borderBottom: '1px solid var(--cream-dark)' }}>
      <div className="mx-auto px-5 py-16 sm:py-20" style={{ maxWidth: 1200 }}>

        <div style={{ marginBottom: 48 }}>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 11, fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--forest)', marginBottom: 10 }}>
            How it works
          </p>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(22px,3vw,30px)', fontWeight: 800, color: 'var(--ink)', letterSpacing: '-0.025em', lineHeight: 1.2, margin: 0, maxWidth: 480 }}>
            Find the right dentist,<br />confidently.
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          {STEPS.map(({ number, title, body, icon }) => (
            <div key={number} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

              {/* Number + icon row */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <span style={{
                  fontFamily: 'var(--font-display)', fontSize: 36, fontWeight: 800,
                  color: 'rgba(28,69,53,0.1)', lineHeight: 1, letterSpacing: '-0.03em',
                  flexShrink: 0,
                }}>
                  {number}
                </span>
                <div style={{ width: 46, height: 46, borderRadius: 12, background: 'var(--forest-pale)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {icon}
                </div>
              </div>

              {/* Text */}
              <div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 800, color: 'var(--ink)', margin: '0 0 8px', letterSpacing: '-0.015em', lineHeight: 1.3 }}>
                  {title}
                </h3>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--ink-soft)', lineHeight: 1.65, margin: 0 }}>
                  {body}
                </p>
              </div>

            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
