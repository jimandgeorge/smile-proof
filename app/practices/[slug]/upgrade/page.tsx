import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createAdminSupabase } from '@/lib/supabase';

type Params = { params: Promise<{ slug: string }> };

const FEATURES = [
  ['Practice insights', 'Response rate, city ranking, monthly review trends'],
  ['AI reply generation', 'One-click AI-drafted responses to patient reviews'],
  ['Review invite tool', 'QR code and shareable link to collect more reviews'],
  ['Score trend tracking', 'See if your rating is improving over time'],
  ['Email alerts', 'Instant notification when a new review is published'],
  ['Priority support', 'Direct support from the SmileProof team'],
];

export default async function UpgradePage({ params }: Params) {
  const { slug } = await params;
  const admin = createAdminSupabase();

  const { data: practice } = await admin
    .from('practices')
    .select('id, name, subscription_status')
    .eq('slug', slug)
    .single();

  if (!practice) notFound();

  if ((practice as any).subscription_status === 'active') {
    return (
      <main style={{ maxWidth: 480, margin: '0 auto', padding: '80px 24px', textAlign: 'center' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 700, color: 'var(--ink)', marginBottom: 12 }}>
          You're already on Pro
        </h1>
        <Link
          href={`/practices/${slug}/dashboard`}
          style={{ fontSize: 14, color: 'var(--forest)', textDecoration: 'none' }}
        >
          Back to dashboard →
        </Link>
      </main>
    );
  }

  return (
    <main style={{ maxWidth: 560, margin: '0 auto', padding: '48px 24px' }}>
      <Link
        href={`/practices/${slug}/dashboard`}
        style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--ink-soft)', textDecoration: 'none', marginBottom: 32, fontFamily: 'var(--font-body)' }}
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M9 2L4 7l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Back to dashboard
      </Link>

      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 36 }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 11, fontWeight: 700, color: 'var(--forest)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 12 }}>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M6 1l1.5 3 3.5.5-2.5 2.5.5 3.5L6 9 2.5 10.5l.5-3.5L.5 4.5 4 4z" stroke="var(--forest)" strokeWidth="1.2" strokeLinejoin="round" fill="none" />
          </svg>
          SmileProof Pro
        </div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 700, color: 'var(--ink)', letterSpacing: '-0.02em', marginBottom: 8 }}>
          Grow your practice with data
        </h1>
        <p style={{ fontSize: 15, color: 'var(--ink-soft)', fontFamily: 'var(--font-body)', lineHeight: 1.6 }}>
          Everything you need to understand your reputation, respond faster, and attract more patients.
        </p>
      </div>

      {/* Pricing card */}
      <div style={{ background: 'white', border: '1.5px solid var(--cream-dark)', borderRadius: 'var(--radius)', padding: '28px 32px', boxShadow: 'var(--shadow-card)', marginBottom: 16 }}>
        {/* Price */}
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 6 }}>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 42, fontWeight: 700, color: 'var(--ink)', letterSpacing: '-0.03em' }}>£49</span>
          <span style={{ fontSize: 14, color: 'var(--ink-soft)', fontFamily: 'var(--font-body)' }}>/month</span>
        </div>
        <p style={{ fontSize: 13, color: 'var(--ink-faint)', fontFamily: 'var(--font-body)', marginBottom: 24 }}>
          Per practice. Cancel any time.
        </p>

        {/* Feature list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 28 }}>
          {FEATURES.map(([title, desc]) => (
            <div key={title} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <div style={{ width: 18, height: 18, borderRadius: '50%', background: 'var(--forest)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
                <svg width="9" height="9" viewBox="0 0 10 10" fill="none">
                  <polyline points="2,5 4,7.5 8,2.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)', fontFamily: 'var(--font-body)' }}>{title}</div>
                <div style={{ fontSize: 12, color: 'var(--ink-soft)', fontFamily: 'var(--font-body)' }}>{desc}</div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <a
          href={`mailto:hello@smileproof.co.uk?subject=Pro upgrade request — ${encodeURIComponent(practice.name)}&body=Hi, I'd like to upgrade ${encodeURIComponent(practice.name)} to SmileProof Pro.`}
          style={{ display: 'block', width: '100%', padding: '14px', borderRadius: 50, background: 'var(--forest)', color: 'var(--cream)', border: 'none', fontSize: 15, fontWeight: 700, fontFamily: 'var(--font-body)', cursor: 'pointer', textAlign: 'center', textDecoration: 'none', boxSizing: 'border-box' }}
        >
          Get started — email us to upgrade
        </a>
      </div>

      <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--ink-faint)', fontFamily: 'var(--font-body)' }}>
        Questions? Email us at <a href="mailto:hello@smileproof.co.uk" style={{ color: 'var(--forest)' }}>hello@smileproof.co.uk</a>
      </p>
    </main>
  );
}
