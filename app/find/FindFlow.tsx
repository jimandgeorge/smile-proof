'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { submitFindFlow, type MatchedPractice } from './actions';

// ── Types ──────────────────────────────────────────────────────────────────────

type Step = 1 | 2 | 3 | 4 | 'results';

interface FlowState {
  treatment: string;
  treatmentLabel: string;
  postcode: string;
  nhsPrivate: 'nhs' | 'private' | 'either';
  preferences: string[];
  name: string;
  email: string;
}

// ── Treatment catalogue ────────────────────────────────────────────────────────

const TREATMENTS = [
  {
    id: 'checkup', label: 'Check-up & clean',
    subtitle: 'Routine dental care and hygiene',
    color: 'var(--forest-pale)', iconColor: 'var(--forest)',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path d="M12 3C9 3 6 5.5 6 9c0 4.5 3 8 6 12 3-4 6-7.5 6-12 0-3.5-3-6-6-6z"
          stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
        <path d="M9 9h6M12 6v6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: 'invisalign', label: 'Invisalign',
    subtitle: 'Clear aligners for straighter teeth',
    color: 'var(--forest-pale)', iconColor: 'var(--forest)',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path d="M4 6c0-1.1.9-2 2-2h12a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6z"
          stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
        <path d="M4 14c0-1.1.9-2 2-2h12a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-2z"
          stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    id: 'implants', label: 'Dental implants',
    subtitle: 'Permanent, natural-feeling tooth replacement',
    color: '#fef9ee', iconColor: '#b45309',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path d="M12 3v10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="12" cy="16" r="4" stroke="currentColor" strokeWidth="1.5" />
        <path d="M9 3h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: 'nervous', label: 'Nervous patients',
    subtitle: 'Calm, supportive care for anxious patients',
    color: '#f5f0ff', iconColor: '#7c3aed',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path d="M12 21C12 21 4 14 4 9a8 8 0 0 1 16 0c0 5-8 12-8 12z"
          stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
        <path d="M9 10l1.5 1.5L15 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    id: 'whitening', label: 'Teeth whitening',
    subtitle: 'Professional whitening for a brighter smile',
    color: '#fffbeb', iconColor: '#d97706',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
        <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.5" />
        <path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.93 4.93l2.12 2.12M16.95 16.95l2.12 2.12M4.93 19.07l2.12-2.12M16.95 7.05l2.12-2.12"
          stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: 'emergency', label: 'Emergency care',
    subtitle: 'Urgent appointments, often same-day',
    color: '#fff5f5', iconColor: '#dc2626',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path d="M12 3v9M12 15v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <circle cx="12" cy="20" r="1" fill="currentColor" />
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"
          stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    id: 'nhs', label: 'NHS dentist',
    subtitle: 'NHS-registered practices accepting patients',
    color: '#eff6ff', iconColor: '#2563eb',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path d="M12 2L3 7v6c0 5.25 3.75 10.15 9 11.35C17.25 23.15 21 18.25 21 13V7L12 2z"
          stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
        <path d="M9 12h6M12 9v6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: 'other', label: 'Not sure yet',
    subtitle: 'Tell us what you need and we\'ll help',
    color: 'var(--cream)', iconColor: 'var(--ink-soft)',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="12" cy="17" r="0.5" fill="currentColor" stroke="currentColor" strokeWidth="1" />
      </svg>
    ),
  },
];

// ── Patient priorities ─────────────────────────────────────────────────────────

const PRIORITIES = [
  {
    id: 'anxiety-friendly', label: 'Gentle with nervous patients',
    subtitle: 'Calm, patient-centred care',
    iconColor: '#7c3aed', bg: '#f5f0ff',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
          stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    id: 'payment-plans', label: 'Budget-friendly',
    subtitle: 'Transparent pricing, payment plans',
    iconColor: '#b45309', bg: '#fef9ee',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
        <rect x="2" y="6" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="1.5" />
        <path d="M2 10h20" stroke="currentColor" strokeWidth="1.5" />
        <path d="M6 15h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: 'cosmetic-expertise', label: 'Cosmetic expertise',
    subtitle: 'Aesthetic and smile-focused treatments',
    iconColor: '#db2777', bg: '#fdf2f8',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z"
          stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    id: 'fast-availability', label: 'Fast appointments',
    subtitle: 'Shorter waiting times',
    iconColor: '#0891b2', bg: '#ecfeff',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
        <path d="M12 7v5l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    id: 'nhs-options', label: 'NHS options',
    subtitle: 'NHS-registered or mixed practices',
    iconColor: '#2563eb', bg: '#eff6ff',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path d="M12 2L3 7v6c0 5.25 3.75 10.15 9 11.35C17.25 23.15 21 18.25 21 13V7L12 2z"
          stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    id: 'highly-rated', label: 'Highly rated',
    subtitle: 'Top local ratings from verified patients',
    iconColor: '#d97706', bg: '#fffbeb',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z"
          fill="currentColor" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      </svg>
    ),
  },
];

// ── Progress bar ───────────────────────────────────────────────────────────────

const STEP_PCT: Record<number, number> = { 1: 25, 2: 50, 3: 75, 4: 95 };
const STEP_TIME: Record<number, string> = {
  1: 'About 30 seconds',
  2: 'About 20 seconds',
  3: 'Almost there',
  4: 'Last step',
};

function ProgressBar({ step }: { step: number }) {
  const pct = STEP_PCT[step] ?? 25;
  return (
    <div style={{ marginBottom: 36 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--forest)', fontFamily: 'var(--font-body)' }}>
          Step {step} of 4
        </span>
        <span style={{ fontSize: 11, color: 'var(--ink-faint)', fontFamily: 'var(--font-body)' }}>
          {STEP_TIME[step]}
        </span>
      </div>
      <div style={{ height: 3, borderRadius: 2, background: 'var(--cream-dark)', overflow: 'hidden' }}>
        <div style={{
          height: '100%', width: `${pct}%`,
          background: 'linear-gradient(90deg, var(--forest) 0%, #2a5e49 100%)',
          borderRadius: 2,
          transition: 'width 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
        }} />
      </div>
    </div>
  );
}

function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 5,
        background: 'none', border: 'none', cursor: 'pointer',
        fontSize: 13, color: 'var(--ink-soft)', fontFamily: 'var(--font-body)',
        padding: '4px 0', marginBottom: 24,
        transition: 'color 0.15s',
      }}
      onMouseEnter={e => (e.currentTarget.style.color = 'var(--ink)')}
      onMouseLeave={e => (e.currentTarget.style.color = 'var(--ink-soft)')}
    >
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <path d="M9 2L4 7l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      Back
    </button>
  );
}

function StepHeading({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div style={{ marginBottom: 32 }}>
      <h1 style={{
        fontFamily: 'var(--font-display)', fontSize: 'clamp(22px, 3vw, 30px)',
        fontWeight: 800, color: 'var(--ink)', letterSpacing: '-0.025em',
        lineHeight: 1.15, marginBottom: 10,
      }}>
        {title}
      </h1>
      <p style={{ fontSize: 15, color: 'var(--ink-soft)', fontFamily: 'var(--font-body)', lineHeight: 1.6, margin: 0 }}>
        {subtitle}
      </p>
    </div>
  );
}

// ── Treatment card ─────────────────────────────────────────────────────────────

function TreatmentCard({
  id, label, subtitle, color, iconColor, icon, selected, onClick,
}: {
  id: string; label: string; subtitle: string;
  color: string; iconColor: string; icon: React.ReactNode;
  selected: boolean; onClick: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  const active = selected || hovered;

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: 'relative',
        display: 'flex', flexDirection: 'column', alignItems: 'flex-start',
        gap: 10, padding: '16px 16px 14px',
        background: selected
          ? color
          : hovered ? color : 'white',
        border: selected
          ? `2px solid ${iconColor}`
          : `1.5px solid ${hovered ? iconColor : 'var(--cream-dark)'}`,
        borderRadius: 14,
        cursor: 'pointer',
        textAlign: 'left',
        boxShadow: selected
          ? `0 0 0 4px ${iconColor}20, 0 4px 20px rgba(0,0,0,0.07)`
          : hovered
            ? '0 4px 16px rgba(0,0,0,0.07)'
            : '0 1px 4px rgba(0,0,0,0.04)',
        transform: selected ? 'scale(1.02)' : hovered ? 'scale(1.01)' : 'scale(1)',
        transition: 'all 0.18s cubic-bezier(0.4, 0, 0.2, 1)',
        outline: 'none',
      }}
    >
      {/* Checkmark badge */}
      {selected && (
        <div style={{
          position: 'absolute', top: 10, right: 10,
          width: 20, height: 20, borderRadius: '50%',
          background: iconColor,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'transform 0.2s, opacity 0.2s',
        }}>
          <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
            <path d="M2.5 6l2.5 2.5 4.5-4.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      )}

      {/* Icon */}
      <div style={{
        width: 42, height: 42, borderRadius: 11, flexShrink: 0,
        background: selected ? `${iconColor}18` : color,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: iconColor,
        border: selected ? `1px solid ${iconColor}30` : 'none',
        transition: 'background 0.18s',
      }}>
        {icon}
      </div>

      {/* Text */}
      <div>
        <div style={{
          fontSize: 13, fontWeight: 700, color: selected ? 'var(--ink)' : 'var(--ink)',
          fontFamily: 'var(--font-body)', lineHeight: 1.3, marginBottom: 3,
        }}>
          {label}
        </div>
        <div style={{
          fontSize: 11, color: selected ? 'var(--ink-mid)' : 'var(--ink-faint)',
          fontFamily: 'var(--font-body)', lineHeight: 1.4,
          transition: 'color 0.18s',
        }}>
          {subtitle}
        </div>
      </div>
    </button>
  );
}

// ── Priority card ──────────────────────────────────────────────────────────────

function PriorityCard({
  id, label, subtitle, iconColor, bg, icon, selected, onClick,
}: {
  id: string; label: string; subtitle: string;
  iconColor: string; bg: string; icon: React.ReactNode;
  selected: boolean; onClick: () => void;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: 'relative',
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '14px 16px',
        background: selected ? bg : hovered ? bg : 'white',
        border: selected
          ? `2px solid ${iconColor}`
          : `1.5px solid ${hovered ? iconColor : 'var(--cream-dark)'}`,
        borderRadius: 12, cursor: 'pointer', textAlign: 'left',
        boxShadow: selected
          ? `0 0 0 3px ${iconColor}18, 0 2px 12px rgba(0,0,0,0.06)`
          : hovered ? '0 2px 12px rgba(0,0,0,0.06)' : '0 1px 3px rgba(0,0,0,0.03)',
        transition: 'all 0.18s cubic-bezier(0.4, 0, 0.2, 1)',
        outline: 'none',
      }}
    >
      <div style={{
        width: 38, height: 38, borderRadius: 9, flexShrink: 0,
        background: selected ? `${iconColor}18` : bg,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: iconColor,
        border: selected ? `1px solid ${iconColor}25` : 'none',
        transition: 'background 0.18s',
      }}>
        {icon}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink)', fontFamily: 'var(--font-body)', lineHeight: 1.3 }}>
          {label}
        </div>
        <div style={{ fontSize: 11, color: 'var(--ink-faint)', fontFamily: 'var(--font-body)', marginTop: 1 }}>
          {subtitle}
        </div>
      </div>
      {selected && (
        <div style={{
          width: 18, height: 18, borderRadius: '50%', flexShrink: 0,
          background: iconColor,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
            <path d="M2.5 6l2.5 2.5 4.5-4.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      )}
    </button>
  );
}

// ── Match card ─────────────────────────────────────────────────────────────────

function MatchCard({ p }: { p: MatchedPractice }) {
  const stars = p.avg_overall ? Math.round(p.avg_overall) : 0;
  return (
    <div style={{
      background: 'white',
      border: `1.5px solid ${p.claimed ? 'rgba(28,69,53,0.22)' : 'var(--cream-dark)'}`,
      borderTop: p.claimed ? '3px solid var(--forest)' : `1.5px solid var(--cream-dark)`,
      borderRadius: 14,
      padding: p.claimed ? '18px 20px 20px' : '18px 20px',
      display: 'flex', flexDirection: 'column', gap: 12,
      boxShadow: p.claimed ? '0 2px 12px rgba(28,69,53,0.08)' : '0 1px 4px rgba(0,0,0,0.04)',
      transition: 'box-shadow 0.15s',
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
        <div style={{
          width: 40, height: 40, borderRadius: 10, flexShrink: 0,
          background: p.claimed ? 'var(--forest)' : 'var(--forest-pale)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 15, fontWeight: 700, fontFamily: 'var(--font-display)',
          color: p.claimed ? 'white' : 'var(--forest)', overflow: 'hidden',
        }}>
          {p.logo_url
            ? <img src={p.logo_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            : p.name.charAt(0).toUpperCase()}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{
            fontSize: 15, fontWeight: 700, color: 'var(--ink)',
            fontFamily: 'var(--font-display)', margin: 0,
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {p.name}
          </p>
          <p style={{ fontSize: 12, color: 'var(--ink-soft)', margin: '2px 0 0', fontFamily: 'var(--font-body)' }}>
            {p.address_line1 ? `${p.address_line1}, ${p.city}` : p.city}
          </p>
        </div>
        {p.avg_overall != null && (
          <div style={{ flexShrink: 0, textAlign: 'right' }}>
            <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--ink)', fontFamily: 'var(--font-display)', lineHeight: 1 }}>
              {p.avg_overall.toFixed(1)}
            </div>
            <div style={{ fontSize: 10, color: '#f59e0b', letterSpacing: '-0.5px', marginTop: 1 }}>
              {'★'.repeat(stars)}{'☆'.repeat(Math.max(0, 5 - stars))}
            </div>
          </div>
        )}
      </div>

      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {p.claimed && (
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 3,
            fontSize: 10, fontWeight: 700, color: 'var(--forest)',
            background: 'var(--forest-pale)', border: '1px solid rgba(28,69,53,0.15)',
            borderRadius: 20, padding: '2px 8px', fontFamily: 'var(--font-body)',
          }}>
            <svg width="8" height="8" viewBox="0 0 12 12" fill="none">
              <circle cx="6" cy="6" r="6" fill="var(--forest)" />
              <polyline points="3,6 5,8.5 9,3.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Verified practice
          </span>
        )}
        {p.review_count > 0 && (
          <span style={{ fontSize: 11, color: 'var(--ink-faint)', fontFamily: 'var(--font-body)', display: 'flex', alignItems: 'center' }}>
            {p.review_count} patient {p.review_count === 1 ? 'review' : 'reviews'}
          </span>
        )}
      </div>

      <p style={{
        fontSize: 13, color: 'var(--ink-mid)', lineHeight: 1.6,
        fontFamily: 'var(--font-body)', margin: 0, fontStyle: 'italic', flex: 1,
        borderLeft: '2px solid var(--cream-dark)', paddingLeft: 10,
      }}>
        &ldquo;{p.insight}&rdquo;
      </p>

      <Link
        href={`/practices/${p.slug}`}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
          background: p.claimed ? 'var(--forest)' : 'var(--forest-pale)',
          color: p.claimed ? 'white' : 'var(--forest)',
          border: 'none', borderRadius: 9,
          padding: '11px 14px',
          fontSize: 13, fontWeight: 700,
          fontFamily: 'var(--font-body)', textDecoration: 'none',
          transition: 'opacity 0.15s',
        }}
        onMouseEnter={e => (e.currentTarget.style.opacity = '0.88')}
        onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
      >
        {p.claimed ? 'Request a consultation' : 'View practice profile'}
        <svg width="11" height="11" viewBox="0 0 12 12" fill="none" aria-hidden>
          <path d="M2.5 6h7M7 3.5L9.5 6 7 8.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </Link>
    </div>
  );
}

// ── Input style ────────────────────────────────────────────────────────────────

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '13px 16px',
  border: '1.5px solid var(--cream-dark)', borderRadius: 10,
  fontSize: 15, fontFamily: 'var(--font-body)',
  color: 'var(--ink)', background: 'white', boxSizing: 'border-box',
  outline: 'none', transition: 'border-color 0.15s',
};

// ── Main component ─────────────────────────────────────────────────────────────

export default function FindFlow({ initialTreatment }: { initialTreatment?: string }) {
  const matchingTreatment = TREATMENTS.find(t => t.id === initialTreatment);

  const [step, setStep] = useState<Step>(matchingTreatment ? 2 : 1);
  const [state, setState] = useState<FlowState>({
    treatment:      matchingTreatment?.id ?? '',
    treatmentLabel: matchingTreatment?.label ?? '',
    postcode:       '',
    nhsPrivate:     'either',
    preferences:    [],
    name:           '',
    email:          '',
  });
  const [matches, setMatches] = useState<MatchedPractice[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function set(patch: Partial<FlowState>) {
    setState(s => ({ ...s, ...patch }));
  }

  function selectTreatment(id: string, label: string) {
    set({ treatment: id, treatmentLabel: label });
    setTimeout(() => setStep(2), 120);
  }

  function togglePreference(id: string) {
    set({
      preferences: state.preferences.includes(id)
        ? state.preferences.filter(p => p !== id)
        : [...state.preferences, id],
    });
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await submitFindFlow({
        name:           state.name,
        email:          state.email,
        treatment:      state.treatment || undefined,
        treatmentLabel: state.treatmentLabel || undefined,
        postcode:       state.postcode || undefined,
        nhsPrivate:     state.nhsPrivate === 'either' ? undefined : state.nhsPrivate,
        preferences:    state.preferences.length > 0 ? state.preferences : undefined,
      });
      if (result.error) {
        setError(result.error);
      } else {
        setMatches(result.matches ?? []);
        setStep('results');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });
  }

  const stepNum = step === 'results' ? 4 : (step as number);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--cream)', paddingBottom: 80 }}>

      {/* ── Hero area ── */}
      <div style={{
        background: 'linear-gradient(180deg, white 0%, var(--cream) 100%)',
        borderBottom: '1px solid var(--cream-dark)',
        padding: '48px 20px 40px',
        textAlign: 'center',
      }}>
        <p style={{
          display: 'inline-block', fontSize: 11, fontWeight: 700, letterSpacing: '0.12em',
          textTransform: 'uppercase', color: 'var(--forest)',
          background: 'var(--forest-pale)', borderRadius: 20,
          padding: '4px 12px', marginBottom: 16, fontFamily: 'var(--font-body)',
        }}>
          Patient matching
        </p>
        <h1 style={{
          fontFamily: 'var(--font-display)', fontSize: 'clamp(26px, 4vw, 38px)',
          fontWeight: 800, color: 'var(--ink)', letterSpacing: '-0.03em',
          lineHeight: 1.1, margin: '0 0 14px', maxWidth: 560, marginLeft: 'auto', marginRight: 'auto',
        }}>
          Find the right dentist
          <br />
          <span style={{ color: 'var(--forest)' }}>for your needs</span>
        </h1>
        <p style={{
          fontSize: 16, color: 'var(--ink-soft)', fontFamily: 'var(--font-body)',
          margin: '0 auto', lineHeight: 1.6, maxWidth: 440,
        }}>
          Answer a few quick questions and we'll match you with suitable clinics nearby.
        </p>
      </div>

      <div style={{ padding: '40px 20px 0' }}>

        {/* ── STEP 1: Treatment ── */}
        {step === 1 && (
          <div style={{ maxWidth: 740, margin: '0 auto' }}>
            <ProgressBar step={1} />
            <StepHeading
              title="What brings you in?"
              subtitle="Choose the treatment or situation that fits — we'll do the matching from here."
            />

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(162px, 1fr))', gap: 12 }}>
              {TREATMENTS.map(t => (
                <TreatmentCard
                  key={t.id}
                  {...t}
                  selected={state.treatment === t.id}
                  onClick={() => selectTreatment(t.id, t.label)}
                />
              ))}
            </div>

            {/* Trust statement */}
            <div style={{
              marginTop: 28, padding: '14px 18px',
              background: 'white', border: '1px solid var(--cream-dark)',
              borderRadius: 10, display: 'flex', alignItems: 'center', gap: 10,
            }}>
              <div style={{
                width: 32, height: 32, borderRadius: '50%',
                background: 'var(--forest-pale)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>
                <svg width="14" height="14" viewBox="0 0 20 20" fill="none">
                  <path d="M10 2L3 5.5v5c0 4.75 3 8.5 7 9.5 4-1 7-4.75 7-9.5v-5L10 2z"
                    fill="var(--forest-pale)" stroke="var(--forest)" strokeWidth="1.4" strokeLinejoin="round" />
                  <path d="M7 10l2 2 4-4" stroke="var(--forest)" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <p style={{ fontSize: 13, color: 'var(--ink-soft)', fontFamily: 'var(--font-body)', margin: 0, lineHeight: 1.5 }}>
                We match based on <strong style={{ color: 'var(--ink-mid)', fontWeight: 600 }}>patient reviews</strong>, treatment experience, and verified ratings — not paid placements.
              </p>
            </div>
          </div>
        )}

        {/* ── STEP 2: Priorities ── */}
        {step === 2 && (
          <div style={{ maxWidth: 680, margin: '0 auto' }}>
            <ProgressBar step={2} />
            <BackButton onClick={() => setStep(1)} />
            <StepHeading
              title="What matters most to you?"
              subtitle="Select all that apply — we'll prioritise practices that match your needs."
            />

            {/* Selected treatment echo */}
            {state.treatmentLabel && (
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                background: 'white', border: '1px solid var(--cream-dark)',
                borderRadius: 20, padding: '5px 12px', marginBottom: 24,
              }}>
                <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                  <circle cx="6" cy="6" r="5" fill="var(--forest)" opacity="0.2" />
                  <path d="M3.5 6l2 2 3.5-3.5" stroke="var(--forest)" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span style={{ fontSize: 12, color: 'var(--ink-mid)', fontFamily: 'var(--font-body)', fontWeight: 500 }}>
                  {state.treatmentLabel}
                </span>
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 28 }}>
              {PRIORITIES.map(p => (
                <PriorityCard
                  key={p.id}
                  {...p}
                  selected={state.preferences.includes(p.id)}
                  onClick={() => togglePreference(p.id)}
                />
              ))}
            </div>

            <button
              onClick={() => setStep(3)}
              style={{
                width: '100%', padding: '14px',
                background: 'var(--forest)', color: 'white',
                border: 'none', borderRadius: 10,
                fontSize: 15, fontWeight: 700,
                fontFamily: 'var(--font-body)', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
                transition: 'opacity 0.15s',
              }}
              onMouseEnter={e => (e.currentTarget.style.opacity = '0.9')}
              onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
            >
              {state.preferences.length > 0
                ? `Continue with ${state.preferences.length} priorit${state.preferences.length === 1 ? 'y' : 'ies'}`
                : 'Continue — any practice is fine'}
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
                <path d="M3 7h8M7 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>

            <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--ink-faint)', fontFamily: 'var(--font-body)', marginTop: 12 }}>
              No preference? Just continue — we'll find highly-rated practices regardless.
            </p>
          </div>
        )}

        {/* ── STEP 3: Location ── */}
        {step === 3 && (
          <div style={{ maxWidth: 540, margin: '0 auto' }}>
            <ProgressBar step={3} />
            <BackButton onClick={() => setStep(2)} />
            <StepHeading
              title="Where are you based?"
              subtitle="We'll surface practices near you. Your postcode stays private."
            />

            <div style={{
              background: 'white', border: '1.5px solid var(--cream-dark)',
              borderRadius: 16, padding: '28px 28px 24px',
              boxShadow: '0 2px 16px rgba(0,0,0,0.04)',
            }}>
              <div style={{ marginBottom: 22 }}>
                <label style={{
                  display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--ink-soft)',
                  marginBottom: 8, fontFamily: 'var(--font-body)',
                  letterSpacing: '0.05em', textTransform: 'uppercase',
                }}>
                  Your postcode <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(optional)</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. SW1A 1AA"
                  value={state.postcode}
                  onChange={e => set({ postcode: e.target.value })}
                  style={inputStyle}
                  onFocus={e => (e.currentTarget.style.borderColor = 'var(--forest)')}
                  onBlur={e => (e.currentTarget.style.borderColor = 'var(--cream-dark)')}
                />
              </div>

              <div>
                <label style={{
                  display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--ink-soft)',
                  marginBottom: 10, fontFamily: 'var(--font-body)',
                  letterSpacing: '0.05em', textTransform: 'uppercase',
                }}>
                  NHS or private?
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                  {([
                    { id: 'nhs',     label: 'NHS',    sub: 'Subsidised care' },
                    { id: 'private', label: 'Private', sub: 'Full range of treatments' },
                    { id: 'either',  label: 'Either',  sub: 'No preference' },
                  ] as const).map(({ id, label, sub }) => (
                    <button
                      key={id}
                      onClick={() => set({ nhsPrivate: id })}
                      style={{
                        padding: '11px 8px',
                        borderRadius: 10, cursor: 'pointer',
                        textAlign: 'center',
                        border: `1.5px solid ${state.nhsPrivate === id ? 'var(--forest)' : 'var(--cream-dark)'}`,
                        background: state.nhsPrivate === id ? 'var(--forest-pale)' : 'white',
                        transition: 'all 0.15s',
                        outline: 'none',
                      }}
                    >
                      <div style={{
                        fontSize: 13, fontWeight: 700,
                        fontFamily: 'var(--font-body)',
                        color: state.nhsPrivate === id ? 'var(--forest)' : 'var(--ink)',
                      }}>
                        {label}
                      </div>
                      <div style={{
                        fontSize: 10, fontFamily: 'var(--font-body)',
                        color: state.nhsPrivate === id ? 'var(--forest)' : 'var(--ink-faint)',
                        marginTop: 2,
                      }}>
                        {sub}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button
              onClick={() => setStep(4)}
              style={{
                width: '100%', marginTop: 20, padding: '14px',
                background: 'var(--forest)', color: 'white',
                border: 'none', borderRadius: 10,
                fontSize: 15, fontWeight: 700,
                fontFamily: 'var(--font-body)', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
                transition: 'opacity 0.15s',
              }}
              onMouseEnter={e => (e.currentTarget.style.opacity = '0.9')}
              onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
            >
              Continue
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
                <path d="M3 7h8M7 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        )}

        {/* ── STEP 4: Contact ── */}
        {step === 4 && (
          <div style={{ maxWidth: 480, margin: '0 auto' }}>
            <ProgressBar step={4} />
            <BackButton onClick={() => setStep(3)} />
            <StepHeading
              title="Almost there — get your matches"
              subtitle="Where should we send your personalised shortlist?"
            />

            <div style={{
              background: 'white', border: '1.5px solid var(--cream-dark)',
              borderRadius: 16, padding: '28px 28px 24px',
              boxShadow: '0 2px 16px rgba(0,0,0,0.04)',
            }}>
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--ink-soft)', marginBottom: 8, fontFamily: 'var(--font-body)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                    Your first name
                  </label>
                  <input
                    type="text" required
                    placeholder="First name"
                    value={state.name}
                    onChange={e => set({ name: e.target.value })}
                    style={inputStyle}
                    onFocus={e => (e.currentTarget.style.borderColor = 'var(--forest)')}
                    onBlur={e => (e.currentTarget.style.borderColor = 'var(--cream-dark)')}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--ink-soft)', marginBottom: 8, fontFamily: 'var(--font-body)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                    Email address
                  </label>
                  <input
                    type="email" required
                    placeholder="you@example.com"
                    value={state.email}
                    onChange={e => set({ email: e.target.value })}
                    style={inputStyle}
                    onFocus={e => (e.currentTarget.style.borderColor = 'var(--forest)')}
                    onBlur={e => (e.currentTarget.style.borderColor = 'var(--cream-dark)')}
                  />
                </div>

                {/* Choices summary */}
                {(state.treatmentLabel || state.postcode || state.preferences.length > 0) && (
                  <div style={{
                    background: 'var(--cream)', border: '1px solid var(--cream-dark)',
                    borderRadius: 10, padding: '12px 14px',
                  }}>
                    <p style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--ink-faint)', fontFamily: 'var(--font-body)', margin: '0 0 8px' }}>
                      Your match profile
                    </p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {state.treatmentLabel && (
                        <Chip label={state.treatmentLabel} />
                      )}
                      {state.postcode && (
                        <Chip label={`Near ${state.postcode.toUpperCase()}`} />
                      )}
                      {state.nhsPrivate !== 'either' && (
                        <Chip label={state.nhsPrivate === 'nhs' ? 'NHS' : 'Private'} />
                      )}
                      {state.preferences.slice(0, 3).map(id => {
                        const p = PRIORITIES.find(x => x.id === id);
                        return p ? <Chip key={id} label={p.label} /> : null;
                      })}
                    </div>
                  </div>
                )}

                {error && (
                  <p style={{ fontSize: 13, color: '#dc2626', fontFamily: 'var(--font-body)', margin: 0 }}>{error}</p>
                )}

                <button
                  type="submit"
                  disabled={isPending}
                  style={{
                    width: '100%', padding: '15px',
                    background: isPending ? 'var(--forest-pale)' : 'var(--forest)',
                    color: isPending ? 'var(--forest)' : 'white',
                    border: 'none', borderRadius: 10,
                    fontSize: 15, fontWeight: 700,
                    fontFamily: 'var(--font-body)',
                    cursor: isPending ? 'not-allowed' : 'pointer',
                    transition: 'all 0.15s',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
                  }}
                >
                  {isPending
                    ? (
                      <>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ animation: 'spin 0.8s linear infinite' }}>
                          <circle cx="12" cy="12" r="9" stroke="var(--forest)" strokeWidth="2.5" strokeDasharray="28 56" />
                        </svg>
                        Finding your best matches…
                      </>
                    )
                    : (
                      <>
                        Show my {state.treatmentLabel ? state.treatmentLabel.toLowerCase() : ''} matches
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
                          <path d="M3 7h8M7 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </>
                    )
                  }
                </button>

                <p style={{ fontSize: 11, color: 'var(--ink-faint)', fontFamily: 'var(--font-body)', textAlign: 'center', margin: 0, lineHeight: 1.5 }}>
                  No spam — your details are only shared with the practices we match you with.
                </p>
              </form>
            </div>
          </div>
        )}

        {/* ── RESULTS ── */}
        {step === 'results' && (
          <div style={{ maxWidth: 940, margin: '0 auto' }}>
            {/* Results header */}
            <div style={{ textAlign: 'center', marginBottom: 36 }}>
              <div style={{
                width: 52, height: 52, borderRadius: '50%',
                background: 'var(--forest-pale)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 16px',
                border: '2px solid rgba(28,69,53,0.15)',
              }}>
                <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                  <path d="M4 11l5 5L18 6" stroke="var(--forest)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <h1 style={{
                fontFamily: 'var(--font-display)', fontSize: 'clamp(22px, 3vw, 30px)',
                fontWeight: 800, color: 'var(--ink)', letterSpacing: '-0.025em',
                lineHeight: 1.15, marginBottom: 10,
              }}>
                {matches.length > 0
                  ? `${matches.length === 1 ? 'Your top match' : `Your ${matches.length} best matches`}`
                  : 'Practices to explore'}
              </h1>
              <p style={{ fontSize: 14, color: 'var(--ink-soft)', fontFamily: 'var(--font-body)', lineHeight: 1.6, maxWidth: 440, margin: '0 auto' }}>
                {state.treatmentLabel
                  ? `Matched for ${state.treatmentLabel.toLowerCase()}${state.postcode ? ` near ${state.postcode.toUpperCase()}` : ''} — sorted by rating and patient reviews`
                  : 'Sorted by rating and verified review count'}
              </p>
            </div>

            {matches.length > 0 ? (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
                  {matches.map((p, i) => (
                    <MatchCard key={p.id} p={p} />
                  ))}
                </div>
                <div style={{ textAlign: 'center', marginTop: 28 }}>
                  <Link
                    href={state.treatment ? `/search?q=${encodeURIComponent(state.treatmentLabel)}` : '/search'}
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: 6,
                      fontSize: 13, fontWeight: 600, color: 'var(--forest)',
                      fontFamily: 'var(--font-body)', textDecoration: 'none',
                      padding: '11px 20px',
                      background: 'white', border: '1.5px solid var(--cream-dark)',
                      borderRadius: 10,
                    }}
                  >
                    Browse all matching practices
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <path d="M2.5 6h7M7 3.5L9.5 6 7 8.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </Link>
                </div>
              </>
            ) : (
              <div style={{
                textAlign: 'center', padding: '48px 24px',
                background: 'white', borderRadius: 16,
                border: '1.5px solid var(--cream-dark)',
              }}>
                <p style={{ fontSize: 15, color: 'var(--ink-soft)', fontFamily: 'var(--font-body)', marginBottom: 20 }}>
                  We couldn't find an exact match — try browsing all practices.
                </p>
                <Link
                  href="/search"
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                    background: 'var(--forest)', color: 'white',
                    borderRadius: 10, padding: '12px 22px',
                    fontWeight: 700, fontSize: 14, textDecoration: 'none',
                    fontFamily: 'var(--font-body)',
                  }}
                >
                  Browse all practices
                </Link>
              </div>
            )}

            <div style={{ textAlign: 'center', marginTop: 32 }}>
              <button
                onClick={() => {
                  setState({ treatment: '', treatmentLabel: '', postcode: '', nhsPrivate: 'either', preferences: [], name: state.name, email: state.email });
                  setStep(1);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  fontSize: 13, color: 'var(--ink-faint)',
                  fontFamily: 'var(--font-body)', textDecoration: 'underline',
                }}
              >
                Start a new search
              </button>
            </div>
          </div>
        )}

        {/* ── Trust footer ── */}
        {step !== 'results' && (
          <div style={{
            maxWidth: 540, margin: '32px auto 0',
            display: 'flex', justifyContent: 'center', gap: 28, flexWrap: 'wrap',
          }}>
            {[
              'Verified patient reviews',
              'No spam — ever',
              'Free to use',
            ].map(text => (
              <span key={text} style={{
                display: 'inline-flex', alignItems: 'center', gap: 5,
                fontSize: 12, color: 'var(--ink-faint)', fontFamily: 'var(--font-body)',
              }}>
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <circle cx="6" cy="6" r="5" fill="var(--forest)" opacity="0.2" />
                  <path d="M3.5 6l2 2 3.5-3.5" stroke="var(--forest)" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                {text}
              </span>
            ))}
          </div>
        )}

      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

// ── Summary chip ───────────────────────────────────────────────────────────────

function Chip({ label }: { label: string }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      fontSize: 11, color: 'var(--ink-mid)', fontFamily: 'var(--font-body)',
      background: 'white', border: '1px solid var(--cream-dark)',
      borderRadius: 20, padding: '3px 9px',
    }}>
      <svg width="8" height="8" viewBox="0 0 10 10" fill="none">
        <circle cx="5" cy="5" r="4" fill="var(--forest)" opacity="0.2" />
        <path d="M3 5l1.5 1.5 2.5-2.5" stroke="var(--forest)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      {label}
    </span>
  );
}
