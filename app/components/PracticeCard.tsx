'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export type PracticeCardData = {
  id: string;
  name: string;
  slug: string;
  city: string;
  address_line1: string;
  practice_type: string;
  website?: string | null;
  claimed_by_user_id?: string | null;
  avg_overall?: number | null;
  review_count?: number;
  avg_cleanliness?: number | null;
  avg_pain?: number | null;
  avg_cost?: number | null;
  avg_communication?: number | null;
  avg_anxiety?: number | null;
  distance_km?: number | null;
  ai_summary?: string | null;
  services?: { slug: string; name: string }[];
};

function ScoreMini({ label, value }: { label: string; value: number | null | undefined }) {
  return (
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ fontSize: 11, color: 'var(--ink-soft)', marginBottom: 3 }}>{label}</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        <div style={{ flex: 1, height: 3, borderRadius: 2, background: 'var(--cream-dark)', overflow: 'hidden' }}>
          <div style={{ height: '100%', width: value ? `${(value / 5) * 100}%` : '0%', background: 'var(--forest)', borderRadius: 2 }} />
        </div>
        <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--ink-mid)', flexShrink: 0 }}>
          {value ? Number(value).toFixed(1) : '—'}
        </span>
      </div>
    </div>
  );
}

export default function PracticeCard({ practice: p }: { practice: PracticeCardData }) {
  const router = useRouter();
  const [hovered, setHovered] = useState(false);

  const stars = p.avg_overall ? Math.round(p.avg_overall) : 0;
  const subtitle = p.address_line1 ? `${p.address_line1}, ${p.city}` : p.city;

  return (
    <div
      onClick={() => router.push(`/practices/${p.slug}`)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: 'white',
        borderRadius: 'var(--radius)',
        border: `1.5px solid ${hovered ? 'var(--forest)' : 'var(--cream-dark)'}`,
        padding: '24px 28px',
        cursor: 'pointer',
        boxShadow: hovered ? 'var(--shadow-hover)' : 'var(--shadow-card)',
        transition: 'all var(--transition)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>
        {/* Avatar */}
        <div style={{ width: 56, height: 56, borderRadius: 12, flexShrink: 0, background: 'var(--forest-pale)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--forest)' }}>
          {p.name.charAt(0).toUpperCase()}
        </div>

        {/* Info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
            <div style={{ minWidth: 0 }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 600, color: 'var(--ink)', marginBottom: 2, letterSpacing: '-0.01em', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {p.name}
              </h3>
              <p style={{ fontSize: 13, color: 'var(--ink-soft)' }}>{subtitle}</p>
            </div>

            {/* Rating */}
            <div style={{ textAlign: 'right', flexShrink: 0 }}>
              {p.avg_overall ? (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'flex-end' }}>
                    <span style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 700, color: 'var(--ink)', letterSpacing: '-0.02em' }}>
                      {Number(p.avg_overall).toFixed(1)}
                    </span>
                    <span style={{ color: 'var(--gold)', fontSize: 13, letterSpacing: '-1px' }}>
                      {'★'.repeat(stars)}{'☆'.repeat(Math.max(0, 5 - stars))}
                    </span>
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--ink-soft)', marginTop: 2 }}>
                    {p.review_count ?? 0} review{(p.review_count ?? 0) !== 1 ? 's' : ''}
                  </div>
                </>
              ) : (
                <span style={{ fontSize: 11, fontWeight: 500, padding: '4px 10px', borderRadius: 20, background: 'var(--cream-dark)', color: 'var(--ink-soft)' }}>
                  No reviews yet
                </span>
              )}
            </div>
          </div>

          {/* Badges */}
          <div style={{ display: 'flex', gap: 6, marginTop: 10, flexWrap: 'wrap', alignItems: 'center' }}>
            {p.claimed_by_user_id && (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: 11, color: 'var(--forest)', fontWeight: 600 }}>
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <circle cx="6" cy="6" r="6" fill="var(--forest)" />
                  <polyline points="3,6 5,8.5 9,3.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Verified
              </span>
            )}
            {p.distance_km != null && (
              <span style={{ fontSize: 11, color: 'var(--ink-faint)', marginLeft: 'auto' }}>
                {p.distance_km.toFixed(1)} km away
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Score bars */}
      <div style={{ display: 'flex', gap: 24, marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--cream-dark)' }}>
        {[
          { label: 'Cleanliness', value: p.avg_cleanliness },
          { label: 'Value',       value: p.avg_cost },
          { label: 'Pain',        value: p.avg_pain },
          { label: 'Staff',       value: p.avg_communication },
        ].map(({ label, value }) => (
          <ScoreMini key={label} label={label} value={value} />
        ))}
      </div>

      {p.ai_summary && (
        <p style={{ marginTop: 10, fontSize: 13, color: 'var(--ink-soft)', lineHeight: 1.5 }}>
          <span style={{ fontWeight: 600, color: 'var(--ink)' }}>Patients say: </span>
          {p.ai_summary.length > 120 ? p.ai_summary.slice(0, 120) + '…' : p.ai_summary}
        </p>
      )}
      {!p.ai_summary && (p.services ?? []).length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginTop: 10 }}>
          {(p.services ?? []).slice(0, 4).map(s => (
            <span
              key={s.slug}
              style={{ fontSize: 11, padding: '3px 8px', borderRadius: 20, background: 'var(--cream)', border: '1px solid var(--cream-dark)', color: 'var(--ink-soft)', fontFamily: 'var(--font-body)' }}
            >
              {s.name}
            </span>
          ))}
        </div>
      )}

      {/* Buttons */}
      <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
        <Link
          href={`/practices/${p.slug}`}
          onClick={(e) => e.stopPropagation()}
          style={{ flex: 1, padding: '8px', borderRadius: 8, border: '1.5px solid var(--cream-dark)', background: 'transparent', cursor: 'pointer', fontSize: 13, fontWeight: 500, color: 'var(--ink-mid)', textAlign: 'center', textDecoration: 'none', transition: 'var(--transition)' }}
        >
          See patient experience
        </Link>
        {p.website && (
          <a
            href={p.website}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            style={{ flex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 5, padding: '8px', borderRadius: 8, border: '1.5px solid var(--cream-dark)', background: 'transparent', cursor: 'pointer', fontSize: 13, fontWeight: 500, color: 'var(--ink-mid)', textDecoration: 'none', transition: 'var(--transition)' }}
          >
            <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
              <rect x="1" y="3" width="9" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.3" fill="none" />
              <path d="M8 1h5v5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M13 1L7 7" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
            </svg>
            Website
          </a>
        )}
        <Link
          href={`/practices/${p.slug}/review`}
          onClick={(e) => e.stopPropagation()}
          style={{ flex: 1, padding: '8px', borderRadius: 8, border: 'none', background: 'var(--forest)', cursor: 'pointer', fontSize: 13, fontWeight: 600, color: 'var(--cream)', textAlign: 'center', textDecoration: 'none', transition: 'var(--transition)' }}
        >
          Write a review
        </Link>
      </div>
    </div>
  );
}
