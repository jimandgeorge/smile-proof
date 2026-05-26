import { notFound } from 'next/navigation';
import Link from 'next/link';
import { createServerSupabase } from '@/lib/supabase';

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params) {
  const { slug } = await params;
  const supabase = await createServerSupabase();
  const { data } = await supabase.from('treatments').select('name').eq('slug', slug).single();
  if (!data) return { title: 'Treatment not found' };
  const title = `${data.name} — UK prices & reviews | SmileProof`;
  const description = `See what UK patients paid for ${data.name}. Real prices reported by verified patients.`;
  const url = `https://www.smileproof.co.uk/treatments/${slug}`;
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { title, description, url, type: 'website' },
    twitter: { card: 'summary' as const, title, description },
  };
}

const TYPE_LABEL: Record<string, string> = { nhs: 'NHS', private: 'Private', insurance: 'Insurance' };
const TYPE_COLOR: Record<string, string> = {
  nhs:       'background: #e8f5ee; color: #1c4535;',
  private:   'background: #fdf8ee; color: #8a6a00;',
  insurance: 'background: #eef4fd; color: #1a4a8a;',
};

export default async function TreatmentPage({ params }: Params) {
  const { slug } = await params;
  const supabase = await createServerSupabase();

  const { data: treatment } = await supabase
    .from('treatments')
    .select('id, name, category, nhs_band, description')
    .eq('slug', slug)
    .single();

  if (!treatment) notFound();

  const { data: reports } = await supabase
    .from('price_reports')
    .select('amount_pence, payment_type, date_of_treatment, practices(id, slug, name, city)')
    .eq('treatment_id', treatment.id)
    .order('date_of_treatment', { ascending: false })
    .limit(100);

  const priceRows = reports ?? [];

  const byType = ['nhs', 'private', 'insurance'].map((type) => {
    const prices = priceRows.filter((r) => r.payment_type === type).map((r) => r.amount_pence);
    if (!prices.length) return null;
    const sorted = [...prices].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    const median = sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
    return { type, count: prices.length, min: Math.min(...prices) / 100, max: Math.max(...prices) / 100, median: median / 100 };
  }).filter(Boolean);

  const practiceMap = new Map<string, { slug: string; name: string; city: string }>();
  for (const r of priceRows) {
    const p = r.practices as any;
    if (p && !practiceMap.has(p.id)) practiceMap.set(p.id, p);
  }
  const practicesWithReports = Array.from(practiceMap.values());

  return (
    <main style={{ maxWidth: 768, margin: '0 auto', padding: '32px 24px' }}>
      <Link
        href="/"
        style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--ink-soft)', textDecoration: 'none', marginBottom: 24, fontFamily: 'var(--font-body)' }}
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M9 2L4 7l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Back to home
      </Link>

      {/* Header */}
      <div style={{ background: 'white', border: '1.5px solid var(--cream-dark)', borderRadius: 'var(--radius)', padding: '24px 28px', marginBottom: 20, boxShadow: 'var(--shadow-card)' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 700, color: 'var(--ink)', letterSpacing: '-0.02em', marginBottom: 10 }}>
              {treatment.name}
            </h1>
            <div style={{ display: 'flex', gap: 8 }}>
              <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 20, background: 'var(--cream-dark)', color: 'var(--ink-soft)', fontFamily: 'var(--font-body)', fontWeight: 500, textTransform: 'capitalize' }}>
                {treatment.category}
              </span>
              {treatment.nhs_band && (
                <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 20, background: 'var(--forest-pale)', color: 'var(--forest)', fontFamily: 'var(--font-body)', fontWeight: 600 }}>
                  NHS Band {treatment.nhs_band}
                </span>
              )}
            </div>
          </div>
          {treatment.nhs_band && (
            <div style={{ flexShrink: 0, textAlign: 'right' }}>
              <div style={{ fontSize: 11, color: 'var(--ink-soft)', fontFamily: 'var(--font-body)', marginBottom: 2 }}>NHS fixed price</div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, color: 'var(--forest)' }}>
                £{treatment.nhs_band === 1 ? '26.80' : treatment.nhs_band === 2 ? '73.50' : '284.30'}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Price summary */}
      <section style={{ background: 'white', border: '1.5px solid var(--cream-dark)', borderRadius: 'var(--radius)', padding: '24px 28px', marginBottom: 20, boxShadow: 'var(--shadow-card)' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 600, color: 'var(--ink)', marginBottom: 16 }}>
          Prices reported by patients
        </h2>

        {byType.length === 0 ? (
          <p style={{ fontSize: 14, color: 'var(--ink-faint)', fontFamily: 'var(--font-body)' }}>
            No price reports yet for this treatment.
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {byType.map((row) => row && (
              <div key={row.type} style={{ display: 'grid', gridTemplateColumns: '100px 1fr 1fr 1fr', alignItems: 'center', padding: '12px 16px', borderRadius: 10, border: '1px solid var(--cream-dark)', gap: 8 }}>
                <span style={{ fontSize: 12, fontWeight: 600, padding: '3px 10px', borderRadius: 20, fontFamily: 'var(--font-body)', display: 'inline-block', ...(Object.fromEntries(TYPE_COLOR[row.type].split(';').filter(Boolean).map(s => s.split(':').map(x => x.trim()) as [string, string]))) }}>
                  {TYPE_LABEL[row.type]}
                </span>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 11, color: 'var(--ink-faint)', fontFamily: 'var(--font-body)', marginBottom: 2 }}>Reports</div>
                  <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--ink)', fontFamily: 'var(--font-display)' }}>{row.count}</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 11, color: 'var(--ink-faint)', fontFamily: 'var(--font-body)', marginBottom: 2 }}>Range</div>
                  <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--ink)', fontFamily: 'var(--font-display)' }}>£{row.min.toFixed(0)}–£{row.max.toFixed(0)}</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 11, color: 'var(--ink-faint)', fontFamily: 'var(--font-body)', marginBottom: 2 }}>Median</div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--forest)', fontFamily: 'var(--font-display)' }}>£{row.median.toFixed(0)}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Practices with price data */}
      {practicesWithReports.length > 0 && (
        <section style={{ background: 'white', border: '1.5px solid var(--cream-dark)', borderRadius: 'var(--radius)', padding: '24px 28px', boxShadow: 'var(--shadow-card)' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 600, color: 'var(--ink)', marginBottom: 16 }}>
            Practices with {treatment.name.toLowerCase()} prices
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {practicesWithReports.map((p) => (
              <Link
                key={p.slug}
                href={`/practices/${p.slug}`}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderRadius: 10, border: '1.5px solid var(--cream-dark)', textDecoration: 'none', transition: 'border-color var(--transition)' }}
              >
                <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink)', fontFamily: 'var(--font-body)' }}>{p.name}</span>
                <span style={{ fontSize: 13, color: 'var(--ink-soft)', fontFamily: 'var(--font-body)' }}>{p.city} →</span>
              </Link>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
