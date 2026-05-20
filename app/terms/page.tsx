import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service | SmileProof',
  description: 'SmileProof terms of service — your rights and responsibilities when using our platform.',
};

const EFFECTIVE_DATE = '8 May 2025';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={{ marginBottom: 40 }}>
      <h2 style={{
        fontFamily: 'var(--font-display)',
        fontSize: 18,
        fontWeight: 700,
        color: 'var(--ink)',
        letterSpacing: '-0.01em',
        marginBottom: 12,
      }}>
        {title}
      </h2>
      <div style={{
        fontFamily: 'var(--font-body)',
        fontSize: 15,
        color: 'var(--ink-mid)',
        lineHeight: 1.75,
      }}>
        {children}
      </div>
    </section>
  );
}

function P({ children }: { children: React.ReactNode }) {
  return <p style={{ marginBottom: 12 }}>{children}</p>;
}

function Ul({ children }: { children: React.ReactNode }) {
  return (
    <ul style={{ paddingLeft: 20, marginBottom: 12 }}>
      {children}
    </ul>
  );
}

function Li({ children }: { children: React.ReactNode }) {
  return <li style={{ marginBottom: 6 }}>{children}</li>;
}

export default function TermsPage() {
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
      <div style={{ marginBottom: 48 }}>
        <p style={{
          fontFamily: 'var(--font-body)',
          fontSize: 11, fontWeight: 700, letterSpacing: '0.1em',
          textTransform: 'uppercase', color: 'var(--forest)', marginBottom: 10,
        }}>
          Legal
        </p>
        <h1 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(28px, 4vw, 38px)',
          fontWeight: 700, color: 'var(--ink)',
          letterSpacing: '-0.025em', lineHeight: 1.15, marginBottom: 12,
        }}>
          Terms of Service
        </h1>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--ink-soft)' }}>
          Effective {EFFECTIVE_DATE}
        </p>
      </div>

      <Section title="1. Who we are">
        <P>
          SmileProof is a dental review platform operated in the United Kingdom. We help patients
          find and review dental practices and help practices understand patient feedback. These
          terms govern your use of smileproof.co.uk and any associated services.
        </P>
        <P>
          By accessing or using SmileProof you agree to these terms. If you do not agree, please do
          not use the platform.
        </P>
      </Section>

      <Section title="2. Using SmileProof">
        <P>You may use SmileProof to:</P>
        <Ul>
          <Li>Search for and read reviews of dental practices</Li>
          <Li>Submit a review of a dental practice you have genuinely visited</Li>
          <Li>Claim and manage a dental practice profile you are authorised to represent</Li>
          <Li>Respond to reviews on behalf of a practice you manage</Li>
        </Ul>
        <P>You must be at least 18 years old to submit a review or claim a practice profile.</P>
      </Section>

      <Section title="3. Submitting reviews">
        <P>
          Reviews on SmileProof are intended to reflect genuine patient experiences. When you submit
          a review you confirm that:
        </P>
        <Ul>
          <Li>You have personally received treatment at the practice you are reviewing</Li>
          <Li>Your review is honest, accurate, and based on your own experience</Li>
          <Li>You are not submitting a review on behalf of a competitor or in exchange for payment</Li>
          <Li>Your review does not contain false factual claims, personal attacks, or discriminatory language</Li>
          <Li>You own or have permission to share any content you include</Li>
        </Ul>
        <P>
          We reserve the right to moderate, withhold, or remove any review that we reasonably
          believe violates these rules or applicable law. Moderation decisions are final.
        </P>
        <P>
          By submitting a review you grant SmileProof a non-exclusive, royalty-free, worldwide
          licence to display and use that content on the platform and in related promotional
          material.
        </P>
      </Section>

      <Section title="4. Practice profiles and claiming">
        <P>
          Dental practice profiles may be created by SmileProof using publicly available information.
          If you are the owner or authorised representative of a practice, you may claim the profile
          to manage it.
        </P>
        <P>
          By claiming a profile you confirm that you are authorised to represent that practice. You
          are responsible for keeping your profile information accurate and up to date.
        </P>
        <P>
          Practice responses to reviews must be professional and factual. You may not use responses
          to harass reviewers, make threats, or post promotional content unrelated to the review.
        </P>
      </Section>

      <Section title="5. Prohibited conduct">
        <P>You may not use SmileProof to:</P>
        <Ul>
          <Li>Post fake, incentivised, or coordinated reviews</Li>
          <Li>Attempt to suppress or manipulate a practice&apos;s rating</Li>
          <Li>Scrape, copy, or redistribute content from the platform without permission</Li>
          <Li>Impersonate another person, practice, or organisation</Li>
          <Li>Introduce malware or attempt to gain unauthorised access to our systems</Li>
          <Li>Violate any applicable law or regulation</Li>
        </Ul>
        <P>
          We may suspend or terminate access for any account that breaches these rules, without
          notice.
        </P>
      </Section>

      <Section title="6. Intellectual property">
        <P>
          All content, design, and software on SmileProof — excluding user-submitted reviews — is
          owned by or licensed to SmileProof. You may not copy, reproduce, or create derivative
          works without our written permission.
        </P>
        <P>
          The SmileProof name and logo are trading names. Nothing in these terms transfers any
          intellectual property rights to you.
        </P>
      </Section>

      <Section title="7. Disclaimer and limitation of liability">
        <P>
          Reviews on SmileProof represent the opinions of individual patients and are not verified
          medical assessments. SmileProof does not endorse any specific dental practice or
          treatment. You should always consult a qualified dental professional for personal advice.
        </P>
        <P>
          SmileProof is provided &ldquo;as is&rdquo;. We do not guarantee uninterrupted access or that
          the platform will be free of errors. To the fullest extent permitted by UK law, we exclude
          all implied warranties and limit our liability to the greater of £100 or the amount you
          have paid us in the twelve months prior to the claim.
        </P>
        <P>
          Nothing in these terms excludes liability for death or personal injury caused by our
          negligence, or for fraud or fraudulent misrepresentation.
        </P>
      </Section>

      <Section title="8. Privacy">
        <P>
          Your use of SmileProof is also governed by our{' '}
          <Link href="/privacy" style={{ color: 'var(--forest)', textDecoration: 'underline' }}>
            Privacy Policy
          </Link>
          , which explains how we collect and use your personal information. By using the platform
          you consent to that processing.
        </P>
      </Section>

      <Section title="9. Changes to these terms">
        <P>
          We may update these terms from time to time. Material changes will be notified by updating
          the effective date above. Continued use of SmileProof after changes are posted constitutes
          acceptance of the revised terms.
        </P>
      </Section>

      <Section title="10. Governing law">
        <P>
          These terms are governed by the laws of England and Wales. Any disputes will be subject to
          the exclusive jurisdiction of the courts of England and Wales.
        </P>
      </Section>

      <Section title="11. Contact">
        <P>
          Questions about these terms? Email us at{' '}
          <a href="mailto:hello@smileproof.co.uk" style={{ color: 'var(--forest)' }}>
            hello@smileproof.co.uk
          </a>
          .
        </P>
      </Section>

      {/* Footer rule */}
      <div style={{
        borderTop: '1px solid var(--cream-dark)',
        paddingTop: 24,
        display: 'flex', gap: 20, flexWrap: 'wrap',
      }}>
        <Link href="/privacy" style={{ fontSize: 13, color: 'var(--ink-soft)', textDecoration: 'none' }}>Privacy Policy</Link>
        <Link href="/" style={{ fontSize: 13, color: 'var(--ink-soft)', textDecoration: 'none' }}>Back to SmileProof</Link>
      </div>
    </main>
  );
}
