'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

const PILLS = [
  { label: 'Invisalign',        q: 'invisalign' },
  { label: 'Implants',          q: 'implants' },
  { label: 'Nervous patients',  q: 'nervous' },
  { label: 'Whitening',         q: 'whitening' },
  { label: 'Emergency',         q: 'emergency' },
];

type HeroStats = {
  practiceCount: number;
  avgOverall: number | null;
  reviewCount: number;
};

export default function HeroSection({ stats }: { stats?: HeroStats }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const [locating, setLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const q = inputRef.current?.value.trim();
    router.push(q ? `/search?q=${encodeURIComponent(q)}` : '/search');
  }

  function handleNearMe() {
    if (locating) return;
    setLocationError(null);

    if (typeof window !== 'undefined' && !window.isSecureContext) {
      setLocationError('Location needs HTTPS or localhost. Try entering your postcode.');
      return;
    }

    if (!navigator.geolocation) {
      setLocationError('Your browser does not support location. Try entering your postcode.');
      return;
    }

    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        window.location.assign(`/search?lat=${coords.latitude.toFixed(6)}&lng=${coords.longitude.toFixed(6)}&radius=10`);
      },
      (err) => {
        setLocating(false);
        setLocationError(
          err.code === err.PERMISSION_DENIED
            ? 'Location access was denied. Try entering your postcode.'
            : err.code === err.TIMEOUT
              ? 'Location timed out. Try again or enter your postcode.'
              : 'Could not get your location. Try entering your postcode.'
        );
      },
      { enableHighAccuracy: false, maximumAge: 60000, timeout: 12000 }
    );
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
              href={`/find?treatment=${encodeURIComponent(q)}`}
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
            type="button"
            onClick={handleNearMe}
            disabled={locating}
            title="Use my location"
            aria-label="Use my location"
            className="shrink-0 transition-opacity hover:opacity-80"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 38,
              height: 38,
              borderRadius: '50%',
              border: '1.5px solid #e5e7eb',
              background: locating ? '#f3f4f6' : 'white',
              cursor: locating ? 'default' : 'pointer',
              flexShrink: 0,
              margin: '5px 0 5px 0',
              color: locating ? '#9ca3af' : 'var(--forest)',
            }}
          >
            <svg width="15" height="15" viewBox="0 0 14 14" fill="none" aria-hidden>
              <circle cx="7" cy="7" r="2.8" stroke="currentColor" strokeWidth="1.4" />
              <line x1="7" y1="1" x2="7" y2="3.4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
              <line x1="7" y1="10.6" x2="7" y2="13" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
              <line x1="1" y1="7" x2="3.4" y2="7" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
              <line x1="10.6" y1="7" x2="13" y2="7" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
            </svg>
          </button>
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
        {locationError && (
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'rgba(255,255,255,0.72)', margin: '-6px 0 16px', maxWidth: 580 }}>
            {locationError}
          </p>
        )}

        {/* Secondary CTAs */}
        <div className="flex items-center gap-3 mb-10 flex-wrap">
          <a
            href="/find"
            className="transition-all hover:bg-white/20"
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: 14,
              fontWeight: 700,
              color: '#fff',
              background: 'rgba(110,231,183,0.18)',
              border: '1.5px solid rgba(110,231,183,0.4)',
              borderRadius: 999,
              padding: '9px 20px',
              textDecoration: 'none',
              whiteSpace: 'nowrap',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
              <circle cx="7" cy="5" r="2.5" stroke="currentColor" strokeWidth="1.4" />
              <path d="M2 12c0-2.8 2.2-5 5-5s5 2.2 5 5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
            </svg>
            Find my dentist
          </a>
          <span style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>
            or browse by treatment below
          </span>
        </div>

        {/* Stats row */}
        {(() => {
          const liveStats = stats && stats.practiceCount > 0 ? [
            { value: stats.practiceCount.toLocaleString(), label: 'practices' },
            { value: stats.avgOverall ? `${stats.avgOverall.toFixed(1)}★` : '—', label: 'avg rating' },
            { value: stats.reviewCount >= 100 ? stats.reviewCount.toLocaleString() : 'Growing', label: stats.reviewCount >= 100 ? 'reviews' : 'daily' },
          ] : [
            { value: '834', label: 'practices' },
            { value: '4.6★', label: 'avg rating' },
            { value: 'Growing', label: 'daily' },
          ];
          return (
            <div className="flex items-center gap-6 sm:gap-10 flex-wrap">
              {liveStats.map(({ value, label }, i) => (
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
          );
        })()}

      </div>
    </section>
  );
}
