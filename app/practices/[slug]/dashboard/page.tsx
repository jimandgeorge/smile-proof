import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { createAdminSupabase, createServerSupabase } from '@/lib/supabase';
import DashboardShell from './DashboardShell';

type Params = { params: Promise<{ slug: string }> };

export default async function DashboardPage({ params }: Params) {
  const { slug } = await params;
  const admin = createAdminSupabase();
  const supabase = await createServerSupabase();

  const { data: { user } } = await supabase.auth.getUser();

  const { data: practice, error } = await admin
    .from('practices')
    .select('id, name, city, postcode, practice_type, claimed_by_user_id, subscription_status, ai_insights')
    .eq('slug', slug)
    .single();

  if (error || !practice) notFound();

  if (!practice.claimed_by_user_id) {
    redirect(`/practices/${slug}/claim`);
  }

  if (!user || user.id !== (practice as any).claimed_by_user_id) {
    return (
      <main style={{ maxWidth: 480, margin: '0 auto', padding: '80px 24px', textAlign: 'center' }}>
        <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'var(--cream-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <rect x="3" y="11" width="18" height="11" rx="2" stroke="var(--ink-mid)" strokeWidth="1.5" fill="none" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" stroke="var(--ink-mid)" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 700, color: 'var(--ink)', marginBottom: 12 }}>
          Access denied
        </h1>
        <p style={{ fontSize: 14, color: 'var(--ink-soft)', marginBottom: 28, lineHeight: 1.6 }}>
          You need to be the verified owner of this practice to access the dashboard.
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

  const isPaid = (practice as any).subscription_status === 'active';

  const rawName: string = user.user_metadata?.full_name ?? user.user_metadata?.name ?? user.email?.split('@')[0] ?? 'there';
  const userName = rawName.split(' ')[0];
  const userInitial = userName[0]?.toUpperCase() ?? '?';

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
        { label: 'Pain management',  key: 'avg_pain' },
        { label: 'Staff friendliness', key: 'avg_communication' },
        { label: 'Value for money',  key: 'avg_cost' },
        { label: 'Cleanliness',      key: 'avg_cleanliness' },
        { label: 'Anxiety handling', key: 'avg_anxiety' },
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
    { label: 'Overall', value: summary?.avg_overall ?? null },
    { label: 'Pain Management', value: summary?.avg_pain ?? null },
    { label: 'Communication', value: summary?.avg_communication ?? null },
    { label: 'Value for Money', value: summary?.avg_cost ?? null },
    { label: 'Cleanliness', value: summary?.avg_cleanliness ?? null },
    { label: 'Anxiety Handling', value: summary?.avg_anxiety ?? null },
  ];

  // Computed insights
  const unresponded = published.filter((r: any) => !r.practice_responses?.body).length;
  const insights: { type: 'warning' | 'info' | 'action'; text: string; actionLabel: string; actionHref: string }[] = [];
  if (unresponded > 0) {
    insights.push({ type: 'action', text: `${unresponded} review${unresponded !== 1 ? 's' : ''} need${unresponded === 1 ? 's' : ''} a response — responding improves trust scores`, actionLabel: 'Respond now', actionHref: '#' });
  }
  if (cityRank > 0 && cityRank <= 3) {
    insights.push({ type: 'info', text: `You're ranked #${cityRank} in ${(practice as any).city} — great work!`, actionLabel: 'See ranking', actionHref: '#' });
  }
  if (responseRate < 50 && published.length >= 3) {
    insights.push({ type: 'warning', text: `Response rate is ${responseRate}% — patients trust practices that reply`, actionLabel: 'View reviews', actionHref: '#' });
  }

  const prevMonthReviews = monthlyData[monthlyData.length - 2]?.count ?? 0;

  const invites = (invitesRes.data ?? []) as { id: string; patient_email: string; patient_name: string | null; sent_at: string; review_id: string | null }[];
  const allServices = (allServicesRes.data ?? []) as { id: string; slug: string; name: string; category: string; sort_order: number }[];
  const practiceServiceIds = (practiceServicesRes.data ?? []).map((ps: any) => ps.service_id as string);

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
      aiInsights={(practice as any).ai_insights ?? null}
      allServices={allServices}
      practiceServiceIds={practiceServiceIds}
    />
  );
}
