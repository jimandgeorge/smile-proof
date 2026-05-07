import { notFound } from 'next/navigation';
import { after } from 'next/server';
import Link from 'next/link';
import { createServerSupabase, createAdminSupabase } from '@/lib/supabase';
import { generatePracticeSummary } from '@/lib/ai';
import ToothScore from '@/app/components/ToothScore';
import ProfileTabs from './ProfileTabs';
import PriceTransparencySection from './PriceTransparencySection';
import type { PriceRow } from './PriceTransparencySection';
import AnxietySpotlight from './AnxietySpotlight';
import ResponseAccountabilitySection from './ResponseAccountabilitySection';

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params) {
  const { slug } = await params;
  const supabase = await createServerSupabase();
  const { data: practice } = await supabase
    .from('practices')
    .select('name, city')
    .eq('slug', slug)
    .single();

  if (!practice) return { title: 'Practice not found' };
  return {
    title: `${practice.name} reviews — ${practice.city} | SmileProof`,
    description: `Verified patient reviews for ${practice.name} in ${practice.city}.`,
  };
}

export default async function PracticePage({ params }: Params) {
  const { slug } = await params;
  const supabase = await createServerSupabase();
  const admin = createAdminSupabase();

  const [practiceRes, { data: { user } }] = await Promise.all([
    admin.from('practices').select('*').eq('slug', slug).single(),
    supabase.auth.getUser(),
  ]);

  if (practiceRes.error || !practiceRes.data) notFound();
  const practice = practiceRes.data;
  const isOwner = !!user && user.id === practice.claimed_by_user_id;

  const summaryRes = await supabase
    .from('practice_rating_summary')
    .select('*')
    .eq('practice_id', practice.id)
    .maybeSingle();

  const summary = summaryRes.data as {
    avg_overall: number | null;
    avg_pain: number | null;
    avg_communication: number | null;
    avg_cost: number | null;
    avg_cleanliness: number | null;
    avg_anxiety: number | null;
    review_count: number | null;
    verified_count: number | null;
  } | null;

  const reviewsRes = await supabase
    .from('reviews')
    .select(`
      id, title, body, rating_overall, rating_anxiety_handling, verification_status, treatment_date, created_at,
      reviewer_display_name, helpful_count,
      followup_body, followup_rating, followup_submitted_at,
      treatments(name),
      dentists(full_name, slug),
      practice_responses(body, created_at)
    `)
    .eq('practice_id', practice.id)
    .eq('moderation_status', 'published')
    .order('verification_status', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(20);

  const reviews = reviewsRes.data ?? [];

  const respondedCount = reviews.filter((r: any) => r.practice_responses?.body).length;
  const avgResponseDays = (() => {
    const times = reviews
      .filter((r: any) => r.practice_responses?.created_at && r.created_at)
      .map((r: any) => {
        const diff = new Date(r.practice_responses.created_at).getTime() - new Date(r.created_at).getTime();
        return diff / (1000 * 60 * 60 * 24);
      });
    if (times.length === 0) return null;
    return Math.round(times.reduce((a: number, b: number) => a + b, 0) / times.length);
  })();

  const priceRes = await admin
    .from('practice_price_summary')
    .select('*')
    .eq('practice_id', practice.id);
  const priceRows: PriceRow[] = (priceRes.data ?? []) as PriceRow[];

  const latestReviewAt = reviews.reduce((max, r: any) => {
    const d = new Date(r.created_at);
    return d > max ? d : max;
  }, new Date(0));

  const SUMMARY_MIN_REVIEWS = 3;
  const SUMMARY_COOLDOWN_MS = 6 * 60 * 60 * 1000; // 6 hours

  const summaryStale =
    reviews.length >= SUMMARY_MIN_REVIEWS &&
    (!practice.ai_summary_updated_at ||
      (latestReviewAt > new Date(practice.ai_summary_updated_at) &&
        Date.now() - new Date(practice.ai_summary_updated_at).getTime() > SUMMARY_COOLDOWN_MS));

  // Track profile view (fire-and-forget)
  after(async () => {
    const a = createAdminSupabase();
    await a.from('practice_page_views').insert({ practice_id: practice.id });
  });

  if (summaryStale) {
    after(async () => {
      const text = await generatePracticeSummary(
        practice.name,
        reviews.map((r: any) => ({
          rating_overall: r.rating_overall,
          body: r.body,
          verification_status: r.verification_status,
        })),
      );
      if (text) {
        const a = createAdminSupabase();
        await a
          .from('practices')
          .update({ ai_summary: text, ai_summary_updated_at: new Date().toISOString() })
          .eq('id', practice.id);
      }
    });
  }

  const overallScore = summary?.avg_overall ?? null;

  const scoreDimensions = summary
    ? [
        { label: 'Cleanliness', value: summary.avg_cleanliness },
        { label: 'Pain Management', value: summary.avg_pain },
        { label: 'Value for Money', value: summary.avg_cost },
        { label: 'Staff Friendliness', value: summary.avg_communication },
        { label: 'Anxiety Handling', value: summary.avg_anxiety },
      ]
    : [];

  return (
    <main className="max-w-4xl mx-auto px-4 py-8">
      {/* Back link */}
      <Link
        href="/"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: 'var(--ink-soft)',
          fontSize: 13,
          fontFamily: 'var(--font-body)',
          marginBottom: 24,
          textDecoration: 'none',
          padding: 0,
        }}
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M9 2L4 7l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Back to results
      </Link>

      {/* Practice header card */}
      <div
        className="rounded-2xl bg-white mb-6"
        style={{ border: '1.5px solid var(--cream-dark)', padding: 32 }}
      >
        <div className="flex items-start gap-5">
          {/* Avatar */}
          <div
            className="shrink-0 flex items-center justify-center font-bold"
            style={{
              width: 80,
              height: 80,
              borderRadius: 16,
              background: 'var(--forest-pale)',
              color: 'var(--forest)',
              fontFamily: 'var(--font-display)',
              fontSize: 32,
            }}
          >
            {practice.name.charAt(0).toUpperCase()}
          </div>

          <div className="flex-1 min-w-0">
            {/* Name + Verified inline */}
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1
                className="font-bold leading-tight"
                style={{ fontFamily: 'var(--font-display)', fontSize: 26, color: 'var(--ink)' }}
              >
                {practice.name}
              </h1>
              {practice.claimed_by_user_id && (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: 11, color: 'var(--forest)', fontWeight: 600 }}>
                  <svg width="14" height="14" viewBox="0 0 12 12" fill="none">
                    <circle cx="6" cy="6" r="6" fill="var(--forest)" />
                    <polyline points="3,6 5,8.5 9,3.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  Verified
                </span>
              )}
            </div>

            <p style={{ marginTop: 6, fontSize: 14, color: 'var(--ink-soft)', fontFamily: 'var(--font-body)' }}>
              {[practice.address_line1, practice.city].filter(Boolean).join(', ')}
            </p>

            {summary && (summary.review_count ?? 0) > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 8, flexWrap: 'wrap' }}>
                {(summary.verified_count ?? 0) > 0 && (
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4,
                      fontSize: 12,
                      fontWeight: 600,
                      color: 'var(--forest)',
                      fontFamily: 'var(--font-body)',
                    }}
                  >
                    <svg width="13" height="13" viewBox="0 0 12 12" fill="none">
                      <circle cx="6" cy="6" r="6" fill="var(--forest)" />
                      <polyline points="3,6 5,8.5 9,3.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    {summary.verified_count} verified {summary.verified_count === 1 ? 'review' : 'reviews'}
                  </span>
                )}
                <span style={{ fontSize: 12, color: 'var(--ink-faint)', fontFamily: 'var(--font-body)' }}>
                  {summary.review_count} total
                </span>
              </div>
            )}

          </div>

          {overallScore !== null && (
            <div className="shrink-0 text-center">
              <ToothScore score={Number(overallScore)} />
              <p
                className="mt-1 uppercase tracking-wide"
                style={{ fontSize: 11, color: 'var(--ink-soft)', letterSpacing: '0.08em' }}
              >
                Overall Score
              </p>
            </div>
          )}
        </div>

        {/* Patient Scores */}
        {scoreDimensions.length > 0 && (
          <div style={{ marginTop: 28, paddingTop: 24, borderTop: '1px solid var(--cream-dark)' }}>
            <h3
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 14,
                fontWeight: 600,
                color: 'var(--ink-soft)',
                marginBottom: 16,
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
              }}
            >
              Patient Scores
            </h3>
            <div className="grid grid-cols-2 gap-x-10 gap-y-4">
              {scoreDimensions.map(({ label, value }) => (
                <div key={label} style={{ marginBottom: 10 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontSize: 12, color: 'var(--ink-soft)' }}>{label}</span>
                    <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink-mid)' }}>
                      {value !== null ? Number(value).toFixed(1) : '—'}
                    </span>
                  </div>
                  <div style={{ height: 4, borderRadius: 2, background: 'var(--cream-dark)', overflow: 'hidden' }}>
                    <div
                      style={{
                        height: '100%',
                        width: value !== null ? `${(Number(value) / 5) * 100}%` : '0%',
                        background: 'var(--forest)',
                        borderRadius: 2,
                        transition: 'width 0.8s cubic-bezier(0.4,0,0.2,1)',
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action buttons */}
        <div style={{ display: 'flex', gap: 10, marginTop: 20, flexWrap: 'wrap' }}>
          <Link
            href={`/practices/${slug}/review`}
            style={{
              padding: '12px 28px',
              background: 'var(--forest)',
              color: 'var(--cream)',
              border: 'none',
              borderRadius: 8,
              fontSize: 14,
              fontWeight: 600,
              textDecoration: 'none',
              transition: 'background var(--transition)',
            }}
          >
            Write a Review
          </Link>
          {practice.website && (
            <a
              href={practice.website}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '12px 20px',
                background: 'transparent',
                color: 'var(--ink-mid)',
                border: '1.5px solid var(--cream-dark)',
                borderRadius: 8,
                fontSize: 14,
                fontWeight: 500,
                textDecoration: 'none',
                transition: 'all var(--transition)',
              }}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <rect x="1" y="3" width="9" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.3" fill="none" />
                <path d="M8 1h5v5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M13 1L7 7" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
              </svg>
              Visit Website
            </a>
          )}
          {isOwner && (
            <Link
              href={`/practices/${slug}/dashboard`}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '12px 20px',
                background: 'var(--forest-pale)',
                color: 'var(--forest)',
                border: '1.5px solid rgba(28,69,53,0.2)',
                borderRadius: 8,
                fontSize: 14,
                fontWeight: 600,
                textDecoration: 'none',
                transition: 'all var(--transition)',
              }}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <rect x="1" y="7" width="3" height="6" rx="1" fill="currentColor" />
                <rect x="5.5" y="4" width="3" height="9" rx="1" fill="currentColor" />
                <rect x="10" y="1" width="3" height="12" rx="1" fill="currentColor" />
              </svg>
              Manage practice
            </Link>
          )}
          {!practice.claimed_by_user_id && (
            <Link
              href={`/practices/${slug}/claim`}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '12px 20px',
                background: 'transparent',
                color: 'var(--ink-soft)',
                border: '1.5px solid var(--cream-dark)',
                borderRadius: 8,
                fontSize: 14,
                fontWeight: 500,
                textDecoration: 'none',
                transition: 'all var(--transition)',
              }}
            >
              <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
                <path d="M7 1l1.5 3 3.5.5-2.5 2.5.5 3.5L7 9 3.5 10.5l.5-3.5L1.5 4.5 5 4z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" fill="none" />
              </svg>
              Claim this profile
            </Link>
          )}
        </div>
      </div>

      {/* AI Review Summary */}
      <section
        style={{
          background: 'linear-gradient(135deg, var(--forest-pale) 0%, #f0f7f3 100%)',
          borderRadius: 'var(--radius)',
          padding: '20px 24px',
          border: '1.5px solid rgba(28,69,53,0.15)',
          marginBottom: 24,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: practice.ai_summary ? 12 : 0 }}>
          <div style={{ width: 24, height: 24, borderRadius: 6, background: 'var(--forest)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M2 3h8M2 6h5M2 9h6" stroke="white" strokeWidth="1.4" strokeLinecap="round" />
              <circle cx="10" cy="9" r="1.5" fill="white" />
            </svg>
          </div>
          <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--forest)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            AI Review Summary
          </span>
          {!practice.ai_summary && (
            <span style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--ink-soft)', fontFamily: 'var(--font-body)', fontStyle: 'italic' }}>
              {reviews.length >= SUMMARY_MIN_REVIEWS ? 'Generating…' : `Appears after ${SUMMARY_MIN_REVIEWS} reviews`}
            </span>
          )}
        </div>
        {practice.ai_summary && (
          <p
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 15,
              color: 'var(--ink-mid)',
              lineHeight: 1.75,
              fontStyle: 'italic',
              margin: 0,
            }}
          >
            &ldquo;{practice.ai_summary}&rdquo;
          </p>
        )}
      </section>

      <AnxietySpotlight
        anxietyScore={summary?.avg_anxiety ?? null}
        reviews={reviews.map((r: any) => ({
          body: r.body,
          reviewer_display_name: r.reviewer_display_name ?? null,
          rating_anxiety_handling: r.rating_anxiety_handling ?? null,
        }))}
      />

      <PriceTransparencySection rows={priceRows} />

      <ResponseAccountabilitySection
        reviewCount={reviews.length}
        respondedCount={respondedCount}
        avgResponseDays={avgResponseDays}
      />

      <ProfileTabs
        reviews={reviews as any}
        practiceSlug={slug}
        practice={{
          name: practice.name,
          address_line1: practice.address_line1,
          address_line2: practice.address_line2 ?? null,
          city: practice.city,
          postcode: practice.postcode,
          email: practice.email ?? null,
          phone: practice.phone ?? null,
          website: practice.website ?? null,
          opening_hours: practice.opening_hours ?? null,
          claimed_by_user_id: practice.claimed_by_user_id ?? null,
        }}
      />
    </main>
  );
}
