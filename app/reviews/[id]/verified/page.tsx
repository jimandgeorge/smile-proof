import Link from 'next/link';
import { createAdminSupabase } from '@/lib/supabase';

type Params = { params: Promise<{ id: string }> };

export default async function VerifiedPage({ params }: Params) {
  const { id } = await params;
  const admin = createAdminSupabase();

  const { data: review } = await admin
    .from('reviews')
    .select('practices(name, slug)')
    .eq('id', id)
    .single();

  const practice = review?.practices as any;

  return (
    <main style={{ maxWidth: 480, margin: '0 auto', padding: '80px 24px', textAlign: 'center' }}>
      {/* Verified badge */}
      <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--forest)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
          <polyline points="4,12 9,17 20,6" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>

      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 700, color: 'var(--ink)', marginBottom: 12, letterSpacing: '-0.02em' }}>
        Review verified
      </h1>

      {practice && (
        <p style={{ fontSize: 15, color: 'var(--forest)', fontWeight: 600, fontFamily: 'var(--font-body)', marginBottom: 12 }}>
          {practice.name}
        </p>
      )}

      <p style={{ fontSize: 14, color: 'var(--ink-soft)', fontFamily: 'var(--font-body)', lineHeight: 1.7, marginBottom: 36 }}>
        Your email has been confirmed and your review is marked as <strong style={{ color: 'var(--forest)' }}>verified</strong>. It will appear on the practice profile once approved by our moderation team.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'center' }}>
        {practice?.slug && (
          <Link
            href={`/practices/${practice.slug}`}
            style={{ padding: '12px 32px', borderRadius: 50, background: 'var(--forest)', color: 'var(--cream)', textDecoration: 'none', fontSize: 14, fontWeight: 600, fontFamily: 'var(--font-body)' }}
          >
            View practice profile
          </Link>
        )}
        <Link
          href="/"
          style={{ fontSize: 13, color: 'var(--ink-soft)', fontFamily: 'var(--font-body)', textDecoration: 'none' }}
        >
          Back to home
        </Link>
      </div>
    </main>
  );
}
