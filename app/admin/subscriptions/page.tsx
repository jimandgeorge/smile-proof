import { createAdminSupabase } from '@/lib/supabase';
import { ExternalLink, TrendingUp } from 'lucide-react';

const PLAN_PRICE: Record<string, number> = { growth: 49, pro: 99 };

const planStyle: Record<string, { bg: string; color: string }> = {
  growth: { bg: '#eff6ff', color: '#1d4ed8' },
  pro:    { bg: '#faf5ff', color: '#7c3aed' },
};

function fmt(date: string | null | undefined) {
  if (!date) return '—';
  return new Date(date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default async function AdminSubscriptionsPage({
  searchParams,
}: {
  searchParams: Promise<{ plan?: string; status?: string; page?: string }>;
}) {
  const { plan = '', status = 'active', page = '1' } = await searchParams;
  const pageNum = Math.max(1, parseInt(page) || 1);
  const PAGE_SIZE = 50;

  const supabase = createAdminSupabase();

  // Fetch all paid/previously-paid practices
  let query = supabase
    .from('practices')
    .select('id, name, slug, claimed_by_user_id, subscription_plan, subscription_status, stripe_customer_id, stripe_subscription_id, claimed_at', { count: 'exact' })
    .neq('subscription_plan', 'free')
    .order('subscription_status', { ascending: false })
    .order('subscription_plan', { ascending: false });

  if (plan)                  query = query.eq('subscription_plan', plan);
  if (status === 'active')   query = query.eq('subscription_status', 'active');
  if (status === 'cancelled') query = query.eq('subscription_status', 'cancelled');

  // Stats queries (always over full dataset, no status filter)
  const [{ data: practices, count }, allPaidRes, authRes] = await Promise.all([
    query,
    supabase.from('practices').select('subscription_plan, subscription_status').neq('subscription_plan', 'free'),
    supabase.auth.admin.listUsers({ perPage: 1000 }),
  ]);

  const userMap = Object.fromEntries(
    (authRes.data?.users ?? []).map(u => [u.id, u])
  );

  const allPaid = allPaidRes.data ?? [];
  const active = allPaid.filter(p => p.subscription_status === 'active');
  const mrr = active.reduce((sum, p) => sum + (PLAN_PRICE[p.subscription_plan] ?? 0), 0);
  const growthCount = active.filter(p => p.subscription_plan === 'growth').length;
  const proCount = active.filter(p => p.subscription_plan === 'pro').length;

  const total = count ?? 0;
  const totalPages = Math.ceil(total / PAGE_SIZE);

  const stats = [
    { label: 'MRR',        value: `£${mrr.toLocaleString()}`,  color: '#16a34a', bg: '#f0fdf4', bold: true },
    { label: 'active',     value: active.length,               color: '#1d4ed8', bg: '#eff6ff' },
    { label: 'Growth',     value: growthCount,                 color: '#1d4ed8', bg: '#eff6ff' },
    { label: 'Pro',        value: proCount,                    color: '#7c3aed', bg: '#faf5ff' },
    { label: 'cancelled',  value: allPaid.filter(p => p.subscription_status === 'cancelled').length, color: '#9ca3af', bg: '#f9fafb' },
  ];

  function buildUrl(overrides: Record<string, string>) {
    const p: Record<string, string> = { plan, status, page };
    Object.assign(p, overrides);
    const params = new URLSearchParams();
    Object.entries(p).forEach(([k, v]) => { if (v) params.set(k, v); });
    const s = params.toString();
    return `/admin/subscriptions${s ? `?${s}` : ''}`;
  }

  return (
    <div style={{ padding: '32px', maxWidth: 1000 }}>

      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, color: '#111', margin: '0 0 12px', letterSpacing: '-0.02em' }}>
          Subscriptions
        </h1>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {stats.map(({ label, value, color, bg }) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 12px', borderRadius: 20, background: bg }}>
              {label === 'MRR' && <TrendingUp size={12} strokeWidth={2} style={{ color }} />}
              <span style={{ fontSize: 12, fontWeight: 700, color, fontFamily: 'var(--font-body)' }}>{value}</span>
              <span style={{ fontSize: 12, color: '#6b7280', fontFamily: 'var(--font-body)' }}>{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Filters */}
      <form method="get" action="/admin/subscriptions" style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        <select name="status" defaultValue={status} style={{ padding: '8px 10px', borderRadius: 8, fontSize: 13, border: '1px solid #e5e2db', fontFamily: 'var(--font-body)', color: '#374151', background: 'white' }}>
          <option value="">All statuses</option>
          <option value="active">Active</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <select name="plan" defaultValue={plan} style={{ padding: '8px 10px', borderRadius: 8, fontSize: 13, border: '1px solid #e5e2db', fontFamily: 'var(--font-body)', color: '#374151', background: 'white' }}>
          <option value="">All plans</option>
          <option value="growth">Growth</option>
          <option value="pro">Pro</option>
        </select>
        <button type="submit" style={{ padding: '8px 18px', borderRadius: 8, background: '#1a3327', color: 'white', border: 'none', fontSize: 13, fontWeight: 600, fontFamily: 'var(--font-body)', cursor: 'pointer' }}>
          Filter
        </button>
        {(plan || status !== 'active') && (
          <a href="/admin/subscriptions" style={{ padding: '8px 14px', borderRadius: 8, background: '#f3f4f6', color: '#6b7280', fontSize: 13, fontFamily: 'var(--font-body)', textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
            Reset
          </a>
        )}
      </form>

      {/* Table card */}
      <div style={{ background: 'white', borderRadius: 12, border: '1px solid #e5e2db', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, fontFamily: 'var(--font-body)' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #e5e2db', background: '#fafaf9' }}>
                {['Practice', 'Plan', 'Status', 'MRR', 'Owner', 'Since', ''].map(h => (
                  <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#9ca3af', letterSpacing: '0.06em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {!practices?.length && (
                <tr>
                  <td colSpan={7} style={{ padding: '48px 16px', textAlign: 'center', color: '#9ca3af' }}>
                    No subscriptions found.
                  </td>
                </tr>
              )}
              {practices?.map((p: any, i: number) => {
                const ps = planStyle[p.subscription_plan] ?? { bg: '#f3f4f6', color: '#6b7280' };
                const owner = p.claimed_by_user_id ? userMap[p.claimed_by_user_id] : null;
                const isActive = p.subscription_status === 'active';
                const monthlyValue = PLAN_PRICE[p.subscription_plan] ?? 0;

                return (
                  <tr key={p.id} style={{ borderBottom: '1px solid #f0ede8', background: i % 2 === 0 ? 'white' : '#fafaf9' }}>

                    {/* Practice */}
                    <td style={{ padding: '12px 16px', minWidth: 180 }}>
                      <div style={{ fontWeight: 600, color: '#111' }}>{p.name}</div>
                      <div style={{ fontSize: 11, color: '#9ca3af' }}>{p.slug}</div>
                    </td>

                    {/* Plan */}
                    <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                      <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 6, background: ps.bg, color: ps.color, textTransform: 'capitalize' }}>
                        {p.subscription_plan}
                      </span>
                    </td>

                    {/* Status */}
                    <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12, color: isActive ? '#16a34a' : '#9ca3af', fontWeight: 500 }}>
                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: isActive ? '#16a34a' : '#d1d5db', flexShrink: 0 }} />
                        {isActive ? 'Active' : 'Cancelled'}
                      </span>
                    </td>

                    {/* MRR contribution */}
                    <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: isActive ? '#111' : '#9ca3af' }}>
                        {isActive ? `£${monthlyValue}/mo` : '—'}
                      </span>
                    </td>

                    {/* Owner */}
                    <td style={{ padding: '12px 16px', minWidth: 160 }}>
                      <span style={{ fontSize: 12, color: '#374151', wordBreak: 'break-all' }}>
                        {owner?.email ?? '—'}
                      </span>
                    </td>

                    {/* Since */}
                    <td style={{ padding: '12px 16px', whiteSpace: 'nowrap', color: '#6b7280', fontSize: 12 }}>
                      {fmt(p.claimed_at)}
                    </td>

                    {/* Actions */}
                    <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                      <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                        <a
                          href={`/practices/${p.slug}`}
                          target="_blank"
                          style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#1a3327', textDecoration: 'none', fontWeight: 500 }}
                        >
                          Practice <ExternalLink size={11} strokeWidth={2} />
                        </a>
                        {p.stripe_customer_id && (
                          <a
                            href={`https://dashboard.stripe.com/customers/${p.stripe_customer_id}`}
                            target="_blank"
                            style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#6b7280', textDecoration: 'none' }}
                          >
                            Stripe <ExternalLink size={11} strokeWidth={2} />
                          </a>
                        )}
                      </div>
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
              {(pageNum - 1) * PAGE_SIZE + 1}–{Math.min(pageNum * PAGE_SIZE, total)} of {total}
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
