import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Trust & Verification | SmileProof',
  description: 'How SmileProof verifies reviews, prevents fake feedback, and keeps patient scores honest.',
};

function Badge({ children, color = 'forest' }: { children: React.ReactNode; color?: 'forest' | 'amber' | 'ink' }) {
  const styles: Record<string, React.CSSProperties> = {
    forest: { background: 'var(--forest-pale)', color: 'var(--forest)', border: '1px solid rgba(28,69,53,0.2)' },
    amber:  { background: '#fef3c7', color: '#92400e', border: '1px solid #fcd34d' },
    ink:    { background: 'var(--cream-dark)', color: 'var(--ink-soft)', border: '1px solid transparent' },
  };
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      fontSize: 12, fontWeight: 600, padding: '3px 10px',
      borderRadius: 20, fontFamily: 'var(--font-body)',
      ...styles[color],
    }}>
      {children}
    </span>
  );
}

function Callout({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div style={{
      display: 'flex', gap: 16, padding: '20px 22px',
      background: 'var(--forest-pale)', borderRadius: 12,
      border: '1px solid rgba(28,69,53,0.12)', marginBottom: 16,
    }}>
      <div style={{
        width: 40, height: 40, borderRadius: 10, flexShrink: 0,
        background: 'var(--forest)', display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {icon}
      </div>
      <div>
        <p style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 700, color: 'var(--ink)', marginBottom: 4 }}>
          {title}
        </p>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--ink-mid)', lineHeight: 1.65, margin: 0 }}>
          {children}
        </p>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={{ marginBottom: 48 }}>
      <h2 style={{
        fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700,
        color: 'var(--ink)', letterSpacing: '-0.02em', marginBottom: 16,
      }}>
        {title}
      </h2>
      {children}
    </section>
  );
}

function P({ children }: { children: React.ReactNode }) {
  return (
    <p style={{ fontFamily: 'var(--font-body)', fontSize: 15, color: 'var(--ink-mid)', lineHeight: 1.75, marginBottom: 14 }}>
      {children}
    </p>
  );
}

function Step({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', gap: 16, marginBottom: 20 }}>
      <div style={{
        width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
        background: 'var(--forest)', display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 700, color: 'white', marginTop: 2,
      }}>
        {n}
      </div>
      <div>
        <p style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 700, color: 'var(--ink)', marginBottom: 4 }}>
          {title}
        </p>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--ink-mid)', lineHeight: 1.65, margin: 0 }}>
          {children}
        </p>
      </div>
    </div>
  );
}

export default function TrustPage() {
  return (
    <main style={{ maxWidth: 720, margin: '0 auto', padding: '48px 24px 80px' }}>
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

      {/* Header */}
      <div style={{ marginBottom: 52 }}>
        <p style={{
          fontFamily: 'var(--font-body)', fontSize: 11, fontWeight: 700,
          letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--forest)', marginBottom: 10,
        }}>
          How it works
        </p>
        <h1 style={{
          fontFamily: 'var(--font-display)', fontSize: 'clamp(28px, 4vw, 38px)',
          fontWeight: 700, color: 'var(--ink)', letterSpacing: '-0.025em', lineHeight: 1.15, marginBottom: 16,
        }}>
          Trust &amp; Verification
        </h1>
        <p style={{
          fontFamily: 'var(--font-body)', fontSize: 17, color: 'var(--ink-soft)', lineHeight: 1.65, maxWidth: 560,
        }}>
          Honest dental reviews only work if the people reading them can trust them. Here&apos;s exactly how we make sure every score on SmileProof is earned.
        </p>
      </div>

      {/* Quick summary callouts */}
      <div style={{ marginBottom: 56 }}>
        <Callout
          icon={
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <circle cx="9" cy="9" r="7" stroke="white" strokeWidth="1.5" />
              <polyline points="5.5,9 7.5,11.5 12.5,6.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          }
          title="Reviews are written by real patients"
        >
          Every review goes through an email verification step before it can be published. We link
          the reviewer&apos;s email to the review so we can confirm a real person submitted it — not a bot or a competitor.
        </Callout>

        <Callout
          icon={
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <rect x="3" y="8" width="12" height="8" rx="2" stroke="white" strokeWidth="1.5" fill="none" />
              <path d="M6 8V6a3 3 0 0 1 6 0v2" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          }
          title="Practices cannot edit or delete reviews"
        >
          Once a review passes moderation it is locked. Practice owners can post a public response,
          but they cannot alter the score, edit the reviewer&apos;s words, or remove the review from
          their profile.
        </Callout>

        <Callout
          icon={
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M9 2l1.8 4.9 5.2.4-4 3.4 1.3 5L9 13l-4.3 2.7 1.3-5-4-3.4 5.2-.4z" stroke="white" strokeWidth="1.4" strokeLinejoin="round" fill="none" />
            </svg>
          }
          title="Scores are smoothed, not inflated"
        >
          We use a Bayesian scoring method that anchors new practices toward the platform average
          until enough reviews have been collected. A single 5-star review does not make a practice
          top-rated overnight.
        </Callout>
      </div>

      <Section title="How review verification works">
        <P>
          When a patient submits a review they provide an email address. We immediately send a
          magic-link verification email to that address. Clicking the link confirms that a real
          person with access to that inbox wrote the review.
        </P>

        <Step n={1} title="Patient submits a review">
          The reviewer completes the multi-step form — treatment, scores, and written feedback —
          and provides an email address. The review is not published yet.
        </Step>
        <Step n={2} title="Verification email is sent">
          We send a one-time magic link to the email address. This confirms the reviewer is a real
          person and gives them permanent access to their review.
        </Step>
        <Step n={3} title="Review enters moderation">
          Our moderation process checks for policy violations — fake claims, promotional content,
          or abusive language. Most reviews are approved within 24 hours.
        </Step>
        <Step n={4} title="Review is published">
          The review appears on the practice profile. Verified reviews are labelled and ranked
          above unverified ones in the default sort order.
        </Step>

        <P>
          Reviews submitted via a practice&apos;s own invite link — where the practice sends a review
          request directly to a patient — are treated as <strong>verified by default</strong>, because
          the practice has already confirmed the patient relationship.
        </P>
      </Section>

      <Section title="What the badges mean">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 16 }}>

          <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start', padding: '16px 20px', background: 'white', borderRadius: 10, border: '1.5px solid var(--cream-dark)' }}>
            <div style={{ paddingTop: 2 }}>
              <Badge color="forest">
                <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                  <circle cx="6" cy="6" r="6" fill="var(--forest)" />
                  <polyline points="3,6 5,8.5 9,3.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Verified review
              </Badge>
            </div>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--ink-mid)', lineHeight: 1.65, margin: 0 }}>
              The reviewer&apos;s email address has been confirmed via a magic link, or the review was
              submitted through a practice-issued invite.
            </p>
          </div>

          <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start', padding: '16px 20px', background: 'white', borderRadius: 10, border: '1.5px solid var(--cream-dark)' }}>
            <div style={{ paddingTop: 2 }}>
              <Badge color="ink">Unverified review</Badge>
            </div>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--ink-mid)', lineHeight: 1.65, margin: 0 }}>
              The reviewer submitted the review but has not yet clicked the verification link. The
              review is still moderated, but the email link was not confirmed. Unverified reviews
              appear below verified ones.
            </p>
          </div>

          <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start', padding: '16px 20px', background: 'white', borderRadius: 10, border: '1.5px solid var(--cream-dark)' }}>
            <div style={{ paddingTop: 2 }}>
              <Badge color="forest">
                <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                  <circle cx="6" cy="6" r="6" fill="var(--forest)" />
                  <polyline points="3,6 5,8.5 9,3.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Verified practice
              </Badge>
            </div>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--ink-mid)', lineHeight: 1.65, margin: 0 }}>
              The practice profile has been claimed by an authenticated owner or team member. This
              means someone from the practice monitors reviews and can post responses.
            </p>
          </div>

          <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start', padding: '16px 20px', background: 'white', borderRadius: 10, border: '1.5px solid var(--cream-dark)' }}>
            <div style={{ paddingTop: 2 }}>
              <Badge color="amber">
                Early patient insights
              </Badge>
            </div>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--ink-mid)', lineHeight: 1.65, margin: 0 }}>
              Shown when a practice has fewer than 5 published reviews. Scores exist but should not
              yet be treated as representative — more feedback is needed before a clear picture
              emerges.
            </p>
          </div>

        </div>
      </Section>

      <Section title="How scores are calculated">
        <P>
          SmileProof uses a <strong>Bayesian average</strong> rather than a simple arithmetic mean.
          This prevents a practice with one or two reviews from appearing artificially high or low
          in rankings.
        </P>
        <P>
          The method works by starting every practice at the platform average and gradually shifting
          its score toward its actual ratings as more reviews arrive. In plain terms: the more
          verified reviews a practice has, the more its score reflects what patients actually said.
        </P>
        <P>
          Each practice is scored across six dimensions independently — Staff Friendliness,
          Communication, Anxiety Handling, Pain Management, Value for Money, and Treatment Results —
          so patients can compare practices on what matters most to them, not just a single number.
        </P>
      </Section>

      <Section title="Moderation">
        <P>
          Every review is checked before it is published. We remove or reject reviews that:
        </P>
        <ul style={{ fontFamily: 'var(--font-body)', fontSize: 15, color: 'var(--ink-mid)', lineHeight: 1.75, paddingLeft: 20, marginBottom: 14 }}>
          <li style={{ marginBottom: 8 }}>Appear to have been written by a competitor or someone with a commercial motive</li>
          <li style={{ marginBottom: 8 }}>Contain personal attacks on named staff members</li>
          <li style={{ marginBottom: 8 }}>Include false factual claims or defamatory statements</li>
          <li style={{ marginBottom: 8 }}>Are clearly duplicates or coordinated submissions from the same source</li>
          <li style={{ marginBottom: 8 }}>Contain discriminatory, hateful, or threatening language</li>
        </ul>
        <P>
          Practices can flag a review for investigation, but flagging does not automatically remove
          it. We review each flag independently. If a review is removed following investigation,
          the reviewer is notified.
        </P>
      </Section>

      <Section title="AI summaries">
        <P>
          Practice profiles with enough reviews display an AI-generated summary of patient
          feedback. These summaries are produced by processing published reviews through a language
          model and are stored in our database — they are not generated live on every page load.
        </P>
        <P>
          AI summaries are shown only when a practice has at least 5 published reviews, or has a
          claimed and verified profile. Below that threshold, we show a &ldquo;Early patient insights&rdquo;
          label to make clear that the data is limited.
        </P>
        <P>
          AI summaries reflect patterns in what patients have written — they do not represent our
          own editorial opinion, and they are not a clinical assessment of any practice.
        </P>
      </Section>

      <Section title="Report a concern">
        <P>
          If you believe a review is fake, has been manipulated, or violates our guidelines, please
          use the flag button on the review or contact us directly. We take every report seriously
          and aim to respond within 5 working days.
        </P>
        <a
          href="mailto:hello@smileproof.co.uk?subject=Review%20concern"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '12px 24px', borderRadius: 8,
            background: 'var(--forest)', color: 'white',
            fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: 600,
            textDecoration: 'none', transition: 'opacity 0.15s',
          }}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <rect x="1" y="3" width="12" height="9" rx="1.5" stroke="white" strokeWidth="1.3" fill="none" />
            <path d="M1 4l6 4.5L13 4" stroke="white" strokeWidth="1.3" strokeLinecap="round" />
          </svg>
          Report a concern
        </a>
      </Section>

      {/* Footer rule */}
      <div style={{
        borderTop: '1px solid var(--cream-dark)', paddingTop: 24,
        display: 'flex', gap: 20, flexWrap: 'wrap', marginTop: 16,
      }}>
        <Link href="/terms" style={{ fontSize: 13, color: 'var(--ink-soft)', textDecoration: 'none' }}>Terms of Service</Link>
        <Link href="/privacy" style={{ fontSize: 13, color: 'var(--ink-soft)', textDecoration: 'none' }}>Privacy Policy</Link>
        <Link href="/" style={{ fontSize: 13, color: 'var(--ink-soft)', textDecoration: 'none' }}>Back to SmileProof</Link>
      </div>
    </main>
  );
}
