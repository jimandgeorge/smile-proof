'use client';

type MonthlyPoint = { month: string; count: number; avgScore: number | null };

function monthLabel(yyyymm: string) {
  const [y, m] = yyyymm.split('-');
  return new Date(Number(y), Number(m) - 1).toLocaleDateString('en-GB', { month: 'short' });
}

const W = 440, H = 160, PAD = { top: 12, right: 12, bottom: 28, left: 28 };
const chartW = W - PAD.left - PAD.right;
const chartH = H - PAD.top - PAD.bottom;

export default function RatingChart({ data }: { data: MonthlyPoint[] }) {
  if (!data.length) return null;

  const maxCount = Math.max(...data.map(d => d.count), 1);
  const barW = Math.floor(chartW / data.length * 0.5);
  const step = chartW / (data.length - 1 || 1);

  const ratingPoints = data
    .map((d, i) => d.avgScore != null ? { x: i * step, y: chartH - ((d.avgScore - 1) / 4) * chartH } : null)
    .filter(Boolean) as { x: number; y: number }[];

  const linePath = ratingPoints.length > 1
    ? ratingPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')
    : null;

  const ratingTicks = [1, 2, 3, 4, 5];

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto', display: 'block' }}>
      {/* Y-axis ticks */}
      {ratingTicks.map(v => {
        const y = PAD.top + chartH - ((v - 1) / 4) * chartH;
        return (
          <g key={v}>
            <line x1={PAD.left - 4} y1={y} x2={PAD.left + chartW} y2={y} stroke="var(--cream-dark)" strokeWidth="1" />
            <text x={PAD.left - 7} y={y + 4} textAnchor="end" fontSize="9" fill="var(--ink-faint)" fontFamily="var(--font-body)">
              {v}
            </text>
          </g>
        );
      })}

      <g transform={`translate(${PAD.left}, ${PAD.top})`}>
        {/* Volume bars */}
        {data.map((d, i) => {
          const barH = d.count > 0 ? Math.max((d.count / maxCount) * chartH, 4) : 3;
          const x = i * step - barW / 2;
          return (
            <rect
              key={d.month}
              x={x}
              y={chartH - barH}
              width={barW}
              height={barH}
              rx="2"
              fill={d.count > 0 ? 'var(--cream-dark)' : 'var(--cream-dark)'}
              opacity={d.count > 0 ? 0.9 : 0.4}
            />
          );
        })}

        {/* Rating line */}
        {linePath && (
          <path d={linePath} fill="none" stroke="var(--forest)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        )}

        {/* Rating dots */}
        {ratingPoints.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r="3.5" fill="var(--forest)" stroke="white" strokeWidth="1.5" />
        ))}

        {/* X-axis month labels */}
        {data.map((d, i) => (
          <text
            key={d.month}
            x={i * step}
            y={chartH + 18}
            textAnchor="middle"
            fontSize="9"
            fill="var(--ink-faint)"
            fontFamily="var(--font-body)"
          >
            {monthLabel(d.month)}
          </text>
        ))}
      </g>
    </svg>
  );
}
