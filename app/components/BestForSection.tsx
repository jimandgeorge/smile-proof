'use client';

import { useState } from 'react';
import Link from 'next/link';

export type BestForClinic = {
  name: string;
  slug: string;
  rating: number | null;
  location: string;
  insight: string;
  isAiInsight?: boolean;
  anxietyFriendly?: boolean;
  isClaimed?: boolean;
  reviewCount?: number;
};

type Props = {
  title: string;
  subtitle: string;
  badge?: string;
  viewAllHref?: string;
  clinics: BestForClinic[];
};


export function ClinicCard({ clinic }: { clinic: BestForClinic }) {
  const [hovered, setHovered] = useState(false);
  const isClaimed   = !!clinic.isClaimed;
  const reviewCount = clinic.reviewCount ?? 0;
  const showAI      = !!clinic.isAiInsight;
  const stars       = clinic.rating ? Math.round(clinic.rating) : 0;

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
        boxShadow: hovered ? 'var(--shadow-hover)' : isClaimed ? 'var(--shadow-card)' : 'none',
        transition: 'border-color 0.15s, box-shadow 0.15s',
        height: '100%',
        boxSizing: 'border-box',
      }}
    >
      {/* Claimed badge */}
      {isClaimed && (
        <div>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 700, fontFamily: 'var(--font-body)', color: 'var(--forest)', background: 'var(--forest-pale)', border: '1px solid rgba(28,69,53,0.15)', borderRadius: 20, padding: '3px 9px' }}>
            <svg width="9" height="9" viewBox="0 0 12 12" fill="none" aria-hidden>
              <circle cx="6" cy="6" r="6" fill="var(--forest)" />
              <polyline points="3,6 5,8.5 9,3.5" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Claimed
          </span>
        </div>
      )}

      {/* Name + location */}
      <div>
        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 800, color: 'var(--ink)', margin: '0 0 4px', lineHeight: 1.2, letterSpacing: '-0.015em' }}>
          {clinic.name}
        </h3>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--ink-soft)', margin: 0 }}>
          {clinic.location}
        </p>
      </div>

      {/* Rating row */}
      {clinic.rating !== null && reviewCount > 0 ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ color: 'var(--gold)', fontSize: 14, letterSpacing: 1 }}>
            {'★'.repeat(stars)}{'☆'.repeat(Math.max(0, 5 - stars))}
          </span>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 700, color: 'var(--ink)' }}>
            {clinic.rating.toFixed(1)}
          </span>
          <span style={{ color: 'var(--ink-faint)', fontSize: 13 }}>·</span>
          <span style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--ink-soft)' }}>
            {reviewCount} verified {reviewCount === 1 ? 'review' : 'reviews'}
          </span>
        </div>
      ) : clinic.rating !== null ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ color: 'var(--gold)', fontSize: 14, letterSpacing: 1 }}>
            {'★'.repeat(stars)}{'☆'.repeat(Math.max(0, 5 - stars))}
          </span>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 700, color: 'var(--ink)' }}>
            {clinic.rating.toFixed(1)}
          </span>
        </div>
      ) : (
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--ink-faint)', margin: 0 }}>No reviews yet</p>
      )}

      {/* AI Insight */}
      {showAI ? (
        <div style={{ background: 'var(--forest-pale)', border: '1px solid rgba(28,69,53,0.12)', borderRadius: 10, padding: '12px 14px' }}>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 11, fontWeight: 800, letterSpacing: '0.07em', textTransform: 'uppercase', color: 'var(--forest)', margin: '0 0 6px' }}>
            AI Insight
          </p>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--ink-mid)', lineHeight: 1.6, fontStyle: 'italic', margin: 0 }}>
            &ldquo;{clinic.insight.length > 120 ? clinic.insight.slice(0, 120) + '…' : clinic.insight}&rdquo;
          </p>
        </div>
      ) : (
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--ink-faint)', lineHeight: 1.55, margin: 0 }}>
          {clinic.insight}
        </p>
      )}

      {/* Tags */}
      {clinic.anxietyFriendly && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--ink-mid)', background: 'var(--cream)', border: '1px solid var(--cream-dark)', borderRadius: 20, padding: '3px 10px', fontFamily: 'var(--font-body)' }}>
            Anxiety friendly
          </span>
        </div>
      )}

      {/* CTAs */}
      <div style={{ display: 'flex', gap: 8, marginTop: 'auto', paddingTop: 4 }}>
        {isClaimed && (
          <Link href={`/practices/${clinic.slug}`} style={{ flex: 1, padding: '10px 14px', background: 'var(--forest)', color: 'white', borderRadius: 9, fontSize: 13, fontWeight: 700, fontFamily: 'var(--font-body)', textAlign: 'center', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
            Book consultation
          </Link>
        )}
        <Link href={`/practices/${clinic.slug}`} style={{ flex: isClaimed ? 'none' : 1, padding: '10px 16px', background: 'white', color: 'var(--forest)', borderRadius: 9, border: '1.5px solid rgba(28,69,53,0.25)', fontSize: 13, fontWeight: 700, fontFamily: 'var(--font-body)', textAlign: 'center', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
          View profile
        </Link>
      </div>
    </div>
  );
}

export default function BestForSection({ title, subtitle, badge, viewAllHref = '/search', clinics }: Props) {
  if (clinics.length === 0) {
    return (
      <div style={{ padding: '24px 0', textAlign: 'center' }}>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--ink-soft)' }}>
          No clinics yet — we&apos;re adding practices across England.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-start justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2
              className="font-bold"
              style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(18px,2.5vw,22px)', color: 'var(--ink)', letterSpacing: '-0.02em', lineHeight: 1.2 }}
            >
              {title}
            </h2>
            {badge && (
              <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 20, background: 'var(--cream-dark)', color: 'var(--ink-soft)', fontFamily: 'var(--font-body)', whiteSpace: 'nowrap' }}>
                {badge}
              </span>
            )}
          </div>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--ink-soft)', lineHeight: 1.5 }}>
            {subtitle}
          </p>
        </div>
        <Link
          href={viewAllHref}
          style={{ fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600, color: 'var(--ink-soft)', textDecoration: 'none', whiteSpace: 'nowrap', paddingTop: 2 }}
        >
          View all →
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {clinics.slice(0, 3).map((clinic) => (
          <ClinicCard key={clinic.slug} clinic={clinic} />
        ))}
      </div>
    </div>
  );
}
