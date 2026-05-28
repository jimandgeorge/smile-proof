import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createAdminSupabase } from '@/lib/supabase';
import { ChevronLeft } from 'lucide-react';
import UpgradeButtons from './UpgradeButtons';

type Params = { params: Promise<{ slug: string }> };

const features = [
  'AI-powered patient sentiment analysis',
  'Google review intelligence',
  'Patient trust scoring across 7 dimensions',
  'Operational recommendations',
  'Reputation trend monitoring',
  'AI management summary reports',
  'City-level benchmarking',
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
      <main style={{ minHeight: '100vh', background: '#07070e', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 11-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 800, color: '#edeef5', marginBottom: 12, letterSpacing: '-0.02em' }}>
            You&apos;re already on Pro
          </h1>
          <Link href={`/practices/${slug}/dashboard`} style={{ fontSize: 13, color: '#34d399', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
            <ChevronLeft size={14} strokeWidth={1.5} />
            Back to dashboard
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main style={{ minHeight: '100vh', background: '#07070e', padding: 'clamp(40px, 6vw, 80px) 24px' }}>
      <div style={{ maxWidth: 520, margin: '0 auto' }}>

        <Link
          href={`/practices/${slug}/dashboard`}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 13, color: 'rgba(237,238,245,0.4)', textDecoration: 'none', marginBottom: 36, fontFamily: 'var(--font-body)' }}
        >
          <ChevronLeft size={14} strokeWidth={1.5} />
          Back to dashboard
        </Link>

        <div style={{ marginBottom: 36 }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#34d399', opacity: 0.8, fontFamily: 'var(--font-body)', marginBottom: 10 }}>
            Upgrade to Pro
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(28px, 4vw, 38px)', fontWeight: 800, color: '#edeef5', lineHeight: 1.1, letterSpacing: '-0.03em', margin: '0 0 12px' }}>
            Unlock the full intelligence platform.
          </h1>
          <p style={{ fontSize: 15, color: 'rgba(237,238,245,0.48)', lineHeight: 1.65, fontFamily: 'var(--font-body)', margin: 0 }}>
            Get complete access to SmileProof&apos;s AI-powered patient intelligence tools.
          </p>
        </div>

        {/* Plan card */}
        <div style={{
          background: '#111119',
          border: '1px solid rgba(52,211,153,0.2)',
          borderRadius: 16,
          overflow: 'hidden',
          marginBottom: 20,
          position: 'relative',
        }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg, #34d399, #059669)' }} />

          <div style={{ padding: '28px 28px 24px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24 }}>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#34d399', fontFamily: 'var(--font-body)', marginBottom: 8 }}>
                  Pro
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                  <span style={{ fontFamily: 'var(--font-display)', fontSize: 42, fontWeight: 800, color: '#edeef5', letterSpacing: '-0.03em' }}>£99</span>
                  <span style={{ fontSize: 14, color: 'rgba(237,238,245,0.4)', fontFamily: 'var(--font-body)' }}>/month</span>
                </div>
              </div>
              <div style={{ padding: '5px 12px', borderRadius: 100, background: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.2)', fontSize: 11, fontWeight: 700, color: '#34d399', fontFamily: 'var(--font-body)', letterSpacing: '0.04em' }}>
                14-day trial
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
              {features.map(f => (
                <div key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                  <div style={{
                    width: 16, height: 16, borderRadius: '50%',
                    background: 'rgba(52,211,153,0.12)', border: '1px solid rgba(52,211,153,0.28)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1,
                  }}>
                    <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5" /></svg>
                  </div>
                  <span style={{ fontSize: 13.5, color: 'rgba(237,238,245,0.62)', fontFamily: 'var(--font-body)', lineHeight: 1.5 }}>{f}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <UpgradeButtons slug={slug} />

        <p style={{ textAlign: 'center', fontSize: 12.5, color: 'rgba(237,238,245,0.22)', fontFamily: 'var(--font-body)', marginTop: 16, lineHeight: 1.6 }}>
          Cancel any time. Questions?{' '}
          <a href="mailto:hello@smileproof.co.uk" style={{ color: 'rgba(52,211,153,0.6)', textDecoration: 'none' }}>hello@smileproof.co.uk</a>
        </p>

      </div>
    </main>
  );
}
