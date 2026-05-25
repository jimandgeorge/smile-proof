import { createAdminSupabase } from '@/lib/supabase';

const PLAN_PRICE: Record<string, number> = { growth: 49, pro: 99 };

function getLast6Months() {
  return Array.from({ length: 6 }, (_, i) => {
    const d = new Date();
    d.setDate(1);
    d.setMonth(d.getMonth() - (5 - i));
    return {
      key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`,
      label: d.toLocaleString('en-GB', { month: 'short', year: '2-digit' }),
    };
  });
}

function monthKey(iso: string) {
  return iso.slice(0, 7);
}

function pct(n: number, total: number) {
  if (!total) return 0;
  return Math.round((n / total) * 100);
}

export default async function AdminAnalyticsPage() {
  const supabase = createAdminSupabase();

  const now = new Date();
  const d30 = new Date(now.getTime() - 30 * 86400000).toISOString();
  const d7  = new Date(now.getTime() -  7 * 86400000).toISOString();
  const d180 = new Date(now.getTime() - 180 * 86400000).toISOString();

  const [
    { count: totalPractices },
    { count: claimedCount },
    { data: paidPlans },
    { count: totalReviews },
    { count: publishedCount },
    { count: verifiedCount },
    { count: pendingCount },
    { count: views30 },
    { count: views7 },
    { data: recentReviews },
    { data: recentClaims },
    { data: ratingRows },
    { data: recentViews },
    { data: allCities },
  ] = await Promise.all([
    supabase.from('practices').select('id', { count: 'exact', head: true }),
    supabase.from('practices').select('id', { count: 'exact', head: true }).not('claimed_by_user_id', 'is', null),
    supabase.from('practices').select('subscription_plan, subscription_status').eq('subscription_status', 'active').neq('subscription_plan', 'free'),
    supabase.from('reviews').select('id', { count: 'exact', head: true }),
    supabase.from('reviews').select('id', { count: 'exact', head: true }).eq('moderation_status', 'published'),
    supabase.from('reviews').select('id', { count: 'exact', head: true }).eq('moderation_status', 'published').eq('verification_status', 'verified'),
    supabase.from('reviews').select('id', { count: 'exact', head: true }).eq('moderation_status', 'pending'),
    supabase.from('practice_page_views').select('id', { count: 'exact', head: true }).gte('viewed_at', d30),
    supabase.from('practice_page_views').select('id', { count: 'exact', head: true }).gte('viewed_at', d7),
    supabase.from('reviews').select('created_at').gte('created_at', d180),
    supabase.from('practices').select('claimed_at').not('claimed_by_user_id', 'is', null).gte('claimed_at', d180),
    supabase.from('reviews').select('rating_overall').eq('moderation_status', 'published'),
    supabase.from('practice_page_views').select('practice_id, practices(name, slug)').gte('viewed_at', d30).limit(5000),
    supabase.from('practices').select('city'),
  ]);

  // MRR
  const mrr = (paidPlans ?? []).reduce((s, p) => s + (PLAN_PRICE[p.subscription_plan] ?? 0), 0);

  // Monthly activity
  const months = getLast6Months();
  const reviewsByMonth: Record<string, number> = {};
  const claimsByMonth: Record<string, number> = {};
  months.forEach(m => { reviewsByMonth[m.key] = 0; claimsByMonth[m.key] = 0; });
  (recentReviews ?? []).forEach(r => {
    const k = monthKey(r.created_at);
    if (k in reviewsByMonth) reviewsByMonth[k]++;
  });
  (recentClaims ?? []).forEach(c => {
    if (!c.claimed_at) return;
    const k = monthKey(c.claimed_at);
    if (k in claimsByMonth) claimsByMonth[k]++;
  });
  const maxReviews = Math.max(1, ...months.map(m => reviewsByMonth[m.key]));
  const maxClaims  = Math.max(1, ...months.map(m => claimsByMonth[m.key]));

  // Rating distribution
  const ratingDist: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  (ratingRows ?? []).forEach(r => { if (r.rating_overall) ratingDist[r.rating_overall]++; });
  const maxRating = Math.max(1, ...Object.values(ratingDist));
  const avgRating = ratingRows?.length
    ? ((ratingRows.reduce((s, r) => s + (r.rating_overall ?? 0), 0)) / ratingRows.length).toFixed(1)
    : '—';

  // Top practices by views
  const viewCounts: Record<string, { name: string; slug: string; views: number }> = {};
  (recentViews ?? []).forEach((v: any) => {
    if (!v.practice_id) return;
    if (!viewCounts[v.practice_id]) {
      viewCounts[v.practice_id] = { name: v.practices?.name ?? v.practice_id, slug: v.practices?.slug ?? '', views: 0 };
    }
    viewCounts[v.practice_id].views++;
  });
  const topPractices = Object.values(viewCounts).sort((a, b) => b.views - a.views).slice(0, 10);
  const maxViews = Math.max(1, topPractices[0]?.views ?? 1);

  // Top cities
  const cityCounts: Record<string, number> = {};
  (allCities ?? []).forEach(p => { if (p.city) cityCounts[p.city] = (cityCounts[p.city] ?? 0) + 1; });
  const topCities = Object.entries(cityCounts).sort((a, b) => b[1] - a[1]).slice(0, 8);
  const maxCity = Math.max(1, topCities[0]?.[1] ?? 1);

  const overviewCards = [
    { label: 'Total practices',   value: (totalPractices ?? 0).toLocaleString(), sub: `${claimedCount ?? 0} claimed`, color: '#1a3327' },
    { label: 'Total reviews',     value: (totalReviews ?? 0).toLocaleString(),   sub: `${publishedCount ?? 0} published`, color: '#1d4ed8' },
    { label: 'MRR',               value: `£${mrr}`,                              sub: `${paidPlans?.length ?? 0} paid plans`, color: '#16a34a' },
    { label: 'Pending moderation',value: (pendingCount ?? 0).toLocaleString(),   sub: 'awaiting review', color: pendingCount ? '#d97706' : '#9ca3af' },
    { label: 'Verified reviews',  value: `${pct(verifiedCount ?? 0, publishedCount ?? 0)}%`, sub: `${verifiedCount ?? 0} of ${publishedCount ?? 0}`, color: '#7c3aed' },
    { label: 'Avg rating',        value: avgRating,                              sub: 'published reviews', color: '#d97706' },
    { label: 'Profile views 30d', value: (views30 ?? 0).toLocaleString(),        sub: `${views7 ?? 0} last 7 days`, color: '#0891b2' },
    { label: 'Claim rate',        value: `${pct(claimedCount ?? 0, totalPractices ?? 0)}%`, sub: 'of all practices', color: '#16a34a' },
  ];

  return (
    <div style={{ padding: '32px', maxWidth: 1100 }}>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, color: '#111', margin: '0 0 24px', letterSpacing: '-0.02em' }}>
        Analytics
      </h1>

      {/* Overview grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 28 }}>
        {overviewCards.map(({ label, value, sub, color }) => (
          <div key={label} style={{ background: 'white', border: '1px solid #e5e2db', borderRadius: 10, padding: '16px 18px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#9ca3af', letterSpacing: '0.06em', textTransform: 'uppercase', fontFamily: 'var(--font-body)', marginBottom: 6 }}>
              {label}
            </div>
            <div style={{ fontSize: 26, fontWeight: 800, color, fontFamily: 'var(--font-display)', letterSpacing: '-0.03em', lineHeight: 1, marginBottom: 4 }}>
              {value}
            </div>
            <div style={{ fontSize: 11, color: '#9ca3af', fontFamily: 'var(--font-body)' }}>{sub}</div>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>

        {/* Monthly reviews */}
        <div style={{ background: 'white', border: '1px solid #e5e2db', borderRadius: 10, padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#374151', fontFamily: 'var(--font-body)', marginBottom: 16, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Reviews — last 6 months
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {months.map(m => {
              const count = reviewsByMonth[m.key];
              return (
                <div key={m.key} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 11, color: '#9ca3af', fontFamily: 'var(--font-body)', width: 44, flexShrink: 0 }}>{m.label}</span>
                  <div style={{ flex: 1, background: '#f3f4f6', borderRadius: 3, height: 8, overflow: 'hidden' }}>
                    <div style={{ width: `${pct(count, maxReviews)}%`, height: '100%', background: '#1a3327', borderRadius: 3, minWidth: count > 0 ? 3 : 0 }} />
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 600, color: '#374151', fontFamily: 'var(--font-body)', width: 24, textAlign: 'right' }}>{count}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Monthly claims */}
        <div style={{ background: 'white', border: '1px solid #e5e2db', borderRadius: 10, padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#374151', fontFamily: 'var(--font-body)', marginBottom: 16, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Claims — last 6 months
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {months.map(m => {
              const count = claimsByMonth[m.key];
              return (
                <div key={m.key} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 11, color: '#9ca3af', fontFamily: 'var(--font-body)', width: 44, flexShrink: 0 }}>{m.label}</span>
                  <div style={{ flex: 1, background: '#f3f4f6', borderRadius: 3, height: 8, overflow: 'hidden' }}>
                    <div style={{ width: `${pct(count, maxClaims)}%`, height: '100%', background: '#7c3aed', borderRadius: 3, minWidth: count > 0 ? 3 : 0 }} />
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 600, color: '#374151', fontFamily: 'var(--font-body)', width: 24, textAlign: 'right' }}>{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>

        {/* Rating distribution */}
        <div style={{ background: 'white', border: '1px solid #e5e2db', borderRadius: 10, padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#374151', fontFamily: 'var(--font-body)', marginBottom: 16, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Rating distribution
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[5, 4, 3, 2, 1].map(star => {
              const count = ratingDist[star] ?? 0;
              return (
                <div key={star} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 11, color: '#d97706', fontFamily: 'var(--font-body)', width: 28, flexShrink: 0 }}>{'★'.repeat(star)}</span>
                  <div style={{ flex: 1, background: '#f3f4f6', borderRadius: 3, height: 8, overflow: 'hidden' }}>
                    <div style={{ width: `${pct(count, maxRating)}%`, height: '100%', background: '#d97706', borderRadius: 3, minWidth: count > 0 ? 3 : 0 }} />
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 600, color: '#374151', fontFamily: 'var(--font-body)', width: 28, textAlign: 'right' }}>{count}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top practices by views */}
        <div style={{ background: 'white', border: '1px solid #e5e2db', borderRadius: 10, padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#374151', fontFamily: 'var(--font-body)', marginBottom: 16, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Top practices — 30 days
          </div>
          {topPractices.length === 0 ? (
            <p style={{ fontSize: 12, color: '#9ca3af', fontFamily: 'var(--font-body)', margin: 0 }}>No view data yet.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
              {topPractices.map((p, i) => (
                <div key={p.slug} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 10, fontWeight: 700, color: '#d1d5db', width: 14, flexShrink: 0 }}>{i + 1}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <a href={`/practices/${p.slug}`} target="_blank" style={{ fontSize: 12, fontWeight: 500, color: '#111', textDecoration: 'none', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {p.name}
                    </a>
                    <div style={{ background: '#f3f4f6', borderRadius: 2, height: 4, marginTop: 3 }}>
                      <div style={{ width: `${pct(p.views, maxViews)}%`, height: '100%', background: '#0891b2', borderRadius: 2, minWidth: 3 }} />
                    </div>
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 600, color: '#374151', fontFamily: 'var(--font-body)', flexShrink: 0 }}>{p.views}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top cities */}
        <div style={{ background: 'white', border: '1px solid #e5e2db', borderRadius: 10, padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#374151', fontFamily: 'var(--font-body)', marginBottom: 16, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Practices by city
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {topCities.map(([city, count]) => (
              <div key={city} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 11, color: '#374151', fontFamily: 'var(--font-body)', width: 80, flexShrink: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{city}</span>
                <div style={{ flex: 1, background: '#f3f4f6', borderRadius: 3, height: 8, overflow: 'hidden' }}>
                  <div style={{ width: `${pct(count, maxCity)}%`, height: '100%', background: '#16a34a', borderRadius: 3, minWidth: 3 }} />
                </div>
                <span style={{ fontSize: 11, fontWeight: 600, color: '#374151', fontFamily: 'var(--font-body)', width: 24, textAlign: 'right' }}>{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
