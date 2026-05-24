import { notFound } from 'next/navigation';
import Link from 'next/link';
import { createAdminSupabase } from '@/lib/supabase';
import { ClaimForm } from './ClaimForm';
import { Lock, ChevronLeft, CheckCircle } from 'lucide-react';

type Params = { params: Promise<{ slug: string }>; searchParams: Promise<{ submitted?: string }> };

export default async function ClaimPage({ params, searchParams }: Params) {
  const { slug } = await params;
  const { submitted } = await searchParams;
  const supabase = createAdminSupabase();

  const { data: practice } = await supabase
    .from('practices')
    .select('id, name, city, postcode, website, claimed_by_user_id')
    .eq('slug', slug)
    .single();

  if (!practice) notFound();

  if (submitted === '1') {
    return (
      <main style={{ maxWidth: 480, margin: '0 auto', padding: '80px 24px', textAlign: 'center' }}>
        <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'var(--forest-pale)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
          <CheckCircle size={24} strokeWidth={1.5} style={{ color: 'var(--forest)' }} />
        </div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 700, color: 'var(--ink)', marginBottom: 12 }}>
          Claim submitted
        </h1>
        <p style={{ fontSize: 14, color: 'var(--ink-soft)', marginBottom: 28, lineHeight: 1.6 }}>
          We&apos;ve received your request to claim <strong>{practice.name}</strong>. We&apos;ll review it and get back to you within 1–2 business days.
        </p>
        <Link
          href={`/practices/${slug}`}
          style={{ fontSize: 13, color: 'var(--forest)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4 }}
        >
          <ChevronLeft size={14} strokeWidth={1.5} />
          Back to practice
        </Link>
      </main>
    );
  }

  if (practice.claimed_by_user_id) {
    return (
      <main style={{ maxWidth: 480, margin: '0 auto', padding: '80px 24px', textAlign: 'center' }}>
        <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'var(--cream-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
          <Lock size={24} strokeWidth={1.5} style={{ color: 'var(--ink-mid)' }} />
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
          <ChevronLeft size={14} strokeWidth={1.5} />
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
        <ChevronLeft size={14} strokeWidth={1.5} />
        Back to profile
      </Link>

      <ClaimForm
        practiceId={practice.id}
        practiceName={practice.name}
        practiceCity={`${practice.city}${practice.postcode ? `, ${practice.postcode}` : ''}`}
        practiceSlug={slug}
        practiceWebsite={(practice as any).website ?? null}
      />
    </main>
  );
}
