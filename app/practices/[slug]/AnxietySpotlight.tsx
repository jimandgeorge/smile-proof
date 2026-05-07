type Review = {
  body: string;
  reviewer_display_name: string | null;
  rating_anxiety_handling: number | null;
};

type Props = {
  anxietyScore: number | null;
  reviews: Review[];
};

const SCORE_THRESHOLD = 4.0;
const ANXIETY_REVIEW_MIN = 4;

export default function AnxietySpotlight({ anxietyScore, reviews }: Props) {
  if (!anxietyScore || anxietyScore < SCORE_THRESHOLD) return null;

  const excerpts = reviews
    .filter((r) => (r.rating_anxiety_handling ?? 0) >= ANXIETY_REVIEW_MIN && r.body.length > 30)
    .slice(0, 3);

  return (
    <section
      style={{
        background: 'linear-gradient(135deg, var(--forest-pale) 0%, #edf6f0 100%)',
        borderRadius: 'var(--radius)',
        border: '1.5px solid rgba(28,69,53,0.18)',
        padding: '20px 24px',
        marginBottom: 24,
      }}
    >
      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            background: 'var(--forest)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
            <path d="M10 2C7.8 2 6 3.8 6 6c0 1.5.8 2.8 2 3.5v1.5l-1 1v1l1-1v.5l-1 1v1l2-2V10a4 4 0 100-8z" fill="white" opacity="0.2" />
            <circle cx="10" cy="10" r="8" stroke="white" strokeWidth="1.5" />
            <path d="M7 10l2.5 2.5L14 8" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <div>
          <div
            style={{
              fontSize: 15,
              fontWeight: 700,
              color: 'var(--forest)',
              fontFamily: 'var(--font-display)',
              letterSpacing: '-0.01em',
            }}
          >
            Highly rated for nervous patients
          </div>
          <div
            style={{
              fontSize: 12,
              color: 'var(--ink-soft)',
              fontFamily: 'var(--font-body)',
              marginTop: 1,
            }}
          >
            Patients score anxiety handling&nbsp;
            <strong style={{ color: 'var(--forest)' }}>{Number(anxietyScore).toFixed(1)}</strong>
            &nbsp;/ 5
          </div>
        </div>
      </div>

      {/* Review excerpts */}
      {excerpts.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {excerpts.map((r, i) => (
            <div
              key={i}
              style={{
                background: 'white',
                borderRadius: 8,
                padding: '10px 14px',
                border: '1px solid rgba(28,69,53,0.12)',
              }}
            >
              <p
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: 13,
                  color: 'var(--ink-mid)',
                  lineHeight: 1.6,
                  fontStyle: 'italic',
                  margin: 0,
                }}
              >
                &ldquo;{r.body.length > 160 ? r.body.slice(0, 160) + '…' : r.body}&rdquo;
              </p>
              {r.reviewer_display_name && (
                <p
                  style={{
                    fontSize: 11,
                    color: 'var(--ink-faint)',
                    fontFamily: 'var(--font-body)',
                    marginTop: 4,
                    textAlign: 'right',
                  }}
                >
                  — {r.reviewer_display_name}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
