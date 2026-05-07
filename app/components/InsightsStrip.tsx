export type InsightStats = {
  totalReviews: number;
  avgOverall: number | null;
  verifiedPct: number | null;
};

const FALLBACK_CARDS = [
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"
          stroke="var(--forest)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    title: 'Treatment outcomes',
    text: 'Patients report on results 3 months after their procedure — not just on the day.',
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
        <circle cx="12" cy="12" r="9" stroke="var(--forest)" strokeWidth="1.6" />
        <path d="M9 12l2 2 4-4" stroke="var(--forest)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    title: 'Verified reviews',
    text: 'Reviews are verified by appointment receipts or email — so you know they\'re real.',
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path d="M12 21C12 21 4 13.5 4 8.5a8 8 0 0 1 16 0C20 13.5 12 21 12 21z"
          stroke="var(--forest)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="12" cy="8.5" r="2" stroke="var(--forest)" strokeWidth="1.5" />
      </svg>
    ),
    title: 'Anxiety-aware',
    text: 'Every review asks about anxiety handling — so nervous patients can find the right practice.',
  },
];

function StatCard({
  icon, title, text,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <div
      className="flex items-start gap-4 rounded-2xl"
      style={{
        background: 'white',
        border: '1.5px solid var(--cream-dark)',
        padding: '20px 22px',
      }}
    >
      <div
        className="shrink-0 flex items-center justify-center rounded-xl"
        style={{ width: 44, height: 44, background: 'var(--forest-pale)' }}
      >
        {icon}
      </div>
      <div>
        <p
          className="font-semibold mb-1"
          style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--ink)', lineHeight: 1.3 }}
        >
          {title}
        </p>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--ink-soft)', lineHeight: 1.55 }}>
          {text}
        </p>
      </div>
    </div>
  );
}

export default function InsightsStrip({ stats }: { stats: InsightStats }) {
  const hasData = stats.totalReviews >= 5;

  const liveCards = hasData
    ? [
        {
          icon: (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"
                stroke="var(--forest)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          ),
          title: `${stats.totalReviews.toLocaleString()} patient review${stats.totalReviews !== 1 ? 's' : ''}`,
          text: stats.avgOverall
            ? `Average overall rating of ${stats.avgOverall.toFixed(1)} / 5 across all listed practices.`
            : 'Real experiences from patients across listed practices.',
        },
        {
          icon: (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
              <circle cx="12" cy="12" r="9" stroke="var(--forest)" strokeWidth="1.6" />
              <path d="M9 12l2 2 4-4" stroke="var(--forest)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          ),
          title: 'Verified reviews',
          text: stats.verifiedPct != null && stats.verifiedPct > 0
            ? `${Math.round(stats.verifiedPct)}% of reviews are verified by appointment receipts or email confirmation.`
            : 'Reviews are verified by appointment receipts or email — not just self-reported.',
        },
        {
          icon: (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path d="M12 2C8.13 2 5 5.13 5 9c0 2.38 1.19 4.47 3 5.74V17h8v-2.26c1.81-1.27 3-3.36 3-5.74 0-3.87-3.13-7-7-7z"
                stroke="var(--forest)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M9 21h6" stroke="var(--forest)" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          ),
          title: 'Treatment outcomes',
          text: 'Patients can update their review 3 months later — showing how results hold up over time.',
        },
      ]
    : FALLBACK_CARDS;

  return (
    <section className="w-full border-b" style={{ background: 'var(--cream)', borderColor: 'var(--cream-dark)' }}>
      <div className="mx-auto px-5 py-12 sm:py-14" style={{ maxWidth: 1200 }}>

        <div className="mb-8">
          <p
            className="uppercase mb-2"
            style={{ fontFamily: 'var(--font-body)', fontSize: 11, fontWeight: 700, color: 'var(--forest)', letterSpacing: '0.12em' }}
          >
            {hasData ? 'Platform stats' : 'Why SmileProof'}
          </p>
          <h2
            className="font-bold"
            style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(20px,3vw,26px)', color: 'var(--ink)', letterSpacing: '-0.02em', lineHeight: 1.25 }}
          >
            {hasData
              ? <>What patients are saying <span style={{ color: 'var(--ink-soft)', fontWeight: 500 }}>across all practices</span></>
              : <>Reviews you can actually <span style={{ color: 'var(--ink-soft)', fontWeight: 500 }}>trust</span></>
            }
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {liveCards.map(({ icon, title, text }) => (
            <StatCard key={title} icon={icon} title={title} text={text} />
          ))}
        </div>

      </div>
    </section>
  );
}
