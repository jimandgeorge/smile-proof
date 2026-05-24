import { createAdminSupabase } from '@/lib/supabase';
import { toggleFeatured } from './actions';
import { ExternalLink, Star } from 'lucide-react';

const PAGE_SIZE = 50;

const planStyle: Record<string, { bg: string; color: string }> = {
  free:   { bg: '#f3f4f6', color: '#6b7280' },
  growth: { bg: '#eff6ff', color: '#1d4ed8' },
  pro:    { bg: '#faf5ff', color: '#7c3aed' },
};

const typeLabel: Record<string, string> = {
  nhs: 'NHS', private: 'Private', mixed: 'Mixed',
};

const typeStyle: Record<string, { bg: string; color: string }> = {
  nhs:     { bg: '#f0fdf4', color: '#16a34a' },
  private: { bg: '#fff7ed', color: '#c2410c' },
  mixed:   { bg: '#eff6ff', color: '#1d4ed8' },
};

export default async function AdminPracticesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; type?: string; plan?: string; claimed?: string; page?: string }>;
}) {
  const { q = '', type = '', plan = '', claimed = '', page = '1' } = await searchParams;
  const pageNum = Math.max(1, parseInt(page) || 1);
  const from = (pageNum - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const supabase = createAdminSupabase();

  let query = supabase
    .from('practices')
    .select(`
      id, slug, name, city, postcode, practice_type,
      claimed_by_user_id, claimed_at, claim_pending_email,
      subscription_plan, subscription_status, is_featured, created_at
    `, { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to);

  if (q)          query = query.or(`name.ilike.%${q}%,city.ilike.%${q}%,postcode.ilike.%${q}%`);
  if (type)       query = query.eq('practice_type', type);
  if (plan)       query = query.eq('subscription_plan', plan);
  if (claimed === 'yes')     query = query.not('claimed_by_user_id', 'is', null);
  if (claimed === 'no')      query = query.is('claimed_by_user_id', null).is('claim_pending_email', null);
  if (claimed === 'pending') query = query.is('claimed_by_user_id', null).not('claim_pending_email', 'is', null);

  const [
    { data: practices, count },
    { count: totalCount },
    { count: claimedCount },
    { count: paidCount },
    { count: featuredCount },
  ] = await Promise.all([
    query,
    supabase.from('practices').select('id', { count: 'exact', head: true }),
    supabase.from('practices').select('id', { count: 'exact', head: true }).not('claimed_by_user_id', 'is', null),
    supabase.from('practices').select('id', { count: 'exact', head: true }).neq('subscription_plan', 'free'),
    supabase.from('practices').select('id', { count: 'exact', head: true }).eq('is_featured', true),
  ]);

  const total = count ?? 0;
  const totalPages = Math.ceil(total / PAGE_SIZE);

  const stats = [
    { label: 'practices',    value: totalCount ?? 0,    color: '#6b7280', bg: '#f9fafb' },
    { label: 'claimed',      value: claimedCount ?? 0,  color: '#16a34a', bg: '#f0fdf4' },
    { label: 'paid',         value: paidCount ?? 0,     color: '#7c3aed', bg: '#faf5ff' },
    { label: 'featured',     value: featuredCount ?? 0, color: '#d97706', bg: '#fffbeb' },
  ];

  function buildUrl(overrides: Record<string, string>) {
    const p: Record<string, string> = { q, type, plan, claimed, page };
    Object.assign(p, overrides);
    const params = new URLSearchParams();
    Object.entries(p).forEach(([k, v]) => { if (v) params.set(k, v); });
    const s = params.toString();
    return `/admin/practices${s ? `?${s}` : ''}`;
  }

  return (
    <div style={{ padding: '32px', maxWidth: 1100 }}>

      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, color: '#111', margin: '0 0 12px', letterSpacing: '-0.02em' }}>
          Practices
        </h1>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {stats.map(({ label, value, color, bg }) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 12px', borderRadius: 20, background: bg }}>
              <span style={{ fontSize: 12, fontWeight: 700, color, fontFamily: 'var(--font-body)' }}>{value.toLocaleString()}</span>
              <span style={{ fontSize: 12, color: '#6b7280', fontFamily: 'var(--font-body)' }}>{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Search + filters */}
      <form method="get" action="/admin/practices" style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        <input
          name="q"
          defaultValue={q}
          placeholder="Search name, city or postcode…"
          style={{
            flex: '1 1 240px', padding: '8px 12px', borderRadius: 8, fontSize: 13,
            border: '1px solid #e5e2db', fontFamily: 'var(--font-body)', color: '#111',
            outline: 'none', background: 'white',
          }}
        />
        <select name="type" defaultValue={type} style={{ padding: '8px 10px', borderRadius: 8, fontSize: 13, border: '1px solid #e5e2db', fontFamily: 'var(--font-body)', color: '#374151', background: 'white' }}>
          <option value="">All types</option>
          <option value="nhs">NHS</option>
          <option value="private">Private</option>
          <option value="mixed">Mixed</option>
        </select>
        <select name="plan" defaultValue={plan} style={{ padding: '8px 10px', borderRadius: 8, fontSize: 13, border: '1px solid #e5e2db', fontFamily: 'var(--font-body)', color: '#374151', background: 'white' }}>
          <option value="">All plans</option>
          <option value="free">Free</option>
          <option value="growth">Growth</option>
          <option value="pro">Pro</option>
        </select>
        <select name="claimed" defaultValue={claimed} style={{ padding: '8px 10px', borderRadius: 8, fontSize: 13, border: '1px solid #e5e2db', fontFamily: 'var(--font-body)', color: '#374151', background: 'white' }}>
          <option value="">All</option>
          <option value="yes">Claimed</option>
          <option value="pending">Pending claim</option>
          <option value="no">Unclaimed</option>
        </select>
        <button type="submit" style={{ padding: '8px 18px', borderRadius: 8, background: '#1a3327', color: 'white', border: 'none', fontSize: 13, fontWeight: 600, fontFamily: 'var(--font-body)', cursor: 'pointer' }}>
          Search
        </button>
        {(q || type || plan || claimed) && (
          <a href="/admin/practices" style={{ padding: '8px 14px', borderRadius: 8, background: '#f3f4f6', color: '#6b7280', fontSize: 13, fontFamily: 'var(--font-body)', textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
            Clear
          </a>
        )}
      </form>

      {/* Table card */}
      <div style={{ background: 'white', borderRadius: 12, border: '1px solid #e5e2db', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', overflow: 'hidden' }}>

        {/* Table */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, fontFamily: 'var(--font-body)' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #e5e2db', background: '#fafaf9' }}>
                {['Practice', 'Type', 'Claimed', 'Plan', 'Featured', ''].map(h => (
                  <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#9ca3af', letterSpacing: '0.06em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {!practices?.length && (
                <tr>
                  <td colSpan={6} style={{ padding: '48px 16px', textAlign: 'center', color: '#9ca3af' }}>
                    No practices found.
                  </td>
                </tr>
              )}
              {practices?.map((p: any, i: number) => {
                const isClaimed = !!p.claimed_by_user_id;
                const isPending = !isClaimed && !!p.claim_pending_email;
                const ts = typeStyle[p.practice_type] ?? { bg: '#f3f4f6', color: '#374151' };
                const ps = planStyle[p.subscription_plan] ?? planStyle.free;

                return (
                  <tr key={p.id} style={{ borderBottom: '1px solid #f0ede8', background: i % 2 === 0 ? 'white' : '#fafaf9' }}>
                    {/* Practice name */}
                    <td style={{ padding: '12px 16px', minWidth: 200 }}>
                      <div style={{ fontWeight: 600, color: '#111', marginBottom: 2 }}>{p.name}</div>
                      <div style={{ fontSize: 11, color: '#9ca3af' }}>{p.city}{p.postcode ? ` · ${p.postcode}` : ''}</div>
                    </td>

                    {/* Type */}
                    <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                      <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 6, background: ts.bg, color: ts.color }}>
                        {typeLabel[p.practice_type] ?? p.practice_type}
                      </span>
                    </td>

                    {/* Claimed status */}
                    <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                      {isClaimed ? (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12, color: '#16a34a', fontWeight: 500 }}>
                          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#16a34a', flexShrink: 0 }} />
                          Claimed
                        </span>
                      ) : isPending ? (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12, color: '#d97706', fontWeight: 500 }}>
                          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#d97706', flexShrink: 0 }} />
                          Pending
                        </span>
                      ) : (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12, color: '#9ca3af' }}>
                          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#d1d5db', flexShrink: 0 }} />
                          Unclaimed
                        </span>
                      )}
                    </td>

                    {/* Plan */}
                    <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                      <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 6, background: ps.bg, color: ps.color, textTransform: 'capitalize' }}>
                        {p.subscription_plan}
                      </span>
                    </td>

                    {/* Featured toggle */}
                    <td style={{ padding: '12px 16px' }}>
                      <form action={async () => { 'use server'; await toggleFeatured(p.id, p.is_featured); }}>
                        <button
                          type="submit"
                          title={p.is_featured ? 'Remove featured' : 'Mark as featured'}
                          style={{
                            background: 'none', border: 'none', cursor: 'pointer', padding: '2px 4px',
                            color: p.is_featured ? '#d97706' : '#d1d5db',
                            display: 'flex', alignItems: 'center',
                          }}
                        >
                          <Star size={16} strokeWidth={1.75} fill={p.is_featured ? 'currentColor' : 'none'} />
                        </button>
                      </form>
                    </td>

                    {/* Actions */}
                    <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                      <a
                        href={`/practices/${p.slug}`}
                        target="_blank"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#1a3327', textDecoration: 'none', fontWeight: 500 }}
                      >
                        View <ExternalLink size={11} strokeWidth={2} />
                      </a>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderTop: '1px solid #e5e2db', background: '#fafaf9' }}>
            <span style={{ fontSize: 12, color: '#9ca3af', fontFamily: 'var(--font-body)' }}>
              {from + 1}–{Math.min(to + 1, total)} of {total.toLocaleString()}
            </span>
            <div style={{ display: 'flex', gap: 4 }}>
              {pageNum > 1 && (
                <a href={buildUrl({ page: String(pageNum - 1) })} style={{ padding: '5px 12px', borderRadius: 6, background: 'white', border: '1px solid #e5e2db', fontSize: 12, color: '#374151', textDecoration: 'none', fontFamily: 'var(--font-body)' }}>
                  ← Prev
                </a>
              )}
              {pageNum < totalPages && (
                <a href={buildUrl({ page: String(pageNum + 1) })} style={{ padding: '5px 12px', borderRadius: 6, background: 'white', border: '1px solid #e5e2db', fontSize: 12, color: '#374151', textDecoration: 'none', fontFamily: 'var(--font-body)' }}>
                  Next →
                </a>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
