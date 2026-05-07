'use client';

import { useState } from 'react';
import Link from 'next/link';

export type BestForClinic = {
  name: string;
  slug: string;
  rating: number | null;
  location: string;
  insight: string;
  anxietyFriendly?: boolean;
};

type Props = {
  title: string;
  subtitle: string;
  badge?: string;
  viewAllHref?: string;
  clinics: BestForClinic[];
};

function StarIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="#f59e0b" aria-hidden>
      <path d="M6 1l1.35 2.73 3.01.44-2.18 2.12.52 3.01L6 7.93 3.3 9.3l.52-3.01L1.64 4.17l3.01-.44z" />
    </svg>
  );
}

export function ClinicCard({ clinic }: { clinic: BestForClinic }) {
  const [hovered, setHovered] = useState(false);
  const initial = clinic.name.charAt(0).toUpperCase();

  return (
    <Link
      href={`/practices/${clinic.slug}`}
      style={{ textDecoration: 'none' }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div
        className="flex flex-col h-full"
        style={{
          borderRadius: 12,
          border: `1.5px solid ${hovered ? 'var(--forest)' : 'var(--cream-dark)'}`,
          padding: 16,
          background: 'white',
          cursor: 'pointer',
          transition: 'border-color 0.15s, transform 0.15s',
          transform: hovered ? 'translateY(-2px)' : 'translateY(0)',
        }}
      >
        {/* Name row */}
        <div className="flex items-center gap-3 mb-3">
          <div
            className="shrink-0 flex items-center justify-center rounded-lg font-bold"
            style={{
              width: 36,
              height: 36,
              background: 'var(--forest-pale)',
              fontFamily: 'var(--font-display)',
              fontSize: 15,
              color: 'var(--forest)',
            }}
          >
            {initial}
          </div>
          <div className="min-w-0">
            <p
              className="font-semibold truncate"
              style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--ink)', lineHeight: 1.3 }}
            >
              {clinic.name}
            </p>
            <p
              className="truncate"
              style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--ink-soft)', lineHeight: 1.4 }}
            >
              {clinic.location}
            </p>
          </div>
        </div>

        {/* Rating */}
        {clinic.rating !== null && (
          <div className="flex items-center gap-1.5 mb-3">
            <StarIcon />
            <span style={{ fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600, color: 'var(--ink)', lineHeight: 1 }}>
              {clinic.rating.toFixed(1)}
            </span>
            <span style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--ink-faint)' }}>/ 5</span>
          </div>
        )}

        {/* Insight line */}
        <p
          className="flex-1 mb-4"
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: 13,
            color: 'var(--ink-soft)',
            lineHeight: 1.55,
            borderLeft: '2.5px solid var(--forest-pale)',
            paddingLeft: 10,
          }}
        >
          {clinic.insight}
        </p>

        {/* Anxiety-friendly badge */}
        {clinic.anxietyFriendly && (
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              padding: '3px 8px',
              borderRadius: 20,
              background: 'var(--forest-pale)',
              border: '1px solid rgba(28,69,53,0.2)',
              fontSize: 11,
              fontWeight: 600,
              color: 'var(--forest)',
              fontFamily: 'var(--font-body)',
              marginBottom: 10,
            }}
          >
            <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
              <circle cx="6" cy="6" r="5" fill="var(--forest)" />
              <path d="M3.5 6l1.8 1.8 3.2-3.2" stroke="white" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Anxiety-friendly
          </div>
        )}

        {/* CTA */}
        <div
          className="flex items-center gap-1"
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: 13,
            fontWeight: 600,
            color: hovered ? 'var(--forest)' : 'var(--ink-soft)',
            transition: 'color 0.15s',
          }}
        >
          See patient insights
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden>
            <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>
    </Link>
  );
}

export default function BestForSection({ title, subtitle, badge, viewAllHref = '/search', clinics }: Props) {
  if (clinics.length === 0) return null;

  return (
    <div>
      <div className="flex items-start justify-between gap-4 mb-5">
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
