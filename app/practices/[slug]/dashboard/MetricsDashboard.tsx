'use client';

import Link from 'next/link';
import { Lock } from 'lucide-react';

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

export default function MetricsDashboard({ isPaid, practiceSlug, responseRate, cityRank, cityTotal, monthlyData }: Props) {
  if (!isPaid) {
    return (
      <div style={{ position: 'relative', marginBottom: 24 }}>
        {/* Blurred preview */}
        <div style={{ filter: 'blur(4px)', pointerEvents: 'none', userSelect: 'none', opacity: 0.6 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 12 }}>
            {[['Response rate', '72%'], ['City rank', '#3'], ['This month', '4 reviews']].map(([label, val]) => (
              <div key={label} style={{ background: 'white', border: '1.5px solid var(--cream-dark)', borderRadius: 'var(--radius)', padding: '16px 20px', boxShadow: 'var(--shadow-card)' }}>
                <div style={{ fontSize: 11, color: 'var(--ink-soft)', marginBottom: 6 }}>{label}</div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 700, color: 'var(--ink)', letterSpacing: '-0.02em' }}>{val}</div>
              </div>
            ))}
          </div>
          <div style={{ background: 'white', border: '1.5px solid var(--cream-dark)', borderRadius: 'var(--radius)', padding: '20px 24px', boxShadow: 'var(--shadow-card)', height: 140 }} />
        </div>

        {/* Upsell overlay */}
        <div style={{
          position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', gap: 12,
          background: 'rgba(248,245,240,0.85)', borderRadius: 'var(--radius)',
          backdropFilter: 'blur(2px)',
        }}>
          <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--forest-pale)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Lock size={18} strokeWidth={1.8} style={{ color: 'var(--forest)' }} />
          </div>
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700, color: 'var(--ink)', marginBottom: 4 }}>
              Unlock practice insights
            </p>
            <p style={{ fontSize: 13, color: 'var(--ink-soft)', fontFamily: 'var(--font-body)', maxWidth: 280, lineHeight: 1.5 }}>
              Response rate, city ranking, monthly trends and more.
            </p>
          </div>
          <Link
            href={`/practices/${practiceSlug}/upgrade`}
            style={{
              padding: '10px 28px', borderRadius: 50, background: 'var(--forest)',
              color: 'var(--cream)', fontSize: 13, fontWeight: 600,
              fontFamily: 'var(--font-body)', textDecoration: 'none',
            }}
          >
            Upgrade
          </Link>
        </div>
      </div>
    );
  }

  const maxCount = Math.max(...monthlyData.map(d => d.count), 1);

  return (
    <div style={{ marginBottom: 24 }}>
      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 12 }}>
        <div style={{ background: 'white', border: '1.5px solid var(--cream-dark)', borderRadius: 'var(--radius)', padding: '16px 20px', boxShadow: 'var(--shadow-card)' }}>
          <div style={{ fontSize: 11, color: 'var(--ink-soft)', marginBottom: 6 }}>Response rate</div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 700, color: responseRate >= 80 ? 'var(--forest)' : responseRate >= 50 ? 'var(--gold)' : '#e05252', letterSpacing: '-0.02em' }}>
            {responseRate}%
          </div>
          <div style={{ marginTop: 8, height: 3, borderRadius: 2, background: 'var(--cream-dark)', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${responseRate}%`, background: 'var(--forest)', borderRadius: 2 }} />
          </div>
        </div>

        <div style={{ background: 'white', border: '1.5px solid var(--cream-dark)', borderRadius: 'var(--radius)', padding: '16px 20px', boxShadow: 'var(--shadow-card)' }}>
          <div style={{ fontSize: 11, color: 'var(--ink-soft)', marginBottom: 6 }}>City rank</div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 700, color: 'var(--ink)', letterSpacing: '-0.02em' }}>
            {cityRank > 0 ? `#${cityRank}` : '—'}
          </div>
          {cityTotal > 0 && (
            <div style={{ fontSize: 11, color: 'var(--ink-faint)', marginTop: 4, fontFamily: 'var(--font-body)' }}>
              of {cityTotal} practices
            </div>
          )}
        </div>

        <div style={{ background: 'white', border: '1.5px solid var(--cream-dark)', borderRadius: 'var(--radius)', padding: '16px 20px', boxShadow: 'var(--shadow-card)' }}>
          <div style={{ fontSize: 11, color: 'var(--ink-soft)', marginBottom: 6 }}>This month</div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 700, color: 'var(--ink)', letterSpacing: '-0.02em' }}>
            {monthlyData[monthlyData.length - 1]?.count ?? 0}
          </div>
          <div style={{ fontSize: 11, color: 'var(--ink-faint)', marginTop: 4, fontFamily: 'var(--font-body)' }}>
            reviews
          </div>
        </div>
      </div>

      {/* Monthly bar chart */}
      <div style={{ background: 'white', border: '1.5px solid var(--cream-dark)', borderRadius: 'var(--radius)', padding: '20px 24px', boxShadow: 'var(--shadow-card)' }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)', fontFamily: 'var(--font-body)', marginBottom: 16 }}>
          Reviews over 6 months
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 80 }}>
          {monthlyData.map((d) => (
            <div key={d.month} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, height: '100%', justifyContent: 'flex-end' }}>
              <div style={{ fontSize: 11, color: 'var(--ink-soft)', fontFamily: 'var(--font-body)' }}>
                {d.count > 0 ? d.count : ''}
              </div>
              <div
                style={{
                  width: '100%', borderRadius: '4px 4px 0 0',
                  background: d.count > 0 ? 'var(--forest)' : 'var(--cream-dark)',
                  height: d.count > 0 ? `${Math.max((d.count / maxCount) * 56, 6)}px` : '4px',
                  transition: 'height 0.4s ease',
                  minHeight: 4,
                }}
              />
              <div style={{ fontSize: 10, color: 'var(--ink-faint)', fontFamily: 'var(--font-body)', whiteSpace: 'nowrap' }}>
                {MonthLabel(d.month)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
