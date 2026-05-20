import { createServerSupabase } from '@/lib/supabase';
import HeroSection from './components/HeroSection';
import InsightsStrip from './components/InsightsStrip';
import TreatmentPathways from './components/TreatmentPathways';
import BestForSection from './components/BestForSection';
import LeadCaptureSection from './components/LeadCaptureSection';
import TopClinicsSection from './components/TopClinicsSection';
import MatchCTA from './components/MatchCTA';
import HowItWorksSection from './components/HowItWorksSection';
import type { PracticeCardData } from './components/PracticeCard';
import type { BestForClinic } from './components/BestForSection';
import type { InsightStats } from './components/InsightsStrip';

const HOME_LIMIT = 40;

// ── Thresholds (configurable) ─────────────────────────────────────────────
const PLATFORM_REVIEW_THRESHOLD = 20; // below this → service-based sections
const MIN_REVIEWS_FOR_SECTION   = 5;  // per-practice minimum for review ranking
const MIN_SECTION_SIZE          = 3;  // minimum practices for a rating-based section

export default async function Home() {
  const supabase = await createServerSupabase();

  const summariesRes = await supabase
    .from('practice_rating_summary')
    .select('practice_id, avg_overall, avg_cleanliness, avg_pain, avg_cost, avg_communication, avg_anxiety, review_count, verified_count')
    .order('avg_overall', { ascending: false });

  const summaries = summariesRes.data ?? [];
  const summaryMap = Object.fromEntries(summaries.map((s) => [s.practice_id, s]));

  const totalReviews = summaries.reduce((n, s) => n + (s.review_count ?? 0), 0);
  const ratedSummaries = summaries.filter(s => s.avg_overall != null);
  const avgOverall = ratedSummaries.length > 0
    ? ratedSummaries.reduce((n, s) => n + (s.avg_overall ?? 0), 0) / ratedSummaries.length
    : null;
  const totalVerified = summaries.reduce((n, s) => n + ((s as any).verified_count ?? 0), 0);
  const verifiedPct = totalReviews > 0 ? (totalVerified / totalReviews) * 100 : null;
  const insightStats: InsightStats = { totalReviews, avgOverall, verifiedPct };
  const reviewedIds = summaries.map((s) => s.practice_id);

  const PRACTICE_SELECT = 'id, name, slug, city, address_line1, practice_type, website, claimed_by_user_id, ai_summary, nhs_accepting';

  const [reviewedRes, unreviewedRes, practiceServicesRes, practiceCountRes] = await Promise.all([
    reviewedIds.length > 0
      ? supabase
          .from('practices')
          .select(PRACTICE_SELECT)
          .in('id', reviewedIds)
      : Promise.resolve({ data: [] }),
    supabase
      .from('practices')
      .select(PRACTICE_SELECT)
      .not('id', 'in', reviewedIds.length > 0 ? `(${reviewedIds.join(',')})` : '(00000000-0000-0000-0000-000000000000)')
      .order('name')
      .limit(Math.max(0, HOME_LIMIT - reviewedIds.length)),
    supabase
      .from('practice_services')
      .select('practice_id, services(slug, name)')
      .then(r => r, () => ({ data: null, error: null })),
    supabase.from('practices').select('id', { count: 'exact', head: true }),
  ]);

  const practiceCount = practiceCountRes.count ?? 0;
  const heroStats = { practiceCount, avgOverall, reviewCount: totalReviews };

  // Group services by practice_id — gracefully empty if migration not yet applied
  const servicesByPractice = new Map<string, { slug: string; name: string }[]>();
  for (const row of (practiceServicesRes.data ?? [])) {
    const ps = row as any;
    if (!ps.services) continue;
    const list = servicesByPractice.get(ps.practice_id) ?? [];
    list.push(ps.services);
    servicesByPractice.set(ps.practice_id, list);
  }

  const toCard = (p: any): PracticeCardData => {
    const s = summaryMap[p.id];
    const services = servicesByPractice.get(p.id) ?? [];
    return {
      ...p,
      avg_overall:       s?.avg_overall       ?? null,
      review_count:      s?.review_count       ?? 0,
      avg_cleanliness:   s?.avg_cleanliness    ?? null,
      avg_pain:          s?.avg_pain           ?? null,
      avg_cost:          s?.avg_cost           ?? null,
      avg_communication: s?.avg_communication  ?? null,
      avg_anxiety:       s?.avg_anxiety        ?? null,
      ai_summary:        p.ai_summary          ?? null,
      nhs_accepting:     p.nhs_accepting       ?? null,
      services,
    };
  };

  const reviewed = (reviewedRes.data ?? [])
    .sort((a: any, b: any) => (summaryMap[b.id]?.avg_overall ?? 0) - (summaryMap[a.id]?.avg_overall ?? 0))
    .map(toCard);

  const unreviewed = (unreviewedRes.data ?? []).map(toCard);
  const allPractices = [...reviewed, ...unreviewed];

  // ── Debug ─────────────────────────────────────────────────────────────────
  console.log('[Homepage]', {
    practiceCount: allPractices.length,
    reviewedCount: reviewed.length,
    unreviewedCount: unreviewed.length,
    totalReviews,
    isEarlyStage: totalReviews < PLATFORM_REVIEW_THRESHOLD,
    serviceMapSize: servicesByPractice.size,
  });

  const isEarlyStage = totalReviews < PLATFORM_REVIEW_THRESHOLD;

  // Rating-based pools (used when !isEarlyStage)
  const wellReviewed = reviewed.filter(p => (p.review_count ?? 0) >= MIN_REVIEWS_FOR_SECTION);
  const topByAnxiety = [...wellReviewed].sort((a, b) => (b.avg_anxiety ?? 0) - (a.avg_anxiety ?? 0)).slice(0, 3);
  const topByValue   = [...wellReviewed].sort((a, b) => (b.avg_cost    ?? 0) - (a.avg_cost    ?? 0)).slice(0, 3);
  const topRated     = [...wellReviewed].sort((a, b) => (b.avg_overall ?? 0) - (a.avg_overall ?? 0)).slice(0, 8);

  // Service-based ranking: target service required; secondary sort by profile
  // completeness (more services = more active listing); city diversity preferred.
  const rankByService = (slugs: string | string[], limit = 3): PracticeCardData[] => {
    const slugSet = new Set(Array.isArray(slugs) ? slugs : [slugs]);
    const tagged = allPractices
      .filter(p => (p.services ?? []).some((s: any) => slugSet.has(s.slug)))
      .sort((a, b) => (b.services ?? []).length - (a.services ?? []).length);
    // City diversity: prefer one practice per city before repeating
    const seen = new Set<string>();
    const diverse: PracticeCardData[] = [];
    const remainder: PracticeCardData[] = [];
    for (const p of tagged) {
      const city = (p.city ?? '').toLowerCase();
      (seen.has(city) ? remainder : diverse).push(p);
      seen.add(city);
    }
    return [...diverse, ...remainder].slice(0, limit);
  };

  const earlyBadge  = 'New platform';
  const signalBadge = 'Early signals';

  const PRACTICE_TYPE_LABELS: Record<string, string> = { nhs: 'NHS', private: 'Private', mixed: 'NHS & private' };

  const toBestFor = (p: PracticeCardData, fallback: string): BestForClinic => {
    const serviceNames = (p.services ?? []).map((s: any) => s.name);
    const showAI = !!p.ai_summary && ((p.review_count ?? 0) >= 5 || !!p.claimed_by_user_id);
    const typeLabel = PRACTICE_TYPE_LABELS[p.practice_type] ?? null;
    const fallbackParts = [...serviceNames.slice(0, 3), typeLabel].filter(Boolean) as string[];
    const insight = showAI
      ? p.ai_summary!
      : fallbackParts.length > 0 ? fallbackParts.join(' · ') : fallback;
    return {
      name:            p.name,
      slug:            p.slug,
      rating:          p.avg_overall ?? null,
      location:        p.city ?? '',
      insight,
      isAiInsight:     showAI,
      anxietyFriendly: (p.avg_anxiety ?? 0) >= 4 || (p.services ?? []).some((s: any) => s.slug === 'anxiety-friendly'),
      isClaimed:       !!p.claimed_by_user_id,
      reviewCount:     p.review_count ?? 0,
    };
  };

  // Generic fallback for any practice when no speciality context is available
  const genericFallback = (p: PracticeCardData) =>
    toBestFor(p, `Dental practice · ${p.city ?? 'England'}`);

  return (
    <div>
      <HeroSection stats={heroStats} />

      {/* Trust strip — "Helping patients choose confidently" */}
      <InsightsStrip stats={insightStats} />

      {/* How it works */}
      <HowItWorksSection />

      {/* Treatment-first navigation */}
      <TreatmentPathways />

      {/* Section 1 — nervous patients / first available section */}
      <section className="mx-auto px-5 py-16 sm:py-20" style={{ maxWidth: 1200 }}>
        {(() => {
          const anxietyByService = rankByService('anxiety-friendly');
          const eveningByService = rankByService('evening-appointments');

          if (!isEarlyStage && topByAnxiety.length >= MIN_SECTION_SIZE) {
            return (
              <BestForSection
                title="Best for nervous patients"
                subtitle="Practices rated highest by patients for comfort and calm"
                viewAllHref="/search?q=nervous"
                clinics={topByAnxiety.map(p => toBestFor(p, 'Great for anxious patients, clear communication'))}
              />
            );
          }
          if (anxietyByService.length > 0) {
            return (
              <BestForSection
                title={isEarlyStage ? 'Clinics supporting nervous patients' : 'Anxiety-friendly practices'}
                subtitle="Practices specialising in nervous and anxious patient care"
                badge={isEarlyStage ? earlyBadge : signalBadge}
                viewAllHref="/search?q=nervous"
                clinics={anxietyByService.map(p => toBestFor(p, 'Specialises in anxious patient care'))}
              />
            );
          }
          if (eveningByService.length > 0) {
            return (
              <BestForSection
                title="Clinics with flexible appointments"
                subtitle="Practices open evenings and weekends"
                badge={isEarlyStage ? earlyBadge : signalBadge}
                clinics={eveningByService.map(p => toBestFor(p, 'Flexible appointment times available'))}
              />
            );
          }
          return (
            <BestForSection
              title="Dental practices in England"
              subtitle="Verified practices — reviewed by real patients"
              badge={earlyBadge}
              viewAllHref="/search"
              clinics={allPractices.slice(0, 3).map(genericFallback)}
            />
          );
        })()}
      </section>

      {/* Mid-page lead capture */}
      <div id="get-matched">
        <LeadCaptureSection />
      </div>

      {/* Section 2 — value / NHS / Invisalign */}
      <section className="mx-auto px-5 py-16 sm:py-20" style={{ maxWidth: 1200 }}>
        {(() => {
          const nhsByService        = rankByService(['nhs', 'mixed-nhs-private']);
          const invisalignByService = rankByService('invisalign');

          if (!isEarlyStage && topByValue.length >= MIN_SECTION_SIZE) {
            return (
              <BestForSection
                title="Best value for money"
                subtitle="Top-rated practices for transparent, fair pricing — based on patient scores"
                viewAllHref="/search?q=value"
                clinics={topByValue.map(p => toBestFor(p, 'Patients highlight great value and cost transparency'))}
              />
            );
          }
          if (nhsByService.length > 0) {
            return (
              <BestForSection
                title="NHS & private practices"
                subtitle="Practices offering NHS treatment alongside private options"
                badge={isEarlyStage ? earlyBadge : signalBadge}
                clinics={nhsByService.map(p => toBestFor(p, 'NHS and private treatment available'))}
              />
            );
          }
          if (invisalignByService.length > 0) {
            return (
              <BestForSection
                title="Invisalign-certified practices"
                subtitle="Practices offering clear aligner treatment — reviewed by real patients"
                badge={isEarlyStage ? earlyBadge : signalBadge}
                clinics={invisalignByService.map(p => toBestFor(p, 'Certified Invisalign provider'))}
              />
            );
          }
          const morePractices = allPractices.slice(3, 6);
          if (morePractices.length > 0) {
            return (
              <BestForSection
                title="More practices to explore"
                subtitle="Discover dental practices across England"
                badge={earlyBadge}
                viewAllHref="/search"
                clinics={morePractices.map(genericFallback)}
              />
            );
          }
          return null;
        })()}
      </section>

      {/* Top rated */}
      <TopClinicsSection
        clinics={
          topRated.length > 0
            ? topRated.map(p => toBestFor(p, 'Highly rated by verified patients'))
            : allPractices.slice(0, 6).map(genericFallback)
        }
        title={topRated.length > 0 ? 'Top-rated dentists' : 'Practices to explore'}
        eyebrow={topRated.length > 0 ? 'Based on patient reviews' : 'Browse'}
      />

      {/* Dentist CTA — at the bottom, out of the patient flow */}
      <MatchCTA />
    </div>
  );
}
