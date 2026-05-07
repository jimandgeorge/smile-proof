import { notFound } from 'next/navigation';
import Link from 'next/link';
import { createAdminSupabase } from '@/lib/supabase';
import { ClaimForm } from './ClaimForm';

type Params = { params: Promise<{ slug: string }> };

export default async function ClaimPage({ params }: Params) {
  const { slug } = await params;
  const supabase = createAdminSupabase();

  const { data: practice } = await supabase
    .from('practices')
    .select('id, name, city, postcode, claimed_by_user_id')
    .eq('slug', slug)
    .single();

  if (!practice) notFound();

  if (practice.claimed_by_user_id) {
    return (
      <main style={{ maxWidth: 480, margin: '0 auto', padding: '80px 24px', textAlign: 'center' }}>
        <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'var(--cream-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <rect x="3" y="11" width="18" height="11" rx="2" stroke="var(--ink-mid)" strokeWidth="1.5" fill="none" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" stroke="var(--ink-mid)" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 700, color: 'var(--ink)', marginBottom: 12 }}>
          Already claimed
        </h1>
        <p style={{ fontSize: 14, color: 'var(--ink-soft)', marginBottom: 28, lineHeight: 1.6 }}>
          {practice.name} has already been claimed by its owner.
        </p>
        <Link
          href={`/practices/${slug}`}
          style={{ fontSize: 13, color: 'var(--forest)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4 }}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M9 2L4 7l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Back to practice
        </Link>
      </main>
    );
  }

  return (
    <main style={{ maxWidth: 480, margin: '0 auto', padding: '32px 24px 60px' }}>
      <Link
        href={`/practices/${slug}`}
        style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 13, color: 'var(--ink-soft)', textDecoration: 'none', marginBottom: 24, fontFamily: 'var(--font-body)' }}
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M9 2L4 7l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Back to profile
      </Link>

      <ClaimForm
        practiceId={practice.id}
        practiceName={practice.name}
        practiceCity={`${practice.city}${practice.postcode ? `, ${practice.postcode}` : ''}`}
        practiceSlug={slug}
      />
    </main>
  );
}
