'use client';

import { useState, useEffect, useContext, createContext } from 'react';
import Link from 'next/link';
import { ResponseForm } from './ResponseForm';
import RatingChart from './RatingChart';
import InviteTab, { type Invite } from './InviteTab';
import TeamTab, { type TeamDentist } from './TeamTab';
import PracticeIntelligenceTab from './PracticeIntelligenceTab';
import type { OpportunityInsightData } from './actions';
import { markEnquiriesRead, updatePracticeServices, unclaimPractice } from './actions';
import { AccessTokenContext } from './token-context';

const D = {
  bg: '#0d0d12', sidebar: '#09090d', card: '#13131a', card2: '#1a1a24',
  border: 'rgba(255,255,255,0.07)', border2: 'rgba(255,255,255,0.12)',
  text: '#edeef5', mid: 'rgba(237,238,245,0.72)', soft: 'rgba(237,238,245,0.5)',
  faint: 'rgba(237,238,245,0.28)', accent: '#34d399', accentPale: 'rgba(52,211,153,0.1)',
  gold: '#fbbf24',
} as const;

type ServiceDef = { id: string; slug: string; name: string; category: string; sort_order: number };
type Enquiry = { id: string; name: string; email: string; treatment_interest: string | null; message: string | null; created_at: string; read_at: string | null };
type MonthlyPoint = { month: string; count: number; avgScore: number | null };
type Review = {
  id: string; title: string | null; body: string; rating_overall: number | null;
  moderation_status: string; verification_status: string;
  reviewer_display_name: string | null; created_at: string;
  treatments: { name: string } | null; practice_responses: { body: string } | null;
};
type ScoreCard = { label: string; value: number | null };
type Insight = { type: 'warning' | 'info' | 'action'; text: string; actionLabel: string; actionHref: string };

type DimensionRank = { label: string; rank: number; total: number; score: number | null };

type Props = {
  practiceId: string; practiceSlug: string; practiceName: string;
  practiceCity: string; practicePostcode: string; practiceType: string | null;
  userName: string; userInitial: string; userEmail: string; isOAuthUser: boolean;
  logoUrl: string | null;
  isPaid: boolean;
  avgOverall: number | null; reviewCount: number; verifiedCount: number;
  profileViews30d: number; profileViewsPrev30d: number;
  newReviewsThisMonth: number; prevMonthReviews: number;
  responseRate: number; unrespondedCount: number;
  cityRank: number; cityTotal: number;
  dimensionRanks: DimensionRank[];
  monthlyData: MonthlyPoint[]; scoreCards: ScoreCard[];
  publishedReviews: Review[]; pendingReviews: Review[];
  insights: Insight[];
  invites: Invite[];
  allServices: ServiceDef[];
  practiceServiceIds: string[];
  enquiries: Enquiry[];
  teamDentists: TeamDentist[];
  opportunityInsights: OpportunityInsightData | null;
  initialAccessToken: string;
};

type Tab = 'overview' | 'reviews' | 'intelligence' | 'profile' | 'invites' | 'enquiries' | 'team' | 'settings';

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}

function initials(name: string) {
  return name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();
}

// ── Header actions (bell + avatar dropdown) ───────────────────────────────────
function HeaderActions({ userInitial, pendingCount, unrespondedCount, onBellClick, onSettingsClick, userEmail }: {
  userInitial: string; pendingCount: number; unrespondedCount: number;
  onBellClick: () => void; onSettingsClick: () => void; userEmail: string;
}) {
  const [open, setOpen] = useState(false);
  const hasAlert = pendingCount > 0 || unrespondedCount > 0;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
      {/* Bell */}
      <button
        onClick={onBellClick}
        title={hasAlert ? `${pendingCount} pending, ${unrespondedCount} unresponded` : 'Reviews'}
        style={{ position: 'relative', width: 36, height: 36, borderRadius: '50%', background: D.card2, border: `1px solid ${D.border2}`, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
      >
        <svg width="15" height="15" viewBox="0 0 20 20" fill="none">
          <path d="M10 2a6 6 0 0 0-6 6v3l-1.5 2.5h15L16 11V8a6 6 0 0 0-6-6z" stroke="rgba(237,238,245,0.5)" strokeWidth="1.5" strokeLinejoin="round" />
          <path d="M8 16a2 2 0 0 0 4 0" stroke="rgba(237,238,245,0.5)" strokeWidth="1.5" />
        </svg>
        {hasAlert && (
          <span style={{ position: 'absolute', top: 4, right: 4, width: 8, height: 8, borderRadius: '50%', background: '#f59e0b', border: `2px solid ${D.card2}` }} />
        )}
      </button>

      {/* Avatar + dropdown */}
      <div style={{ position: 'relative' }}>
        <button
          onClick={() => setOpen(o => !o)}
          style={{ width: 36, height: 36, borderRadius: '50%', background: D.accent, border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
        >
          <span style={{ fontSize: 14, fontWeight: 700, color: 'white', fontFamily: 'var(--font-display)' }}>{userInitial}</span>
        </button>

        {open && (
          <>
            {/* Backdrop */}
            <div onClick={() => setOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 40 }} />
            {/* Menu */}
            <div style={{ position: 'absolute', top: 44, right: 0, zIndex: 50, background: D.card, border: `1.5px solid ${D.border2}`, borderRadius: 12, boxShadow: '0 8px 32px rgba(0,0,0,0.4)', minWidth: 200, overflow: 'hidden' }}>
              <div style={{ padding: '12px 16px', borderBottom: `1px solid ${D.border}` }}>
                <p style={{ fontSize: 11, fontWeight: 600, color: D.soft, fontFamily: 'var(--font-body)', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 2px' }}>Signed in as</p>
                <p style={{ fontSize: 13, color: D.text, fontFamily: 'var(--font-body)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{userEmail}</p>
              </div>
              <div style={{ padding: '6px 4px' }}>
                {[
                  { label: 'Settings', icon: <svg width="13" height="13" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.5" /><path d="M10 2v1.5M10 16.5V18M18 10h-1.5M3.5 10H2M15.36 4.64l-1.06 1.06M5.7 14.3l-1.06 1.06M15.36 15.36l-1.06-1.06M5.7 5.7L4.64 4.64" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>, action: () => { onSettingsClick(); setOpen(false); } },
                ].map(item => (
                  <button key={item.label} onClick={item.action} style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '9px 12px', borderRadius: 8, border: 'none', background: 'transparent', cursor: 'pointer', fontSize: 13, color: D.mid, fontFamily: 'var(--font-body)', textAlign: 'left' }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.06)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    <span style={{ color: D.soft }}>{item.icon}</span>
                    {item.label}
                  </button>
                ))}
                <div style={{ height: 1, background: D.border, margin: '4px 8px' }} />
                <a href="/auth/logout" style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '9px 12px', borderRadius: 8, fontSize: 13, color: '#dc2626', fontFamily: 'var(--font-body)', textDecoration: 'none' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(220,38,38,0.1)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  <svg width="13" height="13" viewBox="0 0 20 20" fill="none">
                    <path d="M13 3h4v14h-4M9 14l4-4-4-4M13 10H3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  Sign out
                </a>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ── Sidebar nav item ─────────────────────────────────────────────────────────
function NavItem({ icon, label, badge, active, onClick }: {
  icon: React.ReactNode; label: string; badge?: number; active: boolean; onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', gap: 10,
        width: '100%', padding: '9px 16px', borderRadius: 8,
        background: active ? 'rgba(255,255,255,0.09)' : 'transparent',
        border: 'none', cursor: 'pointer', textAlign: 'left',
        color: active ? 'white' : 'rgba(255,255,255,0.5)',
        fontSize: 14, fontWeight: active ? 600 : 400,
        fontFamily: 'var(--font-body)',
        transition: 'background 0.15s, color 0.15s',
      }}
      onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
      onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent'; }}
    >
      <span style={{ width: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{icon}</span>
      <span style={{ flex: 1 }}>{label}</span>
      {badge != null && badge > 0 && (
        <span style={{ background: '#f59e0b', color: 'white', fontSize: 11, fontWeight: 700, borderRadius: 20, padding: '1px 7px', minWidth: 18, textAlign: 'center' }}>
          {badge}
        </span>
      )}
    </button>
  );
}

// ── Insight banner ────────────────────────────────────────────────────────────
function InsightBanner({ insight, onAction }: { insight: Insight; onAction?: () => void }) {
  const cfg = {
    warning: { bg: '#1c1400', border: '#fde68a', iconColor: '#d97706', textColor: '#fde68a', btnBg: '#271c00', btnColor: '#fbbf24' },
    info:    { bg: '#110b1f', border: '#7c3aed', iconColor: '#a78bfa', textColor: '#c4b5fd', btnBg: '#1a1030', btnColor: '#a78bfa' },
    action:  { bg: '#071a0f', border: '#16a34a', iconColor: '#34d399', textColor: '#6ee7b7', btnBg: '#0d2318', btnColor: '#34d399' },
  }[insight.type];

  const icons = {
    warning: (
      <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
        <path d="M8 2L1.5 13.5h13L8 2z" stroke={cfg.iconColor} strokeWidth="1.5" strokeLinejoin="round" />
        <path d="M8 6.5v3M8 11.5v.5" stroke={cfg.iconColor} strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
    info: (
      <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
        <polyline points="2,12 6,4 10,8 13,5" stroke={cfg.iconColor} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    action: (
      <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
        <path d="M14 10a2 2 0 0 1-2 2H4l-2 2V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v6z" stroke={cfg.iconColor} strokeWidth="1.5" strokeLinejoin="round" />
      </svg>
    ),
  };

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12,
      padding: '12px 16px',
      background: cfg.bg, border: `1px solid ${cfg.border}`, borderRadius: 10,
    }}>
      <span style={{ flexShrink: 0 }}>{icons[insight.type]}</span>
      <span style={{ flex: 1, fontSize: 13, color: cfg.textColor, fontFamily: 'var(--font-body)' }}>{insight.text}</span>
      <button
        onClick={onAction}
        style={{
          flexShrink: 0, fontSize: 12, fontWeight: 600, color: cfg.btnColor,
          background: cfg.btnBg, borderRadius: 20, padding: '4px 12px',
          whiteSpace: 'nowrap', fontFamily: 'var(--font-body)',
          border: 'none', cursor: onAction ? 'pointer' : 'default',
        }}
      >
        {insight.actionLabel} →
      </button>
    </div>
  );
}

// ── Metric card ───────────────────────────────────────────────────────────────
function MetricCard({ label, value, sub1, sub2, sub2Red }: {
  label: string; value: React.ReactNode; sub1?: string; sub2?: React.ReactNode; sub2Red?: boolean;
}) {
  return (
    <div style={{ background: D.card, border: `1px solid ${D.border}`, borderRadius: 12, padding: '20px 22px' }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: D.soft, letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 10, fontFamily: 'var(--font-body)' }}>{label}</div>
      <div style={{ fontFamily: 'var(--font-display)', fontSize: 34, fontWeight: 800, color: D.text, letterSpacing: '-0.03em', lineHeight: 1 }}>{value}</div>
      {sub1 && <div style={{ fontSize: 12, color: D.soft, marginTop: 6, fontFamily: 'var(--font-body)' }}>{sub1}</div>}
      {sub2 && <div style={{ fontSize: 12, marginTop: 2, fontFamily: 'var(--font-body)', color: sub2Red ? '#dc2626' : D.soft, fontWeight: sub2Red ? 600 : 400 }}>{sub2}</div>}
    </div>
  );
}

// ── Review card ───────────────────────────────────────────────────────────────
function ReviewCard({ r, practiceId, practiceSlug, practiceName, isPaid, dimmed }: {
  r: Review; practiceId: string; practiceSlug: string; practiceName: string; isPaid: boolean; dimmed?: boolean;
}) {
  const response = r.practice_responses;
  const stars = r.rating_overall ?? 0;
  return (
    <div style={{ background: dimmed ? D.card2 : D.card, border: `1px solid ${D.border}`, borderRadius: 12, padding: '18px 22px', opacity: dimmed ? 0.7 : 1 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 8 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <span style={{ color: D.gold, fontSize: 13, letterSpacing: '-1px' }}>
              {'★'.repeat(stars)}{'☆'.repeat(Math.max(0, 5 - stars))}
            </span>
            {r.verification_status === 'verified' && (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: 11, color: D.accent, fontWeight: 600 }}>
                <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                  <circle cx="6" cy="6" r="6" fill={D.accent} />
                  <polyline points="3,6 5,8.5 9,3.5" stroke={D.card} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Verified
              </span>
            )}
          </div>
          {r.title && <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 700, color: D.text, margin: '0 0 4px' }}>{r.title}</h3>}
          {r.treatments?.name && <span style={{ fontSize: 11, color: D.soft, background: D.card2, padding: '2px 8px', borderRadius: 20 }}>{r.treatments.name}</span>}
        </div>
        <div style={{ fontSize: 12, color: D.faint, flexShrink: 0, fontFamily: 'var(--font-body)' }}>
          {r.reviewer_display_name ?? 'Patient'} · {new Date(r.created_at).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })}
        </div>
      </div>
      <p style={{ fontSize: 13, color: D.mid, lineHeight: 1.65, fontFamily: 'var(--font-body)', margin: 0 }}>{r.body}</p>
      {response?.body && (
        <div style={{ marginTop: 12, paddingTop: 12, borderTop: `1px solid ${D.border}`, background: D.card2, marginLeft: -22, marginRight: -22, marginBottom: -18, padding: '12px 22px 18px' }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: D.accent, marginBottom: 4, fontFamily: 'var(--font-body)' }}>Your response</p>
          <p style={{ fontSize: 13, color: D.mid, lineHeight: 1.65, fontFamily: 'var(--font-body)', margin: 0 }}>{response.body}</p>
        </div>
      )}
      {!dimmed && (
        <ResponseForm reviewId={r.id} practiceId={practiceId} practiceSlug={practiceSlug}
          existing={response?.body} reviewBody={r.body} reviewTitle={r.title ?? null}
          rating={r.rating_overall ?? 0} practiceName={practiceName} isPaid={isPaid} />
      )}
    </div>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────
export default function DashboardShell({
  practiceId, practiceSlug, practiceName, practiceCity, practiceType,
  userName, userInitial, userEmail, isOAuthUser, logoUrl,
  isPaid,
  avgOverall, reviewCount, verifiedCount,
  profileViews30d, profileViewsPrev30d,
  newReviewsThisMonth, prevMonthReviews,
  responseRate, unrespondedCount,
  cityRank, cityTotal,
  monthlyData, scoreCards,
  publishedReviews, pendingReviews,
  insights, invites,
  dimensionRanks,
  allServices, practiceServiceIds,
  enquiries, teamDentists, opportunityInsights,
  initialAccessToken,
}: Props) {
  const [tab, setTab] = useState<Tab>('overview');
  const [accessToken, setAccessToken] = useState(initialAccessToken);

  useEffect(() => {
    // Refresh the token every 50 minutes (tokens expire after 1 hour).
    // Also listen for auth state changes (e.g. sign-out).
    async function refreshToken() {
      const res = await fetch('/api/auth/token');
      if (res.ok) {
        const { access_token } = await res.json();
        if (access_token) setAccessToken(access_token);
      }
    }
    refreshToken();
    const interval = setInterval(refreshToken, 50 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);
  const unreadEnquiries = enquiries.filter(e => !e.read_at).length;

  const viewsDelta = profileViewsPrev30d > 0
    ? Math.round(((profileViews30d - profileViewsPrev30d) / profileViewsPrev30d) * 100)
    : null;
  const reviewDelta = newReviewsThisMonth - prevMonthReviews;

  // ── Sidebar icons ─────────────────────────────────────────────────────────
  const navItems: { id: Tab; label: string; badge?: number; icon: React.ReactNode }[] = [
    {
      id: 'overview', label: 'Practice Health',
      icon: <svg width="15" height="15" viewBox="0 0 20 20" fill="none"><path d="M3 9.5L10 3l7 6.5V17a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" /></svg>,
    },
    {
      id: 'reviews', label: 'Reviews', badge: pendingReviews.length || undefined,
      icon: <svg width="15" height="15" viewBox="0 0 20 20" fill="none"><path d="M17 12a2 2 0 0 1-2 2H5l-3 3V5a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v7z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" /></svg>,
    },
    {
      id: 'intelligence' as Tab, label: 'Intelligence',
      icon: <svg width="15" height="15" viewBox="0 0 20 20" fill="none"><path d="M10 2l1.8 5.5H17l-4.6 3.3 1.7 5.5L10 13l-4.1 3.3 1.7-5.5L3 7.5h5.2z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" /></svg>,
    },
    {
      id: 'invites', label: 'Get Reviews',
      icon: <svg width="15" height="15" viewBox="0 0 20 20" fill="none"><path d="M3 5h14M3 10h10M3 15h7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /><circle cx="16" cy="14" r="3" stroke="currentColor" strokeWidth="1.5" /><path d="M16 13v2M16 16v.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" /></svg>,
    },
    {
      id: 'enquiries' as Tab, label: 'Enquiries', badge: unreadEnquiries || undefined,
      icon: <svg width="15" height="15" viewBox="0 0 20 20" fill="none"><rect x="2" y="4" width="16" height="12" rx="2" stroke="currentColor" strokeWidth="1.5" /><path d="M2 7l8 5 8-5" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" /></svg>,
    },
    {
      id: 'team' as Tab, label: 'Team',
      icon: <svg width="15" height="15" viewBox="0 0 20 20" fill="none"><circle cx="7" cy="7" r="3" stroke="currentColor" strokeWidth="1.5" /><path d="M1 17c0-3 2.7-5 6-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /><circle cx="14" cy="8" r="2.5" stroke="currentColor" strokeWidth="1.5" /><path d="M10.5 17c0-2.5 1.6-4 3.5-4s3.5 1.5 3.5 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>,
    },
    {
      id: 'profile', label: 'Profile',
      icon: <svg width="15" height="15" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="7" r="3.5" stroke="currentColor" strokeWidth="1.5" /><path d="M3 17c0-3.3 3.1-6 7-6s7 2.7 7 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>,
    },
    {
      id: 'settings', label: 'Settings',
      icon: <svg width="15" height="15" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.5" /><path d="M10 2v1.5M10 16.5V18M18 10h-1.5M3.5 10H2M15.36 4.64l-1.06 1.06M5.7 14.3l-1.06 1.06M15.36 15.36l-1.06-1.06M5.7 5.7L4.64 4.64" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>,
    },
  ];

  return (
    <AccessTokenContext.Provider value={accessToken}>
    <div style={{ display: 'flex', minHeight: 'calc(100vh - 72px)', background: D.bg }}>

      {/* ── Sidebar ── */}
      <aside style={{
        width: 216, flexShrink: 0, background: D.sidebar,
        borderRight: `1px solid rgba(255,255,255,0.06)`,
        display: 'flex', flexDirection: 'column',
        position: 'sticky', top: 72, height: 'calc(100vh - 72px)',
        overflowY: 'auto',
      }}>
        {/* Practice selector */}
        <div style={{ padding: '20px 16px 16px', borderBottom: 'rgba(255,255,255,0.06)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden' }}>
              {logoUrl
                ? <img src={logoUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : <span style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 700, color: 'white' }}>{initials(practiceName)}</span>
              }
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: D.text, fontFamily: 'var(--font-body)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {practiceName}
              </div>
              <div style={{ fontSize: 11, color: D.soft, fontFamily: 'var(--font-body)', marginTop: 1 }}>
                {practiceCity}{practiceType ? ` · ${practiceType}` : ''}
              </div>
            </div>
          </div>
        </div>

        {/* Nav items */}
        <nav style={{ padding: '12px 8px', flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
          {navItems.map(item => (
            <NavItem key={item.id} icon={item.icon} label={item.label}
              badge={item.badge} active={tab === item.id} onClick={() => setTab(item.id)} />
          ))}
        </nav>

        {/* Bottom */}
        <div style={{ padding: '12px 16px 20px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <Link
            href={`/practices/${practiceSlug}`}
            style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'rgba(255,255,255,0.55)', textDecoration: 'none', fontFamily: 'var(--font-body)', marginBottom: 16 }}
          >
            <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
              <path d="M2 6h8M6 2l4 4-4 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            View public profile
          </Link>
          {!isPaid && (
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, color: '#f59e0b', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8, fontFamily: 'var(--font-body)' }}>Free plan</div>
              <Link
                href={`/practices/${practiceSlug}/upgrade`}
                style={{ display: 'block', width: '100%', padding: '9px 0', borderRadius: 8, background: '#f59e0b', color: '#1c1c0a', fontSize: 13, fontWeight: 700, fontFamily: 'var(--font-body)', textDecoration: 'none', textAlign: 'center', boxSizing: 'border-box' }}
              >
                Upgrade to Pro
              </Link>
            </div>
          )}
          {isPaid && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#4ade80' }} />
              <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', fontFamily: 'var(--font-body)' }}>Pro plan active</span>
            </div>
          )}
        </div>
      </aside>

      {/* ── Main content ── */}
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>

        {/* Greeting header */}
        <div style={{ padding: '28px 32px 20px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 800, color: D.text, margin: 0, letterSpacing: '-0.02em' }}>
              {getGreeting()}, {userName}
            </h1>
            <p style={{ fontSize: 13, color: D.soft, margin: '4px 0 0', fontFamily: 'var(--font-body)' }}>
              Here's what's happening with {practiceName}
            </p>
          </div>
          <HeaderActions
            userInitial={userInitial}
            pendingCount={pendingReviews.length}
            unrespondedCount={unrespondedCount}
            onBellClick={() => setTab('reviews')}
            onSettingsClick={() => setTab('settings')}
            userEmail={userEmail}
          />
        </div>

        {/* Tab content */}
        <div style={{ flex: 1, padding: '0 32px 40px' }}>
          {tab === 'overview' && (
            <OverviewTab
              isPaid={isPaid} practiceSlug={practiceSlug} practiceCity={practiceCity}
              avgOverall={avgOverall} reviewCount={reviewCount}
              profileViews30d={profileViews30d} viewsDelta={viewsDelta}
              newReviewsThisMonth={newReviewsThisMonth} reviewDelta={reviewDelta}
              responseRate={responseRate} unrespondedCount={unrespondedCount}
              cityRank={cityRank} cityTotal={cityTotal}
              dimensionRanks={dimensionRanks}
              monthlyData={monthlyData} scoreCards={scoreCards}
              insights={insights} pendingCount={pendingReviews.length}
              recentReviews={publishedReviews.slice(0, 5)}
              onGoToReviews={() => setTab('reviews')}
              onGoToInvites={() => setTab('invites')}
            />
          )}
          {tab === 'reviews' && (
            <ReviewsTab
              publishedReviews={publishedReviews} pendingReviews={pendingReviews}
              practiceId={practiceId} practiceSlug={practiceSlug}
              practiceName={practiceName} isPaid={isPaid}
              onGoToInvites={() => setTab('invites')}
            />
          )}
          {tab === 'intelligence' && (
            <PracticeIntelligenceTab
              practiceId={practiceId}
              practiceSlug={practiceSlug}
              reviewCount={reviewCount}
              initialInsights={opportunityInsights}
            />
          )}
          {tab === 'invites' && (
            <InviteTab
              practiceId={practiceId}
              practiceSlug={practiceSlug}
              practiceName={practiceName}
              invites={invites}
            />
          )}
          {tab === 'enquiries' && <EnquiriesTab practiceId={practiceId} enquiries={enquiries} />}
          {tab === 'team' && <TeamTab practiceId={practiceId} practiceSlug={practiceSlug} initialDentists={teamDentists} />}
          {tab === 'profile' && <ProfileTab practiceName={practiceName} practiceCity={practiceCity} practiceSlug={practiceSlug} practiceId={practiceId} allServices={allServices} practiceServiceIds={practiceServiceIds} initialLogoUrl={logoUrl} />}
          {tab === 'settings' && <SettingsTab userEmail={userEmail} isOAuthUser={isOAuthUser} practiceId={practiceId} practiceSlug={practiceSlug} practiceName={practiceName} />}
        </div>
      </div>
    </div>
    </AccessTokenContext.Provider>
  );
}

// ── Enquiries tab ─────────────────────────────────────────────────────────────
function EnquiriesTab({ practiceId, enquiries }: { practiceId: string; enquiries: Enquiry[] }) {
  const [items, setItems] = useState<Enquiry[]>(enquiries);
  const accessToken = useContext(AccessTokenContext);

  // Mark all unread enquiries as read when the tab opens
  useEffect(() => {
    if (enquiries.some((e: Enquiry) => !e.read_at)) {
      markEnquiriesRead(accessToken, practiceId).then(() => {
        setItems(prev => prev.map(e => ({ ...e, read_at: e.read_at ?? new Date().toISOString() })));
      });
    }
  }, []);

  return (
    <div style={{ maxWidth: 680 }}>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 800, color: D.text, margin: '0 0 6px', letterSpacing: '-0.02em' }}>
          Patient Enquiries
        </h2>
        <p style={{ fontSize: 13, color: D.soft, fontFamily: 'var(--font-body)', margin: 0 }}>
          Messages sent by patients via your SmileProof profile.
        </p>
      </div>

      {items.length === 0 ? (
        <div style={{ background: D.card, border: `1.5px solid ${D.border}`, borderRadius: 12, padding: '48px 24px', textAlign: 'center' }}>
          <div style={{ width: 48, height: 48, borderRadius: '50%', background: D.card2, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <rect x="2" y="4" width="16" height="12" rx="2" stroke={D.soft} strokeWidth="1.5" />
              <path d="M2 7l8 5 8-5" stroke={D.soft} strokeWidth="1.5" strokeLinejoin="round" />
            </svg>
          </div>
          <p style={{ fontSize: 14, color: D.soft, fontFamily: 'var(--font-body)', margin: '0 0 6px', fontWeight: 600 }}>No enquiries yet</p>
          <p style={{ fontSize: 13, color: D.faint, fontFamily: 'var(--font-body)', margin: 0 }}>
            When patients send enquiries from your profile page, they'll appear here.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {items.map(e => (
            <div
              key={e.id}
              style={{
                background: D.card,
                border: `1.5px solid ${!e.read_at ? D.border2 : D.border}`,
                borderRadius: 12,
                padding: '18px 22px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: D.accentPale, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <span style={{ fontSize: 14, fontWeight: 700, color: D.accent, fontFamily: 'var(--font-display)' }}>
                      {e.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 14, fontWeight: 700, color: D.text, fontFamily: 'var(--font-body)' }}>{e.name}</span>
                      {!e.read_at && (
                        <span style={{ fontSize: 10, fontWeight: 700, color: D.accent, background: D.accentPale, padding: '1px 7px', borderRadius: 20, fontFamily: 'var(--font-body)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                          New
                        </span>
                      )}
                    </div>
                    <a
                      href={`mailto:${e.email}`}
                      style={{ fontSize: 12, color: D.accent, fontFamily: 'var(--font-body)', textDecoration: 'none' }}
                    >
                      {e.email}
                    </a>
                  </div>
                </div>
                <span style={{ fontSize: 12, color: D.faint, fontFamily: 'var(--font-body)', flexShrink: 0 }}>
                  {new Date(e.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                </span>
              </div>

              {e.treatment_interest && (
                <div style={{ marginBottom: 8 }}>
                  <span style={{ fontSize: 11, fontWeight: 600, color: D.soft, fontFamily: 'var(--font-body)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    Treatment interest:{' '}
                  </span>
                  <span style={{ fontSize: 13, color: D.mid, fontFamily: 'var(--font-body)' }}>
                    {e.treatment_interest}
                  </span>
                </div>
              )}

              {e.message && (
                <p style={{ fontSize: 13, color: D.mid, lineHeight: 1.65, fontFamily: 'var(--font-body)', margin: '0 0 14px' }}>
                  {e.message}
                </p>
              )}

              <a
                href={`mailto:${e.email}?subject=Your enquiry to our dental practice`}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  padding: '8px 16px', borderRadius: 8,
                  background: D.accentPale, color: D.accent,
                  border: `1px solid rgba(52,211,153,0.3)`,
                  fontSize: 13, fontWeight: 600, fontFamily: 'var(--font-body)',
                  textDecoration: 'none',
                }}
              >
                <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
                  <rect x="1.5" y="3.5" width="13" height="9" rx="1.5" stroke="white" strokeWidth="1.3" />
                  <path d="M1.5 5.5l6.5 4 6.5-4" stroke="white" strokeWidth="1.3" strokeLinejoin="round" />
                </svg>
                Reply by email
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Overview tab ──────────────────────────────────────────────────────────────

function derivePerception(scoreCards: ScoreCard[], responseRate: number, reviewCount: number): { label: string; positive: boolean }[] {
  if (reviewCount < 2) return [];
  const map: Record<string, number | null> = {};
  for (const { label, value } of scoreCards) map[label] = value != null ? Number(value) : null;
  const tags: { label: string; positive: boolean }[] = [];
  if ((map['Communication'] ?? 0) >= 4.2)      tags.push({ label: 'Clear communicators', positive: true });
  if ((map['Anxiety Handling'] ?? 0) >= 4.0)   tags.push({ label: 'Good with nervous patients', positive: true });
  if ((map['Staff Friendliness'] ?? 0) >= 4.3) tags.push({ label: 'Welcoming team', positive: true });
  if ((map['Treatment Results'] ?? 0) >= 4.2)  tags.push({ label: 'Quality results', positive: true });
  if (responseRate >= 80 && reviewCount >= 3)   tags.push({ label: 'Actively responds', positive: true });
  if ((map['Value for Money'] ?? 5) <= 3.2 && reviewCount >= 3) tags.push({ label: 'Perceived as expensive', positive: false });
  if (responseRate < 30 && reviewCount >= 5)    tags.push({ label: 'Low review engagement', positive: false });
  return tags.slice(0, 6);
}

const SCORE_ORDER = ['Communication', 'Anxiety Handling', 'Treatment Results', 'Staff Friendliness', 'Pain Management', 'Value for Money'];

function OverviewTab({
  isPaid, practiceSlug, practiceCity,
  avgOverall, reviewCount,
  profileViews30d, viewsDelta,
  newReviewsThisMonth, reviewDelta,
  responseRate, unrespondedCount,
  cityRank, cityTotal, dimensionRanks,
  monthlyData, scoreCards, pendingCount,
  recentReviews, onGoToReviews, onGoToInvites,
}: {
  isPaid: boolean; practiceSlug: string; practiceCity: string;
  avgOverall: number | null; reviewCount: number;
  profileViews30d: number; viewsDelta: number | null;
  newReviewsThisMonth: number; reviewDelta: number;
  responseRate: number; unrespondedCount: number;
  cityRank: number; cityTotal: number;
  dimensionRanks: DimensionRank[];
  monthlyData: MonthlyPoint[]; scoreCards: ScoreCard[];
  insights: Insight[]; pendingCount: number;
  recentReviews: Review[];
  onGoToReviews: () => void;
  onGoToInvites: () => void;
}) {
  const hasActions = unrespondedCount > 0 || pendingCount > 0;
  const responseColor = responseRate >= 80 ? '#4ade80' : responseRate >= 50 ? '#fbbf24' : '#f87171';
  const isLowData = reviewCount < 10;
  const rankingMeaningful = cityTotal >= 3 && cityRank > 0;
  const rankingEarly = cityTotal > 0 && cityTotal < 3 && cityRank > 0;

  const sortedScores = [...scoreCards.filter(s => s.label !== 'Overall')].sort((a, b) => {
    const ai = SCORE_ORDER.indexOf(a.label), bi = SCORE_ORDER.indexOf(b.label);
    return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
  });

  const perceptionTags = derivePerception(scoreCards, responseRate, reviewCount);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 300px', gap: 20, alignItems: 'start' }}>

      {/* ── Left column ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, minWidth: 0 }}>

        {/* Hero rating card */}
        <div style={{ background: 'linear-gradient(135deg, #1a3829 0%, #0e1c14 100%)', borderRadius: 14, padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 20 }}>
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.5)', marginBottom: 6, fontFamily: 'var(--font-body)' }}>
              Overall rating
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 6 }}>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: 48, fontWeight: 800, letterSpacing: '-0.04em', lineHeight: 1, color: 'white' }}>
                {avgOverall ? Number(avgOverall).toFixed(1) : '—'}
              </span>
              <span style={{ fontSize: 16, color: 'rgba(255,255,255,0.35)', fontFamily: 'var(--font-body)', fontWeight: 400 }}>/5</span>
            </div>
            <div style={{ display: 'flex', gap: 2, marginBottom: 6 }}>
              {[1, 2, 3, 4, 5].map(i => {
                const filled = avgOverall != null && i <= Math.round(Number(avgOverall));
                return <svg key={i} width="13" height="13" viewBox="0 0 20 20"><path d="M10 2l1.8 5.5H17l-4.6 3.3 1.7 5.5L10 13l-4.1 3.3 1.7-5.5L3 7.5h5.2z" fill={filled ? '#fbbf24' : 'rgba(255,255,255,0.18)'} /></svg>;
              })}
            </div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', fontFamily: 'var(--font-body)' }}>
              {reviewCount} review{reviewCount !== 1 ? 's' : ''}
              {reviewCount < 10 && <span style={{ color: 'rgba(255,255,255,0.3)', marginLeft: 6 }}>· building trust</span>}
            </div>
          </div>

          {/* Secondary stats */}
          <div style={{ display: 'flex', gap: 24, borderLeft: '1px solid rgba(255,255,255,0.12)', paddingLeft: 24 }}>
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(255,255,255,0.5)', marginBottom: 3, fontFamily: 'var(--font-body)' }}>This month</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 5 }}>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 800, color: 'white', letterSpacing: '-0.03em', lineHeight: 1 }}>{newReviewsThisMonth}</span>
                <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', fontFamily: 'var(--font-body)' }}>review{newReviewsThisMonth !== 1 ? 's' : ''}</span>
              </div>
              {reviewDelta !== 0 && (
                <div style={{ fontSize: 11, fontWeight: 600, fontFamily: 'var(--font-body)', marginTop: 2, color: reviewDelta > 0 ? '#4ade80' : '#f87171' }}>
                  {reviewDelta > 0 ? '↑' : '↓'} {Math.abs(reviewDelta)} vs last month
                </div>
              )}
              {reviewDelta === 0 && newReviewsThisMonth > 0 && (
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', fontFamily: 'var(--font-body)', marginTop: 2 }}>same as last month</div>
              )}
            </div>
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(255,255,255,0.5)', marginBottom: 3, fontFamily: 'var(--font-body)' }}>Response rate</div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1, color: responseColor }}>{responseRate}%</div>
              <div style={{ fontSize: 11, fontFamily: 'var(--font-body)', marginTop: 2 }}>
                {unrespondedCount > 0
                  ? <span style={{ color: '#fbbf24' }}>{unrespondedCount} awaiting reply</span>
                  : <span style={{ color: 'rgba(255,255,255,0.35)' }}>all answered</span>
                }
              </div>
            </div>
            {isPaid && (
              <div>
                <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(255,255,255,0.5)', marginBottom: 3, fontFamily: 'var(--font-body)' }}>Profile views</div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 800, color: 'white', letterSpacing: '-0.03em', lineHeight: 1 }}>{profileViews30d.toLocaleString()}</div>
                {viewsDelta != null && (
                  <div style={{ fontSize: 11, fontWeight: 600, fontFamily: 'var(--font-body)', marginTop: 2, color: viewsDelta >= 0 ? '#4ade80' : '#f87171' }}>
                    {viewsDelta >= 0 ? '↑' : '↓'} {Math.abs(viewsDelta)}% vs last month
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Chart or recent activity */}
        {isLowData ? (
          <div style={{ background: D.card, border: `1px solid ${D.border}`, borderRadius: 12, padding: '20px 24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: D.text, fontFamily: 'var(--font-body)' }}>Recent reviews</div>
              <span style={{ fontSize: 11, color: D.faint, fontFamily: 'var(--font-body)' }}>Trend chart unlocks at 10 reviews</span>
            </div>
            {recentReviews.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '24px 0' }}>
                <p style={{ fontSize: 13, color: D.faint, fontFamily: 'var(--font-body)', marginBottom: 16 }}>No published reviews yet — invite your first patients.</p>
                <button onClick={onGoToInvites} style={{ padding: '9px 20px', borderRadius: 8, background: D.accent, color: '#0d0d12', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600, fontFamily: 'var(--font-body)' }}>
                  Request a review →
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
                {recentReviews.slice(0, 3).map(r => (
                  <div key={r.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '11px 13px', background: D.card2, borderRadius: 9 }}>
                    <span style={{ fontSize: 12, color: D.gold, letterSpacing: '-1px', flexShrink: 0, paddingTop: 1 }}>
                      {'★'.repeat(r.rating_overall ?? 0)}{'☆'.repeat(5 - (r.rating_overall ?? 0))}
                    </span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 13, color: D.mid, fontFamily: 'var(--font-body)', margin: '0 0 2px', lineHeight: 1.5, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {r.body}
                      </p>
                      <span style={{ fontSize: 11, color: D.faint, fontFamily: 'var(--font-body)' }}>
                        {r.reviewer_display_name ?? 'Patient'} · {new Date(r.created_at).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })}
                      </span>
                    </div>
                  </div>
                ))}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 13px', background: D.accentPale, borderRadius: 9, marginTop: 2 }}>
                  <span style={{ fontSize: 12, color: D.accent, fontFamily: 'var(--font-body)', flex: 1 }}>
                    {10 - reviewCount} more review{10 - reviewCount !== 1 ? 's' : ''} to unlock your rating trend chart.
                  </span>
                  <button onClick={onGoToInvites} style={{ flexShrink: 0, fontSize: 12, fontWeight: 600, color: D.accent, background: 'rgba(52,211,153,0.12)', border: `1px solid rgba(52,211,153,0.25)`, borderRadius: 6, padding: '4px 10px', cursor: 'pointer', fontFamily: 'var(--font-body)', whiteSpace: 'nowrap' }}>
                    Invite patients →
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div style={{ background: D.card, border: `1px solid ${D.border}`, borderRadius: 12, padding: '20px 24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: D.text, fontFamily: 'var(--font-body)' }}>Rating trend</div>
              <div style={{ display: 'flex', gap: 14 }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: D.soft, fontFamily: 'var(--font-body)' }}>
                  <span style={{ width: 14, height: 2, background: D.accent, borderRadius: 1, display: 'inline-block' }} /> Score
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: D.soft, fontFamily: 'var(--font-body)' }}>
                  <span style={{ width: 10, height: 8, background: 'rgba(255,255,255,0.1)', borderRadius: 1, display: 'inline-block' }} /> Volume
                </span>
              </div>
            </div>
            <RatingChart data={monthlyData} />
          </div>
        )}

        {/* Patient perception */}
        {perceptionTags.length > 0 && (
          <div style={{ background: D.card, border: `1px solid ${D.border}`, borderRadius: 12, padding: '16px 20px' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 12 }}>
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: D.soft, fontFamily: 'var(--font-body)' }}>
                Patient perception
              </div>
              <span style={{ fontSize: 11, color: D.faint, fontFamily: 'var(--font-body)' }}>From {reviewCount} review{reviewCount !== 1 ? 's' : ''}</span>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
              {perceptionTags.map(tag => (
                <span key={tag.label} style={{
                  fontSize: 12, fontWeight: 500, padding: '5px 11px', borderRadius: 20,
                  fontFamily: 'var(--font-body)', display: 'inline-flex', alignItems: 'center', gap: 5,
                  background: tag.positive ? D.accentPale : 'rgba(251,191,36,0.08)',
                  color: tag.positive ? D.accent : D.gold,
                  border: `1px solid ${tag.positive ? 'rgba(52,211,153,0.2)' : 'rgba(251,191,36,0.2)'}`,
                }}>
                  <span style={{ fontSize: 10 }}>{tag.positive ? '✓' : '△'}</span>
                  {tag.label}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Right column ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

        {/* Actions */}
        {hasActions ? (
          <div style={{ background: D.card, border: `1px solid ${D.border}`, borderRadius: 12, padding: '18px 20px' }}>
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: D.soft, marginBottom: 12, fontFamily: 'var(--font-body)' }}>
              Action needed
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {unrespondedCount > 0 && (
                <button
                  onClick={onGoToReviews}
                  style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 12px', borderRadius: 9, border: '1.5px solid rgba(251,191,36,0.4)', background: '#1c1000', cursor: 'pointer', textAlign: 'left', width: '100%' }}
                >
                  <div style={{ width: 30, height: 30, borderRadius: 8, background: 'rgba(251,191,36,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <svg width="13" height="13" viewBox="0 0 16 16" fill="none"><path d="M14 10a2 2 0 0 1-2 2H4l-2 2V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v6z" stroke="#fbbf24" strokeWidth="1.5" strokeLinejoin="round" /></svg>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#fde68a', fontFamily: 'var(--font-body)' }}>
                      {unrespondedCount} review{unrespondedCount !== 1 ? 's' : ''} need{unrespondedCount === 1 ? 's' : ''} a reply
                    </div>
                    <div style={{ fontSize: 11, color: '#b45309', fontFamily: 'var(--font-body)', marginTop: 1 }}>Replying builds patient trust</div>
                  </div>
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M4 2l4 4-4 4" stroke="#fbbf24" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </button>
              )}
              {pendingCount > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 12px', borderRadius: 9, border: `1.5px solid ${D.border}`, background: D.card2 }}>
                  <div style={{ width: 30, height: 30, borderRadius: 8, background: D.card, border: `1px solid ${D.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <svg width="13" height="13" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="7" stroke={D.soft} strokeWidth="1.5" /><path d="M8 5v3M8 10v.5" stroke={D.soft} strokeWidth="1.5" strokeLinecap="round" /></svg>
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: D.mid, fontFamily: 'var(--font-body)' }}>{pendingCount} in moderation</div>
                    <div style={{ fontSize: 11, color: D.faint, fontFamily: 'var(--font-body)', marginTop: 1 }}>Not yet visible</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div style={{ background: D.accentPale, border: `1px solid rgba(52,211,153,0.2)`, borderRadius: 12, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <circle cx="8" cy="8" r="7" fill={D.accent} />
              <path d="M5 8l2.5 2.5L12 5.5" stroke={D.card} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span style={{ fontSize: 13, fontWeight: 600, color: D.accent, fontFamily: 'var(--font-body)' }}>All caught up</span>
          </div>
        )}

        {/* Patient scores — priority order */}
        <div style={{ background: D.card, border: `1px solid ${D.border}`, borderRadius: 12, padding: '18px 20px' }}>
          <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: D.soft, marginBottom: 14, fontFamily: 'var(--font-body)' }}>
            Patient scores
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
            {sortedScores.map(({ label, value }) => {
              const v = value != null ? Number(value) : null;
              const color = v == null ? D.faint : v >= 4.3 ? '#16a34a' : v >= 3.5 ? '#ca8a04' : '#ea580c';
              return (
                <div key={label}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                    <span style={{ fontSize: 12, color: D.soft, fontFamily: 'var(--font-body)' }}>{label}</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color, fontFamily: 'var(--font-body)' }}>
                      {v != null ? v.toFixed(1) : '—'}
                    </span>
                  </div>
                  <div style={{ height: 5, borderRadius: 3, background: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: v != null ? `${(v / 5) * 100}%` : '0%', background: color, borderRadius: 3, transition: 'width 0.6s ease' }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Local standing — sparse-data safe */}
        {isPaid && (rankingMeaningful || rankingEarly) && (
          <div style={{ background: D.card, border: `1px solid ${D.border}`, borderRadius: 12, padding: '18px 20px' }}>
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: D.soft, marginBottom: 14, fontFamily: 'var(--font-body)' }}>
              {practiceCity} standing
            </div>
            {rankingMeaningful ? (
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: dimensionRanks.length > 0 ? 16 : 0, paddingBottom: dimensionRanks.length > 0 ? 14 : 0, borderBottom: dimensionRanks.length > 0 ? `1px solid ${D.border}` : 'none' }}>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: 44, fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1, color: cityRank <= 3 ? D.accent : D.text }}>#{cityRank}</span>
                <span style={{ fontSize: 13, color: D.soft, fontFamily: 'var(--font-body)' }}>of {cityTotal} practices</span>
              </div>
            ) : (
              <div style={{ marginBottom: dimensionRanks.length > 0 ? 14 : 0, paddingBottom: dimensionRanks.length > 0 ? 12 : 0, borderBottom: dimensionRanks.length > 0 ? `1px solid ${D.border}` : 'none' }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: D.mid, fontFamily: 'var(--font-body)', marginBottom: 3 }}>Newly tracked</div>
                <div style={{ fontSize: 12, color: D.faint, fontFamily: 'var(--font-body)', lineHeight: 1.5 }}>
                  Local ranking becomes available as more practices join SmileProof.
                </div>
              </div>
            )}
            {dimensionRanks.length > 0 && rankingMeaningful && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {dimensionRanks.map(({ label, rank, total, score }) => {
                  const isTop = rank <= 3 && total >= 3;
                  const pct = score != null ? (score / 5) * 100 : 0;
                  return (
                    <div key={label}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 5 }}>
                        <span style={{ fontSize: 12, color: D.soft, fontFamily: 'var(--font-body)' }}>{label}</span>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: 3 }}>
                          <span style={{ fontSize: 13, fontWeight: 700, color: isTop ? D.accent : D.text, fontFamily: 'var(--font-body)' }}>#{rank}</span>
                          <span style={{ fontSize: 11, color: D.faint, fontFamily: 'var(--font-body)' }}>/{total}</span>
                        </div>
                      </div>
                      <div style={{ height: 5, borderRadius: 3, background: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${pct}%`, background: isTop ? D.accent : D.faint, borderRadius: 3, transition: 'width 0.6s ease' }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Premium upsell widgets — free plan */}
        {!isPaid && (
          <>
            <div style={{ background: D.card, border: `1px solid ${D.border}`, borderRadius: 12, padding: '18px 20px', position: 'relative', overflow: 'hidden' }}>
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: D.soft, marginBottom: 8, fontFamily: 'var(--font-body)' }}>Profile views</div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 36, fontWeight: 800, color: D.text, letterSpacing: '-0.03em', lineHeight: 1, filter: 'blur(7px)', userSelect: 'none', marginBottom: 4 }}>1,240</div>
              <div style={{ fontSize: 11, color: D.faint, fontFamily: 'var(--font-body)', filter: 'blur(4px)', userSelect: 'none' }}>↑ 24% vs last month</div>
              <Link href={`/practices/${practiceSlug}/upgrade`} style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'rgba(13,13,18,0.82)', textDecoration: 'none', gap: 5 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><rect x="3" y="11" width="18" height="11" rx="2" stroke={D.accent} strokeWidth="1.8" fill="none" /><path d="M7 11V7a5 5 0 0 1 10 0v4" stroke={D.accent} strokeWidth="1.8" strokeLinecap="round" /></svg>
                <span style={{ fontSize: 12, fontWeight: 700, color: D.accent, fontFamily: 'var(--font-body)' }}>Unlock with Pro</span>
              </Link>
            </div>

            <div style={{ background: D.card, border: `1px solid ${D.border}`, borderRadius: 12, padding: '18px 20px', position: 'relative', overflow: 'hidden' }}>
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: D.soft, marginBottom: 10, fontFamily: 'var(--font-body)' }}>Local comparison</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, opacity: 0.18, userSelect: 'none' }}>
                {(['Your practice', 'Top local avg.', 'Area average'] as const).map((l, i) => (
                  <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 11, color: D.soft, fontFamily: 'var(--font-body)', width: 86, flexShrink: 0 }}>{l}</span>
                    <div style={{ flex: 1, height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${[80, 91, 72][i]}%`, background: [D.accent, '#60a5fa', D.faint][i], borderRadius: 2 }} />
                    </div>
                    <span style={{ fontSize: 11, fontWeight: 700, color: D.soft, fontFamily: 'var(--font-body)', flexShrink: 0 }}>{['4.1', '4.6', '3.7'][i]}</span>
                  </div>
                ))}
              </div>
              <Link href={`/practices/${practiceSlug}/upgrade`} style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'rgba(13,13,18,0.82)', textDecoration: 'none', gap: 4 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><rect x="3" y="11" width="18" height="11" rx="2" stroke={D.accent} strokeWidth="1.8" fill="none" /><path d="M7 11V7a5 5 0 0 1 10 0v4" stroke={D.accent} strokeWidth="1.8" strokeLinecap="round" /></svg>
                <span style={{ fontSize: 12, fontWeight: 700, color: D.accent, fontFamily: 'var(--font-body)' }}>Competitor benchmarking</span>
                <span style={{ fontSize: 11, color: D.soft, fontFamily: 'var(--font-body)' }}>See how you rank locally</span>
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ── Reviews tab ───────────────────────────────────────────────────────────────
function ReviewsTab({ publishedReviews, pendingReviews, practiceId, practiceSlug, practiceName, isPaid, onGoToInvites }: {
  publishedReviews: Review[]; pendingReviews: Review[];
  practiceId: string; practiceSlug: string; practiceName: string; isPaid: boolean;
  onGoToInvites: () => void;
}) {
  return (
    <div>
      {pendingReviews.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 700, color: D.text, marginBottom: 12 }}>Awaiting moderation ({pendingReviews.length})</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {pendingReviews.map(r => <ReviewCard key={r.id} r={r} practiceId={practiceId} practiceSlug={practiceSlug} practiceName={practiceName} isPaid={isPaid} dimmed />)}
          </div>
        </div>
      )}
      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 700, color: D.text, marginBottom: 12 }}>Published reviews ({publishedReviews.length})</h2>
      {publishedReviews.length === 0 ? (
        <div style={{ background: D.card, border: `1px solid ${D.border}`, borderRadius: 12, padding: '40px 24px', textAlign: 'center' }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: D.accentPale, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke={D.accent} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <p style={{ fontSize: 15, fontWeight: 700, color: D.text, fontFamily: 'var(--font-display)', marginBottom: 6 }}>No reviews yet</p>
          <p style={{ fontSize: 13, color: D.soft, fontFamily: 'var(--font-body)', marginBottom: 20, lineHeight: 1.6, maxWidth: 320, margin: '0 auto 20px' }}>
            Send a review invite to your first patients — it only takes a moment and goes straight to their inbox.
          </p>
          <button
            onClick={onGoToInvites}
            style={{ padding: '10px 22px', borderRadius: 8, background: D.accent, color: '#0d0d12', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600, fontFamily: 'var(--font-body)' }}
          >
            Request a review →
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {publishedReviews.map(r => <ReviewCard key={r.id} r={r} practiceId={practiceId} practiceSlug={practiceSlug} practiceName={practiceName} isPaid={isPaid} />)}
        </div>
      )}
    </div>
  );
}

const CATEGORY_LABELS: Record<string, string> = {
  availability:  'Availability',
  funding:       'NHS / Funding',
  orthodontics:  'Orthodontics',
  cosmetic:      'Cosmetic',
  restorative:   'Restorative',
  accessibility: 'Accessibility',
};

// ── Profile tab ───────────────────────────────────────────────────────────────
function ProfileTab({ practiceName, practiceCity, practiceSlug, practiceId, allServices, practiceServiceIds, initialLogoUrl }: {
  practiceName: string; practiceCity: string; practiceSlug: string; practiceId: string;
  allServices: ServiceDef[]; practiceServiceIds: string[];
  initialLogoUrl: string | null;
}) {
  const [copied, setCopied] = useState(false);
  const [selectedServices, setSelectedServices] = useState<Set<string>>(new Set(practiceServiceIds));
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState<string | null>(null);
  const [logoUrl, setLogoUrl] = useState<string | null>(initialLogoUrl);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoUploading, setLogoUploading] = useState(false);
  const [logoMsg, setLogoMsg] = useState<string | null>(null);
  const accessToken = useContext(AccessTokenContext);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://smileproof.co.uk';

  async function handleSaveServices() {
    setSaving(true);
    setSaveMsg(null);
    const result = await updatePracticeServices(accessToken, practiceId, practiceSlug, Array.from(selectedServices));
    setSaveMsg(result.error ?? 'Saved');
    setSaving(false);
  }

  function toggleService(id: string) {
    setSelectedServices(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function handleLogoSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { setLogoMsg('Image must be under 2 MB'); return; }
    if (!file.type.startsWith('image/')) { setLogoMsg('Please select an image file'); return; }
    setLogoFile(file);
    setLogoMsg(null);
    const reader = new FileReader();
    reader.onload = (ev) => setLogoPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  }

  async function handleLogoUpload() {
    if (!logoFile) return;
    setLogoUploading(true);
    setLogoMsg(null);
    try {
      const fd = new FormData();
      fd.append('file', logoFile);
      fd.append('practiceId', practiceId);
      fd.append('practiceSlug', practiceSlug);
      const res = await fetch('/api/practices/logo', { method: 'POST', body: fd });
      const json = await res.json();
      if (!res.ok) { setLogoMsg(json.error ?? 'Upload failed'); return; }
      setLogoUrl(json.url);
      setLogoPreview(null);
      setLogoFile(null);
      setLogoMsg('Logo saved');
    } finally {
      setLogoUploading(false);
    }
  }

  const grouped = allServices.reduce<Record<string, ServiceDef[]>>((acc, s) => {
    (acc[s.category] ??= []).push(s);
    return acc;
  }, {});

  const snippet = `<script>
(function(){
  var s=document.createElement('script');
  s.src='${siteUrl}/widget.js?slug=${practiceSlug}';
  s.async=true;
  document.head.appendChild(s);
})();
</script>
<div id="smileproof-badge" data-slug="${practiceSlug}"></div>`;

  function handleCopy() {
    navigator.clipboard.writeText(snippet).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32, alignItems: 'start' }}>
      <div>

      {/* Logo upload */}
      <div style={{ marginBottom: 32 }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 800, color: D.text, margin: '0 0 6px', letterSpacing: '-0.02em' }}>
          Practice logo
        </h2>
        <p style={{ fontSize: 13, color: D.soft, fontFamily: 'var(--font-body)', margin: '0 0 16px', lineHeight: 1.6 }}>
          Upload your practice logo — it appears on your public profile and dashboard.
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          {/* Current / preview logo */}
          <div style={{ width: 72, height: 72, borderRadius: 14, border: `1.5px solid ${D.border}`, background: D.card2, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 }}>
            {(logoPreview ?? logoUrl)
              ? <img src={logoPreview ?? logoUrl!} alt="Logo preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : <span style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 700, color: D.accent }}>{practiceName.charAt(0).toUpperCase()}</span>
            }
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <label style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 8, border: `1.5px solid ${D.border}`, background: D.card2, cursor: 'pointer', fontSize: 13, fontWeight: 500, color: D.mid, fontFamily: 'var(--font-body)' }}>
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                <path d="M8 2v8M4 6l4-4 4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M2 13h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              {logoFile ? 'Change image' : 'Choose image'}
              <input type="file" accept="image/*" onChange={handleLogoSelect} style={{ display: 'none' }} />
            </label>
            {logoFile && (
              <button
                onClick={handleLogoUpload}
                disabled={logoUploading}
                style={{ padding: '8px 16px', borderRadius: 8, border: 'none', background: logoUploading ? D.faint : D.accent, color: '#0d0d12', fontSize: 13, fontWeight: 600, fontFamily: 'var(--font-body)', cursor: logoUploading ? 'not-allowed' : 'pointer' }}
              >
                {logoUploading ? 'Uploading…' : 'Save logo'}
              </button>
            )}
          </div>
        </div>
        {logoMsg && (
          <p style={{ marginTop: 8, fontSize: 12, fontFamily: 'var(--font-body)', color: logoMsg === 'Logo saved' ? D.accent : '#f87171' }}>
            {logoMsg === 'Logo saved' ? '✓ Logo saved' : logoMsg}
          </p>
        )}
      </div>

      <div style={{ marginBottom: 28, paddingTop: 28, borderTop: `1px solid ${D.border}` }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 800, color: D.text, margin: '0 0 6px', letterSpacing: '-0.02em' }}>
          Website badge
        </h2>
        <p style={{ fontSize: 13, color: D.soft, fontFamily: 'var(--font-body)', margin: 0, lineHeight: 1.6 }}>
          Paste this snippet into your website to show your live SmileProof rating and review count — it updates automatically.
        </p>
      </div>

      {/* Preview */}
      <div style={{ background: D.card, border: `1.5px solid ${D.border}`, borderRadius: 12, padding: '20px 22px', marginBottom: 16 }}>
        <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: D.soft, marginBottom: 12, fontFamily: 'var(--font-body)' }}>
          Preview
        </p>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 10, border: `1.5px solid ${D.border}`, background: D.card2 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: D.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: 'white', fontFamily: 'var(--font-display)' }}>S</span>
          </div>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: D.text, fontFamily: 'var(--font-body)' }}>SmileProof</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <span style={{ color: '#f59e0b', fontSize: 11 }}>★★★★★</span>
              <span style={{ fontSize: 11, color: D.soft, fontFamily: 'var(--font-body)' }}>Verified patient reviews</span>
            </div>
          </div>
        </div>
      </div>

      {/* Code block */}
      <div style={{ background: '#1e1e2e', borderRadius: 10, padding: '16px 18px', marginBottom: 12, position: 'relative' }}>
        <pre style={{ margin: 0, fontSize: 12, color: '#cdd6f4', fontFamily: 'monospace', lineHeight: 1.6, whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
          {snippet}
        </pre>
        <button
          onClick={handleCopy}
          style={{
            position: 'absolute', top: 10, right: 10,
            padding: '4px 10px', borderRadius: 6,
            background: copied ? D.accent : 'rgba(255,255,255,0.1)',
            color: 'white', border: 'none', fontSize: 11, fontWeight: 600,
            fontFamily: 'var(--font-body)', cursor: 'pointer',
            transition: 'background 0.2s',
          }}
        >
          {copied ? '✓ Copied' : 'Copy'}
        </button>
      </div>

      <p style={{ fontSize: 11, color: D.faint, fontFamily: 'var(--font-body)', lineHeight: 1.6, margin: 0 }}>
        The badge fetches live data from SmileProof and renders a small widget linking to your profile. Works on any HTML page.
      </p>

      </div>

      <div>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, marginBottom: 16 }}>
          <div>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, color: D.text, margin: '0 0 4px', letterSpacing: '-0.01em' }}>Services offered</h3>
            <p style={{ fontSize: 13, color: D.soft, fontFamily: 'var(--font-body)', margin: 0, lineHeight: 1.5 }}>
              Tell patients what you offer — shown on your profile and used to surface your practice in relevant searches.
            </p>
          </div>
          <button
            onClick={handleSaveServices}
            disabled={saving}
            style={{
              flexShrink: 0, padding: '9px 20px', borderRadius: 8,
              background: saving ? D.faint : D.accent,
              color: '#0d0d12', border: 'none', fontSize: 13, fontWeight: 600,
              fontFamily: 'var(--font-body)', cursor: saving ? 'not-allowed' : 'pointer',
            }}
          >
            {saving ? 'Saving…' : 'Save services'}
          </button>
        </div>

        {saveMsg && (
          <p style={{ fontSize: 12, color: saveMsg === 'Saved' ? D.accent : '#f87171', fontFamily: 'var(--font-body)', marginBottom: 12 }}>
            {saveMsg === 'Saved' ? '✓ Services saved' : saveMsg}
          </p>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          {Object.entries(grouped).map(([category, services]) => (
            <div key={category}>
              <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: D.soft, marginBottom: 8, fontFamily: 'var(--font-body)' }}>
                {CATEGORY_LABELS[category] ?? category}
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {services.map(s => {
                  const checked = selectedServices.has(s.id);
                  return (
                    <button
                      key={s.id}
                      onClick={() => toggleService(s.id)}
                      style={{
                        display: 'inline-flex', alignItems: 'center', gap: 6,
                        padding: '6px 12px', borderRadius: 20, cursor: 'pointer',
                        border: `1.5px solid ${checked ? 'rgba(52,211,153,0.3)' : D.border}`,
                        background: checked ? D.accentPale : D.card2,
                        color: checked ? D.accent : D.soft,
                        fontSize: 13, fontWeight: checked ? 600 : 400,
                        fontFamily: 'var(--font-body)',
                        transition: 'all 0.12s',
                      }}
                    >
                      {checked && (
                        <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                          <circle cx="6" cy="6" r="5.5" fill={D.accent} />
                          <polyline points="3,6 5,8.5 9,3.5" stroke={D.card} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                      {s.name}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Settings tab ──────────────────────────────────────────────────────────────
function SettingsTab({ userEmail, isOAuthUser, practiceId, practiceSlug, practiceName }: {
  userEmail: string; isOAuthUser: boolean;
  practiceId: string; practiceSlug: string; practiceName: string;
}) {
  const [pwCurrent, setPwCurrent] = useState('');
  const [pwNew, setPwNew] = useState('');
  const [pwConfirm, setPwConfirm] = useState('');
  const [pwSaving, setPwSaving] = useState(false);
  const [pwMsg, setPwMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const [unclaimConfirm, setUnclaimConfirm] = useState(false);
  const [unclaiming, setUnclaiming] = useState(false);
  const [unclaimMsg, setUnclaimMsg] = useState<string | null>(null);
  const accessToken = useContext(AccessTokenContext);

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    if (pwNew !== pwConfirm) { setPwMsg({ ok: false, text: 'New passwords do not match' }); return; }
    if (pwNew.length < 8) { setPwMsg({ ok: false, text: 'Password must be at least 8 characters' }); return; }
    setPwSaving(true);
    setPwMsg(null);
    const { createClient } = await import('@/lib/supabase');
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password: pwNew });
    if (error) {
      setPwMsg({ ok: false, text: error.message });
    } else {
      setPwMsg({ ok: true, text: 'Password updated successfully' });
      setPwCurrent(''); setPwNew(''); setPwConfirm('');
    }
    setPwSaving(false);
  }

  async function handleSendReset() {
    setPwSaving(true);
    setPwMsg(null);
    const { createClient } = await import('@/lib/supabase');
    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(userEmail, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });
    setPwMsg(error ? { ok: false, text: error.message } : { ok: true, text: `Reset link sent to ${userEmail}` });
    setPwSaving(false);
  }

  async function handleUnclaim() {
    setUnclaiming(true);
    setUnclaimMsg(null);
    const result = await unclaimPractice(accessToken, practiceId, practiceSlug);
    if (result.error) { setUnclaimMsg(result.error); setUnclaiming(false); }
    // on success the server redirects away
  }

  const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div style={{ background: D.card, border: `1px solid ${D.border}`, borderRadius: 12, padding: '24px 28px', marginBottom: 16 }}>
      <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700, color: D.text, margin: '0 0 16px', letterSpacing: '-0.01em' }}>{title}</h3>
      {children}
    </div>
  );

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 800, color: D.text, margin: '0 0 4px', letterSpacing: '-0.02em' }}>Settings</h2>
        <p style={{ fontSize: 13, color: D.soft, fontFamily: 'var(--font-body)', margin: 0 }}>Manage your account and practice settings.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, alignItems: 'start' }}>
      <div>
      {/* Account */}
      <Section title="Account">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', borderRadius: 8, background: D.card2, marginBottom: 16, border: `1px solid ${D.border}` }}>
          <svg width="14" height="14" viewBox="0 0 20 20" fill="none" style={{ flexShrink: 0 }}>
            <path d="M3 5h14M3 10h10M3 15h7" stroke={D.soft} strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <span style={{ fontSize: 13, color: D.mid, fontFamily: 'var(--font-body)' }}>{userEmail}</span>
          {isOAuthUser && (
            <span style={{ marginLeft: 'auto', fontSize: 11, fontWeight: 600, color: D.accent, background: D.accentPale, padding: '2px 8px', borderRadius: 20 }}>
              Google
            </span>
          )}
        </div>

        {isOAuthUser ? (
          <p style={{ fontSize: 13, color: D.soft, fontFamily: 'var(--font-body)', lineHeight: 1.6, margin: 0 }}>
            You signed in with Google. Password management is handled by your Google account.
          </p>
        ) : (
          <form onSubmit={handleChangePassword} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: D.soft, fontFamily: 'var(--font-body)', marginBottom: 5 }}>New password</label>
              <input
                type="password"
                value={pwNew}
                onChange={e => setPwNew(e.target.value)}
                placeholder="At least 8 characters"
                required
                style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: `1.5px solid ${D.border2}`, fontSize: 13, fontFamily: 'var(--font-body)', outline: 'none', boxSizing: 'border-box', background: D.card2, color: D.text }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: D.soft, fontFamily: 'var(--font-body)', marginBottom: 5 }}>Confirm new password</label>
              <input
                type="password"
                value={pwConfirm}
                onChange={e => setPwConfirm(e.target.value)}
                placeholder="Repeat new password"
                required
                style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: `1.5px solid ${D.border2}`, fontSize: 13, fontFamily: 'var(--font-body)', outline: 'none', boxSizing: 'border-box', background: D.card2, color: D.text }}
              />
            </div>
            {pwMsg && (
              <p style={{ fontSize: 12, fontFamily: 'var(--font-body)', color: pwMsg.ok ? D.accent : '#f87171', margin: 0 }}>
                {pwMsg.ok ? '✓ ' : ''}{pwMsg.text}
              </p>
            )}
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 4 }}>
              <button
                type="submit"
                disabled={pwSaving}
                style={{ padding: '9px 20px', borderRadius: 8, border: 'none', background: pwSaving ? D.faint : D.accent, color: '#0d0d12', fontSize: 13, fontWeight: 600, fontFamily: 'var(--font-body)', cursor: pwSaving ? 'not-allowed' : 'pointer' }}
              >
                {pwSaving ? 'Saving…' : 'Update password'}
              </button>
              <button
                type="button"
                onClick={handleSendReset}
                disabled={pwSaving}
                style={{ padding: '9px 16px', borderRadius: 8, border: `1.5px solid ${D.border}`, background: D.card2, color: D.mid, fontSize: 13, fontWeight: 500, fontFamily: 'var(--font-body)', cursor: 'pointer' }}
              >
                Email reset link
              </button>
            </div>
          </form>
        )}
      </Section>

      {/* Sign out */}
      <Section title="Sign out">
        <p style={{ fontSize: 13, color: D.soft, fontFamily: 'var(--font-body)', lineHeight: 1.6, margin: '0 0 14px' }}>
          Sign out of your account on this device.
        </p>
        <a
          href="/auth/logout"
          style={{ display: 'inline-block', padding: '9px 20px', borderRadius: 8, border: `1.5px solid ${D.border}`, background: D.card2, color: D.mid, fontSize: 13, fontWeight: 500, fontFamily: 'var(--font-body)', textDecoration: 'none' }}
        >
          Sign out
        </a>
      </Section>

      </div>
      <div>
      {/* Danger zone */}
      <div style={{ background: 'rgba(220,38,38,0.07)', border: '1.5px solid rgba(220,38,38,0.25)', borderRadius: 12, padding: '24px 28px' }}>
        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700, color: '#f87171', margin: '0 0 8px', letterSpacing: '-0.01em' }}>Danger zone</h3>
        <p style={{ fontSize: 13, color: 'rgba(248,113,113,0.7)', fontFamily: 'var(--font-body)', lineHeight: 1.6, margin: '0 0 14px' }}>
          Unclaiming <strong>{practiceName}</strong> will remove your access to this dashboard and revert the listing to unverified. This cannot be undone from here — you would need to re-claim the practice.
        </p>
        {!unclaimConfirm ? (
          <button
            onClick={() => setUnclaimConfirm(true)}
            style={{ padding: '9px 20px', borderRadius: 8, border: '1.5px solid rgba(220,38,38,0.4)', background: 'rgba(220,38,38,0.08)', color: '#f87171', fontSize: 13, fontWeight: 600, fontFamily: 'var(--font-body)', cursor: 'pointer' }}
          >
            Unclaim practice
          </button>
        ) : (
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            <span style={{ fontSize: 13, color: 'rgba(248,113,113,0.8)', fontFamily: 'var(--font-body)' }}>Are you sure?</span>
            <button
              onClick={handleUnclaim}
              disabled={unclaiming}
              style={{ padding: '9px 20px', borderRadius: 8, border: 'none', background: '#dc2626', color: 'white', fontSize: 13, fontWeight: 600, fontFamily: 'var(--font-body)', cursor: unclaiming ? 'not-allowed' : 'pointer' }}
            >
              {unclaiming ? 'Unclaiming…' : 'Yes, unclaim'}
            </button>
            <button
              onClick={() => setUnclaimConfirm(false)}
              style={{ padding: '9px 16px', borderRadius: 8, border: `1.5px solid ${D.border}`, background: D.card2, color: D.mid, fontSize: 13, fontWeight: 500, fontFamily: 'var(--font-body)', cursor: 'pointer' }}
            >
              Cancel
            </button>
            {unclaimMsg && <p style={{ fontSize: 12, color: '#dc2626', fontFamily: 'var(--font-body)', margin: 0 }}>{unclaimMsg}</p>}
          </div>
        )}
      </div>
      </div>
      </div>
    </div>
  );
}
