import { createServerSupabase } from '@/lib/supabase';
import HeroSection from './components/HeroSection';
import InsightsStrip from './components/InsightsStrip';
import BestForSection from './components/BestForSection';
import TopClinicsSection from './components/TopClinicsSection';
import MatchCTA from './components/MatchCTA';
import ReviewCTA from './components/ReviewCTA';
import ReviewNudge from './components/ReviewNudge';
import type { PracticeCardData } from './components/PracticeCard';
import type { BestForClinic } from './components/BestForSection';
import type { InsightStats } from './components/InsightsStrip';

const HOME_LIMIT = 40;

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

  const PRACTICE_SELECT = 'id, name, slug, city, address_line1, practice_type, website, claimed_by_user_id, ai_summary';

  const [reviewedRes, unreviewedRes, practiceServicesRes] = await Promise.all([
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
      .then(r => r)
      .catch(() => ({ data: null, error: null })),
  ]);

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
      services,
    };
  };

  const reviewed = (reviewedRes.data ?? [])
    .sort((a, b) => (summaryMap[b.id]?.avg_overall ?? 0) - (summaryMap[a.id]?.avg_overall ?? 0))
    .map(toCard);

  const unreviewed = (unreviewedRes.data ?? []).map(toCard);
  const allPractices = [...reviewed, ...unreviewed];

  const MIN_REVIEWS_FOR_SECTION = 5;
  const MIN_SECTION_SIZE = 3;

  // Rating-based: only practices with enough reviews
  const wellReviewed = reviewed.filter(p => (p.review_count ?? 0) >= MIN_REVIEWS_FOR_SECTION);
  const topByAnxiety = [...wellReviewed].sort((a, b) => (b.avg_anxiety ?? 0) - (a.avg_anxiety ?? 0)).slice(0, 3);
  const topByValue   = [...wellReviewed].sort((a, b) => (b.avg_cost    ?? 0) - (a.avg_cost    ?? 0)).slice(0, 3);
  const topRated     = [...wellReviewed].sort((a, b) => (b.avg_overall ?? 0) - (a.avg_overall ?? 0)).slice(0, 8);

  // Service-based fallbacks
  const byService = (slug: string) =>
    allPractices.filter(p => (p.services ?? []).some((s: { slug: string }) => s.slug === slug)).slice(0, 3);
  const anxietyFriendlyPractices = byService('anxiety-friendly');
  const eveningPractices         = byService('evening-appointments');
  const invisalignPractices      = byService('invisalign');
  const nhsPractices             = allPractices
    .filter(p => (p.services ?? []).some((s: { slug: string }) => s.slug === 'nhs' || s.slug === 'mixed-nhs-private'))
    .slice(0, 3);

  const toBestFor = (p: PracticeCardData, fallback: string): BestForClinic => {
    const serviceNames = (p.services ?? []).map(s => s.name);
    const insight = p.ai_summary
      ?? (serviceNames.length > 0 ? serviceNames.slice(0, 3).join(' · ') : fallback);
    return {
      name:            p.name,
      slug:            p.slug,
      rating:          p.avg_overall ?? null,
      location:        p.city ?? '',
      insight,
      anxietyFriendly: (p.avg_anxiety ?? 0) >= 4 || (p.services ?? []).some(s => s.slug === 'anxiety-friendly'),
    };
  };

  return (
    <div>
      <HeroSection />
      <ReviewNudge />

      <InsightsStrip stats={insightStats} />

      {/* First row — anxiety or service-based fallback */}
      <section className="mx-auto px-5 pt-12 sm:pt-16 pb-8" style={{ maxWidth: 1200 }}>
        {topByAnxiety.length >= MIN_SECTION_SIZE ? (
          <BestForSection
            title="Best for nervous patients"
            subtitle="Practices rated highest for comfort and calm"
            viewAllHref="/search?q=nervous"
            clinics={topByAnxiety.map(p => toBestFor(p, 'Great for anxious patients, clear communication'))}
          />
        ) : anxietyFriendlyPractices.length > 0 ? (
          <BestForSection
            title="Anxiety-friendly practices"
            subtitle="Practices that specialise in nervous patient care"
            badge="Early signals"
            viewAllHref="/search?q=nervous"
            clinics={anxietyFriendlyPractices.map(p => toBestFor(p, 'Specialises in anxious patient care'))}
          />
        ) : eveningPractices.length > 0 ? (
          <BestForSection
            title="Evening & weekend appointments"
            subtitle="Practices open outside standard hours"
            badge="Early signals"
            clinics={eveningPractices.map(p => toBestFor(p, 'Flexible appointment times available'))}
          />
        ) : null}
      </section>

      <MatchCTA />

      {/* Second row — value or service-based fallback */}
      <section className="mx-auto px-5 pt-8 pb-12 sm:pb-16" style={{ maxWidth: 1200 }}>
        {topByValue.length >= MIN_SECTION_SIZE ? (
          <BestForSection
            title="Best value for money"
            subtitle="Top-rated practices for transparent, fair pricing"
            viewAllHref="/search?q=value"
            clinics={topByValue.map(p => toBestFor(p, 'Patients highlight great value and cost transparency'))}
          />
        ) : invisalignPractices.length > 0 ? (
          <BestForSection
            title="Invisalign & clear aligners"
            subtitle="Practices offering orthodontic treatment"
            badge="Early signals"
            clinics={invisalignPractices.map(p => toBestFor(p, 'Offers Invisalign and orthodontic treatment'))}
          />
        ) : nhsPractices.length > 0 ? (
          <BestForSection
            title="NHS & private practices"
            subtitle="Practices offering NHS treatment alongside private options"
            badge="Early signals"
            clinics={nhsPractices.map(p => toBestFor(p, 'NHS and private treatment available'))}
          />
        ) : null}
      </section>

      <ReviewCTA />

      <TopClinicsSection
        clinics={topRated.map(p => toBestFor(p, 'Highly rated by verified patients'))}
      />
    </div>
  );
}
