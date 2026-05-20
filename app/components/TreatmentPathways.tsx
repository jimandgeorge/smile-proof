'use client';

// q = find-flow treatment ID; fallback = search query if no find-flow match
const TREATMENTS = [
  {
    q: 'invisalign',
    label: 'Invisalign',
    desc: 'Clear aligners from certified providers',
    color: 'var(--forest-pale)',
    iconColor: 'var(--forest)',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path d="M4 6c0-1.1.9-2 2-2h12a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6z"
          stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
        <path d="M4 14c0-1.1.9-2 2-2h12a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-2z"
          stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
        <path d="M9 6v4M9 14v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    q: 'implants',
    label: 'Implants',
    desc: 'Permanent tooth replacement',
    color: '#fef9ee',
    iconColor: '#b45309',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path d="M12 3v10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="12" cy="16" r="4" stroke="currentColor" strokeWidth="1.5" />
        <path d="M9 3h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    q: 'nervous',
    label: 'Nervous patients',
    desc: 'Anxiety-friendly, patient care',
    color: '#f5f0ff',
    iconColor: '#7c3aed',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path d="M12 21C12 21 4 14 4 9a8 8 0 0 1 16 0c0 5-8 12-8 12z"
          stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
        <path d="M9 10l1.5 1.5L15 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    q: 'whitening',
    label: 'Whitening',
    desc: 'Professional brightening treatments',
    color: '#fffbeb',
    iconColor: '#d97706',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
        <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.5" />
        <path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.93 4.93l2.12 2.12M16.95 16.95l2.12 2.12M4.93 19.07l2.12-2.12M16.95 7.05l2.12-2.12"
          stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    q: 'emergency',
    label: 'Emergency',
    desc: 'Same-day urgent dental care',
    color: '#fff5f5',
    iconColor: '#dc2626',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path d="M12 2L2 7l10 5 10-5-10-5z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
        <path d="M2 17l10 5 10-5" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
        <path d="M2 12l10 5 10-5" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      </svg>
    ),
  },
];

export default function TreatmentPathways() {
  return (
    <section style={{ background: 'white', borderBottom: '1px solid var(--cream-dark)' }}>
      <div className="mx-auto px-5 py-16 sm:py-20" style={{ maxWidth: 1200 }}>

        <div style={{ marginBottom: 32 }}>
          <p style={{
            fontFamily: 'var(--font-body)', fontSize: 11, fontWeight: 700,
            letterSpacing: '0.12em', textTransform: 'uppercase',
            color: 'var(--forest)', marginBottom: 8,
          }}>
            Browse by treatment
          </p>
          <h2 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(20px, 3vw, 26px)',
            fontWeight: 700, color: 'var(--ink)',
            letterSpacing: '-0.02em', lineHeight: 1.25, margin: 0,
          }}>
            What are you looking for?
          </h2>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(5, 1fr)',
          gap: 12,
        }}
          className="treatment-grid"
        >
          {TREATMENTS.map(({ q, label, desc, color, iconColor, icon }) => (
            <a
              key={q}
              href={`/find?treatment=${encodeURIComponent(q)}`}
              style={{
                display: 'flex', flexDirection: 'column', gap: 10,
                padding: '18px 16px',
                background: 'white',
                border: '1.5px solid var(--cream-dark)',
                borderRadius: 14,
                textDecoration: 'none',
                transition: 'border-color 0.15s, box-shadow 0.15s',
                cursor: 'pointer',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.borderColor = iconColor;
                (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 16px rgba(0,0,0,0.06)';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.borderColor = 'var(--cream-dark)';
                (e.currentTarget as HTMLElement).style.boxShadow = 'none';
              }}
            >
              <div style={{
                width: 44, height: 44, borderRadius: 12,
                background: color, display: 'flex',
                alignItems: 'center', justifyContent: 'center',
                color: iconColor, flexShrink: 0,
              }}>
                {icon}
              </div>
              <div>
                <p style={{
                  fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: 700,
                  color: 'var(--ink)', margin: '0 0 3px',
                }}>
                  {label}
                </p>
                <p style={{
                  fontFamily: 'var(--font-body)', fontSize: 12,
                  color: 'var(--ink-soft)', margin: 0, lineHeight: 1.4,
                }}>
                  {desc}
                </p>
              </div>
              <div style={{
                marginTop: 'auto',
                display: 'flex', alignItems: 'center', gap: 4,
                fontSize: 12, fontWeight: 600, color: iconColor,
                fontFamily: 'var(--font-body)',
              }}>
                Find matches
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M2.5 6h7M7 3.5L9.5 6 7 8.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </a>
          ))}
        </div>

        <style>{`
          @media (max-width: 768px) {
            .treatment-grid {
              grid-template-columns: repeat(2, 1fr) !important;
            }
            .treatment-grid > a:last-child {
              grid-column: 1 / -1;
            }
          }
        `}</style>

      </div>
    </section>
  );
}
