'use client';

import { useRef } from 'react';
import { useRouter } from 'next/navigation';

const PILLS = [
  { label: 'Invisalign',        q: 'Invisalign' },
  { label: 'Implants',          q: 'Implants' },
  { label: 'Nervous patients',  q: 'Nervous patients' },
  { label: 'Whitening',         q: 'Whitening' },
  { label: 'Emergency',         q: 'Emergency' },
];

const STATS = [
  { value: '834',      label: 'practices' },
  { value: '4.6★',    label: 'avg rating' },
  { value: 'Growing', label: 'daily' },
];

export default function HeroSection() {
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const q = inputRef.current?.value.trim();
    router.push(q ? `/search?q=${encodeURIComponent(q)}` : '/search');
  }

  return (
    <section
      className="relative overflow-hidden flex items-center"
      style={{
        minHeight: 420,
        background: 'linear-gradient(150deg, #122d21 0%, #1c4535 45%, #24594a 100%)',
      }}
    >
      {/* Radial blur accents */}
      <span
        aria-hidden
        className="absolute rounded-full pointer-events-none"
        style={{
          width: 560,
          height: 560,
          top: -180,
          right: -140,
          background: 'radial-gradient(circle, rgba(255,255,255,0.06) 0%, transparent 70%)',
          filter: 'blur(1px)',
        }}
      />
      <span
        aria-hidden
        className="absolute rounded-full pointer-events-none"
        style={{
          width: 360,
          height: 360,
          bottom: -120,
          left: '30%',
          background: 'radial-gradient(circle, rgba(90,200,140,0.07) 0%, transparent 70%)',
          filter: 'blur(2px)',
        }}
      />

      {/* Content */}
      <div className="relative w-full mx-auto px-5 py-16 sm:py-20" style={{ maxWidth: 1200 }}>

        {/* Headline */}
        <h1
          className="font-bold mb-4"
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(32px, 5vw, 56px)',
            color: '#fff',
            lineHeight: 1.1,
            letterSpacing: '-0.025em',
            maxWidth: 680,
          }}
        >
          Find the right dentist<br />
          <em style={{ fontStyle: 'italic', color: '#6ee7b7' }}>for your treatment</em>
        </h1>

        {/* Subheadline */}
        <p
          className="mb-8"
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: 'clamp(15px, 2vw, 18px)',
            color: 'rgba(255,255,255,0.62)',
            lineHeight: 1.6,
            maxWidth: 520,
          }}
        >
          Based on real patient experiences — comfort, results, and cost clarity.
        </p>

        {/* Category pills */}
        <div className="flex flex-wrap gap-2 mb-7">
          {PILLS.map(({ label, q }) => (
            <a
              key={q}
              href={`/search?q=${encodeURIComponent(q)}`}
              className="transition-all hover:bg-white/20"
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: 13,
                fontWeight: 500,
                padding: '6px 14px',
                borderRadius: 999,
                background: 'rgba(255,255,255,0.1)',
                border: '1px solid rgba(255,255,255,0.18)',
                color: 'rgba(255,255,255,0.88)',
                textDecoration: 'none',
                whiteSpace: 'nowrap',
              }}
            >
              {label}
            </a>
          ))}
        </div>

        {/* Search bar */}
        <form
          onSubmit={handleSearch}
          className="flex items-center overflow-hidden mb-4"
          style={{
            background: '#fff',
            borderRadius: 999,
            boxShadow: '0 8px 40px rgba(0,0,0,0.22)',
            maxWidth: 580,
          }}
        >
          <div className="flex items-center pl-5 pr-3 shrink-0">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
              <circle cx="7" cy="7" r="5" stroke="#9ca3af" strokeWidth="1.5" />
              <line x1="11" y1="11" x2="15" y2="15" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>
          <input
            ref={inputRef}
            type="text"
            placeholder="What treatment or location?"
            className="flex-1 bg-transparent outline-none"
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: 15,
              color: 'var(--ink)',
              padding: '14px 8px 14px 4px',
              minWidth: 0,
            }}
          />
          <button
            type="submit"
            className="shrink-0 font-semibold transition-opacity hover:opacity-90 active:opacity-80"
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: 14,
              background: 'var(--forest)',
              color: '#fff',
              border: 'none',
              cursor: 'pointer',
              padding: '10px 24px',
              borderRadius: 999,
              margin: 5,
            }}
          >
            Search
          </button>
        </form>

        {/* Secondary CTA */}
        <div className="flex items-center gap-3 mb-10 flex-wrap">
          <span
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: 14,
              color: 'rgba(255,255,255,0.5)',
            }}
          >
            Not sure what you need?
          </span>
          <a
            href="/search"
            className="transition-all hover:bg-white/15"
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: 13,
              fontWeight: 600,
              color: 'rgba(255,255,255,0.85)',
              border: '1px solid rgba(255,255,255,0.3)',
              borderRadius: 999,
              padding: '6px 16px',
              textDecoration: 'none',
              whiteSpace: 'nowrap',
            }}
          >
            Get matched with a dentist →
          </a>
        </div>

        {/* Stats row */}
        <div className="flex items-center gap-6 sm:gap-10 flex-wrap">
          {STATS.map(({ value, label }, i) => (
            <div key={label} className="flex items-center gap-3">
              {i > 0 && (
                <span aria-hidden className="hidden sm:block" style={{ width: 1, height: 24, background: 'rgba(255,255,255,0.15)' }} />
              )}
              <div>
                <span
                  className="block font-bold"
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: 20,
                    color: '#fff',
                    letterSpacing: '-0.02em',
                    lineHeight: 1.1,
                  }}
                >
                  {value}
                </span>
                <span
                  className="block"
                  style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: 11,
                    color: 'rgba(255,255,255,0.45)',
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase',
                  }}
                >
                  {label}
                </span>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
