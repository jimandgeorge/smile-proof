import { createAdminSupabase } from '@/lib/supabase';
import { markEnquiryRead } from './actions';
import { Inbox, Mail, MailOpen } from 'lucide-react';

function fmt(date: string) {
  return new Date(date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

function relativeTime(date: string) {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return fmt(date);
}

const sourceStyle: Record<string, { bg: string; color: string }> = {
  homepage:  { bg: '#eff6ff', color: '#1d4ed8' },
  widget:    { bg: '#f0fdf4', color: '#16a34a' },
  search:    { bg: '#faf5ff', color: '#7c3aed' },
};

export default async function AdminLeadsPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const { tab = 'enquiries' } = await searchParams;

  const supabase = createAdminSupabase();

  const [leadsRes, enquiriesRes, statsRes] = await Promise.all([
    supabase
      .from('patient_leads')
      .select('id, name, email, treatment_interest, postcode, source, created_at')
      .order('created_at', { ascending: false })
      .limit(200),
    supabase
      .from('practice_enquiries')
      .select(`
        id, name, email, treatment_interest, message, read_at, created_at,
        practices ( name, slug )
      `)
      .order('created_at', { ascending: false })
      .limit(200),
    // Stats: counts
    Promise.all([
      supabase.from('patient_leads').select('id', { count: 'exact', head: true }),
      supabase.from('practice_enquiries').select('id', { count: 'exact', head: true }).is('read_at', null),
      supabase.from('practice_enquiries').select('id', { count: 'exact', head: true }),
    ]),
  ]);

  const [totalLeadsRes, unreadRes, totalEnquiriesRes] = statsRes;

  const stats = [
    { label: 'total leads',       value: totalLeadsRes.count ?? 0,   color: '#1d4ed8', bg: '#eff6ff' },
    { label: 'enquiries',         value: totalEnquiriesRes.count ?? 0, color: '#374151', bg: '#f3f4f6' },
    { label: 'unread enquiries',  value: unreadRes.count ?? 0,        color: '#dc2626', bg: '#fef2f2' },
  ];

  const leads = leadsRes.data ?? [];
  const enquiries = enquiriesRes.data ?? [];

  const tabs = [
    { key: 'enquiries', label: `Enquiries (${totalEnquiriesRes.count ?? 0})` },
    { key: 'leads',     label: `Homepage leads (${totalLeadsRes.count ?? 0})` },
  ];

  return (
    <div style={{ padding: '32px', maxWidth: 900 }}>

      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, color: '#111', margin: '0 0 6px', letterSpacing: '-0.02em' }}>
          Lead routing
        </h1>
        <p style={{ fontSize: 13, color: '#6b7280', fontFamily: 'var(--font-body)', margin: '0 0 12px' }}>
          Practice enquiries and homepage lead captures.
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

      {/* Card */}
      <div style={{ background: 'white', borderRadius: 12, border: '1px solid #e5e2db', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', overflow: 'hidden' }}>

        {/* Tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid #e5e2db', padding: '0 16px' }}>
          {tabs.map(({ key, label }) => {
            const isActive = tab === key;
            return (
              <a
                key={key}
                href={`?tab=${key}`}
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

        <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>

          {/* ENQUIRIES TAB */}
          {tab === 'enquiries' && (
            <>
              {!enquiries.length && (
                <div style={{ padding: '64px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
                  <Inbox size={32} strokeWidth={1.2} style={{ color: '#d1d5db' }} />
                  <p style={{ fontSize: 13, color: '#9ca3af', fontFamily: 'var(--font-body)', margin: 0 }}>No enquiries yet.</p>
                </div>
              )}
              {enquiries.map((e: any) => {
                const practice = e.practices as any;
                const isUnread = !e.read_at;
                return (
                  <div key={e.id} style={{
                    border: `1px solid ${isUnread ? '#bfdbfe' : '#e5e2db'}`,
                    borderLeft: `3px solid ${isUnread ? '#3b82f6' : '#d1d5db'}`,
                    borderRadius: 10,
                    overflow: 'hidden',
                    background: isUnread ? '#f8fbff' : 'white',
                  }}>
                    {/* Header */}
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, padding: '10px 14px', borderBottom: '1px solid #f0ede8' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        {isUnread
                          ? <Mail size={13} strokeWidth={2} style={{ color: '#3b82f6', flexShrink: 0 }} />
                          : <MailOpen size={13} strokeWidth={1.5} style={{ color: '#9ca3af', flexShrink: 0 }} />
                        }
                        <span style={{ fontSize: 13, fontWeight: 600, color: '#111', fontFamily: 'var(--font-body)' }}>
                          {e.name || 'Anonymous'}
                        </span>
                        <span style={{ fontSize: 12, color: '#6b7280', fontFamily: 'var(--font-body)' }}>
                          {e.email}
                        </span>
                        {e.treatment_interest && (
                          <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 6, background: '#f3f4f6', color: '#374151', fontFamily: 'var(--font-body)' }}>
                            {e.treatment_interest}
                          </span>
                        )}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
                        <span style={{ fontSize: 11, color: '#9ca3af', fontFamily: 'var(--font-body)' }}>
                          {relativeTime(e.created_at)}
                        </span>
                        {isUnread && (
                          <form action={async () => { 'use server'; await markEnquiryRead(e.id); }}>
                            <button style={{ padding: '3px 10px', borderRadius: 6, background: 'white', color: '#374151', border: '1px solid #e5e2db', fontSize: 11, fontFamily: 'var(--font-body)', cursor: 'pointer' }}>
                              Mark read
                            </button>
                          </form>
                        )}
                      </div>
                    </div>
                    {/* Body */}
                    <div style={{ padding: '10px 14px' }}>
                      {practice && (
                        <div style={{ fontSize: 11, color: '#6b7280', fontFamily: 'var(--font-body)', marginBottom: 6 }}>
                          Re: <a href={`/practices/${practice.slug}`} target="_blank" style={{ color: '#1a3327', textDecoration: 'none', fontWeight: 600 }}>{practice.name}</a>
                        </div>
                      )}
                      {e.message && (
                        <p style={{ fontSize: 13, color: '#374151', lineHeight: 1.6, margin: 0, fontFamily: 'var(--font-body)' }}>
                          {e.message.length > 400 ? e.message.slice(0, 400) + '…' : e.message}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </>
          )}

          {/* HOMEPAGE LEADS TAB */}
          {tab === 'leads' && (
            <>
              {!leads.length && (
                <div style={{ padding: '64px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
                  <Inbox size={32} strokeWidth={1.2} style={{ color: '#d1d5db' }} />
                  <p style={{ fontSize: 13, color: '#9ca3af', fontFamily: 'var(--font-body)', margin: 0 }}>No leads yet.</p>
                </div>
              )}

              {leads.length > 0 && (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, fontFamily: 'var(--font-body)' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid #e5e2db', background: '#fafaf9' }}>
                        {['Name', 'Email', 'Treatment', 'Postcode', 'Source', 'Date'].map(h => (
                          <th key={h} style={{ padding: '8px 12px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#9ca3af', letterSpacing: '0.06em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {leads.map((lead: any, i: number) => {
                        const ss = sourceStyle[lead.source] ?? { bg: '#f3f4f6', color: '#6b7280' };
                        return (
                          <tr key={lead.id} style={{ borderBottom: '1px solid #f0ede8', background: i % 2 === 0 ? 'white' : '#fafaf9' }}>
                            <td style={{ padding: '10px 12px', color: '#111', fontWeight: 500 }}>{lead.name ?? '—'}</td>
                            <td style={{ padding: '10px 12px', color: '#374151', wordBreak: 'break-all' }}>{lead.email}</td>
                            <td style={{ padding: '10px 12px', color: '#374151' }}>{lead.treatment_interest ?? '—'}</td>
                            <td style={{ padding: '10px 12px', color: '#6b7280' }}>{lead.postcode ?? '—'}</td>
                            <td style={{ padding: '10px 12px', whiteSpace: 'nowrap' }}>
                              <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 6, background: ss.bg, color: ss.color }}>
                                {lead.source}
                              </span>
                            </td>
                            <td style={{ padding: '10px 12px', color: '#9ca3af', whiteSpace: 'nowrap' }}>{relativeTime(lead.created_at)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
