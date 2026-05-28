'use client';

import Link from 'next/link';
import { Lock } from 'lucide-react';

const D = {
  card: '#13131a', card2: '#17171f',
  border: 'rgba(255,255,255,0.07)',
  text: '#edeef5', soft: 'rgba(237,238,245,0.5)',
  faint: 'rgba(237,238,245,0.28)', xfaint: 'rgba(237,238,245,0.13)',
  accent: '#34d399', accentPale: 'rgba(52,211,153,0.08)',
} as const;

type MonthlyPoint = { month: string; count: number; avgScore: number | null };

type Props = {
  isPaid: boolean;
  practiceSlug: string;
  responseRate: number;
  cityRank: number;
  cityTotal: number;
  monthlyData: MonthlyPoint[];
};

function MonthLabel(yyyymm: string) {
  const [y, m] = yyyymm.split('-');
  return new Date(Number(y), Number(m) - 1).toLocaleDateString('en-GB', { month: 'short' });
}

function MicroLabel({ text }: { text: string }) {
  return (
    <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: D.faint, fontFamily: 'var(--font-body)', marginBottom: 8 }}>
      {text}
    </div>
  );
}

export default function MetricsDashboard({ isPaid, practiceSlug, responseRate, cityRank, cityTotal, monthlyData }: Props) {
  if (!isPaid) {
    return (
      <div style={{ position: 'relative', marginBottom: 24 }}>
        <div style={{ filter: 'blur(4px)', pointerEvents: 'none', userSelect: 'none', opacity: 0.5 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 12 }}>
            {[['Response rate', '72%'], ['City rank', '#3'], ['This month', '4 reviews']].map(([label, val]) => (
              <div key={label} style={{ background: D.card, border: `1px solid ${D.border}`, borderRadius: 12, padding: '16px 20px' }}>
                <MicroLabel text={label} />
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 800, color: D.text, letterSpacing: '-0.03em' }}>{val}</div>
              </div>
            ))}
          </div>
          <div style={{ background: D.card, border: `1px solid ${D.border}`, borderRadius: 12, height: 140 }} />
        </div>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10, background: 'rgba(13,13,18,0.85)', borderRadius: 12 }}>
          <div style={{ width: 36, height: 36, borderRadius: '50%', background: D.accentPale, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Lock size={16} strokeWidth={1.8} style={{ color: D.accent }} />
          </div>
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 700, color: D.text, marginBottom: 4 }}>Unlock practice insights</p>
            <p style={{ fontSize: 12, color: D.soft, fontFamily: 'var(--font-body)', maxWidth: 260, lineHeight: 1.5 }}>Response rate, city ranking, monthly trends and more.</p>
          </div>
          <Link href={`/practices/${practiceSlug}/upgrade`} style={{ padding: '9px 24px', borderRadius: 8, background: D.accent, color: '#0d0d12', fontSize: 13, fontWeight: 700, fontFamily: 'var(--font-body)', textDecoration: 'none' }}>
            Upgrade
          </Link>
        </div>
      </div>
    );
  }

  const maxCount = Math.max(...monthlyData.map(d => d.count), 1);
  const responseColor = responseRate >= 80 ? '#34d399' : responseRate >= 50 ? '#fbbf24' : '#f87171';

  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 12 }}>
        <div style={{ background: D.card, border: `1px solid ${D.border}`, borderRadius: 12, padding: '16px 20px' }}>
          <MicroLabel text="Response rate" />
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 800, color: responseColor, letterSpacing: '-0.03em' }}>{responseRate}%</div>
          <div style={{ marginTop: 8, height: 3, borderRadius: 2, background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${responseRate}%`, background: responseColor, borderRadius: 2 }} />
          </div>
        </div>
        <div style={{ background: D.card, border: `1px solid ${D.border}`, borderRadius: 12, padding: '16px 20px' }}>
          <MicroLabel text="City rank" />
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 800, color: D.text, letterSpacing: '-0.03em' }}>
            {cityRank > 0 ? `#${cityRank}` : '—'}
          </div>
          {cityTotal > 0 && <div style={{ fontSize: 11, color: D.xfaint, marginTop: 4, fontFamily: 'var(--font-body)' }}>of {cityTotal} practices</div>}
        </div>
        <div style={{ background: D.card, border: `1px solid ${D.border}`, borderRadius: 12, padding: '16px 20px' }}>
          <MicroLabel text="This month" />
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 800, color: D.text, letterSpacing: '-0.03em' }}>
            {monthlyData[monthlyData.length - 1]?.count ?? 0}
          </div>
          <div style={{ fontSize: 11, color: D.xfaint, marginTop: 4, fontFamily: 'var(--font-body)' }}>reviews</div>
        </div>
      </div>

      <div style={{ background: D.card, border: `1px solid ${D.border}`, borderRadius: 12, padding: '20px 24px' }}>
        <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: D.faint, fontFamily: 'var(--font-body)', marginBottom: 16 }}>
          Reviews over 6 months
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 80 }}>
          {monthlyData.map((d) => (
            <div key={d.month} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, height: '100%', justifyContent: 'flex-end' }}>
              <div style={{ fontSize: 11, color: D.faint, fontFamily: 'var(--font-body)' }}>{d.count > 0 ? d.count : ''}</div>
              <div style={{ width: '100%', borderRadius: '3px 3px 0 0', background: d.count > 0 ? D.accent : 'rgba(255,255,255,0.06)', height: d.count > 0 ? `${Math.max((d.count / maxCount) * 56, 6)}px` : '4px', transition: 'height 0.4s ease', minHeight: 4, opacity: d.count > 0 ? 0.75 : 1 }} />
              <div style={{ fontSize: 10, color: D.xfaint, fontFamily: 'var(--font-body)', whiteSpace: 'nowrap' }}>{MonthLabel(d.month)}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
