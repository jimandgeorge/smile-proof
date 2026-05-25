import { createAdminSupabase } from '@/lib/supabase';
import { resolveFlag, dismissFlag, resolveAndHide, resolveAndRemove } from './actions';
import { Flag, Inbox } from 'lucide-react';

const reasonStyle: Record<string, { bg: string; color: string; label: string }> = {
  fake:        { bg: '#fef2f2', color: '#dc2626', label: 'Fake review' },
  defamatory:  { bg: '#fff7ed', color: '#c2410c', label: 'Defamatory' },
  spam:        { bg: '#fefce8', color: '#a16207', label: 'Spam' },
  other:       { bg: '#f3f4f6', color: '#4b5563', label: 'Other' },
};

const reviewStatusStyle: Record<string, { color: string; label: string }> = {
  pending:   { color: '#d97706', label: 'Pending' },
  published: { color: '#16a34a', label: 'Published' },
  hidden:    { color: '#9ca3af', label: 'Hidden' },
  removed:   { color: '#dc2626', label: 'Removed' },
};

function fmt(date: string) {
  return new Date(date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default async function AdminReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; reason?: string }>;
}) {
  const { status = 'open', reason = '' } = await searchParams;

  const supabase = createAdminSupabase();

  let query = supabase
    .from('review_flags')
    .select(`
      id, reason, details, status, created_at, flagger_email,
      reviews (
        id, title, body, moderation_status, rating_overall, reviewer_email, reviewer_display_name,
        practices ( name, slug )
      )
    `)
    .order('created_at', { ascending: false })
    .limit(100);

  if (status && status !== 'all') query = query.eq('status', status);
  if (reason) query = query.eq('reason', reason);

  // Stats always over full dataset
  const [{ data: flags }, statsRes] = await Promise.all([
    query,
    supabase.from('review_flags').select('reason, status'),
  ]);

  const all = statsRes.data ?? [];
  const open = all.filter(f => f.status === 'open');
  const stats = [
    { label: 'open',        value: open.length,                                   color: '#dc2626', bg: '#fef2f2' },
    { label: 'fake',        value: open.filter(f => f.reason === 'fake').length,        color: '#dc2626', bg: '#fef2f2' },
    { label: 'defamatory',  value: open.filter(f => f.reason === 'defamatory').length,  color: '#c2410c', bg: '#fff7ed' },
    { label: 'spam',        value: open.filter(f => f.reason === 'spam').length,        color: '#a16207', bg: '#fefce8' },
  ];

  const statusTabs = [
    { key: 'open',      label: 'Open' },
    { key: 'resolved',  label: 'Resolved' },
    { key: 'dismissed', label: 'Dismissed' },
    { key: 'all',       label: 'All' },
  ];

  return (
    <div style={{ padding: '32px', maxWidth: 860 }}>

      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, color: '#111', margin: '0 0 12px', letterSpacing: '-0.02em' }}>
          Reports
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

      {/* Main card */}
      <div style={{ background: 'white', borderRadius: 12, border: '1px solid #e5e2db', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', overflow: 'hidden' }}>

        {/* Tabs + reason filter */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #e5e2db', padding: '0 16px', flexWrap: 'wrap', gap: 8 }}>
          <div style={{ display: 'flex' }}>
            {statusTabs.map(({ key, label }) => {
              const isActive = status === key || (!status && key === 'open');
              return (
                <a
                  key={key}
                  href={`?status=${key}${reason ? `&reason=${reason}` : ''}`}
                  style={{
                    padding: '13px 16px', textDecoration: 'none', whiteSpace: 'nowrap',
                    fontSize: 13, fontWeight: isActive ? 600 : 400,
                    fontFamily: 'var(--font-body)',
                    color: isActive ? '#1a3327' : '#6b7280',
                    borderBottom: `2px solid ${isActive ? '#1a3327' : 'transparent'}`,
                    marginBottom: -1,
                  }}
                >
                  {label}
                </a>
              );
            })}
          </div>

          {/* Reason filter */}
          <form method="get" style={{ display: 'flex', gap: 6, padding: '8px 0' }}>
            <input type="hidden" name="status" value={status} />
            <select name="reason" defaultValue={reason} onChange="this.form.submit()" style={{ padding: '6px 10px', borderRadius: 8, fontSize: 12, border: '1px solid #e5e2db', fontFamily: 'var(--font-body)', color: '#374151', background: 'white' }}>
              <option value="">All reasons</option>
              <option value="fake">Fake</option>
              <option value="defamatory">Defamatory</option>
              <option value="spam">Spam</option>
              <option value="other">Other</option>
            </select>
            <button type="submit" style={{ padding: '6px 12px', borderRadius: 8, background: '#f3f4f6', color: '#374151', border: 'none', fontSize: 12, fontFamily: 'var(--font-body)', cursor: 'pointer' }}>
              Filter
            </button>
          </form>
        </div>

        {/* Flag cards */}
        <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {!flags?.length && (
            <div style={{ padding: '64px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
              <Inbox size={32} strokeWidth={1.2} style={{ color: '#d1d5db' }} />
              <p style={{ fontSize: 13, color: '#9ca3af', fontFamily: 'var(--font-body)', margin: 0 }}>
                No {status !== 'all' ? status : ''} reports.
              </p>
            </div>
          )}

          {flags?.map((flag: any) => {
            const review = flag.reviews as any;
            const practice = review?.practices as any;
            const rs = reasonStyle[flag.reason] ?? reasonStyle.other;
            const ms = reviewStatusStyle[review?.moderation_status] ?? reviewStatusStyle.pending;
            const stars = review?.rating_overall ?? 0;
            const isOpen = flag.status === 'open';

            return (
              <div key={flag.id} style={{
                border: '1px solid #e5e2db', borderRadius: 10,
                borderLeft: `3px solid ${isOpen ? rs.color : '#d1d5db'}`,
                overflow: 'hidden',
              }}>
                {/* Flag header */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, padding: '12px 14px', background: isOpen ? '#fafaf9' : 'white', borderBottom: '1px solid #f0ede8' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <Flag size={13} strokeWidth={2} style={{ color: rs.color, flexShrink: 0 }} />
                    <span style={{ fontSize: 12, fontWeight: 700, padding: '2px 8px', borderRadius: 6, background: rs.bg, color: rs.color }}>
                      {rs.label}
                    </span>
                    {flag.details && (
                      <span style={{ fontSize: 12, color: '#374151', fontFamily: 'var(--font-body)' }}>
                        "{flag.details}"
                      </span>
                    )}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
                    <span style={{ fontSize: 11, color: '#9ca3af', fontFamily: 'var(--font-body)' }}>
                      {flag.flagger_email ?? 'Anonymous'} · {fmt(flag.created_at)}
                    </span>
                    {!isOpen && (
                      <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 6, background: '#f3f4f6', color: '#6b7280', textTransform: 'capitalize' }}>
                        {flag.status}
                      </span>
                    )}
                  </div>
                </div>

                {/* Review content */}
                <div style={{ padding: '12px 14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, flexWrap: 'wrap' }}>
                    <span style={{ color: '#f59e0b', fontSize: 12, letterSpacing: '-0.5px' }}>
                      {'★'.repeat(stars)}{'☆'.repeat(Math.max(0, 5 - stars))}
                    </span>
                    {review?.title && (
                      <span style={{ fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 600, color: '#111' }}>
                        "{review.title}"
                      </span>
                    )}
                    <span style={{ fontSize: 11, fontWeight: 600, color: ms.color }}>
                      {ms.label}
                    </span>
                  </div>
                  <div style={{ fontSize: 12, color: '#6b7280', fontFamily: 'var(--font-body)', marginBottom: 8 }}>
                    <a href={`/practices/${practice?.slug}`} target="_blank" style={{ color: '#1a3327', textDecoration: 'none', fontWeight: 600 }}>
                      {practice?.name}
                    </a>
                    {' · '}{review?.reviewer_display_name ?? review?.reviewer_email}
                  </div>
                  <p style={{ fontSize: 13, color: '#374151', lineHeight: 1.6, margin: '0 0 12px', fontFamily: 'var(--font-body)' }}>
                    {review?.body?.length > 300 ? review.body.slice(0, 300) + '…' : review?.body}
                  </p>

                  {/* Actions */}
                  {isOpen && (
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      <form action={async () => { 'use server'; await dismissFlag(flag.id); }}>
                        <button style={{ padding: '5px 14px', borderRadius: 6, background: '#f3f4f6', color: '#374151', border: 'none', fontSize: 12, fontWeight: 500, fontFamily: 'var(--font-body)', cursor: 'pointer' }}>
                          Dismiss
                        </button>
                      </form>
                      <form action={async () => { 'use server'; await resolveFlag(flag.id); }}>
                        <button style={{ padding: '5px 14px', borderRadius: 6, background: '#1a3327', color: 'white', border: 'none', fontSize: 12, fontWeight: 600, fontFamily: 'var(--font-body)', cursor: 'pointer' }}>
                          Resolve
                        </button>
                      </form>
                      {review?.moderation_status !== 'hidden' && (
                        <form action={async () => { 'use server'; await resolveAndHide(flag.id, review.id); }}>
                          <button style={{ padding: '5px 14px', borderRadius: 6, background: 'white', color: '#d97706', border: '1px solid #fde68a', fontSize: 12, fontWeight: 500, fontFamily: 'var(--font-body)', cursor: 'pointer' }}>
                            Hide review
                          </button>
                        </form>
                      )}
                      {review?.moderation_status !== 'removed' && (
                        <form action={async () => { 'use server'; await resolveAndRemove(flag.id, review.id); }}>
                          <button style={{ padding: '5px 14px', borderRadius: 6, background: 'white', color: '#dc2626', border: '1px solid #fecaca', fontSize: 12, fontWeight: 500, fontFamily: 'var(--font-body)', cursor: 'pointer' }}>
                            Remove review
                          </button>
                        </form>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
