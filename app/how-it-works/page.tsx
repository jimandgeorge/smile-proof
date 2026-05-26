import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'How It Works | SmileProof',
  description: 'SmileProof helps patients find the right dentist and helps practices understand what patients really think.',
};

function Step({ n, title, children, light = false }: { n: number; title: string; children: React.ReactNode; light?: boolean }) {
  return (
    <div style={{ display: 'flex', gap: 16 }}>
      <div style={{
        width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
        background: light ? 'rgba(255,255,255,0.15)' : 'var(--forest)',
        border: light ? '1.5px solid rgba(255,255,255,0.3)' : 'none',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 700,
        color: 'white', marginTop: 1,
      }}>
        {n}
      </div>
      <div>
        <p style={{
          fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 700,
          color: light ? 'rgba(255,255,255,0.95)' : 'var(--ink)', marginBottom: 4,
        }}>
          {title}
        </p>
        <p style={{
          fontFamily: 'var(--font-body)', fontSize: 14,
          color: light ? 'rgba(255,255,255,0.6)' : 'var(--ink-mid)',
          lineHeight: 1.65, margin: 0,
        }}>
          {children}
        </p>
      </div>
    </div>
  );
}

function FeatureCard({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div style={{
      padding: '22px', borderRadius: 12,
      background: 'white', border: '1.5px solid var(--cream-dark)',
    }}>
      <div style={{
        width: 40, height: 40, borderRadius: 10, marginBottom: 14,
        background: 'var(--forest-pale)', display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {icon}
      </div>
      <p style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 700, color: 'var(--ink)', marginBottom: 6 }}>
        {title}
      </p>
      <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--ink-mid)', lineHeight: 1.65, margin: 0 }}>
        {children}
      </p>
    </div>
  );
}

export default function HowItWorksPage() {
  return (
    <main style={{ maxWidth: 1040, margin: '0 auto', padding: '48px 24px 80px' }}>

      <Link
        href="/"
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          fontSize: 13, color: 'var(--ink-soft)', textDecoration: 'none', marginBottom: 36,
        }}
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M9 2L4 7l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Back to SmileProof
      </Link>

      {/* Hero */}
      <div style={{ marginBottom: 60 }}>
        <p style={{
          fontFamily: 'var(--font-body)', fontSize: 11, fontWeight: 700,
          letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--forest)', marginBottom: 10,
        }}>
          The platform
        </p>
        <h1 style={{
          fontFamily: 'var(--font-display)', fontSize: 'clamp(30px, 4vw, 44px)',
          fontWeight: 700, color: 'var(--ink)', letterSpacing: '-0.025em',
          lineHeight: 1.1, marginBottom: 16,
        }}>
          How SmileProof works
        </h1>
        <p style={{
          fontFamily: 'var(--font-body)', fontSize: 17, color: 'var(--ink-soft)',
          lineHeight: 1.7, maxWidth: 560,
        }}>
          Honest feedback from real patients — and the tools practices need to act on it.
        </p>
      </div>

      {/* Two-column audience split */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 16, marginBottom: 56, alignItems: 'stretch' }}>

        {/* For patients — light */}
        <div style={{
          borderRadius: 16, padding: 'clamp(20px, 4vw, 32px) clamp(16px, 3vw, 28px)',
          background: 'white', border: '1.5px solid var(--cream-dark)',
          display: 'flex', flexDirection: 'column',
          minWidth: 0,
        }}>
          <p style={{
            fontFamily: 'var(--font-body)', fontSize: 11, fontWeight: 700,
            letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--forest)', marginBottom: 10,
          }}>
            For patients
          </p>
          <h2 style={{
            fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700,
            color: 'var(--ink)', letterSpacing: '-0.02em', lineHeight: 1.2, marginBottom: 24,
          }}>
            Find the right dentist for your treatment
          </h2>

          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 24, marginBottom: 28 }}>
            <Step n={1} title="Search by location or need">
              Enter a postcode, use your device location, or search by treatment — NHS, Invisalign, nervous patients, and more.
            </Step>
            <Step n={2} title="Read verified patient scores">
              Six scored dimensions including Staff Friendliness, Anxiety Handling, Pain Management, and Treatment Results.
            </Step>
            <Step n={3} title="Compare with confidence">
              Scores use a Bayesian average so verified reviews carry more weight than a handful of unverified ones.
            </Step>
            <Step n={4} title="Visit, then leave a review">
              Your feedback takes two minutes and becomes a permanent part of that practice's verified record.
            </Step>
          </div>

          <Link
            href="/search"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '11px 22px', borderRadius: 8,
              background: 'var(--forest)', color: 'white',
              fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 700, textDecoration: 'none',
              alignSelf: 'flex-start',
            }}
          >
            Search practices
            <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
              <path d="M3 7h8M7 3l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
        </div>

        {/* For practices — dark */}
        <div style={{
          borderRadius: 16, padding: 'clamp(20px, 4vw, 32px) clamp(16px, 3vw, 28px)',
          background: 'linear-gradient(150deg, #122d21 0%, #1c4535 100%)',
          display: 'flex', flexDirection: 'column',
          minWidth: 0,
        }}>
          <p style={{
            fontFamily: 'var(--font-body)', fontSize: 11, fontWeight: 700,
            letterSpacing: '0.1em', textTransform: 'uppercase',
            color: 'rgba(110,231,183,0.75)', marginBottom: 10,
          }}>
            For practices
          </p>
          <h2 style={{
            fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700,
            color: 'white', letterSpacing: '-0.02em', lineHeight: 1.2, marginBottom: 24,
          }}>
            Understand what your patients really think
          </h2>

          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 24, marginBottom: 28 }}>
            <Step n={1} title="Claim your practice profile" light>
              Search for your practice and click &ldquo;Claim this profile&rdquo;. We verify your identity and link it to your account.
            </Step>
            <Step n={2} title="Respond to reviews" light>
              Post a public response to any review. Practices that respond consistently score higher on trust metrics.
            </Step>
            <Step n={3} title="Invite patients to review" light>
              Send personalised invite emails from your dashboard. Invited reviews are pre-verified and count immediately.
            </Step>
            <Step n={4} title="Track scores and rankings" light>
              Your dashboard shows scores across six dimensions, your city ranking, and trend data as reviews arrive.
            </Step>
          </div>

          <Link
            href="/for-dentists"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '11px 22px', borderRadius: 8,
              background: 'white', color: 'var(--forest)',
              fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 700, textDecoration: 'none',
              alignSelf: 'flex-start',
            }}
          >
            Learn more
            <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
              <path d="M3 7h8M7 3l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
        </div>
      </div>

      {/* Review form explainer */}
      <div style={{ marginBottom: 56 }}>
        <h2 style={{
          fontFamily: 'var(--font-display)', fontSize: 'clamp(20px, 3vw, 26px)',
          fontWeight: 700, color: 'var(--ink)', letterSpacing: '-0.02em', marginBottom: 6,
        }}>
          What the review form covers
        </h2>
        <p style={{
          fontFamily: 'var(--font-body)', fontSize: 15, color: 'var(--ink-soft)',
          lineHeight: 1.65, marginBottom: 28,
        }}>
          Designed to capture meaningful detail without taking long.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 10 }}>
          {[
            { label: 'Treatment',       desc: 'Check-up, filling, Invisalign, extraction, and more.' },
            { label: 'Six dimensions',  desc: 'Staff Friendliness, Communication, Anxiety Handling, Pain Management, Value for Money, Treatment Results.' },
            { label: 'Written review',  desc: 'Context behind your scores — what went well and what could improve.' },
            { label: 'Optional cost',   desc: 'Anonymised and aggregated into price transparency data.' },
            { label: 'Email verify',    desc: 'A one-time link confirms you\'re a real person. Never shown publicly.' },
          ].map(({ label, desc }) => (
            <div key={label} style={{
              padding: '16px 18px', borderRadius: 10,
              background: 'var(--cream)', border: '1px solid var(--cream-dark)',
            }}>
              <p style={{ fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 700, color: 'var(--forest)', marginBottom: 4 }}>
                {label}
              </p>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--ink-mid)', lineHeight: 1.55, margin: 0 }}>
                {desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Trust features */}
      <div style={{ marginBottom: 56 }}>
        <h2 style={{
          fontFamily: 'var(--font-display)', fontSize: 'clamp(20px, 3vw, 26px)',
          fontWeight: 700, color: 'var(--ink)', letterSpacing: '-0.02em', marginBottom: 6,
        }}>
          Built for honesty
        </h2>
        <p style={{
          fontFamily: 'var(--font-body)', fontSize: 15, color: 'var(--ink-soft)',
          lineHeight: 1.65, marginBottom: 28,
        }}>
          Every design decision keeps scores accurate and feedback genuinely useful.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
          <FeatureCard
            icon={
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <circle cx="10" cy="10" r="7" stroke="var(--forest)" strokeWidth="1.5" />
                <polyline points="7,10 9,12.5 13,7.5" stroke="var(--forest)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            }
            title="Email-verified reviews"
          >
            Every reviewer confirms their email via a magic link before their review is published.
            Verified reviews rank above unverified ones.
          </FeatureCard>
          <FeatureCard
            icon={
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M10 3l1.8 4.9 5.2.4-4 3.4 1.3 5L10 14l-4.3 2.7 1.3-5-4-3.4 5.2-.4z" stroke="var(--forest)" strokeWidth="1.4" strokeLinejoin="round" fill="none" />
              </svg>
            }
            title="Bayesian scoring"
          >
            New practices start at the platform average and earn their score as reviews accumulate.
            Volume matters, not just rating.
          </FeatureCard>
          <FeatureCard
            icon={
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <rect x="4" y="10" width="12" height="8" rx="2" stroke="var(--forest)" strokeWidth="1.5" fill="none" />
                <path d="M7 10V8a3 3 0 0 1 6 0v2" stroke="var(--forest)" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            }
            title="Practices can't alter reviews"
          >
            Once published, a review is locked. Owners can respond publicly but cannot edit
            scores or remove reviews.
          </FeatureCard>
          <FeatureCard
            icon={
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M10 4l.9 2.6 2.6.9-2.6.9L10 11l-.9-2.6L6.5 7.5l2.6-.9z" fill="var(--forest)" />
                <path d="M15 12l.5 1.4 1.4.5-1.4.5L15 16l-.5-1.4-1.4-.5 1.4-.5z" fill="var(--forest)" opacity=".5" />
              </svg>
            }
            title="AI summaries when ready"
          >
            Summaries appear only once a practice has five or more reviews — never generated live,
            always from cached data.
          </FeatureCard>
          <FeatureCard
            icon={
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <circle cx="10" cy="10" r="7" stroke="var(--forest)" strokeWidth="1.5" fill="none" />
                <path d="M10 7v4l2.5 2" stroke="var(--forest)" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            }
            title="3-month outcome check-ins"
          >
            Opt-in follow-up emails ask reviewers how their treatment has held up — giving patients
            a longer-term view of results.
          </FeatureCard>
        </div>
      </div>

      {/* Trust link */}
      <div style={{
        padding: '20px 24px', borderRadius: 12,
        background: 'var(--forest-pale)', border: '1px solid rgba(28,69,53,0.15)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16,
        flexWrap: 'wrap', marginBottom: 48,
      }}>
        <div>
          <p style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 700, color: 'var(--ink)', marginBottom: 3 }}>
            Want to know more about how we prevent fake reviews?
          </p>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--ink-soft)', margin: 0 }}>
            Read our full Trust &amp; Verification page.
          </p>
        </div>
        <Link
          href="/trust"
          style={{
            flexShrink: 0, padding: '10px 20px', borderRadius: 8,
            background: 'var(--forest)', color: 'white',
            fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 700, textDecoration: 'none',
          }}
        >
          Trust &amp; Verification →
        </Link>
      </div>

      {/* Footer rule */}
      <div style={{
        borderTop: '1px solid var(--cream-dark)', paddingTop: 24,
        display: 'flex', gap: 20, flexWrap: 'wrap',
      }}>
        <Link href="/trust" style={{ fontSize: 13, color: 'var(--ink-soft)', textDecoration: 'none' }}>Trust &amp; Verification</Link>
        <Link href="/terms" style={{ fontSize: 13, color: 'var(--ink-soft)', textDecoration: 'none' }}>Terms of Service</Link>
        <Link href="/privacy" style={{ fontSize: 13, color: 'var(--ink-soft)', textDecoration: 'none' }}>Privacy Policy</Link>
      </div>
    </main>
  );
}
