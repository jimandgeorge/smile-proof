import { createAdminSupabase } from '@/lib/supabase';
import { moderateReview, approvePracticeSubmission, rejectPracticeSubmission, approveClaim, rejectClaim } from './actions';

export default async function QueuePage({
  searchParams,
}: {
  searchParams: Promise<{ section?: string; status?: string }>;
}) {
  const { section = 'reviews', status = 'pending' } = await searchParams;
  const supabase = createAdminSupabase();
  const isPractices = section === 'practices';
  const isClaims = section === 'claims';

  const [reviewsRes, submissionsRes, pendingClaimsRes] = await Promise.all([
    isPractices
      ? Promise.resolve({ data: [] })
      : supabase
          .from('reviews')
          .select(`
            id, title, body, rating_overall, moderation_status, verification_status,
            reviewer_email, reviewer_display_name, created_at,
            practices(name, slug),
            treatments(name)
          `)
          .eq('moderation_status', status)
          .order('created_at', { ascending: false })
          .limit(50),
    isPractices
      ? supabase
          .from('practice_submissions')
          .select('*')
          .eq('status', status === 'published' ? 'approved' : status)
          .order('created_at', { ascending: false })
          .limit(50)
      : Promise.resolve({ data: [] }),
    supabase
      .from('practices')
      .select('id, name, city, slug, claim_pending_email, claim_pending_at')
      .not('claim_pending_user_id', 'is', null)
      .is('claimed_by_user_id', null)
      .order('claim_pending_at', { ascending: true })
      .limit(50),
  ]);

  const reviews = reviewsRes.data ?? [];
  const submissions = submissionsRes.data ?? [];
  const pendingClaims = pendingClaimsRes.data ?? [];
  const reviewTabs  = ['pending', 'published', 'hidden', 'removed'];
  const practiceTabs = ['pending', 'approved', 'rejected'];

  return (
    <main style={{ maxWidth: 800, margin: '0 auto', padding: '32px 24px' }}>

      {/* Header */}
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 700, color: 'var(--ink)', marginBottom: 24, letterSpacing: '-0.02em' }}>
        Moderation queue
      </h1>

      {/* Section tabs */}
      <div style={{ display: 'flex', gap: 4, padding: 4, background: 'white', border: '1.5px solid var(--cream-dark)', borderRadius: 50, width: 'fit-content', marginBottom: 24 }}>
        {[['reviews', 'Reviews'], ['practices', 'Practice submissions'], ['claims', `Claims${pendingClaims.length > 0 ? ` (${pendingClaims.length})` : ''}`]].map(([s, label]) => (
          <a
            key={s}
            href={`?section=${s}`}
            style={{
              padding: '6px 20px', borderRadius: 50, fontSize: 13, fontWeight: 600,
              fontFamily: 'var(--font-body)', textDecoration: 'none',
              background: section === s ? 'var(--forest)' : 'transparent',
              color: section === s ? 'var(--cream)' : 'var(--ink-soft)',
              transition: 'all var(--transition)',
            }}
          >
            {label}
          </a>
        ))}
      </div>

      {/* Status sub-tabs — not shown for claims */}
      {!isClaims && <div style={{ display: 'flex', gap: 0, borderBottom: '1.5px solid var(--cream-dark)', marginBottom: 24 }}>
        {(isPractices ? practiceTabs : reviewTabs).map((tab) => (
          <a
            key={tab}
            href={`?section=${section}&status=${tab}`}
            style={{
              padding: '8px 18px', fontSize: 13, fontWeight: 500, fontFamily: 'var(--font-body)',
              textDecoration: 'none', textTransform: 'capitalize', borderBottom: '2px solid',
              marginBottom: -2,
              borderBottomColor: status === tab ? 'var(--forest)' : 'transparent',
              color: status === tab ? 'var(--forest)' : 'var(--ink-soft)',
            }}
          >
            {tab}
          </a>
        ))}
      </div>}

      {/* ── Reviews ── */}
      {!isPractices && !isClaims && (
        <>
          {reviews.length === 0 && (
            <div style={{ textAlign: 'center', padding: '48px 24px', color: 'var(--ink-faint)', fontSize: 14, fontFamily: 'var(--font-body)' }}>
              No {status} reviews.
            </div>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {reviews.map((r: any) => {
              const practice = r.practices as any;
              const treatment = r.treatments as any;
              const stars = r.rating_overall ?? 0;
              return (
                <div key={r.id} style={{ background: 'white', border: '1.5px solid var(--cream-dark)', borderRadius: 'var(--radius)', padding: '18px 20px', boxShadow: 'var(--shadow-card)' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 10 }}>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
                        <span style={{ color: 'var(--gold)', fontSize: 13, letterSpacing: '-1px' }}>
                          {'★'.repeat(stars)}{'☆'.repeat(Math.max(0, 5 - stars))}
                        </span>
                        {r.verification_status === 'verified' && (
                          <span style={{ fontSize: 11, color: 'var(--forest)', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                            <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                              <circle cx="6" cy="6" r="6" fill="var(--forest)" />
                              <polyline points="3,6 5,8.5 9,3.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            Verified
                          </span>
                        )}
                        {r.title && (
                          <span style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 600, color: 'var(--ink)' }}>
                            "{r.title}"
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--ink-soft)', fontFamily: 'var(--font-body)', marginBottom: 6 }}>
                        <a href={`/practices/${practice?.slug}`} style={{ color: 'var(--forest)', textDecoration: 'none', fontWeight: 600 }}>{practice?.name}</a>
                        {treatment ? ` · ${treatment.name}` : ''}
                        {' · '}
                        {r.reviewer_display_name ?? r.reviewer_email}
                        {' · '}
                        {new Date(r.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </div>
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--ink-faint)', flexShrink: 0, fontFamily: 'var(--font-body)' }}>
                      {r.reviewer_email}
                    </div>
                  </div>

                  <p style={{ fontSize: 13, color: 'var(--ink-mid)', lineHeight: 1.65, marginBottom: 14, fontFamily: 'var(--font-body)' }}>
                    {r.body}
                  </p>

                  <div style={{ display: 'flex', gap: 8 }}>
                    {r.moderation_status !== 'published' && (
                      <form action={async () => { 'use server'; await moderateReview(r.id, 'publish'); }}>
                        <button style={{ padding: '6px 16px', borderRadius: 50, background: 'var(--forest)', color: 'var(--cream)', border: 'none', fontSize: 12, fontWeight: 600, fontFamily: 'var(--font-body)', cursor: 'pointer' }}>
                          Publish
                        </button>
                      </form>
                    )}
                    {r.moderation_status !== 'hidden' && (
                      <form action={async () => { 'use server'; await moderateReview(r.id, 'hide'); }}>
                        <button style={{ padding: '6px 16px', borderRadius: 50, background: 'var(--cream-dark)', color: 'var(--ink-mid)', border: 'none', fontSize: 12, fontWeight: 500, fontFamily: 'var(--font-body)', cursor: 'pointer' }}>
                          Hide
                        </button>
                      </form>
                    )}
                    {r.moderation_status !== 'removed' && (
                      <form action={async () => { 'use server'; await moderateReview(r.id, 'remove'); }}>
                        <button style={{ padding: '6px 16px', borderRadius: 50, background: 'transparent', color: '#c0392b', border: '1px solid #e8b4b0', fontSize: 12, fontWeight: 500, fontFamily: 'var(--font-body)', cursor: 'pointer' }}>
                          Remove
                        </button>
                      </form>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* ── Practice submissions ── */}
      {isPractices && (
        <>
          {submissions.length === 0 && (
            <div style={{ textAlign: 'center', padding: '48px 24px', color: 'var(--ink-faint)', fontSize: 14, fontFamily: 'var(--font-body)' }}>
              No {status} practice submissions.
            </div>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {submissions.map((s: any) => (
              <div key={s.id} style={{ background: 'white', border: '1.5px solid var(--cream-dark)', borderRadius: 'var(--radius)', padding: '18px 20px', boxShadow: 'var(--shadow-card)' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 8 }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
                      <span style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 600, color: 'var(--ink)' }}>{s.name}</span>
                      <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 20, background: 'var(--forest-pale)', color: 'var(--forest)', fontWeight: 600 }}>
                        {s.practice_type}
                      </span>
                    </div>
                    <p style={{ fontSize: 13, color: 'var(--ink-soft)', fontFamily: 'var(--font-body)', marginBottom: 2 }}>
                      {[s.address_line1, s.address_line2, s.city, s.postcode].filter(Boolean).join(', ')}
                    </p>
                    {(s.phone || s.email || s.website) && (
                      <p style={{ fontSize: 12, color: 'var(--ink-faint)', fontFamily: 'var(--font-body)' }}>
                        {[s.phone, s.email, s.website].filter(Boolean).join(' · ')}
                      </p>
                    )}
                    {s.notes && (
                      <p style={{ fontSize: 13, color: 'var(--ink-mid)', fontStyle: 'italic', marginTop: 8, fontFamily: 'var(--font-body)' }}>"{s.notes}"</p>
                    )}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--ink-faint)', flexShrink: 0, fontFamily: 'var(--font-body)', textAlign: 'right' }}>
                    {new Date(s.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                    {s.submitter_email && <><br />{s.submitter_email}</>}
                  </div>
                </div>

                {s.status === 'pending' && (
                  <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                    <form action={async () => { 'use server'; await approvePracticeSubmission(s.id); }}>
                      <button style={{ padding: '6px 16px', borderRadius: 50, background: 'var(--forest)', color: 'var(--cream)', border: 'none', fontSize: 12, fontWeight: 600, fontFamily: 'var(--font-body)', cursor: 'pointer' }}>
                        Approve &amp; publish
                      </button>
                    </form>
                    <form action={async () => { 'use server'; await rejectPracticeSubmission(s.id); }}>
                      <button style={{ padding: '6px 16px', borderRadius: 50, background: 'transparent', color: '#c0392b', border: '1px solid #e8b4b0', fontSize: 12, fontWeight: 500, fontFamily: 'var(--font-body)', cursor: 'pointer' }}>
                        Reject
                      </button>
                    </form>
                  </div>
                )}
                {s.status === 'approved' && s.practice_id && (
                  <a href={`/practices/${s.practice_id}`} style={{ display: 'inline-block', marginTop: 10, fontSize: 12, color: 'var(--forest)', textDecoration: 'none', fontWeight: 500 }}>
                    View practice →
                  </a>
                )}
              </div>
            ))}
          </div>
        </>
      )}
      {/* ── Pending claims ── */}
      {isClaims && (
        <>
          {pendingClaims.length === 0 && (
            <div style={{ textAlign: 'center', padding: '48px 24px', color: 'var(--ink-faint)', fontSize: 14, fontFamily: 'var(--font-body)' }}>
              No pending claim requests.
            </div>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {pendingClaims.map((c: any) => (
              <div key={c.id} style={{ background: 'white', border: '1.5px solid var(--cream-dark)', borderRadius: 'var(--radius)', padding: '18px 20px', boxShadow: 'var(--shadow-card)' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 12 }}>
                  <div>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 600, color: 'var(--ink)', marginBottom: 4 }}>
                      <a href={`/practices/${c.slug}`} style={{ color: 'inherit', textDecoration: 'none' }}>{c.name}</a>
                    </div>
                    <p style={{ fontSize: 13, color: 'var(--ink-soft)', fontFamily: 'var(--font-body)', marginBottom: 2 }}>{c.city}</p>
                    <p style={{ fontSize: 13, color: 'var(--ink-mid)', fontFamily: 'var(--font-body)' }}>
                      Claimed by: <strong>{c.claim_pending_email}</strong>
                    </p>
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--ink-faint)', flexShrink: 0, fontFamily: 'var(--font-body)' }}>
                    {new Date(c.claim_pending_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <form action={async () => { 'use server'; await approveClaim(c.id); }}>
                    <button style={{ padding: '6px 16px', borderRadius: 50, background: 'var(--forest)', color: 'var(--cream)', border: 'none', fontSize: 12, fontWeight: 600, fontFamily: 'var(--font-body)', cursor: 'pointer' }}>
                      Approve claim
                    </button>
                  </form>
                  <form action={async () => { 'use server'; await rejectClaim(c.id); }}>
                    <button style={{ padding: '6px 16px', borderRadius: 50, background: 'transparent', color: '#c0392b', border: '1px solid #e8b4b0', fontSize: 12, fontWeight: 500, fontFamily: 'var(--font-body)', cursor: 'pointer' }}>
                      Reject
                    </button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </main>
  );
}
