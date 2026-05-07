import Link from 'next/link';

export const metadata = {
  title: 'For Dental Practices | SmileProof',
  description: 'Claim your free SmileProof listing, respond to patient reviews, and attract new patients with verified social proof.',
};

const benefits = [
  {
    title: 'Verified patient reviews',
    body: 'Every review is tied to a real patient email — no fake reviews, no anonymous attacks. Honest feedback your new patients can trust.',
  },
  {
    title: 'Respond publicly',
    body: 'Show prospective patients how you handle feedback. A thoughtful response to a negative review is one of the most powerful trust signals in healthcare.',
  },
  {
    title: 'Transparent pricing',
    body: 'Patients report what they actually paid. Practices that show competitive prices attract more enquiries — especially for implants and Invisalign.',
  },
  {
    title: 'Understand your ratings',
    body: 'Your dashboard breaks scores across six dimensions — pain, communication, cost, cleanliness, anxiety handling, and overall.',
  },
  {
    title: 'Get found locally',
    body: 'Every practice page is server-rendered for SEO, and postcode search puts you in front of patients nearby.',
  },
  {
    title: 'Free to claim',
    body: 'Claiming your listing costs nothing. Your profile, review responses, and dashboard are all included at no charge.',
  },
];

const steps = [
  { n: '1', title: 'Find your practice', body: 'Search by postcode or name.' },
  { n: '2', title: 'Enter your work email', body: 'We send a one-click verification link to your practice email.' },
  { n: '3', title: 'Click the link', body: "That's it — your dashboard is ready immediately." },
];

export default function ForDentistsPage() {
  return (
    <div>
      {/* Hero */}
      <section style={{ background: 'linear-gradient(160deg, #1c4535 0%, #2a5e49 40%, #3a7a5e 100%)', position: 'relative', overflow: 'hidden' }}>
        <span style={{ position: 'absolute', width: 480, height: 480, top: -100, right: -100, borderRadius: '50%', background: 'rgba(255,255,255,0.04)', pointerEvents: 'none' }} />
        <div style={{ maxWidth: 720, margin: '0 auto', padding: '72px 24px', textAlign: 'center', position: 'relative' }}>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 16 }}>
            For dental practices
          </p>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(32px,5vw,56px)', fontWeight: 700, color: 'var(--cream)', lineHeight: 1.1, letterSpacing: '-0.02em', marginBottom: 20 }}>
            Turn patient reviews into<br /><em>your biggest growth channel</em>
          </h1>
          <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.65)', lineHeight: 1.65, maxWidth: 480, margin: '0 auto 36px' }}>
            SmileProof gives dental practices a free, verified reviews profile — and the tools to respond, learn, and attract new patients.
          </p>
          <Link
            href="/search"
            style={{ display: 'inline-block', background: 'var(--cream)', color: 'var(--forest)', fontWeight: 700, fontSize: 15, padding: '14px 32px', borderRadius: 50, textDecoration: 'none', fontFamily: 'var(--font-body)', transition: 'var(--transition)' }}
          >
            Claim your practice free →
          </Link>
        </div>
      </section>

      {/* Benefits */}
      <section style={{ maxWidth: 896, margin: '0 auto', padding: '72px 24px' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 700, color: 'var(--ink)', textAlign: 'center', marginBottom: 48, letterSpacing: '-0.01em' }}>
          Everything your practice needs
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
          {benefits.map((b) => (
            <div key={b.title} style={{ background: 'white', border: '1.5px solid var(--cream-dark)', borderRadius: 'var(--radius)', padding: '24px 24px 20px', boxShadow: 'var(--shadow-card)' }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 600, color: 'var(--ink)', marginBottom: 8 }}>{b.title}</h3>
              <p style={{ fontSize: 14, color: 'var(--ink-soft)', lineHeight: 1.65 }}>{b.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section style={{ background: 'var(--forest-pale)', borderTop: '1px solid rgba(28,69,53,0.1)', borderBottom: '1px solid rgba(28,69,53,0.1)', padding: '72px 24px' }}>
        <div style={{ maxWidth: 720, margin: '0 auto' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 700, color: 'var(--ink)', textAlign: 'center', marginBottom: 48, letterSpacing: '-0.01em' }}>
            Claim your listing in 60 seconds
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 32 }}>
            {steps.map((s) => (
              <div key={s.n} style={{ textAlign: 'center' }}>
                <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--forest)', color: 'var(--cream)', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                  {s.n}
                </div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 600, color: 'var(--ink)', marginBottom: 6 }}>{s.title}</h3>
                <p style={{ fontSize: 13, color: 'var(--ink-soft)', lineHeight: 1.6 }}>{s.body}</p>
              </div>
            ))}
          </div>
          <div style={{ textAlign: 'center', marginTop: 48 }}>
            <Link
              href="/search"
              style={{ display: 'inline-block', background: 'var(--forest)', color: 'var(--cream)', fontWeight: 600, fontSize: 14, padding: '12px 32px', borderRadius: 50, textDecoration: 'none', fontFamily: 'var(--font-body)', transition: 'var(--transition)' }}
            >
              Find my practice →
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section style={{ maxWidth: 640, margin: '0 auto', padding: '72px 24px' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 700, color: 'var(--ink)', marginBottom: 36, letterSpacing: '-0.01em' }}>
          Common questions
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          {[
            { q: 'Is it really free?', a: 'Yes. Claiming your listing, responding to reviews, and accessing your dashboard costs nothing.' },
            { q: 'Can I remove negative reviews?', a: "No — but you can respond to them publicly. Patients trust practices that engage with criticism far more than those with suspiciously perfect scores." },
            { q: 'How do you verify reviews are real?', a: 'Every reviewer confirms ownership of their email address via a magic link before their review goes live. Unverified reviews are marked clearly.' },
            { q: 'What if my practice is not listed?', a: 'Contact us and we will add you. We seed England listings from the CQC register, so most English practices are already here. Scotland, Wales, and Northern Ireland can be added on request.' },
          ].map(({ q, a }, i, arr) => (
            <div key={q} style={{ padding: '24px 0', borderBottom: i < arr.length - 1 ? '1px solid var(--cream-dark)' : 'none' }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 600, color: 'var(--ink)', marginBottom: 8 }}>{q}</h3>
              <p style={{ fontSize: 14, color: 'var(--ink-soft)', lineHeight: 1.65 }}>{a}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
