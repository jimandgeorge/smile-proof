import { notFound } from 'next/navigation';
import { after } from 'next/server';
import Link from 'next/link';
import { createServerSupabase, createAdminSupabase } from '@/lib/supabase';
import { SUMMARY_MIN_REVIEWS } from '@/lib/ai';
import ToothScore from '@/app/components/ToothScore';
import ProfileTabs from './ProfileTabs';
import PriceTransparencySection from './PriceTransparencySection';
import type { PriceRow } from './PriceTransparencySection';
import AnxietySpotlight from './AnxietySpotlight';
import ResponseAccountabilitySection from './ResponseAccountabilitySection';
import PracticeSidebar from './PracticeSidebar';

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
    avg_treatment_results: number | null;
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

  const [priceRes, aiSummaryRes, nhsSignalRes, servicesRes] = await Promise.all([
    admin.from('practice_price_summary').select('*').eq('practice_id', practice.id),
    admin.from('practice_ai_summaries').select('summary').eq('practice_id', practice.id).maybeSingle(),
    supabase.from('reviews').select('nhs_status', { count: 'exact', head: false })
      .eq('practice_id', practice.id)
      .eq('moderation_status', 'published')
      .eq('nhs_status', 'yes')
      .limit(1),
    admin.from('practice_services').select('services(name, category)').eq('practice_id', practice.id),
  ]);

  const priceRows: PriceRow[] = (priceRes.data ?? []) as PriceRow[];
  const aiSummary: string | null = aiSummaryRes.data?.summary
    ? aiSummaryRes.data.summary.replace(/^#+\s+[^\n]*\n+/, '').trim() || null
    : null;
  const patientReportedNhs = (nhsSignalRes.count ?? 0) > 0;
  const practiceServices = (servicesRes.data ?? [])
    .map((r: any) => r.services)
    .filter(Boolean) as { name: string; category: string }[];
  const nhsAccepting: boolean | null = practice.nhs_accepting ?? (patientReportedNhs ? true : null);

  // Track profile view (fire-and-forget)
  after(async () => {
    const a = createAdminSupabase();
    await a.from('practice_page_views').insert({ practice_id: practice.id });
  });

  const overallScore = summary?.avg_overall ?? null;

  const scoreDimensions = summary
    ? [
        { label: 'Staff Friendliness', value: summary.avg_cleanliness },
        { label: 'Communication',      value: summary.avg_communication },
        { label: 'Anxiety Handling',   value: summary.avg_anxiety },
        { label: 'Pain Management',    value: summary.avg_pain },
        { label: 'Value for Money',    value: summary.avg_cost },
        { label: 'Treatment Results',  value: summary.avg_treatment_results },
      ]
    : [];

  const earlyInsights = (summary?.review_count ?? 0) > 0 && (summary?.review_count ?? 0) < SUMMARY_MIN_REVIEWS;

  return (
    <main style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 20px 80px' }}>
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

      <div
        className="practice-profile-grid"
        style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 300px', gap: 28, alignItems: 'start' }}
      >
      {/* Left column */}
      <div>

      {/* Practice header card */}
      <div
        className="rounded-2xl bg-white mb-6"
        style={{
          border: `1.5px solid ${practice.claimed_by_user_id ? 'rgba(28,69,53,0.2)' : 'var(--cream-dark)'}`,
          borderTop: practice.claimed_by_user_id ? '3px solid var(--forest)' : '1.5px solid var(--cream-dark)',
          padding: practice.claimed_by_user_id ? '30px 32px 32px' : 32,
          boxShadow: practice.claimed_by_user_id ? '0 2px 12px rgba(28,69,53,0.06)' : 'none',
        }}
      >
        <div className="practice-profile-header-row flex items-start gap-5">
          {/* Avatar / logo */}
          <div
            className="practice-profile-logo shrink-0 flex items-center justify-center font-bold"
            style={{
              width: 80,
              height: 80,
              borderRadius: 16,
              background: 'var(--forest-pale)',
              color: 'var(--forest)',
              fontFamily: 'var(--font-display)',
              fontSize: 32,
              overflow: 'hidden',
            }}
          >
            {practice.logo_url
              ? <img src={practice.logo_url} alt={`${practice.name} logo`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : practice.name.charAt(0).toUpperCase()
            }
          </div>

          <div className="practice-profile-heading flex-1 min-w-0">
            {/* Name + Verified inline */}
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1
                className="practice-profile-title font-bold leading-tight"
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
              {nhsAccepting && (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: 11, fontWeight: 700, color: '#1d4ed8', background: '#dbeafe', border: '1px solid #93c5fd', borderRadius: 20, padding: '2px 8px' }}>
                  NHS
                  {!practice.nhs_accepting && patientReportedNhs && (
                    <span style={{ fontSize: 10, fontWeight: 400, color: '#3b82f6' }}> · patient reported</span>
                  )}
                </span>
              )}
              {practice.is_featured && (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: 11, color: '#92400e', fontWeight: 700, background: '#fef3c7', border: '1px solid #fcd34d', borderRadius: 20, padding: '2px 8px' }}>
                  <svg width="10" height="10" viewBox="0 0 12 12" fill="#f59e0b" aria-hidden>
                    <path d="M6 1l1.35 2.73 3.01.44-2.18 2.12.52 3.01L6 7.93 3.3 9.3l.52-3.01L1.64 4.17l3.01-.44z" />
                  </svg>
                  Featured
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
            <div className="practice-profile-score shrink-0 text-center">
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
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <h3
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 14,
                  fontWeight: 600,
                  color: 'var(--ink-soft)',
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase',
                  margin: 0,
                }}
              >
                Patient Experience
              </h3>
              {earlyInsights && (
                <span style={{ fontSize: 11, fontWeight: 600, color: '#92400e', background: '#fef3c7', border: '1px solid #fcd34d', borderRadius: 20, padding: '2px 8px' }}>
                  Early patient insights
                </span>
              )}
            </div>
            <div className="practice-score-grid grid grid-cols-2 gap-x-10 gap-y-4">
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

        {/* Header action buttons — website + owner dashboard only; conversion CTAs live in the sidebar */}
        {(practice.website || isOwner) && (
          <div style={{ display: 'flex', gap: 10, marginTop: 20, flexWrap: 'wrap' }}>
            {practice.website && (
              <a
                href={practice.website}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '11px 18px',
                  background: 'transparent',
                  color: 'var(--ink-mid)',
                  border: '1.5px solid var(--cream-dark)',
                  borderRadius: 8,
                  fontSize: 14,
                  fontWeight: 500,
                  textDecoration: 'none',
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
                  padding: '11px 18px',
                  background: 'var(--forest-pale)',
                  color: 'var(--forest)',
                  border: '1.5px solid rgba(28,69,53,0.2)',
                  borderRadius: 8,
                  fontSize: 14,
                  fontWeight: 600,
                  textDecoration: 'none',
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
          </div>
        )}
      </div>

      {/* AI Review Summary */}
      <section
        style={{
          background: practice.is_featured
            ? 'linear-gradient(135deg, #fffbeb 0%, #fef9e7 100%)'
            : 'linear-gradient(135deg, var(--forest-pale) 0%, #f0f7f3 100%)',
          borderRadius: 'var(--radius)',
          padding: '20px 24px',
          border: practice.is_featured
            ? '1.5px solid #fcd34d'
            : '1.5px solid rgba(28,69,53,0.15)',
          marginBottom: 24,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <div
            style={{
              width: 24, height: 24, borderRadius: 6,
              background: practice.is_featured ? '#f59e0b' : 'var(--forest)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M2 3h8M2 6h5M2 9h6" stroke="white" strokeWidth="1.4" strokeLinecap="round" />
              <circle cx="10" cy="9" r="1.5" fill="white" />
            </svg>
          </div>
          <span
            style={{
              fontSize: 12, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase',
              color: practice.is_featured ? '#92400e' : 'var(--forest)',
            }}
          >
            AI Review Summary
          </span>
          {practice.is_featured && aiSummary && (
            <span style={{ marginLeft: 'auto', fontSize: 11, fontWeight: 600, color: '#92400e', background: '#fef3c7', border: '1px solid #fcd34d', borderRadius: 20, padding: '1px 7px' }}>
              In-depth
            </span>
          )}
        </div>
        {aiSummary ? (
          <p
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 15,
              color: practice.is_featured ? '#1c1008' : 'var(--ink-mid)',
              lineHeight: 1.75,
              fontStyle: 'italic',
              margin: 0,
            }}
          >
            &ldquo;{aiSummary}&rdquo;
          </p>
        ) : !practice.claimed_by_user_id && reviews.length > 0 ? (
          <div>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--ink-soft)', lineHeight: 1.6, margin: '0 0 12px' }}>
              {reviews.length} patient {reviews.length === 1 ? 'review' : 'reviews'} collected — AI insights generate automatically once this profile is claimed or reaches {SUMMARY_MIN_REVIEWS} reviews.
            </p>
            <Link
              href={`/practices/${slug}/claim`}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 5,
                fontSize: 13, fontWeight: 700, color: 'var(--forest)',
                background: 'var(--forest-pale)', border: '1px solid rgba(28,69,53,0.15)',
                borderRadius: 8, padding: '8px 14px', textDecoration: 'none',
              }}
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="1.3" />
                <path d="M6 4v4M4 6h4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
              </svg>
              Claim to unlock AI insights early
            </Link>
          </div>
        ) : (
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--ink-soft)', lineHeight: 1.6, margin: 0 }}>
            {reviews.length === 0
              ? 'Be the first to share your experience — your review helps other patients make an informed choice.'
              : reviews.length < SUMMARY_MIN_REVIEWS
                ? `${reviews.length} review${reviews.length !== 1 ? 's' : ''} so far — AI insights generate automatically once this practice has ${SUMMARY_MIN_REVIEWS}.`
                : 'AI insights are being generated — check back shortly.'}
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
        services={practiceServices}
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
      </div>{/* end left column */}

      {/* Right sidebar */}
      <div className="practice-profile-sidebar" style={{ position: 'sticky', top: 80 }}>
        <PracticeSidebar
          practiceId={practice.id}
          practiceSlug={slug}
          practiceName={practice.name}
          isClaimed={!!practice.claimed_by_user_id}
          phone={practice.phone ?? null}
          email={practice.email ?? null}
          website={practice.website ?? null}
        />
      </div>

      </div>{/* end grid */}

      <style>{`
        .practice-profile-grid {
          grid-template-columns: minmax(0, 1fr) 300px;
        }
        @media (max-width: 768px) {
          .practice-profile-grid {
            grid-template-columns: 1fr !important;
          }
          .practice-profile-header-row {
            flex-direction: column;
          }
          .practice-profile-logo {
            width: 60px !important;
            height: 60px !important;
          }
        }
      `}</style>
    </main>
  );
}
