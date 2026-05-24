import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createAdminSupabase } from '@/lib/supabase';
import { PLANS } from '@/lib/stripe';
import UpgradeButtons from './UpgradeButtons';

type Params = { params: Promise<{ slug: string }> };

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
          You&apos;re already on a paid plan
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
    <main style={{ maxWidth: 640, margin: '0 auto', padding: '48px 24px' }}>
      <Link
        href={`/practices/${slug}/dashboard`}
        style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--ink-soft)', textDecoration: 'none', marginBottom: 32, fontFamily: 'var(--font-body)' }}
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M9 2L4 7l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Back to dashboard
      </Link>

      <div style={{ textAlign: 'center', marginBottom: 40 }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 700, color: 'var(--ink)', letterSpacing: '-0.02em', marginBottom: 8 }}>
          Grow your practice with data
        </h1>
        <p style={{ fontSize: 15, color: 'var(--ink-soft)', fontFamily: 'var(--font-body)', lineHeight: 1.6 }}>
          Understand your reputation, respond faster, and attract more patients.
        </p>
      </div>

      {/* Plan cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 32 }}>
        {/* Growth */}
        <div style={{ background: 'white', border: '1.5px solid var(--cream-dark)', borderRadius: 14, padding: '24px', boxShadow: 'var(--shadow-card)' }}>
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--forest)', marginBottom: 8, fontFamily: 'var(--font-body)' }}>
              Growth
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: 36, fontWeight: 700, color: 'var(--ink)', letterSpacing: '-0.03em' }}>£49</span>
              <span style={{ fontSize: 13, color: 'var(--ink-soft)', fontFamily: 'var(--font-body)' }}>/month</span>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {PLANS.growth.features.map(f => (
              <div key={f} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <div style={{ width: 16, height: 16, borderRadius: '50%', background: 'var(--forest)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}>
                  <svg width="8" height="8" viewBox="0 0 10 10" fill="none">
                    <polyline points="2,5 4,7.5 8,2.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <span style={{ fontSize: 13, color: 'var(--ink)', fontFamily: 'var(--font-body)' }}>{f}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Pro */}
        <div style={{ background: 'var(--forest)', border: '1.5px solid var(--forest)', borderRadius: 14, padding: '24px', position: 'relative' }}>
          <div style={{ position: 'absolute', top: -10, left: '50%', transform: 'translateX(-50%)', background: '#f59e0b', color: 'white', fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', padding: '3px 10px', borderRadius: 20, fontFamily: 'var(--font-body)', whiteSpace: 'nowrap' }}>
            Recommended
          </div>
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.6)', marginBottom: 8, fontFamily: 'var(--font-body)' }}>
              Pro
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: 36, fontWeight: 700, color: 'white', letterSpacing: '-0.03em' }}>£99</span>
              <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', fontFamily: 'var(--font-body)' }}>/month</span>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {PLANS.pro.features.map(f => (
              <div key={f} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <div style={{ width: 16, height: 16, borderRadius: '50%', background: 'rgba(245,158,11,0.25)', border: '1.5px solid rgba(245,158,11,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}>
                  <svg width="8" height="8" viewBox="0 0 10 10" fill="none">
                    <polyline points="2,5 4,7.5 8,2.5" stroke="#f59e0b" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.85)', fontFamily: 'var(--font-body)' }}>{f}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <UpgradeButtons slug={slug} />

      <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--ink-faint)', fontFamily: 'var(--font-body)', marginTop: 16 }}>
        Cancel any time. Questions? <a href="mailto:hello@smileproof.co.uk" style={{ color: 'var(--forest)' }}>hello@smileproof.co.uk</a>
      </p>
    </main>
  );
}
