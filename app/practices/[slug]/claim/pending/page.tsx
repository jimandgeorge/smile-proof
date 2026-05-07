import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createAdminSupabase } from '@/lib/supabase';

type Params = { params: Promise<{ slug: string }> };

export default async function ClaimPendingPage({ params }: Params) {
  const { slug } = await params;
  const admin = createAdminSupabase();

  const { data: practice } = await admin
    .from('practices')
    .select('name, city, claim_pending_email, claimed_by_user_id')
    .eq('slug', slug)
    .single();

  if (!practice) notFound();

  // Already approved — send them to the dashboard
  if (practice.claimed_by_user_id) {
    return (
      <main style={{ maxWidth: 480, margin: '0 auto', padding: '80px 24px', textAlign: 'center' }}>
        <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'var(--forest-pale)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="var(--forest)" strokeWidth="1.5" />
            <polyline points="7,12 10,15 17,9" stroke="var(--forest)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 700, color: 'var(--ink)', marginBottom: 12 }}>
          Your claim was approved
        </h1>
        <p style={{ fontSize: 14, color: 'var(--ink-soft)', marginBottom: 28, lineHeight: 1.6 }}>
          You now have access to the {practice.name} dashboard.
        </p>
        <Link
          href={`/practices/${slug}/dashboard`}
          style={{ display: 'inline-flex', padding: '10px 28px', borderRadius: 50, background: 'var(--forest)', color: 'var(--cream)', fontSize: 14, fontWeight: 600, fontFamily: 'var(--font-body)', textDecoration: 'none' }}
        >
          Go to dashboard →
        </Link>
      </main>
    );
  }

  return (
    <main style={{ maxWidth: 480, margin: '0 auto', padding: '80px 24px', textAlign: 'center' }}>
      <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#fff8ed', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="#d97706" strokeWidth="1.5" />
          <path d="M12 7v5M12 16v.5" stroke="#d97706" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      </div>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 700, color: 'var(--ink)', marginBottom: 12 }}>
        Claim under review
      </h1>
      <p style={{ fontSize: 14, color: 'var(--ink-soft)', marginBottom: 8, lineHeight: 1.6 }}>
        We've received your request to claim <strong>{practice.name}</strong>.
      </p>
      <p style={{ fontSize: 14, color: 'var(--ink-soft)', marginBottom: 28, lineHeight: 1.6 }}>
        We'll verify your ownership and email{practice.claim_pending_email ? ` ${practice.claim_pending_email}` : ' you'} within 1–2 business days.
      </p>
      <Link
        href={`/practices/${slug}`}
        style={{ fontSize: 13, color: 'var(--forest)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4, fontFamily: 'var(--font-body)' }}
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M9 2L4 7l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Back to practice profile
      </Link>
    </main>
  );
}
