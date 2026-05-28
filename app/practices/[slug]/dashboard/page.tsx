export const dynamic = 'force-dynamic';

import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { createAdminSupabase, createServerSupabase } from '@/lib/supabase';
import DashboardShell from './DashboardShell';
import { Lock, ChevronLeft } from 'lucide-react';

type Params = { params: Promise<{ slug: string }> };

export default async function DashboardPage({ params }: Params) {
  const { slug } = await params;
  const admin = createAdminSupabase();
  const supabase = await createServerSupabase();

  const { data: { user } } = await supabase.auth.getUser();
  // getSession() returns null when the access token in cookies is expired,
  // even though getUser() succeeds (it auto-refreshes internally).
  // Fall back to refreshSession() which uses the long-lived refresh token.
  let { data: { session } } = await supabase.auth.getSession();
  if (!session?.access_token) {
    const { data } = await supabase.auth.refreshSession();
    session = data.session;
  }

  const { data: practice, error } = await admin
    .from('practices')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error || !practice) notFound();

  if (!practice.claimed_by_user_id) {
    redirect(`/practices/${slug}/claim`);
  }

  if (!user || user.id !== (practice as any).claimed_by_user_id) {
    return (
      <main style={{ maxWidth: 480, margin: '0 auto', padding: '80px 24px', textAlign: 'center', background: '#0d0d12', minHeight: '100vh' }}>
        <div style={{ width: 52, height: 52, borderRadius: 12, background: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
          <Lock size={22} strokeWidth={1.5} style={{ color: '#34d399' }} />
        </div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 800, color: '#edeef5', marginBottom: 12, letterSpacing: '-0.02em' }}>
          Access denied
        </h1>
        <p style={{ fontSize: 14, color: 'rgba(237,238,245,0.5)', marginBottom: 28, lineHeight: 1.6 }}>
          You need to be the verified owner of this practice to access the dashboard.
        </p>
        <Link
          href={`/practices/${slug}`}
          style={{ fontSize: 13, color: '#34d399', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4, opacity: 0.8 }}
        >
          <ChevronLeft size={14} strokeWidth={1.5} />
          Back to practice
        </Link>
      </main>
    );
  }

  const isPaid = (practice as any).subscription_status === 'active';

  const rawName: string = user.user_metadata?.full_name ?? user.user_metadata?.name ?? user.email?.split('@')[0] ?? 'there';
  const userName = rawName.split(' ')[0];
  const userInitial = userName[0]?.toUpperCase() ?? '?';
  const userEmail = user.email ?? '';
  const isOAuthUser = (user.app_metadata?.provider ?? '') !== 'email';

  // Date helpers
  const now = new Date();
  const thirtyDaysAgo = new Date(now); thirtyDaysAgo.setDate(now.getDate() - 30);
  const sixtyDaysAgo = new Date(now); sixtyDaysAgo.setDate(now.getDate() - 60);
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
  sixMonthsAgo.setDate(1);

  const [
    summaryRes,
    reviewsRes,
    responsesRes,
    cityPracticesRes,
    recentReviewsRes,
    views30dRes,
    viewsPrev30dRes,
    invitesRes,
    allServicesRes,
    practiceServicesRes,
    enquiriesRes,
    teamDentistsRes,
    opportunityInsightsRes,
    googleReviewsRes,
  ] = await Promise.all([
    admin.from('practice_rating_summary').select('*').eq('practice_id', practice.id).maybeSingle(),
    admin.from('reviews').select(`
      id, title, body, rating_overall, moderation_status, verification_status,
      reviewer_display_name, created_at,
      treatments(name),
      practice_responses(body)
    `).eq('practice_id', practice.id).order('created_at', { ascending: false }),
    admin.from('practice_responses').select('id', { count: 'exact', head: true }).eq('practice_id', practice.id),
    admin.from('practices').select('id').eq('city', (practice as any).city),
    admin.from('reviews').select('created_at, rating_overall').eq('practice_id', practice.id).eq('moderation_status', 'published').gte('created_at', sixMonthsAgo.toISOString()),
    admin.from('practice_page_views').select('id', { count: 'exact', head: true }).eq('practice_id', practice.id).gte('viewed_at', thirtyDaysAgo.toISOString()),
    admin.from('practice_page_views').select('id', { count: 'exact', head: true }).eq('practice_id', practice.id).gte('viewed_at', sixtyDaysAgo.toISOString()).lt('viewed_at', thirtyDaysAgo.toISOString()),
    admin.from('review_invites').select('id, patient_email, patient_name, sent_at, review_id').eq('practice_id', practice.id).order('sent_at', { ascending: false }).limit(50),
    admin.from('services').select('id, slug, name, category, sort_order').order('sort_order'),
    admin.from('practice_services').select('service_id').eq('practice_id', practice.id),
    admin.from('practice_enquiries').select('id, name, email, treatment_interest, message, created_at, read_at').eq('practice_id', practice.id).order('created_at', { ascending: false }).limit(100),
    admin.from('practice_dentists').select('dentist_id, dentists(id, full_name, gdc_number, specialisms, slug)').eq('practice_id', practice.id).eq('active', true),
    admin.from('practice_opportunity_insights').select('*').eq('practice_id', practice.id).maybeSingle(),
    admin.from('external_reviews').select('rating').eq('practice_id', practice.id).eq('source', 'google').not('rating', 'is', null),
  ]);

  const summary = summaryRes.data;
  const reviews = reviewsRes.data ?? [];
  const published = reviews.filter((r: any) => r.moderation_status === 'published');
  const pending = reviews.filter((r: any) => r.moderation_status === 'pending');

  const responseRate = published.length > 0
    ? Math.round(((responsesRes.count ?? 0) / published.length) * 100)
    : 0;

  const cityIds = (cityPracticesRes.data ?? []).map((p: any) => p.id);
  let cityRank = 0, cityTotal = 0;
  const dimensionRanks: { label: string; rank: number; total: number; score: number | null }[] = [];
  if (cityIds.length > 0) {
    const { data: citySummaries } = await admin
      .from('practice_rating_summary')
      .select('practice_id, avg_overall, avg_pain, avg_communication, avg_cost, avg_cleanliness, avg_anxiety')
      .in('practice_id', cityIds)
      .order('avg_overall', { ascending: false });

    cityTotal = citySummaries?.length ?? 0;
    cityRank = (citySummaries?.findIndex((s: any) => s.practice_id === practice.id) ?? -1) + 1;

    if (citySummaries && cityTotal >= 2) {
      const dims: { label: string; key: keyof typeof citySummaries[0] }[] = [
        { label: 'Staff Friendliness', key: 'avg_cleanliness' },
        { label: 'Communication',      key: 'avg_communication' },
        { label: 'Anxiety Handling',   key: 'avg_anxiety' },
        { label: 'Pain Management',    key: 'avg_pain' },
        { label: 'Value for Money',    key: 'avg_cost' },
      ];
      for (const { label, key } of dims) {
        const sorted = [...citySummaries]
          .filter((s: any) => s[key] != null)
          .sort((a: any, b: any) => (b[key] ?? 0) - (a[key] ?? 0));
        const rank = sorted.findIndex((s: any) => s.practice_id === practice.id) + 1;
        const mine = citySummaries.find((s: any) => s.practice_id === practice.id);
        if (rank > 0) {
          dimensionRanks.push({ label, rank, total: sorted.length, score: mine ? Number((mine as any)[key]) : null });
        }
      }
    }
  }

  // Monthly data with avgScore
  const monthlyMap = new Map<string, { count: number; ratingSum: number; ratingN: number }>();
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    monthlyMap.set(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`, { count: 0, ratingSum: 0, ratingN: 0 });
  }
  for (const r of recentReviewsRes.data ?? []) {
    const d = new Date(r.created_at);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    if (monthlyMap.has(key)) {
      const entry = monthlyMap.get(key)!;
      entry.count++;
      if (r.rating_overall != null) { entry.ratingSum += r.rating_overall; entry.ratingN++; }
    }
  }
  const monthlyData = Array.from(monthlyMap.entries()).map(([month, { count, ratingSum, ratingN }]) => ({
    month, count, avgScore: ratingN > 0 ? ratingSum / ratingN : null,
  }));

  // Current month reviews
  const thisMonthKey = (() => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`; })();
  const newReviewsThisMonth = monthlyMap.get(thisMonthKey)?.count ?? 0;

  // Score cards
  const scoreCards = [
    { label: 'Overall',            value: summary?.avg_overall ?? null },
    { label: 'Staff Friendliness', value: summary?.avg_cleanliness ?? null },
    { label: 'Communication',      value: summary?.avg_communication ?? null },
    { label: 'Anxiety Handling',   value: summary?.avg_anxiety ?? null },
    { label: 'Pain Management',    value: summary?.avg_pain ?? null },
    { label: 'Value for Money',    value: summary?.avg_cost ?? null },
    { label: 'Treatment Results',  value: (summary as any)?.avg_treatment_results ?? null },
  ];

  // Computed insights
  const unresponded = published.filter((r: any) => !r.practice_responses?.body).length;
  const insights: { type: 'warning' | 'info' | 'action'; text: string; actionLabel: string; actionHref: string }[] = [];
  if (unresponded > 0) {
    insights.push({ type: 'action', text: `${unresponded} review${unresponded !== 1 ? 's' : ''} need${unresponded === 1 ? 's' : ''} a response — responding improves trust scores`, actionLabel: 'Respond now', actionHref: '#' });
  }
if (responseRate < 50 && published.length >= 3) {
    insights.push({ type: 'warning', text: `Response rate is ${responseRate}% — patients trust practices that reply`, actionLabel: 'View reviews', actionHref: '#' });
  }

  const prevMonthReviews = monthlyData[monthlyData.length - 2]?.count ?? 0;

  const invites = (invitesRes.data ?? []) as { id: string; patient_email: string; patient_name: string | null; sent_at: string; review_id: string | null }[];
  const allServices = (allServicesRes.data ?? []) as { id: string; slug: string; name: string; category: string; sort_order: number }[];
  const practiceServiceIds = (practiceServicesRes.data ?? []).map((ps: any) => ps.service_id as string);
  const enquiries = (enquiriesRes.data ?? []) as { id: string; name: string; email: string; treatment_interest: string | null; message: string | null; created_at: string; read_at: string | null }[];
  const teamDentists = (teamDentistsRes.data ?? [])
    .map((row: any) => row.dentists)
    .filter(Boolean)
    .map((d: any) => ({
      dentistId: d.id as string,
      fullName: d.full_name as string,
      gdcNumber: (d.gdc_number as string | null) ?? null,
      specialisms: (d.specialisms as string[]) ?? [],
      slug: d.slug as string,
    }));

  const googleRatings = (googleReviewsRes.data ?? []).map((r: any) => r.rating as number);
  const googleReviewCount = googleRatings.length;
  const googleAvgRating = googleReviewCount > 0
    ? Math.round((googleRatings.reduce((s, r) => s + r, 0) / googleReviewCount) * 10) / 10
    : null;

  const rawOpp = opportunityInsightsRes.data;
  const opportunityInsights = rawOpp ? {
    id:                 rawOpp.id as string,
    generated_at:       rawOpp.generated_at as string,
    review_count:       rawOpp.review_count as number,
    management_summary: (rawOpp as any).management_summary as string | null ?? null,
    strengths:          (rawOpp.strengths ?? []) as any[],
    weaknesses:         (rawOpp.weaknesses ?? []) as any[],
    opportunities:      (rawOpp.opportunities ?? []) as any[],
    category_scores:    (rawOpp.category_scores ?? {}) as Record<string, number>,
    themes:             (rawOpp.themes ?? []) as any[],
  } : null;

  return (
    <DashboardShell
      practiceId={practice.id}
      practiceSlug={slug}
      practiceName={practice.name}
      practiceCity={(practice as any).city}
      practicePostcode={(practice as any).postcode}
      practiceType={(practice as any).practice_type ?? null}
      userName={userName}
      userInitial={userInitial}
      userEmail={userEmail}
      isOAuthUser={isOAuthUser}
      logoUrl={(practice as any).logo_url ?? null}
      isPaid={isPaid}
      avgOverall={summary?.avg_overall ?? null}
      reviewCount={summary?.review_count ?? 0}
      verifiedCount={summary?.verified_count ?? 0}
      profileViews30d={views30dRes.count ?? 0}
      profileViewsPrev30d={viewsPrev30dRes.count ?? 0}
      newReviewsThisMonth={newReviewsThisMonth}
      prevMonthReviews={prevMonthReviews}
      responseRate={responseRate}
      unrespondedCount={unresponded}
      cityRank={cityRank}
      cityTotal={cityTotal}
      dimensionRanks={dimensionRanks}
      monthlyData={monthlyData}
      scoreCards={scoreCards}
      publishedReviews={published as any}
      pendingReviews={pending as any}
      insights={insights}
      invites={invites}
      allServices={allServices}
      practiceServiceIds={practiceServiceIds}
      enquiries={enquiries}
      teamDentists={teamDentists}
      opportunityInsights={opportunityInsights}
      googleReviewCount={googleReviewCount}
      googleAvgRating={googleAvgRating}
      initialAccessToken={session?.access_token ?? ''}
    />
  );
}
