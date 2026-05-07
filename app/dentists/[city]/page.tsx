import { notFound } from 'next/navigation';
import Link from 'next/link';
import { createServerSupabase } from '@/lib/supabase';
import PracticeCard, { PracticeCardData } from '@/app/components/PracticeCard';

const PAGE_SIZE = 20;

type Props = {
  params: Promise<{ city: string }>;
  searchParams: Promise<{ page?: string }>;
};

function prettify(city: string) {
  return city.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

export async function generateMetadata({ params }: Props) {
  const { city } = await params;
  const name = prettify(city);
  return {
    title: `Dentists in ${name} | SmileProof`,
    description: `Find verified NHS and private dentists in ${name}. Read patient reviews and compare prices.`,
  };
}

export default async function CityPage({ params, searchParams }: Props) {
  const { city } = await params;
  const { page: pageParam } = await searchParams;
  const cityName = prettify(city);
  const page = Math.max(1, Number(pageParam) || 1);
  const supabase = await createServerSupabase();

  const [practicesRes, summariesRes] = await Promise.all([
    supabase
      .from('practices')
      .select('id, slug, name, city, address_line1, practice_type, website, claimed_by_user_id')
      .ilike('city', cityName)
      .order('name'),
    supabase
      .from('practice_rating_summary')
      .select('practice_id, avg_overall, avg_cleanliness, avg_pain, avg_cost, avg_communication, review_count'),
  ]);

  const allPractices = practicesRes.data ?? [];
  if (!allPractices.length) notFound();

  const summaryMap: Record<string, any> = {};
  for (const s of summariesRes.data ?? []) {
    summaryMap[s.practice_id] = s;
  }

  const practices: PracticeCardData[] = allPractices.map((p) => {
    const s = summaryMap[p.id];
    return {
      ...p,
      avg_overall: s?.avg_overall ?? null,
      review_count: s?.review_count ?? 0,
      avg_cleanliness: s?.avg_cleanliness ?? null,
      avg_pain: s?.avg_pain ?? null,
      avg_cost: s?.avg_cost ?? null,
      avg_communication: s?.avg_communication ?? null,
    };
  });

  const totalPages = Math.ceil(practices.length / PAGE_SIZE);
  const paginated = practices.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <main style={{ maxWidth: 768, margin: '0 auto', padding: '32px 16px' }}>
      <Link
        href="/"
        style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--ink-soft)', textDecoration: 'none', marginBottom: 20 }}
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Home
      </Link>

      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 700, color: 'var(--ink)', letterSpacing: '-0.02em', marginBottom: 6 }}>
        Dentists in {cityName}
      </h1>
      <p style={{ fontSize: 14, color: 'var(--ink-soft)', marginBottom: 28 }}>
        {practices.length} practice{practices.length !== 1 ? 's' : ''} in {cityName}
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {paginated.map((p) => (
          <PracticeCard key={p.id} practice={p} />
        ))}
      </div>

      {totalPages > 1 && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginTop: 32 }}>
          {page > 1 ? (
            <Link
              href={`/dentists/${city}?page=${page - 1}`}
              style={{ padding: '8px 20px', borderRadius: 8, border: '1.5px solid var(--cream-dark)', background: 'white', color: 'var(--ink-mid)', fontSize: 14, fontWeight: 500, textDecoration: 'none' }}
            >
              ← Previous
            </Link>
          ) : (
            <span style={{ padding: '8px 20px', borderRadius: 8, border: '1.5px solid var(--cream-dark)', color: 'var(--ink-faint)', fontSize: 14, fontWeight: 500 }}>
              ← Previous
            </span>
          )}
          <span style={{ fontSize: 14, color: 'var(--ink-soft)' }}>Page {page} of {totalPages}</span>
          {page < totalPages ? (
            <Link
              href={`/dentists/${city}?page=${page + 1}`}
              style={{ padding: '8px 20px', borderRadius: 8, border: '1.5px solid var(--cream-dark)', background: 'white', color: 'var(--ink-mid)', fontSize: 14, fontWeight: 500, textDecoration: 'none' }}
            >
              Next →
            </Link>
          ) : (
            <span style={{ padding: '8px 20px', borderRadius: 8, border: '1.5px solid var(--cream-dark)', color: 'var(--ink-faint)', fontSize: 14, fontWeight: 500 }}>
              Next →
            </span>
          )}
        </div>
      )}
    </main>
  );
}
