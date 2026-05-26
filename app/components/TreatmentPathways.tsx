'use client';

import { useRef } from 'react';

const TREATMENTS = [
  {
    q: 'checkup',
    label: 'Check-up & clean',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path d="M12 3C9 3 6 5.5 6 9c0 4.5 3 8 6 12 3-4 6-7.5 6-12 0-3.5-3-6-6-6z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
        <path d="M9 9h6M12 6v6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    q: 'invisalign',
    label: 'Invisalign',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path d="M4 6c0-1.1.9-2 2-2h12a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
        <path d="M4 14c0-1.1.9-2 2-2h12a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-2z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    q: 'implants',
    label: 'Implants',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path d="M12 3v10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="12" cy="16" r="4" stroke="currentColor" strokeWidth="1.5" />
        <path d="M9 3h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    q: 'nervous',
    label: 'Nervous patients',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path d="M12 21C12 21 4 14 4 9a8 8 0 0 1 16 0c0 5-8 12-8 12z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
        <path d="M9 10l1.5 1.5L15 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    q: 'whitening',
    label: 'Whitening',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden>
        <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.5" />
        <path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.93 4.93l2.12 2.12M16.95 16.95l2.12 2.12M4.93 19.07l2.12-2.12M16.95 7.05l2.12-2.12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    q: 'emergency',
    label: 'Emergency',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path d="M12 3v9M12 15v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <circle cx="12" cy="20" r="1" fill="currentColor" stroke="currentColor" strokeWidth="1" />
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    q: 'nhs',
    label: 'NHS dentist',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path d="M12 2L3 7v6c0 5.25 3.75 10.15 9 11.35C17.25 23.15 21 18.25 21 13V7L12 2z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
        <path d="M9 12h6M12 9v6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    q: 'veneers',
    label: 'Veneers',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path d="M5 7h14l-1.5 10a2 2 0 0 1-2 1.5h-7a2 2 0 0 1-2-1.5L5 7z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
        <path d="M3 7h18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    q: 'bonding',
    label: 'Composite bonding',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path d="M9 4C8 4 7 5 7 7.5c0 3 1.5 5.5 2.5 8h5c1-2.5 2.5-5 2.5-8C17 5 16 4 15 4H9z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
        <path d="M15 3l2 2-4.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M17 5l1-1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    q: 'gum',
    label: 'Gum treatment',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path d="M9 3C8 3 7 4 7 7c0 3 1.5 5.5 2.5 8h5C15.5 12.5 17 10 17 7c0-3-1-4-2-4H9z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
        <path d="M5 13.5c1.5 0 2 1.5 3.5 1.5s2-1.5 3.5-1.5 2 1.5 3.5 1.5 2-1.5 3.5-1.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    q: 'children',
    label: "Children's",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path d="M9 5C8 5 7 6 7 8.5c0 2.5 1 4.5 2 7.5h6c1-3 2-5 2-7.5C17 6 16 5 15 5H9z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
        <path d="M12 1.5l.6 1.7 1.9.6-1.9.6L12 6.3l-.6-1.9L9.5 3.8l1.9-.6z" fill="currentColor" opacity=".65" />
      </svg>
    ),
  },
];

const SCROLL_BY = 320;

export default function TreatmentPathways() {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: 'left' | 'right') => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: dir === 'right' ? SCROLL_BY : -SCROLL_BY, behavior: 'smooth' });
    }
  };

  return (
    <section style={{ background: 'white', borderBottom: '1px solid var(--cream-dark)' }}>
      <div className="mx-auto px-5" style={{ maxWidth: 1200, paddingTop: 28, paddingBottom: 28 }}>

        {/* Header row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(16px,2vw,20px)', fontWeight: 700, color: 'var(--ink)', letterSpacing: '-0.02em', margin: 0 }}>
            What are you looking for?
          </h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button
              onClick={() => scroll('left')}
              aria-label="Scroll left"
              style={{ width: 34, height: 34, borderRadius: '50%', border: '1.5px solid var(--cream-dark)', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--ink-soft)', flexShrink: 0 }}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M9 11L5 7l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </button>
            <button
              onClick={() => scroll('right')}
              aria-label="Scroll right"
              style={{ width: 34, height: 34, borderRadius: '50%', border: '1.5px solid var(--cream-dark)', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--ink-soft)', flexShrink: 0 }}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M5 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </button>
            <a
              href="/find"
              style={{ fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600, color: 'var(--ink)', border: '1.5px solid var(--cream-dark)', borderRadius: 20, padding: '6px 16px', textDecoration: 'none', whiteSpace: 'nowrap', background: 'white' }}
            >
              See more
            </a>
          </div>
        </div>

        {/* Scrollable row */}
        <div
          ref={scrollRef}
          className="treatment-scroll"
          style={{ display: 'flex', gap: 8, overflowX: 'auto', scrollbarWidth: 'none', paddingBottom: 4 }}
        >
          {TREATMENTS.map(({ q, label, icon }) => (
            <a
              key={q}
              href={`/find?treatment=${encodeURIComponent(q)}`}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, padding: '16px 12px', minWidth: 96, flexShrink: 0, textDecoration: 'none', borderRadius: 12, border: '1.5px solid transparent', transition: 'border-color 0.15s, background 0.15s', color: 'var(--ink)' }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.borderColor = 'var(--cream-dark)';
                (e.currentTarget as HTMLElement).style.background = 'var(--cream)';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.borderColor = 'transparent';
                (e.currentTarget as HTMLElement).style.background = 'transparent';
              }}
            >
              <div style={{ color: 'var(--ink)' }}>{icon}</div>
              <span style={{ fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: 500, color: 'var(--ink)', textAlign: 'center', lineHeight: 1.3 }}>
                {label}
              </span>
            </a>
          ))}
        </div>

        <style>{`.treatment-scroll::-webkit-scrollbar { display: none; }`}</style>
      </div>
    </section>
  );
}
