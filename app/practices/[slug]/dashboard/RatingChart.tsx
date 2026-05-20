'use client';

type MonthlyPoint = { month: string; count: number; avgScore: number | null };

function monthLabel(yyyymm: string) {
  const [y, m] = yyyymm.split('-');
  return new Date(Number(y), Number(m) - 1).toLocaleDateString('en-GB', { month: 'short' });
}

const W = 500, H = 130, PAD = { top: 10, right: 14, bottom: 22, left: 22 };
const chartW = W - PAD.left - PAD.right;
const chartH = H - PAD.top - PAD.bottom;

function smooth(points: { x: number; y: number }[]): string {
  if (points.length < 2) return points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ');
  return points.map((p, i) => {
    if (i === 0) return `M${p.x},${p.y}`;
    const prev = points[i - 1];
    const cpx = (prev.x + p.x) / 2;
    return `C${cpx},${prev.y} ${cpx},${p.y} ${p.x},${p.y}`;
  }).join(' ');
}

export default function RatingChart({ data }: { data: MonthlyPoint[] }) {
  if (!data.length) return null;

  const maxCount = Math.max(...data.map(d => d.count), 1);
  const barW = Math.floor(chartW / data.length * 0.45);
  const step = chartW / (data.length - 1 || 1);

  const ratingPoints = data
    .map((d, i) => d.avgScore != null ? { x: i * step, y: chartH - ((d.avgScore - 1) / 4) * chartH } : null)
    .filter(Boolean) as { x: number; y: number }[];

  const linePath = ratingPoints.length > 1 ? smooth(ratingPoints) : null;
  const areaPath = linePath && ratingPoints.length > 1
    ? `${linePath} L${ratingPoints[ratingPoints.length - 1].x},${chartH} L${ratingPoints[0].x},${chartH} Z`
    : null;

  const gradId = 'ratingAreaGrad';

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto', display: 'block' }}>
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#34d399" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#34d399" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Y-axis grid + labels */}
      {[1, 2, 3, 4, 5].map(v => {
        const y = PAD.top + chartH - ((v - 1) / 4) * chartH;
        return (
          <g key={v}>
            <line x1={PAD.left} y1={y} x2={PAD.left + chartW} y2={y} stroke="rgba(255,255,255,0.07)" strokeWidth="1" strokeDasharray={v === 1 || v === 5 ? 'none' : '3 3'} />
            <text x={PAD.left - 5} y={y + 3} textAnchor="end" fontSize="7" fill="rgba(237,238,245,0.3)" fontFamily="var(--font-body)">{v}</text>
          </g>
        );
      })}

      <g transform={`translate(${PAD.left}, ${PAD.top})`}>
        {/* Volume bars */}
        {data.map((d, i) => {
          const barH = d.count > 0 ? Math.max((d.count / maxCount) * chartH * 0.7, 4) : 3;
          return (
            <rect key={d.month} x={i * step - barW / 2} y={chartH - barH} width={barW} height={barH}
              rx="2" fill="rgba(255,255,255,0.1)" opacity={d.count > 0 ? 1 : 0.4} />
          );
        })}

        {/* Area fill */}
        {areaPath && <path d={areaPath} fill={`url(#${gradId})`} />}

        {/* Rating line */}
        {linePath && <path d={linePath} fill="none" stroke="#34d399" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />}

        {/* Dots */}
        {ratingPoints.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r="3" fill="#34d399" stroke="#13131a" strokeWidth="1.5" />
        ))}

        {/* X labels */}
        {data.map((d, i) => (
          <text key={d.month} x={i * step} y={chartH + 15} textAnchor="middle" fontSize="8" fill="rgba(237,238,245,0.4)" fontFamily="var(--font-body)">
            {monthLabel(d.month)}
          </text>
        ))}
      </g>
    </svg>
  );
}
