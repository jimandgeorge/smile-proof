'use client';

import { useState } from 'react';
import PracticeCard, { PracticeCardData } from './PracticeCard';

export default function HomeListings({ practices }: { practices: PracticeCardData[] }) {
  const [sort, setSort] = useState<'rating' | 'reviews'>('rating');

  const filtered = [...practices].sort((a, b) => {
    if (sort === 'rating') return (b.avg_overall ?? 0) - (a.avg_overall ?? 0);
    return (b.review_count ?? 0) - (a.review_count ?? 0);
  });

  return (
    <div>
      {/* Sort bar */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginBottom: 24, gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 13, color: 'var(--ink-soft)', fontFamily: 'var(--font-body)' }}>Sort:</span>
          {(['rating', 'reviews'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setSort(s)}
              style={{
                padding: '5px 12px',
                borderRadius: 20,
                border: 'none',
                background: sort === s ? 'var(--cream-dark)' : 'transparent',
                color: sort === s ? 'var(--ink)' : 'var(--ink-soft)',
                fontSize: 13,
                cursor: 'pointer',
                fontFamily: 'var(--font-body)',
                fontWeight: sort === s ? 600 : 400,
              }}
            >
              {s === 'rating' ? 'Top Rated' : 'Most Reviewed'}
            </button>
          ))}
        </div>
      </div>

      {/* Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {filtered.length === 0 && (
          <p style={{ fontSize: 14, padding: '32px 0', textAlign: 'center', color: 'var(--ink-soft)' }}>
            No practices found.
          </p>
        )}
        {filtered.map((p) => (
          <PracticeCard key={p.id} practice={p} />
        ))}
      </div>
    </div>
  );
}
