'use client';

import { useState } from 'react';
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
  nhs_accepting?: boolean | null;
};

const PRACTICE_TYPE_LABELS: Record<string, string> = {
  nhs:     'NHS',
  private: 'Private',
  mixed:   'NHS & private',
};

function StarRow({ rating, reviewCount }: { rating: number; reviewCount: number }) {
  const full  = Math.floor(rating);
  const half  = rating - full >= 0.5;
  const empty = 5 - full - (half ? 1 : 0);
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <span style={{ color: 'var(--gold)', fontSize: 14, letterSpacing: 1, lineHeight: 1 }}>
        {'★'.repeat(full)}{half ? '½' : ''}{'☆'.repeat(empty)}
      </span>
      <span style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 700, color: 'var(--ink)' }}>
        {rating.toFixed(1)}
      </span>
      <span style={{ color: 'var(--ink-faint)', fontSize: 13 }}>·</span>
      <span style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--ink-soft)' }}>
        {reviewCount} verified {reviewCount === 1 ? 'review' : 'reviews'}
      </span>
    </div>
  );
}

export default function PracticeCard({ practice: p }: { practice: PracticeCardData }) {
  const [hovered, setHovered] = useState(false);

  const isClaimed   = !!p.claimed_by_user_id;
  const reviewCount = p.review_count ?? 0;
  const showAI      = !!p.ai_summary && (reviewCount >= 5 || isClaimed);
  const typeLabel   = PRACTICE_TYPE_LABELS[p.practice_type] ?? null;

  const tags: string[] = [
    ...(p.services ?? []).slice(0, 3).map(s => s.name),
    ...(typeLabel ? [typeLabel] : []),
  ];

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: 'white',
        borderRadius: 14,
        border: `1.5px solid ${hovered ? 'rgba(28,69,53,0.4)' : isClaimed ? 'rgba(28,69,53,0.2)' : 'var(--cream-dark)'}`,
        padding: '22px 24px',
        display: 'flex',
        flexDirection: 'column',
        gap: 14,
        boxShadow: hovered ? '0 6px 24px rgba(28,69,53,0.1)' : isClaimed ? '0 2px 10px rgba(28,69,53,0.06)' : 'none',
        transition: 'border-color 0.15s, box-shadow 0.15s',
        position: 'relative',
      }}
    >

      {/* ── Claimed badge ── */}
      {isClaimed && (
        <div>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 4,
            fontSize: 11, fontWeight: 700, fontFamily: 'var(--font-body)',
            color: 'var(--forest)', background: 'var(--forest-pale)',
            border: '1px solid rgba(28,69,53,0.15)',
            borderRadius: 20, padding: '3px 9px',
          }}>
            <svg width="9" height="9" viewBox="0 0 12 12" fill="none" aria-hidden>
              <circle cx="6" cy="6" r="6" fill="var(--forest)" />
              <polyline points="3,6 5,8.5 9,3.5" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Claimed
          </span>
        </div>
      )}

      {/* ── Name + location ── */}
      <div>
        <h3 style={{
          fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 800,
          color: 'var(--ink)', margin: '0 0 4px', lineHeight: 1.2,
          letterSpacing: '-0.015em',
        }}>
          {p.name}
        </h3>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--ink-soft)', margin: 0 }}>
          {p.city}
          {p.distance_km != null && (
            <span style={{ color: 'var(--ink-faint)' }}> · {p.distance_km.toFixed(1)} km away</span>
          )}
        </p>
      </div>

      {/* ── Rating row ── */}
      {p.avg_overall && reviewCount > 0 ? (
        <StarRow rating={Number(p.avg_overall)} reviewCount={reviewCount} />
      ) : reviewCount > 0 ? (
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--ink-faint)', margin: 0 }}>
          {reviewCount} {reviewCount === 1 ? 'review' : 'reviews'}
        </p>
      ) : (
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--ink-faint)', margin: 0 }}>
          No reviews yet
        </p>
      )}

      {/* ── AI insight ── */}
      {showAI && (
        <div style={{
          background: 'var(--forest-pale)',
          border: '1px solid rgba(28,69,53,0.12)',
          borderRadius: 10,
          padding: '12px 14px',
        }}>
          <p style={{
            fontFamily: 'var(--font-body)', fontSize: 11, fontWeight: 800,
            letterSpacing: '0.07em', textTransform: 'uppercase',
            color: 'var(--forest)', margin: '0 0 6px',
          }}>
            AI Insight
          </p>
          <p style={{
            fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--ink-mid)',
            lineHeight: 1.6, fontStyle: 'italic', margin: 0,
          }}>
            &ldquo;{p.ai_summary!.length > 120 ? p.ai_summary!.slice(0, 120) + '…' : p.ai_summary}&rdquo;
          </p>
        </div>
      )}

      {/* ── Tags ── */}
      {tags.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {p.nhs_accepting === true && (
            <span style={{ fontSize: 11, fontWeight: 700, color: '#1d4ed8', background: '#dbeafe', border: '1px solid #93c5fd', borderRadius: 20, padding: '3px 9px', fontFamily: 'var(--font-body)' }}>
              NHS accepting
            </span>
          )}
          {tags.map(tag => (
            <span key={tag} style={{
              fontSize: 12, fontWeight: 500, color: 'var(--ink-mid)',
              background: 'var(--cream)', border: '1px solid var(--cream-dark)',
              borderRadius: 20, padding: '3px 10px', fontFamily: 'var(--font-body)',
            }}>
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* ── CTAs ── */}
      <div style={{ display: 'flex', gap: 8, marginTop: 2 }}>
        {isClaimed && (
          <Link
            href={`/practices/${p.slug}`}
            style={{
              flex: 1, padding: '10px 14px',
              background: 'var(--forest)', color: 'white',
              borderRadius: 9, border: 'none',
              fontSize: 13, fontWeight: 700, fontFamily: 'var(--font-body)',
              textAlign: 'center', textDecoration: 'none',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            Book consultation
          </Link>
        )}
        <Link
          href={`/practices/${p.slug}`}
          style={{
            flex: isClaimed ? 'none' : 1,
            padding: '10px 16px',
            background: 'white', color: 'var(--forest)',
            borderRadius: 9, border: '1.5px solid rgba(28,69,53,0.25)',
            fontSize: 13, fontWeight: 700, fontFamily: 'var(--font-body)',
            textAlign: 'center', textDecoration: 'none',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          View profile
        </Link>
      </div>

    </div>
  );
}
