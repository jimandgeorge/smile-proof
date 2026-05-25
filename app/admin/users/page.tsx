import { createAdminSupabase } from '@/lib/supabase';
import { ExternalLink } from 'lucide-react';

const PAGE_SIZE = 50;

const planStyle: Record<string, { bg: string; color: string }> = {
  free:   { bg: '#f3f4f6', color: '#6b7280' },
  growth: { bg: '#eff6ff', color: '#1d4ed8' },
  pro:    { bg: '#faf5ff', color: '#7c3aed' },
};

function fmt(date: string | null | undefined) {
  if (!date) return '—';
  return new Date(date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

function fmtRelative(date: string | null | undefined) {
  if (!date) return '—';
  const d = new Date(date);
  const diff = Date.now() - d.getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  if (days < 365) return `${Math.floor(days / 30)}mo ago`;
  return `${Math.floor(days / 365)}y ago`;
}

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; plan?: string; status?: string; page?: string }>;
}) {
  const { q = '', plan = '', status = '', page = '1' } = await searchParams;
  const pageNum = Math.max(1, parseInt(page) || 1);

  const supabase = createAdminSupabase();

  const practiceFields = 'id, name, slug, claimed_by_user_id, claim_pending_user_id, claim_pending_email, subscription_plan, subscription_status, claimed_at';

  const [claimedRes, pendingRes, authRes] = await Promise.all([
    supabase.from('practices').select(practiceFields).not('claimed_by_user_id', 'is', null),
    supabase.from('practices').select(practiceFields).not('claim_pending_user_id', 'is', null).is('claimed_by_user_id', null),
    supabase.auth.admin.listUsers({ perPage: 1000 }),
  ]);

  const userMap = Object.fromEntries(
    (authRes.data?.users ?? []).map(u => [u.id, u])
  );

  // Build user → practice map, claimed takes precedence over pending
  const practiceByUser: Record<string, { practice: any; claimStatus: 'claimed' | 'pending' }> = {};
  (pendingRes.data ?? []).forEach(p => {
    if (p.claim_pending_user_id) {
      practiceByUser[p.claim_pending_user_id] = { practice: p, claimStatus: 'pending' };
    }
  });
  (claimedRes.data ?? []).forEach(p => {
    if (p.claimed_by_user_id) {
      practiceByUser[p.claimed_by_user_id] = { practice: p, claimStatus: 'claimed' };
    }
  });

  // Combine and filter
  let rows = Object.entries(practiceByUser)
    .map(([userId, { practice, claimStatus }]) => ({ user: userMap[userId], practice, claimStatus }))
    .filter(r => !!r.user);

  if (q)                    rows = rows.filter(r => r.user.email?.toLowerCase().includes(q.toLowerCase()));
  if (plan)                 rows = rows.filter(r => r.practice.subscription_plan === plan);
  if (status === 'claimed') rows = rows.filter(r => r.claimStatus === 'claimed');
  if (status === 'pending') rows = rows.filter(r => r.claimStatus === 'pending');

  rows.sort((a, b) => new Date(b.user.created_at).getTime() - new Date(a.user.created_at).getTime());

  const total = rows.length;
  const totalPages = Math.ceil(total / PAGE_SIZE);
  const pageRows = rows.slice((pageNum - 1) * PAGE_SIZE, pageNum * PAGE_SIZE);

  // Stats (from unfiltered data)
  const allRows = Object.entries(practiceByUser)
    .map(([userId, { practice, claimStatus }]) => ({ user: userMap[userId], practice, claimStatus }))
    .filter(r => !!r.user);

  const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
  const stats = [
    { label: 'practice owners',    value: allRows.length,                                                                         color: '#6b7280', bg: '#f9fafb' },
    { label: 'paid',               value: allRows.filter(r => r.practice.subscription_plan !== 'free').length,                    color: '#7c3aed', bg: '#faf5ff' },
    { label: 'claimed',            value: allRows.filter(r => r.claimStatus === 'claimed').length,                                color: '#16a34a', bg: '#f0fdf4' },
    { label: 'active this month',  value: allRows.filter(r => r.user.last_sign_in_at && new Date(r.user.last_sign_in_at).getTime() > thirtyDaysAgo).length, color: '#2563eb', bg: '#eff6ff' },
  ];

  function buildUrl(overrides: Record<string, string>) {
    const p: Record<string, string> = { q, plan, status, page };
    Object.assign(p, overrides);
    const params = new URLSearchParams();
    Object.entries(p).forEach(([k, v]) => { if (v) params.set(k, v); });
    const s = params.toString();
    return `/admin/users${s ? `?${s}` : ''}`;
  }

  return (
    <div style={{ padding: '32px', maxWidth: 1000 }}>

      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, color: '#111', margin: '0 0 12px', letterSpacing: '-0.02em' }}>
          Users
        </h1>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {stats.map(({ label, value, color, bg }) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 12px', borderRadius: 20, background: bg }}>
              <span style={{ fontSize: 12, fontWeight: 700, color, fontFamily: 'var(--font-body)' }}>{value}</span>
              <span style={{ fontSize: 12, color: '#6b7280', fontFamily: 'var(--font-body)' }}>{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Search + filters */}
      <form method="get" action="/admin/users" style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        <input
          name="q"
          defaultValue={q}
          placeholder="Search by email…"
          style={{
            flex: '1 1 240px', padding: '8px 12px', borderRadius: 8, fontSize: 13,
            border: '1px solid #e5e2db', fontFamily: 'var(--font-body)', color: '#111',
            outline: 'none', background: 'white',
          }}
        />
        <select name="plan" defaultValue={plan} style={{ padding: '8px 10px', borderRadius: 8, fontSize: 13, border: '1px solid #e5e2db', fontFamily: 'var(--font-body)', color: '#374151', background: 'white' }}>
          <option value="">All plans</option>
          <option value="free">Free</option>
          <option value="growth">Growth</option>
          <option value="pro">Pro</option>
        </select>
        <select name="status" defaultValue={status} style={{ padding: '8px 10px', borderRadius: 8, fontSize: 13, border: '1px solid #e5e2db', fontFamily: 'var(--font-body)', color: '#374151', background: 'white' }}>
          <option value="">All statuses</option>
          <option value="claimed">Claimed</option>
          <option value="pending">Pending approval</option>
        </select>
        <button type="submit" style={{ padding: '8px 18px', borderRadius: 8, background: '#1a3327', color: 'white', border: 'none', fontSize: 13, fontWeight: 600, fontFamily: 'var(--font-body)', cursor: 'pointer' }}>
          Search
        </button>
        {(q || plan || status) && (
          <a href="/admin/users" style={{ padding: '8px 14px', borderRadius: 8, background: '#f3f4f6', color: '#6b7280', fontSize: 13, fontFamily: 'var(--font-body)', textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
            Clear
          </a>
        )}
      </form>

      {/* Table card */}
      <div style={{ background: 'white', borderRadius: 12, border: '1px solid #e5e2db', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, fontFamily: 'var(--font-body)' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #e5e2db', background: '#fafaf9' }}>
                {['User', 'Practice', 'Plan', 'Status', 'Joined', 'Last seen', ''].map(h => (
                  <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#9ca3af', letterSpacing: '0.06em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pageRows.length === 0 && (
                <tr>
                  <td colSpan={7} style={{ padding: '48px 16px', textAlign: 'center', color: '#9ca3af' }}>
                    No users found.
                  </td>
                </tr>
              )}
              {pageRows.map(({ user, practice, claimStatus }, i) => {
                const ps = planStyle[practice.subscription_plan] ?? planStyle.free;
                const isConfirmed = !!user.email_confirmed_at;

                return (
                  <tr key={user.id} style={{ borderBottom: '1px solid #f0ede8', background: i % 2 === 0 ? 'white' : '#fafaf9' }}>

                    {/* User */}
                    <td style={{ padding: '12px 16px', minWidth: 200 }}>
                      <div style={{ fontWeight: 500, color: '#111', marginBottom: 2, wordBreak: 'break-all' }}>
                        {user.email}
                      </div>
                      {!isConfirmed && (
                        <span style={{ fontSize: 10, fontWeight: 600, color: '#d97706', background: '#fffbeb', padding: '1px 6px', borderRadius: 4 }}>
                          Unconfirmed
                        </span>
                      )}
                    </td>

                    {/* Practice */}
                    <td style={{ padding: '12px 16px', minWidth: 160 }}>
                      <div style={{ fontWeight: 500, color: '#111' }}>{practice.name}</div>
                      <div style={{ fontSize: 11, color: '#9ca3af' }}>{practice.slug}</div>
                    </td>

                    {/* Plan */}
                    <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                      <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 6, background: ps.bg, color: ps.color, textTransform: 'capitalize' }}>
                        {practice.subscription_plan}
                      </span>
                    </td>

                    {/* Claim status */}
                    <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                      {claimStatus === 'claimed' ? (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12, color: '#16a34a', fontWeight: 500 }}>
                          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#16a34a', flexShrink: 0 }} />
                          Claimed
                        </span>
                      ) : (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12, color: '#d97706', fontWeight: 500 }}>
                          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#d97706', flexShrink: 0 }} />
                          Pending
                        </span>
                      )}
                    </td>

                    {/* Joined */}
                    <td style={{ padding: '12px 16px', whiteSpace: 'nowrap', color: '#6b7280', fontSize: 12 }}>
                      {fmt(user.created_at)}
                    </td>

                    {/* Last seen */}
                    <td style={{ padding: '12px 16px', whiteSpace: 'nowrap', fontSize: 12 }}>
                      <span style={{ color: user.last_sign_in_at && Date.now() - new Date(user.last_sign_in_at).getTime() < 7 * 86400000 ? '#16a34a' : '#9ca3af' }}>
                        {fmtRelative(user.last_sign_in_at)}
                      </span>
                    </td>

                    {/* Actions */}
                    <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                      <a
                        href={`/practices/${practice.slug}`}
                        target="_blank"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#1a3327', textDecoration: 'none', fontWeight: 500 }}
                      >
                        Practice <ExternalLink size={11} strokeWidth={2} />
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
