import { notFound } from 'next/navigation';
import { createAdminSupabase } from '@/lib/supabase';
import FollowupForm from './FollowupForm';

type Params = { params: Promise<{ id: string }>; searchParams: Promise<{ token?: string }> };

export const metadata = { title: 'Update your review — SmileProof' };

export default async function FollowupPage({ params, searchParams }: Params) {
  const { id } = await params;
  const { token } = await searchParams;

  if (!token) notFound();

  const admin = createAdminSupabase();
  const { data: review } = await admin
    .from('reviews')
    .select('id, title, body, rating_overall, followup_token, followup_submitted_at, practices(name, slug)')
    .eq('id', id)
    .single();

  if (!review || review.followup_token !== token) notFound();

  // Already submitted
  if (review.followup_submitted_at) {
    return (
      <main className="max-w-xl mx-auto px-4 py-16 text-center">
        <div
          className="rounded-2xl bg-white p-10"
          style={{ border: '1.5px solid var(--cream-dark)' }}
        >
          <div
            className="mx-auto mb-5 flex items-center justify-center rounded-full"
            style={{ width: 56, height: 56, background: 'var(--forest-pale)' }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M5 12l4 4 10-10" stroke="var(--forest)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h1
            className="font-bold mb-2"
            style={{ fontFamily: 'var(--font-display)', fontSize: 24, color: 'var(--ink)' }}
          >
            Already updated
          </h1>
          <p className="text-sm" style={{ color: 'var(--ink-soft)', lineHeight: 1.65 }}>
            You&apos;ve already submitted a follow-up for this review. Thank you!
          </p>
        </div>
      </main>
    );
  }

  const practice = (Array.isArray(review.practices) ? review.practices[0] : review.practices) as { name: string; slug: string } | null;

  return (
    <main className="max-w-xl mx-auto px-4 py-12">
      <div style={{ marginBottom: 28 }}>
        <p
          style={{
            fontSize: 11,
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            color: 'var(--forest)',
            fontFamily: 'var(--font-body)',
            marginBottom: 6,
          }}
        >
          3-month check-in
        </p>
        <h1
          className="font-bold"
          style={{ fontFamily: 'var(--font-display)', fontSize: 28, color: 'var(--ink)', letterSpacing: '-0.02em', lineHeight: 1.2 }}
        >
          How has the result held up?
        </h1>
        {practice && (
          <p style={{ marginTop: 6, fontSize: 14, color: 'var(--ink-soft)', fontFamily: 'var(--font-body)' }}>
            Updating your review for <strong style={{ color: 'var(--ink)' }}>{practice.name}</strong>
          </p>
        )}
      </div>

      {/* Original review card */}
      <div
        className="rounded-xl mb-6"
        style={{ border: '1.5px solid var(--cream-dark)', padding: '16px 18px', background: 'white' }}
      >
        <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--ink-soft)', marginBottom: 8, fontFamily: 'var(--font-body)' }}>
          Your original review
        </p>
        {review.title && (
          <p style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 600, color: 'var(--ink)', marginBottom: 4 }}>
            {review.title}
          </p>
        )}
        <p style={{ fontSize: 13, color: 'var(--ink-soft)', fontFamily: 'var(--font-body)', lineHeight: 1.6 }}>
          {review.body.length > 160 ? review.body.slice(0, 160) + '…' : review.body}
        </p>
      </div>

      <FollowupForm reviewId={id} token={token} practiceName={practice?.name ?? ''} />
    </main>
  );
}
