const MIN_REVIEWS = 3;

type Props = {
  reviewCount: number;
  respondedCount: number;
  avgResponseDays: number | null;
};

function rateLabel(rate: number) {
  if (rate >= 80) return { text: 'Very responsive', color: 'var(--forest)' };
  if (rate >= 50) return { text: 'Moderately responsive', color: '#92620a' };
  return { text: 'Rarely responds', color: '#b91c1c' };
}

export default function ResponseAccountabilitySection({ reviewCount, respondedCount, avgResponseDays }: Props) {
  if (reviewCount < MIN_REVIEWS) return null;

  const rate = Math.round((respondedCount / reviewCount) * 100);
  const { text: rateText, color: rateColor } = rateLabel(rate);

  return (
    <section
      style={{
        background: 'white',
        borderRadius: 'var(--radius)',
        border: '1.5px solid var(--cream-dark)',
        padding: '18px 24px',
        marginBottom: 24,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: 7,
            background: 'var(--forest-pale)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path
              d="M12 8.5a1.5 1.5 0 0 1-1.5 1.5H3.5L1.5 12V4a1.5 1.5 0 0 1 1.5-1.5h7.5A1.5 1.5 0 0 1 12 4v4.5z"
              stroke="var(--forest)"
              strokeWidth="1.3"
              strokeLinejoin="round"
              fill="none"
            />
          </svg>
        </div>
        <span
          style={{
            fontSize: 12,
            fontWeight: 700,
            color: 'var(--forest)',
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
          }}
        >
          Practice Engagement
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
        {/* Rate bar */}
        <div style={{ flex: 1, minWidth: 180 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
            <span style={{ fontSize: 13, color: 'var(--ink-soft)', fontFamily: 'var(--font-body)' }}>
              Responds to reviews
            </span>
            <span
              style={{
                fontSize: 15,
                fontWeight: 700,
                color: rateColor,
                fontFamily: 'var(--font-display)',
                letterSpacing: '-0.01em',
              }}
            >
              {rate}%
            </span>
          </div>
          <div style={{ height: 6, borderRadius: 3, background: 'var(--cream-dark)', overflow: 'hidden' }}>
            <div
              style={{
                height: '100%',
                width: `${rate}%`,
                borderRadius: 3,
                background: rateColor,
                transition: 'width 0.8s cubic-bezier(0.4,0,0.2,1)',
              }}
            />
          </div>
          <div style={{ marginTop: 5, fontSize: 11, color: rateColor, fontFamily: 'var(--font-body)', fontWeight: 600 }}>
            {rateText} · {respondedCount} of {reviewCount} reviews answered
          </div>
        </div>

        {/* Avg response time */}
        {avgResponseDays !== null && (
          <div
            style={{
              flexShrink: 0,
              textAlign: 'center',
              padding: '10px 16px',
              borderRadius: 10,
              background: 'var(--cream)',
              border: '1px solid var(--cream-dark)',
            }}
          >
            <div
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 22,
                fontWeight: 700,
                color: 'var(--ink)',
                letterSpacing: '-0.02em',
                lineHeight: 1,
              }}
            >
              {avgResponseDays < 1 ? '<1' : avgResponseDays}
            </div>
            <div style={{ fontSize: 11, color: 'var(--ink-soft)', fontFamily: 'var(--font-body)', marginTop: 3 }}>
              {avgResponseDays === 1 ? 'day' : 'days'} avg
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
