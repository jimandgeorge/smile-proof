import { createAdminSupabase } from '@/lib/supabase';
import { toggleFeatured } from '../practices/actions';
import { Star, ExternalLink } from 'lucide-react';

const planStyle: Record<string, { bg: string; color: string }> = {
  free:   { bg: '#f3f4f6', color: '#6b7280' },
  growth: { bg: '#eff6ff', color: '#1d4ed8' },
  pro:    { bg: '#faf5ff', color: '#7c3aed' },
};

export default async function AdminFeaturedPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q = '' } = await searchParams;

  const supabase = createAdminSupabase();

  const [featuredRes, allRes] = await Promise.all([
    supabase
      .from('practices')
      .select('id, name, slug, city, subscription_plan, subscription_status, claimed_by_user_id')
      .eq('is_featured', true)
      .order('name'),
    supabase
      .from('practices')
      .select('id, name, slug, city, subscription_plan, subscription_status, claimed_by_user_id, is_featured', { count: 'exact' })
      .eq('is_featured', false)
      .order('subscription_plan', { ascending: false })
      .order('name'),
  ]);

  const featured = featuredRes.data ?? [];

  let candidates = allRes.data ?? [];
  if (q) {
    const lq = q.toLowerCase();
    candidates = candidates.filter(p =>
      p.name?.toLowerCase().includes(lq) || p.city?.toLowerCase().includes(lq) || p.slug?.toLowerCase().includes(lq)
    );
  }

  const stats = [
    { label: 'featured',   value: featured.length,                                        color: '#d97706', bg: '#fefce8' },
    { label: 'paid',       value: featured.filter(p => p.subscription_plan !== 'free').length, color: '#7c3aed', bg: '#faf5ff' },
    { label: 'claimed',    value: featured.filter(p => !!p.claimed_by_user_id).length,     color: '#16a34a', bg: '#f0fdf4' },
  ];

  return (
    <div style={{ padding: '32px', maxWidth: 900 }}>

      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, color: '#111', margin: '0 0 6px', letterSpacing: '-0.02em' }}>
          Featured practices
        </h1>
        <p style={{ fontSize: 13, color: '#6b7280', fontFamily: 'var(--font-body)', margin: '0 0 12px' }}>
          Featured practices get priority AI summary generation and homepage placement.
        </p>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {stats.map(({ label, value, color, bg }) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 12px', borderRadius: 20, background: bg }}>
              <span style={{ fontSize: 12, fontWeight: 700, color, fontFamily: 'var(--font-body)' }}>{value}</span>
              <span style={{ fontSize: 12, color: '#6b7280', fontFamily: 'var(--font-body)' }}>{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Currently featured */}
      <div style={{ background: 'white', borderRadius: 12, border: '1px solid #e5e2db', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', overflow: 'hidden', marginBottom: 24 }}>
        <div style={{ padding: '14px 16px', borderBottom: '1px solid #e5e2db', background: '#fafaf9', display: 'flex', alignItems: 'center', gap: 8 }}>
          <Star size={14} strokeWidth={2} style={{ color: '#d97706' }} />
          <span style={{ fontSize: 13, fontWeight: 600, color: '#111', fontFamily: 'var(--font-body)' }}>
            Currently featured ({featured.length})
          </span>
        </div>

        {!featured.length ? (
          <div style={{ padding: '40px 24px', textAlign: 'center', fontSize: 13, color: '#9ca3af', fontFamily: 'var(--font-body)' }}>
            No featured practices yet.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {featured.map((p: any, i: number) => {
              const ps = planStyle[p.subscription_plan] ?? planStyle.free;
              return (
                <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderBottom: i < featured.length - 1 ? '1px solid #f0ede8' : 'none', background: i % 2 === 0 ? 'white' : '#fafaf9' }}>
                  <Star size={13} strokeWidth={2.5} style={{ color: '#d97706', flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: 13, color: '#111', fontFamily: 'var(--font-body)' }}>{p.name}</div>
                    <div style={{ fontSize: 11, color: '#9ca3af', fontFamily: 'var(--font-body)' }}>{p.city} · {p.slug}</div>
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 6, background: ps.bg, color: ps.color, textTransform: 'capitalize', flexShrink: 0 }}>
                    {p.subscription_plan}
                  </span>
                  <a href={`/practices/${p.slug}`} target="_blank" style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: 11, color: '#6b7280', textDecoration: 'none', flexShrink: 0 }}>
                    View <ExternalLink size={10} strokeWidth={2} />
                  </a>
                  <form action={async () => { 'use server'; await toggleFeatured(p.id, true); }}>
                    <button style={{ padding: '4px 12px', borderRadius: 6, background: 'white', color: '#dc2626', border: '1px solid #fecaca', fontSize: 12, fontWeight: 500, fontFamily: 'var(--font-body)', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                      Remove
                    </button>
                  </form>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add practices */}
      <div style={{ background: 'white', borderRadius: 12, border: '1px solid #e5e2db', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
        <div style={{ padding: '12px 16px', borderBottom: '1px solid #e5e2db', background: '#fafaf9', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: '#111', fontFamily: 'var(--font-body)' }}>
            All practices
          </span>
          <form method="get" style={{ display: 'flex', gap: 6 }}>
            <input
              name="q"
              defaultValue={q}
              placeholder="Search name or city…"
              style={{ padding: '6px 10px', borderRadius: 8, fontSize: 12, border: '1px solid #e5e2db', fontFamily: 'var(--font-body)', color: '#374151', width: 200 }}
            />
            <button type="submit" style={{ padding: '6px 12px', borderRadius: 8, background: '#f3f4f6', color: '#374151', border: 'none', fontSize: 12, fontFamily: 'var(--font-body)', cursor: 'pointer' }}>
              Search
            </button>
            {q && (
              <a href="/admin/featured" style={{ padding: '6px 10px', borderRadius: 8, background: '#f3f4f6', color: '#6b7280', fontSize: 12, fontFamily: 'var(--font-body)', textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
                Clear
              </a>
            )}
          </form>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {!candidates.length && (
            <div style={{ padding: '40px 24px', textAlign: 'center', fontSize: 13, color: '#9ca3af', fontFamily: 'var(--font-body)' }}>
              {q ? 'No practices match your search.' : 'All practices are featured.'}
            </div>
          )}
          {candidates.slice(0, 100).map((p: any, i: number) => {
            const ps = planStyle[p.subscription_plan] ?? planStyle.free;
            return (
              <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 16px', borderBottom: i < Math.min(candidates.length, 100) - 1 ? '1px solid #f0ede8' : 'none', background: i % 2 === 0 ? 'white' : '#fafaf9' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 500, fontSize: 13, color: '#111', fontFamily: 'var(--font-body)' }}>{p.name}</div>
                  <div style={{ fontSize: 11, color: '#9ca3af', fontFamily: 'var(--font-body)' }}>{p.city} · {p.slug}</div>
                </div>
                <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 6, background: ps.bg, color: ps.color, textTransform: 'capitalize', flexShrink: 0 }}>
                  {p.subscription_plan}
                </span>
                {!p.claimed_by_user_id && (
                  <span style={{ fontSize: 11, color: '#9ca3af', fontFamily: 'var(--font-body)', flexShrink: 0 }}>unclaimed</span>
                )}
                <form action={async () => { 'use server'; await toggleFeatured(p.id, false); }}>
                  <button style={{ padding: '4px 12px', borderRadius: 6, background: '#fefce8', color: '#a16207', border: '1px solid #fde68a', fontSize: 12, fontWeight: 500, fontFamily: 'var(--font-body)', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                    ★ Feature
                  </button>
                </form>
              </div>
            );
          })}
          {candidates.length > 100 && (
            <div style={{ padding: '10px 16px', fontSize: 12, color: '#9ca3af', fontFamily: 'var(--font-body)', borderTop: '1px solid #f0ede8', textAlign: 'center' }}>
              Showing first 100 — use search to narrow down.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
