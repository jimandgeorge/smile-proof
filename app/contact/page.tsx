import Link from 'next/link';
import ContactForm from './ContactForm';

const CATEGORIES = [
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
        <rect x="3" y="7" width="18" height="14" rx="2" stroke="var(--forest)" strokeWidth="1.6" />
        <path d="M8 7V5a4 4 0 0 1 8 0v2" stroke="var(--forest)" strokeWidth="1.6" strokeLinecap="round" />
        <path d="M12 13v3" stroke="var(--forest)" strokeWidth="1.6" strokeLinecap="round" />
        <circle cx="12" cy="12.5" r="0.8" fill="var(--forest)" />
      </svg>
    ),
    title: 'Practice support',
    description: 'Help claiming your practice, using the intelligence dashboard, or managing your subscription.',
    contact: 'hello@smileproof.co.uk',
    href: 'mailto:hello@smileproof.co.uk',
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke="var(--forest)" strokeWidth="1.6" strokeLinecap="round" />
        <circle cx="9" cy="7" r="4" stroke="var(--forest)" strokeWidth="1.6" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" stroke="var(--forest)" strokeWidth="1.6" strokeLinecap="round" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" stroke="var(--forest)" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    ),
    title: 'Partnerships & dental groups',
    description: 'Multi-location groups, enterprise enquiries, or press.',
    contact: 'hello@smileproof.co.uk',
    href: 'mailto:hello@smileproof.co.uk',
  },
];

const FAQS = [
  {
    q: 'How do I claim my practice?',
    a: "Search for your practice on SmileProof, open the profile, and click \"Claim this practice\". We'll verify ownership by email.",
    href: null,
  },
  {
    q: 'Where does the review data come from?',
    a: 'SmileProof imports your Google Reviews. Your data is used only inside your private dashboard — never shown publicly on our site.',
    href: null,
  },
  {
    q: 'How does pricing work?',
    a: 'Claiming your practice is free. Pro unlocks AI intelligence reports, local benchmarking, and profile analytics.',
    href: '/pricing',
  },
  {
    q: 'Can I cancel at any time?',
    a: 'Yes — cancel from the billing section of your dashboard and you\'ll retain access until the end of your billing period.',
    href: null,
  },
];

export default function ContactPage() {
  return (
    <main>

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section
        style={{
          background: 'linear-gradient(150deg, #122d21 0%, #1c4535 45%, #24594a 100%)',
          padding: '80px 24px 88px',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <span aria-hidden style={{ position: 'absolute', top: -160, right: -120, width: 480, height: 480, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,0.05) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ maxWidth: 620, margin: '0 auto', textAlign: 'center', position: 'relative' }}>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 11, fontWeight: 800, letterSpacing: '0.13em', textTransform: 'uppercase', color: '#6ee7b7', marginBottom: 16 }}>
            Support
          </p>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(34px,5vw,52px)', fontWeight: 800, color: 'white', letterSpacing: '-0.03em', lineHeight: 1.1, marginBottom: 18 }}>
            We're here to help.
          </h1>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 'clamp(15px,2vw,18px)', color: 'rgba(255,255,255,0.62)', lineHeight: 1.65, maxWidth: 480, margin: '0 auto' }}>
            Questions about reviews, clinic profiles, or SmileProof? Our team is happy to help.
          </p>
        </div>
      </section>

      {/* ── Contact category cards ────────────────────────────────────────── */}
      <section style={{ background: 'var(--cream)', borderBottom: '1px solid var(--cream-dark)', padding: '64px 24px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
            {CATEGORIES.map(({ icon, title, description, contact, href }) => (
              <div
                key={title}
                style={{
                  background: 'white',
                  border: '1.5px solid var(--cream-dark)',
                  borderRadius: 14,
                  padding: '28px 24px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 14,
                }}
              >
                <div style={{ width: 46, height: 46, borderRadius: 12, background: 'var(--forest-pale)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {icon}
                </div>
                <div>
                  <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 800, color: 'var(--ink)', letterSpacing: '-0.015em', marginBottom: 8 }}>
                    {title}
                  </h2>
                  <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--ink-soft)', lineHeight: 1.6, marginBottom: 0 }}>
                    {description}
                  </p>
                </div>
                <a
                  href={href}
                  style={{ fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600, color: 'var(--forest)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 5, marginTop: 'auto' }}
                >
                  {contact}
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
                    <path d="M2.5 9.5l7-7M4 2.5h5.5v5.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Form + Trust ─────────────────────────────────────────────────── */}
      <section style={{ background: 'var(--cream)', padding: '72px 24px' }}>
        <div style={{ maxWidth: 680, margin: '0 auto' }}>

          <div style={{ marginBottom: 40 }}>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 11, fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--forest)', marginBottom: 10 }}>
              Get in touch
            </p>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(22px,3vw,30px)', fontWeight: 800, color: 'var(--ink)', letterSpacing: '-0.025em', marginBottom: 10 }}>
              Send us a message
            </h2>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 15, color: 'var(--ink-soft)', lineHeight: 1.65 }}>
              Fill in the form below and we'll get back to you within 1 business day.
            </p>
          </div>

          <div style={{ background: 'white', border: '1.5px solid var(--cream-dark)', borderRadius: 16, padding: '36px 32px' }}>
            <ContactForm />
          </div>

          {/* Trust indicators */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px 28px', marginTop: 28, justifyContent: 'center' }}>
            {[
              'Respond within 1 business day',
              'Handled by the SmileProof team',
              'We never share your details',
            ].map(item => (
              <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
                  <circle cx="7" cy="7" r="6.5" stroke="var(--forest)" strokeWidth="1.2" />
                  <path d="M4.5 7l2 2 3.5-3.5" stroke="var(--forest)" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--ink-soft)' }}>{item}</span>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ── FAQ preview ──────────────────────────────────────────────────── */}
      <section style={{ background: 'var(--forest-pale)', borderTop: '1px solid rgba(28,69,53,0.1)', padding: '72px 24px' }}>
        <div style={{ maxWidth: 720, margin: '0 auto' }}>

          <div style={{ textAlign: 'center', marginBottom: 44 }}>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 11, fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--forest)', marginBottom: 10 }}>
              Quick answers
            </p>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(22px,3vw,28px)', fontWeight: 800, color: 'var(--ink)', letterSpacing: '-0.025em' }}>
              Common questions
            </h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {FAQS.map(({ q, a, href }) => (
              <div
                key={q}
                style={{ background: 'white', border: '1.5px solid rgba(28,69,53,0.12)', borderRadius: 12, padding: '20px 24px' }}
              >
                <p style={{ fontFamily: 'var(--font-body)', fontSize: 15, fontWeight: 700, color: 'var(--ink)', marginBottom: 8, lineHeight: 1.4 }}>
                  {q}
                </p>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--ink-soft)', lineHeight: 1.65, marginBottom: href ? 12 : 0 }}>
                  {a}
                </p>
                {href && (
                  <Link
                    href={href}
                    style={{ fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600, color: 'var(--forest)', textDecoration: 'none' }}
                  >
                    Learn more →
                  </Link>
                )}
              </div>
            ))}
          </div>

          <p style={{ textAlign: 'center', fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--ink-soft)', marginTop: 36 }}>
            Didn't find what you need?{' '}
            <a href="mailto:support@smileproof.co.uk" style={{ color: 'var(--forest)', fontWeight: 600, textDecoration: 'none' }}>
              Email us directly →
            </a>
          </p>

        </div>
      </section>

    </main>
  );
}
