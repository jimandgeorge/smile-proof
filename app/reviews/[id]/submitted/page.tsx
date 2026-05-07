import Link from 'next/link';
import { createAdminSupabase } from '@/lib/supabase';

type Params = { params: Promise<{ id: string }> };

export default async function SubmittedPage({ params }: Params) {
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
      {/* Check circle */}
      <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--forest-pale)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="12" fill="var(--forest)" />
          <polyline points="6,12 10,16.5 18,7.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>

      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 700, color: 'var(--ink)', marginBottom: 12, letterSpacing: '-0.02em' }}>
        Review submitted
      </h1>

      {practice && (
        <p style={{ fontSize: 15, color: 'var(--forest)', fontWeight: 600, fontFamily: 'var(--font-body)', marginBottom: 12 }}>
          {practice.name}
        </p>
      )}

      <p style={{ fontSize: 14, color: 'var(--ink-soft)', fontFamily: 'var(--font-body)', lineHeight: 1.7, marginBottom: 8 }}>
        Thank you — your review is pending moderation and will appear once approved.
      </p>
      <p style={{ fontSize: 14, color: 'var(--ink-soft)', fontFamily: 'var(--font-body)', lineHeight: 1.7, marginBottom: 36 }}>
        We've sent a verification email to your address. Clicking the link will mark your review as <strong style={{ color: 'var(--forest)' }}>verified</strong>, which gives it more weight in the scoring.
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
