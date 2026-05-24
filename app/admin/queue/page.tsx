import { createAdminSupabase } from '@/lib/supabase';
import { moderateReview, approvePracticeSubmission, rejectPracticeSubmission, approveClaim, rejectClaim } from './actions';
import { CheckCircle, Inbox } from 'lucide-react';

export default async function QueuePage({
  searchParams,
}: {
  searchParams: Promise<{ section?: string; status?: string }>;
}) {
  const { section = 'reviews', status = 'pending' } = await searchParams;
  const supabase = createAdminSupabase();
  const isPractices = section === 'practices';
  const isClaims = section === 'claims';

  const [reviewsRes, submissionsRes, pendingClaimsRes, pendingReviewCount, pendingSubCount] = await Promise.all([
    isPractices
      ? Promise.resolve({ data: [] })
      : supabase
          .from('reviews')
          .select('id, title, body, rating_overall, moderation_status, verification_status, reviewer_email, reviewer_display_name, created_at, practices(name, slug), treatments(name)')
          .eq('moderation_status', status)
          .order('created_at', { ascending: false })
          .limit(50),
    isPractices
      ? supabase.from('practice_submissions').select('*').eq('status', status === 'published' ? 'approved' : status).order('created_at', { ascending: false }).limit(50)
      : Promise.resolve({ data: [] }),
    supabase.from('practices').select('id, name, city, slug, claim_pending_email, claim_pending_at').not('claim_pending_user_id', 'is', null).is('claimed_by_user_id', null).order('claim_pending_at', { ascending: true }).limit(50),
    supabase.from('reviews').select('id', { count: 'exact', head: true }).eq('moderation_status', 'pending'),
    supabase.from('practice_submissions').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
  ]);

  const reviews = reviewsRes.data ?? [];
  const submissions = submissionsRes.data ?? [];
  const pendingClaims = pendingClaimsRes.data ?? [];
  const reviewTabs = ['pending', 'published', 'hidden', 'removed'];
  const practiceTabs = ['pending', 'approved', 'rejected'];

  const sectionTabs = [
    { key: 'reviews',   label: 'Reviews',              count: pendingReviewCount.count ?? 0 },
    { key: 'practices', label: 'Practice submissions',  count: pendingSubCount.count ?? 0 },
    { key: 'claims',    label: 'Claims',                count: pendingClaims.length },
  ];

  const stats = [
    { label: 'pending reviews',     count: pendingReviewCount.count ?? 0, color: '#d97706', bg: '#fffbeb' },
    { label: 'pending claims',      count: pendingClaims.length,           color: '#7c3aed', bg: '#f5f3ff' },
    { label: 'pending submissions', count: pendingSubCount.count ?? 0,    color: '#2563eb', bg: '#eff6ff' },
  ];

  const statusColor: Record<string, string> = {
    pending:   '#d97706',
    published: '#16a34a',
    hidden:    '#9ca3af',
    removed:   '#dc2626',
    approved:  '#16a34a',
    rejected:  '#dc2626',
  };

  function EmptyState({ label }: { label: string }) {
    return (
      <div style={{ padding: '64px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
        <Inbox size={32} strokeWidth={1.2} style={{ color: '#d1d5db' }} />
        <p style={{ fontSize: 13, color: '#9ca3af', fontFamily: 'var(--font-body)', margin: 0 }}>
          {label}
        </p>
      </div>
    );
  }

  return (
    <div style={{ padding: '32px', maxWidth: 960 }}>

      {/* Page header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, color: '#111', margin: '0 0 12px', letterSpacing: '-0.02em' }}>
          Moderation
        </h1>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {stats.map(({ label, count, color, bg }) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 12px', borderRadius: 20, background: bg }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: color, flexShrink: 0 }} />
              <span style={{ fontSize: 12, fontWeight: 700, color, fontFamily: 'var(--font-body)' }}>{count}</span>
              <span style={{ fontSize: 12, color: '#6b7280', fontFamily: 'var(--font-body)' }}>{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Main card */}
      <div style={{ background: 'white', borderRadius: 12, border: '1px solid #e5e2db', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', overflow: 'hidden' }}>

        {/* Section tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid #e5e2db', background: 'white' }}>
          {sectionTabs.map(({ key, label, count }) => {
            const isActive = section === key;
            return (
              <a
                key={key}
                href={`?section=${key}`}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '13px 20px', textDecoration: 'none', whiteSpace: 'nowrap',
                  fontSize: 13, fontWeight: isActive ? 600 : 400,
                  fontFamily: 'var(--font-body)',
                  color: isActive ? '#1a3327' : '#6b7280',
                  borderBottom: `2px solid ${isActive ? '#1a3327' : 'transparent'}`,
                  marginBottom: -1,
                }}
              >
                {label}
                {count > 0 && (
                  <span style={{
                    fontSize: 11, fontWeight: 700, lineHeight: '16px',
                    padding: '0 6px', borderRadius: 8, height: 16,
                    background: isActive ? '#1a3327' : '#f3f4f6',
                    color: isActive ? 'white' : '#374151',
                  }}>
                    {count}
                  </span>
                )}
              </a>
            );
          })}
        </div>

        {/* Status sub-tabs */}
        {!isClaims && (
          <div style={{ display: 'flex', padding: '0 20px', borderBottom: '1px solid #f0ede8', background: '#fafaf9' }}>
            {(isPractices ? practiceTabs : reviewTabs).map(tab => (
              <a
                key={tab}
                href={`?section=${section}&status=${tab}`}
                style={{
                  padding: '8px 12px', textDecoration: 'none', textTransform: 'capitalize',
                  fontSize: 12, fontWeight: status === tab ? 600 : 400,
                  fontFamily: 'var(--font-body)',
                  color: status === tab ? '#1a3327' : '#9ca3af',
                  borderBottom: `2px solid ${status === tab ? '#1a3327' : 'transparent'}`,
                  marginBottom: -1,
                }}
              >
                {tab}
              </a>
            ))}
          </div>
        )}

        {/* Content */}
        <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>

          {/* ── Reviews ── */}
          {!isPractices && !isClaims && (
            reviews.length === 0
              ? <EmptyState label={`No ${status} reviews`} />
              : reviews.map((r: any) => {
                  const practice = r.practices as any;
                  const treatment = r.treatments as any;
                  const stars = r.rating_overall ?? 0;
                  return (
                    <div key={r.id} style={{
                      background: 'white', border: '1px solid #e5e2db', borderRadius: 10,
                      borderLeft: `3px solid ${statusColor[r.moderation_status] ?? '#e5e2db'}`,
                      padding: '14px 16px',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 8 }}>
                        <div style={{ minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 3 }}>
                            <span style={{ color: '#f59e0b', fontSize: 12, letterSpacing: '-0.5px' }}>
                              {'★'.repeat(stars)}{'☆'.repeat(Math.max(0, 5 - stars))}
                            </span>
                            {r.verification_status === 'verified' && (
                              <span style={{ fontSize: 11, color: '#16a34a', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 3, fontFamily: 'var(--font-body)' }}>
                                <CheckCircle size={10} strokeWidth={2} />
                                Verified
                              </span>
                            )}
                            {r.title && (
                              <span style={{ fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 600, color: '#111' }}>
                                "{r.title}"
                              </span>
                            )}
                          </div>
                          <div style={{ fontSize: 12, color: '#6b7280', fontFamily: 'var(--font-body)' }}>
                            <a href={`/practices/${practice?.slug}`} target="_blank" style={{ color: '#1a3327', textDecoration: 'none', fontWeight: 600 }}>{practice?.name}</a>
                            {treatment ? ` · ${treatment.name}` : ''}
                            {' · '}{r.reviewer_display_name ?? r.reviewer_email}
                            {' · '}{new Date(r.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </div>
                        </div>
                        <span style={{ fontSize: 11, color: '#9ca3af', flexShrink: 0, fontFamily: 'var(--font-body)' }}>
                          {r.reviewer_email}
                        </span>
                      </div>

                      <p style={{ fontSize: 13, color: '#374151', lineHeight: 1.6, margin: '0 0 12px', fontFamily: 'var(--font-body)' }}>
                        {r.body}
                      </p>

                      <div style={{ display: 'flex', gap: 6 }}>
                        {r.moderation_status !== 'published' && (
                          <form action={async () => { 'use server'; await moderateReview(r.id, 'publish'); }}>
                            <button style={{ padding: '5px 14px', borderRadius: 6, background: '#1a3327', color: 'white', border: 'none', fontSize: 12, fontWeight: 600, fontFamily: 'var(--font-body)', cursor: 'pointer' }}>
                              Publish
                            </button>
                          </form>
                        )}
                        {r.moderation_status !== 'hidden' && (
                          <form action={async () => { 'use server'; await moderateReview(r.id, 'hide'); }}>
                            <button style={{ padding: '5px 14px', borderRadius: 6, background: '#f3f4f6', color: '#374151', border: 'none', fontSize: 12, fontWeight: 500, fontFamily: 'var(--font-body)', cursor: 'pointer' }}>
                              Hide
                            </button>
                          </form>
                        )}
                        {r.moderation_status !== 'removed' && (
                          <form action={async () => { 'use server'; await moderateReview(r.id, 'remove'); }}>
                            <button style={{ padding: '5px 14px', borderRadius: 6, background: 'white', color: '#dc2626', border: '1px solid #fecaca', fontSize: 12, fontWeight: 500, fontFamily: 'var(--font-body)', cursor: 'pointer' }}>
                              Remove
                            </button>
                          </form>
                        )}
                      </div>
                    </div>
                  );
                })
          )}

          {/* ── Practice submissions ── */}
          {isPractices && (
            submissions.length === 0
              ? <EmptyState label={`No ${status} practice submissions`} />
              : submissions.map((s: any) => (
                  <div key={s.id} style={{
                    background: 'white', border: '1px solid #e5e2db', borderRadius: 10,
                    borderLeft: `3px solid ${statusColor[s.status] ?? '#e5e2db'}`,
                    padding: '14px 16px',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 10 }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 3 }}>
                          <span style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 600, color: '#111' }}>{s.name}</span>
                          <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 6, background: '#f0fdf4', color: '#16a34a', fontWeight: 600, fontFamily: 'var(--font-body)' }}>
                            {s.practice_type}
                          </span>
                        </div>
                        <p style={{ fontSize: 12, color: '#6b7280', fontFamily: 'var(--font-body)', margin: '0 0 2px' }}>
                          {[s.address_line1, s.address_line2, s.city, s.postcode].filter(Boolean).join(', ')}
                        </p>
                        {(s.phone || s.email || s.website) && (
                          <p style={{ fontSize: 12, color: '#9ca3af', fontFamily: 'var(--font-body)', margin: 0 }}>
                            {[s.phone, s.email, s.website].filter(Boolean).join(' · ')}
                          </p>
                        )}
                        {s.notes && (
                          <p style={{ fontSize: 12, color: '#374151', fontStyle: 'italic', margin: '6px 0 0', fontFamily: 'var(--font-body)' }}>"{s.notes}"</p>
                        )}
                      </div>
                      <div style={{ fontSize: 11, color: '#9ca3af', flexShrink: 0, fontFamily: 'var(--font-body)', textAlign: 'right' }}>
                        {new Date(s.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                        {s.submitter_email && <><br />{s.submitter_email}</>}
                      </div>
                    </div>
                    {s.status === 'pending' && (
                      <div style={{ display: 'flex', gap: 6 }}>
                        <form action={async () => { 'use server'; await approvePracticeSubmission(s.id); }}>
                          <button style={{ padding: '5px 14px', borderRadius: 6, background: '#1a3327', color: 'white', border: 'none', fontSize: 12, fontWeight: 600, fontFamily: 'var(--font-body)', cursor: 'pointer' }}>
                            Approve &amp; publish
                          </button>
                        </form>
                        <form action={async () => { 'use server'; await rejectPracticeSubmission(s.id); }}>
                          <button style={{ padding: '5px 14px', borderRadius: 6, background: 'white', color: '#dc2626', border: '1px solid #fecaca', fontSize: 12, fontWeight: 500, fontFamily: 'var(--font-body)', cursor: 'pointer' }}>
                            Reject
                          </button>
                        </form>
                      </div>
                    )}
                    {s.status === 'approved' && s.practice_id && (
                      <a href={`/practices/${s.practice_id}`} target="_blank" style={{ fontSize: 12, color: '#1a3327', textDecoration: 'none', fontWeight: 500 }}>
                        View practice →
                      </a>
                    )}
                  </div>
                ))
          )}

          {/* ── Claims ── */}
          {isClaims && (
            pendingClaims.length === 0
              ? <EmptyState label="No pending claim requests" />
              : pendingClaims.map((c: any) => (
                  <div key={c.id} style={{
                    background: 'white', border: '1px solid #e5e2db', borderRadius: 10,
                    borderLeft: '3px solid #7c3aed',
                    padding: '14px 16px',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 12 }}>
                      <div>
                        <div style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 600, color: '#111', marginBottom: 2 }}>
                          <a href={`/practices/${c.slug}`} target="_blank" style={{ color: 'inherit', textDecoration: 'none' }}>{c.name}</a>
                        </div>
                        <p style={{ fontSize: 12, color: '#6b7280', fontFamily: 'var(--font-body)', margin: '0 0 4px' }}>{c.city}</p>
                        <p style={{ fontSize: 12, color: '#374151', fontFamily: 'var(--font-body)', margin: 0 }}>
                          Claimed by: <strong>{c.claim_pending_email}</strong>
                        </p>
                      </div>
                      <span style={{ fontSize: 11, color: '#9ca3af', flexShrink: 0, fontFamily: 'var(--font-body)' }}>
                        {new Date(c.claim_pending_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                    </div>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <form action={async () => { 'use server'; await approveClaim(c.id); }}>
                        <button style={{ padding: '5px 14px', borderRadius: 6, background: '#1a3327', color: 'white', border: 'none', fontSize: 12, fontWeight: 600, fontFamily: 'var(--font-body)', cursor: 'pointer' }}>
                          Approve
                        </button>
                      </form>
                      <form action={async () => { 'use server'; await rejectClaim(c.id); }}>
                        <button style={{ padding: '5px 14px', borderRadius: 6, background: 'white', color: '#dc2626', border: '1px solid #fecaca', fontSize: 12, fontWeight: 500, fontFamily: 'var(--font-body)', cursor: 'pointer' }}>
                          Reject
                        </button>
                      </form>
                    </div>
                  </div>
                ))
          )}

        </div>
      </div>
    </div>
  );
}
