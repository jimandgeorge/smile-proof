import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy | SmileProof',
  description: 'How SmileProof collects, uses, and protects your personal information.',
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
  return <ul style={{ paddingLeft: 20, marginBottom: 12 }}>{children}</ul>;
}

function Li({ children }: { children: React.ReactNode }) {
  return <li style={{ marginBottom: 6 }}>{children}</li>;
}

function Table({ rows }: { rows: [string, string, string][] }) {
  return (
    <div style={{ overflowX: 'auto', marginBottom: 12 }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
        <thead>
          <tr style={{ background: 'var(--cream)' }}>
            {['Data', 'Purpose', 'Legal basis'].map(h => (
              <th key={h} style={{
                textAlign: 'left', padding: '10px 14px',
                fontFamily: 'var(--font-body)', fontWeight: 700,
                color: 'var(--ink)', fontSize: 13,
                borderBottom: '1.5px solid var(--cream-dark)',
              }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map(([data, purpose, basis], i) => (
            <tr key={i} style={{ borderBottom: '1px solid var(--cream-dark)' }}>
              <td style={{ padding: '10px 14px', verticalAlign: 'top', color: 'var(--ink)', fontWeight: 500 }}>{data}</td>
              <td style={{ padding: '10px 14px', verticalAlign: 'top', color: 'var(--ink-mid)' }}>{purpose}</td>
              <td style={{ padding: '10px 14px', verticalAlign: 'top', color: 'var(--ink-soft)' }}>{basis}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function PrivacyPage() {
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
          Privacy Policy
        </h1>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--ink-soft)' }}>
          Effective {EFFECTIVE_DATE}
        </p>
      </div>

      <Section title="1. Who we are">
        <P>
          SmileProof (&ldquo;we&rdquo;, &ldquo;us&rdquo;, &ldquo;our&rdquo;) operates the dental review platform at smileproof.co.uk.
          We are the data controller for personal information collected through this platform.
        </P>
        <P>
          You can contact us about privacy matters at{' '}
          <a href="mailto:hello@smileproof.co.uk" style={{ color: 'var(--forest)' }}>
            hello@smileproof.co.uk
          </a>
          .
        </P>
        <P>
          This policy explains what personal data we collect, why we collect it, and your rights
          under the UK General Data Protection Regulation (UK GDPR) and the Data Protection Act 2018.
        </P>
      </Section>

      <Section title="2. Data we collect and why">
        <P>We collect personal data in the following contexts:</P>

        <p style={{ fontWeight: 600, color: 'var(--ink)', marginBottom: 8, marginTop: 20 }}>
          Reviewers
        </p>
        <Table rows={[
          ['Email address', 'Send a verification link to confirm you visited the practice', 'Legitimate interests (review integrity)'],
          ['Display name or initials', 'Shown publicly alongside your review', 'Consent (you choose what to enter)'],
          ['Review content and ratings', 'Published on the practice profile', 'Consent'],
          ['Treatment date and price', 'Aggregated for price transparency data; not shown individually', 'Consent'],
          ['Follow-up preference', 'Send a 3-month outcome check-in if you opt in', 'Consent'],
        ]} />

        <p style={{ fontWeight: 600, color: 'var(--ink)', marginBottom: 8, marginTop: 20 }}>
          Practice owners
        </p>
        <Table rows={[
          ['Email address and name', 'Create and manage your practice account', 'Contract'],
          ['Practice information', 'Displayed on your public profile', 'Contract'],
          ['Subscription and billing data', 'Process payments via Stripe', 'Contract'],
          ['Login activity', 'Account security and fraud prevention', 'Legitimate interests'],
        ]} />

        <p style={{ fontWeight: 600, color: 'var(--ink)', marginBottom: 8, marginTop: 20 }}>
          All visitors
        </p>
        <Table rows={[
          ['IP address and browser data', 'Security, abuse prevention, and anonymous analytics', 'Legitimate interests'],
          ['Page view events', 'Show practice owners how many times their profile was viewed', 'Legitimate interests'],
          ['Approximate location (if you grant permission)', 'Show nearby dental practices in search results', 'Consent'],
        ]} />
      </Section>

      <Section title="3. Cookies">
        <P>
          SmileProof uses cookies and similar technologies for the following purposes:
        </P>
        <Ul>
          <Li><strong>Essential cookies</strong> — required for authentication and security. These cannot be disabled.</Li>
          <Li><strong>Analytics cookies</strong> — anonymised usage data to help us understand how the platform is used. You can opt out via your browser settings.</Li>
        </Ul>
        <P>
          We do not use advertising or tracking cookies, and we do not sell or share your data with
          advertising networks.
        </P>
      </Section>

      <Section title="4. How we share your data">
        <P>We share personal data only where necessary:</P>
        <Ul>
          <Li>
            <strong>Supabase</strong> — our database and authentication provider, hosted in the EU.
            Data is processed under a Data Processing Agreement.
          </Li>
          <Li>
            <strong>Resend</strong> — used to send transactional emails (verification links, review
            invites). Only your email address and the content of the email are shared.
          </Li>
          <Li>
            <strong>Stripe</strong> — processes payments for practice subscriptions. We do not
            store card details; Stripe handles all payment data under their own privacy policy.
          </Li>
          <Li>
            <strong>Anthropic</strong> — review text may be sent to Anthropic&apos;s API to generate
            anonymised AI summaries. No personally identifiable information is included in these
            requests. Summaries are cached in our database; raw review text is not stored by
            Anthropic under our API agreement.
          </Li>
          <Li>
            <strong>Legal obligations</strong> — we may disclose data to law enforcement or
            regulators where required by law.
          </Li>
        </Ul>
        <P>
          We do not sell your personal data to any third party.
        </P>
      </Section>

      <Section title="5. How long we keep your data">
        <Ul>
          <Li><strong>Reviews</strong> — retained indefinitely while the practice is listed, as they form the public record. You may request removal (see section 6).</Li>
          <Li><strong>Account data</strong> — retained for as long as your account is active, then deleted within 90 days of account closure.</Li>
          <Li><strong>Email addresses (reviewers)</strong> — retained for 24 months to allow follow-up check-ins if opted in, then deleted.</Li>
          <Li><strong>Page view events</strong> — aggregated after 12 months; raw event data is deleted.</Li>
          <Li><strong>Server logs</strong> — retained for up to 30 days for security purposes.</Li>
        </Ul>
      </Section>

      <Section title="6. Your rights">
        <P>
          Under UK GDPR you have the following rights regarding your personal data:
        </P>
        <Ul>
          <Li><strong>Access</strong> — request a copy of the data we hold about you.</Li>
          <Li><strong>Rectification</strong> — ask us to correct inaccurate data.</Li>
          <Li><strong>Erasure</strong> — ask us to delete your data (&ldquo;right to be forgotten&rdquo;). Note that removing a review may not be possible where it forms part of a verified public record, but we will consider each request.</Li>
          <Li><strong>Restriction</strong> — ask us to limit how we process your data while a dispute is resolved.</Li>
          <Li><strong>Portability</strong> — receive your data in a structured, machine-readable format.</Li>
          <Li><strong>Objection</strong> — object to processing based on legitimate interests.</Li>
          <Li><strong>Withdraw consent</strong> — where processing is based on consent, you can withdraw it at any time without affecting prior processing.</Li>
        </Ul>
        <P>
          To exercise any of these rights, email{' '}
          <a href="mailto:hello@smileproof.co.uk" style={{ color: 'var(--forest)' }}>
            hello@smileproof.co.uk
          </a>
          . We will respond within 30 days. You also have the right to lodge a complaint with the
          Information Commissioner&apos;s Office (ICO) at{' '}
          <a href="https://ico.org.uk" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--forest)' }}>
            ico.org.uk
          </a>
          .
        </P>
      </Section>

      <Section title="7. Data security">
        <P>
          We use industry-standard measures to protect your personal data, including encrypted
          connections (TLS), row-level security on our database, and access controls that limit
          which team members can view personal information. No transmission over the internet is
          completely secure — if you believe your data has been compromised, please contact us
          immediately.
        </P>
      </Section>

      <Section title="8. Children">
        <P>
          SmileProof is not intended for use by anyone under 18. We do not knowingly collect
          personal data from children. If you believe a child has submitted data to us, please
          contact us and we will delete it promptly.
        </P>
      </Section>

      <Section title="9. International transfers">
        <P>
          Our primary infrastructure is located within the UK and EU. Where data is transferred
          outside the UK (for example, to Anthropic&apos;s US-based API), we ensure appropriate
          safeguards are in place, including standard contractual clauses approved by the ICO.
        </P>
      </Section>

      <Section title="10. Changes to this policy">
        <P>
          We may update this policy periodically. Material changes will be flagged by updating the
          effective date at the top of this page. We encourage you to review this policy from time
          to time. Continued use of SmileProof after changes are posted constitutes acceptance of
          the revised policy.
        </P>
      </Section>

      <Section title="11. Contact">
        <P>
          For any privacy questions or to exercise your rights, contact us at{' '}
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
        <Link href="/terms" style={{ fontSize: 13, color: 'var(--ink-soft)', textDecoration: 'none' }}>Terms of Service</Link>
        <Link href="/" style={{ fontSize: 13, color: 'var(--ink-soft)', textDecoration: 'none' }}>Back to SmileProof</Link>
      </div>
    </main>
  );
}
