'use client';

export type InsightStats = {
  totalReviews: number;
  avgOverall: number | null;
  verifiedPct: number | null;
};

const INSIGHTS = [
  {
    theme: 'Nervous patients',
    quote: 'Dentists who explain treatment clearly rank highest.',
    href: '/find?treatment=nervous',
  },
  {
    theme: 'Invisalign',
    quote: 'Patients value transparency and aftercare most.',
    href: '/find?treatment=invisalign',
  },
  {
    theme: 'Implants',
    quote: 'Cost clarity strongly impacts trust.',
    href: '/find?treatment=implants',
  },
];

export default function InsightsStrip({ stats }: { stats: InsightStats }) {
  return (
    <section className="w-full border-b" style={{ background: 'var(--cream)', borderColor: 'var(--cream-dark)' }}>
      <div className="mx-auto px-5 py-16 sm:py-20" style={{ maxWidth: 1200 }}>

        <div className="insights-grid">

          {/* Left — headline */}
          <div>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 11, fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--forest)', marginBottom: 10 }}>
              What patients tell us
            </p>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(22px,3vw,30px)', fontWeight: 800, color: 'var(--ink)', letterSpacing: '-0.025em', lineHeight: 1.2, marginBottom: 16 }}>
              Real structured<br />insight.
            </h2>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 15, color: 'var(--ink-soft)', lineHeight: 1.65, marginBottom: 0, maxWidth: 340 }}>
              "Patients consistently mention what matters most — so you can choose with confidence."
            </p>
          </div>

          {/* Right — insight rows */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 0 }}>
            {INSIGHTS.map(({ theme, quote, href }) => (
              <a
                key={theme}
                href={href}
                style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 16, background: 'white', border: '1.5px solid var(--cream-dark)', borderRadius: 12, padding: '16px 20px', transition: 'border-color 0.15s' }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(28,69,53,0.35)')}
                onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--cream-dark)')}
              >
                <span style={{ flexShrink: 0, fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: 700, color: 'var(--forest)', background: 'var(--forest-pale)', borderRadius: 999, padding: '4px 12px', whiteSpace: 'nowrap' }}>
                  {theme}
                </span>
                <span style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--ink-soft)', lineHeight: 1.5 }}>
                  "{quote}"
                </span>
              </a>
            ))}
          </div>

        </div>
      </div>
      <style>{`
        .insights-grid {
          display: flex;
          flex-direction: column;
          gap: 40px;
        }
        @media (min-width: 640px) {
          .insights-grid {
            display: grid;
            grid-template-columns: minmax(0,1fr) minmax(0,1.4fr);
            gap: 40px 72px;
            align-items: start;
          }
        }
      `}</style>
    </section>
  );
}
