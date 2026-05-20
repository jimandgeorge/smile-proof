import Link from 'next/link';

export default function LeadCaptureSection() {
  return (
    <section style={{ background: 'linear-gradient(135deg, #122d21 0%, #1c4535 60%, #24594a 100%)' }}>
      <div
        className="lead-grid mx-auto px-5 py-16 sm:py-20"
        style={{ maxWidth: 1200, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 60, alignItems: 'center' }}
      >
        {/* Left: copy */}
        <div>
          <p style={{
            fontFamily: 'var(--font-body)', fontSize: 11, fontWeight: 700,
            letterSpacing: '0.12em', textTransform: 'uppercase',
            color: '#6ee7b7', marginBottom: 12,
          }}>
            Free matching service
          </p>
          <h2 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(24px, 3.5vw, 36px)',
            fontWeight: 700, color: 'white',
            letterSpacing: '-0.025em', lineHeight: 1.2, marginBottom: 16,
          }}>
            Not sure which dentist<br />
            <em style={{ fontStyle: 'italic', color: '#6ee7b7' }}>is right for you?</em>
          </h2>
          <p style={{
            fontFamily: 'var(--font-body)', fontSize: 15,
            color: 'rgba(255,255,255,0.65)', lineHeight: 1.7, marginBottom: 28,
          }}>
            Answer 3 quick questions and we'll show you matched practices — based on treatment, location, and real patient ratings.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[
              'Matched to verified, reviewed practices',
              'Filtered by your treatment and area',
              'Based on real patient scores — not ads',
            ].map(text => (
              <div key={text} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
                  <circle cx="7" cy="7" r="6" fill="rgba(110,231,183,0.25)" />
                  <path d="M4.5 7l1.8 1.8 3.2-3.2" stroke="#6ee7b7" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.75)', fontFamily: 'var(--font-body)' }}>{text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right: CTA card */}
        <div style={{
          background: 'rgba(255,255,255,0.08)',
          border: '1.5px solid rgba(255,255,255,0.12)',
          borderRadius: 20, padding: '36px 32px',
          backdropFilter: 'blur(8px)',
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          textAlign: 'center', gap: 20,
        }}>
          <div style={{
            width: 60, height: 60, borderRadius: '50%',
            background: 'rgba(110,231,183,0.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden>
              <circle cx="14" cy="10" r="4.5" stroke="#6ee7b7" strokeWidth="1.6" />
              <path d="M5 24c0-5 4-9 9-9s9 4 9 9" stroke="#6ee7b7" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </div>

          <div>
            <h3 style={{
              fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700,
              color: 'white', marginBottom: 8, lineHeight: 1.3,
            }}>
              Find my perfect dentist
            </h3>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)', fontFamily: 'var(--font-body)', lineHeight: 1.6 }}>
              3 questions. Instant matches. No obligation.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: '100%' }}>
            {[
              { id: 'nervous',    label: 'Nervous patients' },
              { id: 'invisalign', label: 'Invisalign' },
              { id: 'implants',   label: 'Dental implants' },
            ].map(({ id, label }) => (
              <Link
                key={id}
                href={`/find?treatment=${id}`}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '11px 16px',
                  background: 'rgba(255,255,255,0.08)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  borderRadius: 10,
                  fontSize: 13, fontWeight: 600, color: 'white',
                  fontFamily: 'var(--font-body)', textDecoration: 'none',
                  transition: 'background 0.15s',
                }}
              >
                {label}
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M2.5 6h7M7 3.5L9.5 6 7 8.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
            ))}
          </div>

          <Link
            href="/find"
            style={{
              width: '100%', padding: '13px',
              background: 'white', color: 'var(--forest)',
              borderRadius: 10, fontSize: 14, fontWeight: 700,
              fontFamily: 'var(--font-body)', textDecoration: 'none',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            }}
          >
            Start matching — it's free
            <svg width="13" height="13" viewBox="0 0 14 14" fill="none" aria-hidden>
              <path d="M3 7h8M7 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .lead-grid { grid-template-columns: 1fr !important; gap: 32px !important; }
        }
      `}</style>
    </section>
  );
}
