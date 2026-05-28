import Link from 'next/link';
import ContactForm from './ContactForm';

const CATEGORIES = [
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
        <rect x="3" y="7" width="18" height="14" rx="2" stroke="#34d399" strokeWidth="1.6" />
        <path d="M8 7V5a4 4 0 0 1 8 0v2" stroke="#34d399" strokeWidth="1.6" strokeLinecap="round" />
        <path d="M12 13v3" stroke="#34d399" strokeWidth="1.6" strokeLinecap="round" />
        <circle cx="12" cy="12.5" r="0.8" fill="#34d399" />
      </svg>
    ),
    title: 'Practice support',
    description: 'Help claiming your practice, using the intelligence dashboard, or managing your subscription.',
    contact: 'hello@smileproof.co.uk',
    href: 'mailto:hello@smileproof.co.uk',
  },
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke="#34d399" strokeWidth="1.6" strokeLinecap="round" />
        <circle cx="9" cy="7" r="4" stroke="#34d399" strokeWidth="1.6" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" stroke="#34d399" strokeWidth="1.6" strokeLinecap="round" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" stroke="#34d399" strokeWidth="1.6" strokeLinecap="round" />
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
    a: 'Start with a 14-day free trial — full access to all features. £99/mo after the trial ends.',
    href: '/pricing',
  },
  {
    q: 'Can I cancel at any time?',
    a: "Yes — cancel from the billing section of your dashboard and you'll retain access until the end of your billing period.",
    href: null,
  },
];

export default function ContactPage() {
  return (
    <main style={{ background: '#07070e' }}>

      {/* ── Hero ── */}
      <section style={{
        background: 'linear-gradient(160deg, #0c0c18 0%, #07070e 65%)',
        padding: 'clamp(72px, 10vw, 112px) 24px clamp(64px, 8vw, 96px)',
        position: 'relative',
        overflow: 'hidden',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(52,211,153,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(52,211,153,0.02) 1px, transparent 1px)', backgroundSize: '64px 64px', pointerEvents: 'none' }} />
        <div style={{ maxWidth: 720, margin: '0 auto', textAlign: 'center', position: 'relative' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '5px 14px', borderRadius: 100, background: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.18)', marginBottom: 24 }}>
            <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#34d399', display: 'inline-block', boxShadow: '0 0 6px rgba(52,211,153,0.8)' }} />
            <span style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#34d399', fontFamily: 'var(--font-body)' }}>Support</span>
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(34px, 5vw, 52px)', fontWeight: 800, color: '#edeef5', letterSpacing: '-0.03em', lineHeight: 1.08, marginBottom: 18 }}>
            We&apos;re here to help.
          </h1>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 'clamp(15px, 2vw, 17px)', color: 'rgba(237,238,245,0.5)', lineHeight: 1.65, maxWidth: 460, margin: '0 auto' }}>
            Questions about the dashboard, your practice profile, or SmileProof? Our team is happy to help.
          </p>
        </div>
      </section>

      {/* ── Contact category cards ── */}
      <section style={{ padding: '64px 24px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 14 }}>
            {CATEGORIES.map(({ icon, title, description, contact, href }) => (
              <div key={title} style={{ background: '#111119', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: '24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {icon}
                </div>
                <div>
                  <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700, color: '#edeef5', letterSpacing: '-0.015em', marginBottom: 8 }}>
                    {title}
                  </h2>
                  <p style={{ fontFamily: 'var(--font-body)', fontSize: 13.5, color: 'rgba(237,238,245,0.48)', lineHeight: 1.6 }}>
                    {description}
                  </p>
                </div>
                <a href={href} style={{ fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600, color: '#34d399', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 5, marginTop: 'auto' }}>
                  {contact}
                  <svg width="11" height="11" viewBox="0 0 12 12" fill="none" aria-hidden>
                    <path d="M2.5 9.5l7-7M4 2.5h5.5v5.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Form ── */}
      <section style={{ padding: '72px 24px' }}>
        <div style={{ maxWidth: 640, margin: '0 auto' }}>
          <div style={{ marginBottom: 36 }}>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#34d399', opacity: 0.8, marginBottom: 10 }}>
              Get in touch
            </p>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(22px, 3vw, 30px)', fontWeight: 800, color: '#edeef5', letterSpacing: '-0.025em', marginBottom: 10 }}>
              Send us a message
            </h2>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 15, color: 'rgba(237,238,245,0.48)', lineHeight: 1.65 }}>
              Fill in the form below and we&apos;ll get back to you within 1 business day.
            </p>
          </div>

          <div style={{ background: '#111119', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, padding: '32px 28px' }}>
            <ContactForm />
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px 24px', marginTop: 24, justifyContent: 'center' }}>
            {['Respond within 1 business day', 'Handled by the SmileProof team', 'We never share your details'].map(item => (
              <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                <svg width="13" height="13" viewBox="0 0 14 14" fill="none" aria-hidden>
                  <circle cx="7" cy="7" r="6.5" stroke="rgba(52,211,153,0.5)" strokeWidth="1.2" />
                  <path d="M4.5 7l2 2 3.5-3.5" stroke="#34d399" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span style={{ fontFamily: 'var(--font-body)', fontSize: 12.5, color: 'rgba(237,238,245,0.38)' }}>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: '72px 24px' }}>
        <div style={{ maxWidth: 680, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 44 }}>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#34d399', opacity: 0.8, marginBottom: 10 }}>
              Quick answers
            </p>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(22px, 3vw, 28px)', fontWeight: 800, color: '#edeef5', letterSpacing: '-0.025em' }}>
              Common questions
            </h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {FAQS.map(({ q, a, href }) => (
              <div key={q} style={{ background: '#111119', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: '20px 22px' }}>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: 14.5, fontWeight: 700, color: '#edeef5', marginBottom: 8, lineHeight: 1.4 }}>
                  {q}
                </p>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: 13.5, color: 'rgba(237,238,245,0.48)', lineHeight: 1.65, marginBottom: href ? 12 : 0 }}>
                  {a}
                </p>
                {href && (
                  <Link href={href} style={{ fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600, color: '#34d399', textDecoration: 'none' }}>
                    Learn more →
                  </Link>
                )}
              </div>
            ))}
          </div>

          <p style={{ textAlign: 'center', fontFamily: 'var(--font-body)', fontSize: 13.5, color: 'rgba(237,238,245,0.38)', marginTop: 36 }}>
            Didn&apos;t find what you need?{' '}
            <a href="mailto:hello@smileproof.co.uk" style={{ color: '#34d399', fontWeight: 600, textDecoration: 'none' }}>
              Email us directly →
            </a>
          </p>
        </div>
      </section>

    </main>
  );
}
