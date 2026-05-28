export const dynamic = 'force-dynamic';

import { notFound, redirect } from 'next/navigation';
import { createAdminSupabase, createServerSupabase } from '@/lib/supabase';
import DashboardShell from './DashboardShell';
import { Lock } from 'lucide-react';

type Params = { params: Promise<{ slug: string }> };

export default async function DashboardPage({ params }: Params) {
  const { slug } = await params;
  const admin = createAdminSupabase();
  const supabase = await createServerSupabase();

  const { data: { user } } = await supabase.auth.getUser();
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

  if (!user || user.id !== (practice as any).claimed_by_user_id) {
    redirect('/auth/login');
  }

  const isPaid = (practice as any).subscription_status === 'active';
  const trialStartedAt: string | null = (practice as any).trial_started_at ?? null;

  const rawName: string = user.user_metadata?.full_name ?? user.user_metadata?.name ?? user.email?.split('@')[0] ?? 'there';
  const userName = rawName.split(' ')[0];
  const userInitial = userName[0]?.toUpperCase() ?? '?';
  const userEmail = user.email ?? '';
  const isOAuthUser = (user.app_metadata?.provider ?? '') !== 'email';

  const now = new Date();
  const thirtyDaysAgo = new Date(now); thirtyDaysAgo.setDate(now.getDate() - 30);
  const sixtyDaysAgo = new Date(now); sixtyDaysAgo.setDate(now.getDate() - 60);

  const [
    summaryRes,
    cityPracticesRes,
    views30dRes,
    viewsPrev30dRes,
    opportunityInsightsRes,
    googleReviewsRes,
  ] = await Promise.all([
    admin.from('practice_rating_summary').select('*').eq('practice_id', practice.id).maybeSingle(),
    admin.from('practices').select('id').eq('city', (practice as any).city),
    admin.from('practice_page_views').select('id', { count: 'exact', head: true }).eq('practice_id', practice.id).gte('viewed_at', thirtyDaysAgo.toISOString()),
    admin.from('practice_page_views').select('id', { count: 'exact', head: true }).eq('practice_id', practice.id).gte('viewed_at', sixtyDaysAgo.toISOString()).lt('viewed_at', thirtyDaysAgo.toISOString()),
    admin.from('practice_opportunity_insights').select('*').eq('practice_id', practice.id).maybeSingle(),
    admin.from('external_reviews').select('rating').eq('practice_id', practice.id).eq('source', 'google').not('rating', 'is', null),
  ]);

  const summary = summaryRes.data;

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
      trialStartedAt={trialStartedAt}
      profileViews30d={views30dRes.count ?? 0}
      profileViewsPrev30d={viewsPrev30dRes.count ?? 0}
      cityRank={cityRank}
      cityTotal={cityTotal}
      dimensionRanks={dimensionRanks}
      opportunityInsights={opportunityInsights}
      googleReviewCount={googleReviewCount}
      googleAvgRating={googleAvgRating}
      initialAccessToken={session?.access_token ?? ''}
    />
  );
}
