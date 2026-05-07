'use client';

import { useState } from 'react';
import { ReviewActions } from './ReviewActions';

type Review = {
  id: string;
  title: string | null;
  body: string;
  rating_overall: number;
  verification_status: string;
  treatment_date: string | null;
  created_at: string;
  reviewer_display_name: string | null;
  helpful_count: number | null;
  treatments: { name: string } | null;
  dentists: { full_name: string; slug: string } | null;
  practice_responses: { body: string } | null;
  followup_body: string | null;
  followup_rating: number | null;
  followup_submitted_at: string | null;
};


type Practice = {
  name: string;
  address_line1: string;
  address_line2?: string | null;
  city: string;
  postcode: string;
  email?: string | null;
  phone?: string | null;
  website?: string | null;
  opening_hours?: Record<string, string> | null;
  claimed_by_user_id?: string | null;
};

type Props = {
  reviews: Review[];
  practice: Practice;
  practiceSlug: string;
};

const TABS = ['Reviews', 'About & Contact', 'Practice Responses'] as const;
type Tab = typeof TABS[number];

export default function ProfileTabs({ reviews, practice, practiceSlug }: Props) {
  const [active, setActive] = useState<Tab>('Reviews');
  const [verifiedOnly, setVerifiedOnly] = useState(false);

  const responseCount = reviews.filter((r) => r.practice_responses?.body).length;
  const verifiedCount = reviews.filter((r) => r.verification_status === 'verified').length;
  const displayedReviews = verifiedOnly
    ? reviews.filter((r) => r.verification_status === 'verified')
    : reviews;

  return (
    <div>
      <div
        style={{
          display: 'flex',
          marginBottom: 20,
          background: 'white',
          borderRadius: 'var(--radius)',
          border: '1.5px solid var(--cream-dark)',
          overflow: 'hidden',
        }}
      >
        {TABS.map((tab) => {
          const label =
            tab === 'Reviews'
              ? `Reviews (${reviews.length})`
              : tab === 'Practice Responses' && responseCount > 0
              ? `Practice Responses (${responseCount})`
              : tab;
          return (
            <button
              key={tab}
              onClick={() => setActive(tab)}
              style={{
                flex: 1,
                padding: '14px',
                border: 'none',
                borderRight: '1px solid var(--cream-dark)',
                cursor: 'pointer',
                background: active === tab ? 'var(--forest)' : 'transparent',
                color: active === tab ? 'var(--cream)' : 'var(--ink-soft)',
                fontSize: 13,
                fontWeight: 600,
                fontFamily: 'var(--font-body)',
                transition: 'all var(--transition)',
              }}
            >
              {label}
            </button>
          );
        })}
      </div>

      {active === 'Reviews' && (
        <div>
          {/* Verified filter */}
          {verifiedCount > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14, flexWrap: 'wrap' }}>
              <button
                onClick={() => setVerifiedOnly(false)}
                style={{
                  padding: '5px 12px',
                  borderRadius: 20,
                  border: '1.5px solid',
                  borderColor: !verifiedOnly ? 'var(--forest)' : 'var(--cream-dark)',
                  background: !verifiedOnly ? 'var(--forest)' : 'transparent',
                  color: !verifiedOnly ? 'var(--cream)' : 'var(--ink-soft)',
                  fontSize: 12,
                  fontWeight: 600,
                  fontFamily: 'var(--font-body)',
                  cursor: 'pointer',
                  transition: 'all var(--transition)',
                }}
              >
                All reviews ({reviews.length})
              </button>
              <button
                onClick={() => setVerifiedOnly(true)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 5,
                  padding: '5px 12px',
                  borderRadius: 20,
                  border: '1.5px solid',
                  borderColor: verifiedOnly ? 'var(--forest)' : 'var(--cream-dark)',
                  background: verifiedOnly ? 'var(--forest)' : 'transparent',
                  color: verifiedOnly ? 'var(--cream)' : 'var(--ink-soft)',
                  fontSize: 12,
                  fontWeight: 600,
                  fontFamily: 'var(--font-body)',
                  cursor: 'pointer',
                  transition: 'all var(--transition)',
                }}
              >
                <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                  <circle cx="6" cy="6" r="6" fill={verifiedOnly ? 'white' : 'var(--forest)'} />
                  <polyline points="3,6 5,8.5 9,3.5" stroke={verifiedOnly ? 'var(--forest)' : 'white'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Verified only ({verifiedCount})
              </button>
              {verifiedOnly && (
                <span style={{ fontSize: 11, color: 'var(--ink-faint)', fontFamily: 'var(--font-body)', marginLeft: 4 }}>
                  Confirmed by appointment receipt or email
                </span>
              )}
            </div>
          )}

        <ul className="space-y-4">
          {displayedReviews.length === 0 && (
            <li
              className="rounded-xl bg-white"
              style={{ border: '1.5px solid var(--cream-dark)', padding: '40px 32px', textAlign: 'center', listStyle: 'none' }}
            >
              {verifiedOnly ? (
                <>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--forest-pale)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="9" stroke="var(--forest)" strokeWidth="1.6" />
                      <path d="M9 12l2 2 4-4" stroke="var(--forest)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <p style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 600, color: 'var(--ink)', marginBottom: 6 }}>No verified reviews yet</p>
                  <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--ink-soft)', lineHeight: 1.6, maxWidth: 320, margin: '0 auto' }}>
                    Verified reviews are confirmed by appointment receipt or email. Check back soon — or view all reviews.
                  </p>
                </>
              ) : (
                <>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--forest-pale)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke="var(--forest)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <p style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 600, color: 'var(--ink)', marginBottom: 6 }}>No reviews yet</p>
                  <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--ink-soft)', lineHeight: 1.6, maxWidth: 320, margin: '0 auto 20px' }}>
                    Be the first to share your experience at this practice and help other patients make an informed choice.
                  </p>
                  <a
                    href={`/practices/${practiceSlug}/review`}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                      padding: '10px 20px',
                      borderRadius: 'var(--radius)',
                      background: 'var(--forest)',
                      color: 'var(--cream)',
                      fontSize: 13,
                      fontWeight: 600,
                      fontFamily: 'var(--font-body)',
                      textDecoration: 'none',
                    }}
                  >
                    Write a review
                  </a>
                </>
              )}
            </li>
          )}
          {displayedReviews.map((r) => (
            <li
              key={r.id}
              id={`review-${r.id}`}
              style={{
                background: 'white',
                borderRadius: 'var(--radius)',
                padding: '22px 24px',
                border: '1.5px solid var(--cream-dark)',
                              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <span style={{ color: 'var(--gold)', fontSize: 13, letterSpacing: '-0.5px' }}>
                      {'★'.repeat(r.rating_overall)}{'☆'.repeat(5 - r.rating_overall)}
                    </span>
                    <span style={{ fontSize: 11, color: 'var(--ink-soft)' }}>
                      {new Date(r.created_at).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}
                    </span>
                    {r.verification_status === 'verified' && (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: 11, color: 'var(--forest)', fontWeight: 600 }}>
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                          <circle cx="6" cy="6" r="6" fill="var(--forest)" />
                          <polyline points="3,6 5,8.5 9,3.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        Verified
                      </span>
                    )}
                  </div>
                  {r.title && (
                    <h4 style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 600, color: 'var(--ink)', letterSpacing: '-0.01em' }}>
                      {r.title}
                    </h4>
                  )}
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  {r.reviewer_display_name && (
                    <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink-mid)', marginBottom: 4 }}>
                      {r.reviewer_display_name}
                    </div>
                  )}
                  {r.treatments && (
                    <span style={{ display: 'inline-flex', alignItems: 'center', padding: '3px 8px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: 'var(--cream-dark)', color: 'var(--ink-soft)' }}>
                      {r.treatments.name}
                    </span>
                  )}
                </div>
              </div>

              <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--ink-mid)', lineHeight: 1.7, marginBottom: 8 }}>
                {r.body}
              </p>

              {r.practice_responses?.body && (
                <div
                  style={{
                    marginTop: 14,
                    paddingTop: 14,
                    borderTop: '1px solid var(--cream-dark)',
                    display: 'flex',
                    gap: 10,
                    alignItems: 'flex-start',
                  }}
                >
                  <div style={{ width: 24, height: 24, borderRadius: 6, background: 'var(--forest-pale)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <path d="M2 2h8v7H2z" stroke="var(--forest)" strokeWidth="1.2" fill="none" strokeLinejoin="round" />
                      <path d="M4 5h4M4 7h2" stroke="var(--forest)" strokeWidth="1.2" strokeLinecap="round" />
                    </svg>
                  </div>
                  <p style={{ fontSize: 12, color: 'var(--ink-soft)', lineHeight: 1.6, fontStyle: 'italic' }}>
                    <strong style={{ fontStyle: 'normal', color: 'var(--ink-mid)' }}>Practice responded:</strong>{' '}
                    {r.practice_responses.body}
                  </p>
                </div>
              )}
              {r.followup_body && r.followup_submitted_at && (
                <div
                  style={{
                    marginTop: 14,
                    paddingTop: 14,
                    borderTop: '1px solid var(--cream-dark)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                    <div
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 5,
                        fontSize: 11,
                        fontWeight: 700,
                        color: 'var(--forest)',
                        background: 'var(--forest-pale)',
                        borderRadius: 20,
                        padding: '3px 10px',
                        fontFamily: 'var(--font-body)',
                        letterSpacing: '0.04em',
                        textTransform: 'uppercase',
                      }}
                    >
                      <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                        <circle cx="6" cy="6" r="5" stroke="var(--forest)" strokeWidth="1.4" />
                        <path d="M6 3.5v2.5l1.5 1.5" stroke="var(--forest)" strokeWidth="1.2" strokeLinecap="round" />
                      </svg>
                      {(() => {
                        const months = Math.round(
                          (new Date(r.followup_submitted_at).getTime() - new Date(r.created_at).getTime()) /
                          (1000 * 60 * 60 * 24 * 30)
                        );
                        return `Updated ${months < 2 ? '1 month' : `${months} months`} later`;
                      })()}
                    </div>
                    {r.followup_rating && (
                      <span style={{ fontSize: 12, color: 'var(--gold)', letterSpacing: '-0.5px' }}>
                        {'★'.repeat(r.followup_rating)}{'☆'.repeat(5 - r.followup_rating)}
                      </span>
                    )}
                  </div>
                  <p style={{ fontSize: 13, color: 'var(--ink-soft)', fontFamily: 'var(--font-body)', lineHeight: 1.65, fontStyle: 'italic' }}>
                    {r.followup_body}
                  </p>
                </div>
              )}

              <ReviewActions
                reviewId={r.id}
                practiceSlug={practiceSlug}
                initialCount={r.helpful_count ?? 0}
              />
            </li>
          ))}
        </ul>
        </div>
      )}

      {active === 'About & Contact' && (
        <div
          className="rounded-xl bg-white p-6"
          style={{ border: '1.5px solid var(--cream-dark)', boxShadow: 'var(--shadow-card)' }}
        >
          <p
            className="text-sm leading-relaxed mb-6 italic"
            style={{ fontFamily: 'var(--font-display)', color: 'var(--ink-mid)' }}
          >
            {practice.name} is a dental practice based in {practice.city}
            {practice.claimed_by_user_id ? ', verified on SmileProof' : ''}.
          </p>

          <p
            className="mb-4"
            style={{
              fontSize: 11,
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.12em',
              color: 'var(--ink-soft)',
            }}
          >
            Contact Information
          </p>

          <div className="space-y-4">
            <ContactRow
              icon={<PinIcon />}
              label="Address"
              value={[practice.address_line1, practice.address_line2, practice.city, practice.postcode]
                .filter(Boolean)
                .join(', ')}
            />
            {practice.email && (
              <ContactRow
                icon={<MailIcon />}
                label="Email"
                value={practice.email}
                href={`mailto:${practice.email}`}
              />
            )}
            {practice.phone && (
              <ContactRow
                icon={<PhoneIcon />}
                label="Phone"
                value={practice.phone}
                href={`tel:${practice.phone.replace(/\s/g, '')}`}
              />
            )}
            {practice.opening_hours && Object.keys(practice.opening_hours).length > 0 && (
              <div className="flex gap-3 items-start">
                <div
                  className="shrink-0 flex items-center justify-center w-8 h-8 rounded-lg"
                  style={{ background: 'var(--forest-pale)', color: 'var(--forest)' }}
                >
                  <ClockIcon />
                </div>
                <div>
                  <p
                    className="mb-2"
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      letterSpacing: '0.12em',
                      color: 'var(--ink-soft)',
                    }}
                  >
                    Opening Hours
                  </p>
                  <dl className="space-y-0.5">
                    {Object.entries(practice.opening_hours).map(([day, hours]) => (
                      <div key={day} className="flex gap-3 text-sm">
                        <dt className="w-24 capitalize" style={{ color: 'var(--ink-soft)' }}>{day}</dt>
                        <dd style={{ color: 'var(--ink)' }}>{hours}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {active === 'Practice Responses' && (
        <div>
          {responseCount === 0 ? (
            <div
              className="rounded-xl bg-white p-8 text-center"
              style={{ border: '1.5px solid var(--cream-dark)' }}
            >
              <p className="text-sm" style={{ color: 'var(--ink-soft)' }}>
                No practice responses yet.
              </p>
            </div>
          ) : (
            <ul className="space-y-4">
              {reviews
                .filter((r) => r.practice_responses?.body)
                .map((r) => (
                  <li
                    key={r.id}
                    className="rounded-xl bg-white p-5"
                    style={{ border: '1.5px solid var(--cream-dark)', boxShadow: 'var(--shadow-card)' }}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span style={{ color: 'var(--gold)', fontSize: 13 }}>
                        {'★'.repeat(r.rating_overall)}{'☆'.repeat(5 - r.rating_overall)}
                      </span>
                      <span className="text-xs" style={{ color: 'var(--ink-soft)' }}>
                        {new Date(r.created_at).toLocaleDateString('en-GB')}
                      </span>
                    </div>
                    {r.title && (
                      <p className="text-sm font-semibold mb-1" style={{ color: 'var(--ink)' }}>{r.title}</p>
                    )}
                    <p className="text-sm leading-relaxed mb-3" style={{ color: 'var(--ink-mid)' }}>
                      {r.body.length > 150 ? r.body.slice(0, 150) + '…' : r.body}
                    </p>
                    <div
                      className="rounded-lg pl-4 py-3 text-sm"
                      style={{
                        background: 'var(--forest-pale)',
                        borderLeft: '3px solid var(--forest)',
                        color: 'var(--ink-mid)',
                      }}
                    >
                      <p
                        className="text-xs font-semibold uppercase tracking-wide mb-1"
                        style={{ color: 'var(--forest)' }}
                      >
                        Practice Response
                      </p>
                      {r.practice_responses!.body}
                    </div>
                  </li>
                ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

function ContactRow({
  icon,
  label,
  value,
  href,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  href?: string;
}) {
  return (
    <div className="flex gap-3 items-start">
      <div
        className="shrink-0 flex items-center justify-center w-8 h-8 rounded-lg"
        style={{ background: 'var(--forest-pale)', color: 'var(--forest)' }}
      >
        {icon}
      </div>
      <div>
        <p
          className="mb-0.5"
          style={{
            fontSize: 11,
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            color: 'var(--ink-soft)',
          }}
        >
          {label}
        </p>
        {href ? (
          <a href={href} className="text-sm" style={{ color: 'var(--forest)' }}>
            {value}
          </a>
        ) : (
          <p className="text-sm" style={{ color: 'var(--ink)' }}>{value}</p>
        )}
      </div>
    </div>
  );
}

function PinIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" stroke="currentColor" strokeWidth="2" />
      <circle cx="12" cy="9" r="2.5" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <rect x="2" y="4" width="20" height="16" rx="2" stroke="currentColor" strokeWidth="2" />
      <path d="M2 8l10 6 10-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path d="M6.62 10.79a15.05 15.05 0 006.59 6.59l2.2-2.2a1 1 0 011.01-.24c1.12.37 2.33.57 3.58.57a1 1 0 011 1V20a1 1 0 01-1 1C8.61 21 3 15.39 3 8.5a1 1 0 011-1h3.5a1 1 0 011 1c0 1.25.2 2.46.57 3.58a1 1 0 01-.25 1.01l-2.2 2.2z" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
      <path d="M12 7v5l3 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
