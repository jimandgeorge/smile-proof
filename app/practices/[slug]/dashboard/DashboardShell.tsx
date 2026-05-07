'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ResponseForm } from './ResponseForm';
import RatingChart from './RatingChart';
import InviteTab, { type Invite } from './InviteTab';
import type { SentimentTheme } from './actions';

type ServiceDef = { id: string; slug: string; name: string; category: string; sort_order: number };
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
  userName: string; userInitial: string;
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
  aiInsights: { themes: SentimentTheme[]; generated_at: string } | null;
  allServices: ServiceDef[];
  practiceServiceIds: string[];
};

type Tab = 'overview' | 'reviews' | 'insights' | 'profile' | 'invites';

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}

function initials(name: string) {
  return name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();
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
        background: active ? 'rgba(255,255,255,0.12)' : 'transparent',
        border: 'none', cursor: 'pointer', textAlign: 'left',
        color: active ? 'white' : 'rgba(255,255,255,0.62)',
        fontSize: 14, fontWeight: active ? 600 : 400,
        fontFamily: 'var(--font-body)',
        transition: 'background 0.15s, color 0.15s',
      }}
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
function InsightBanner({ insight }: { insight: Insight }) {
  const cfg = {
    warning: { bg: '#fef9ee', border: '#fde68a', iconColor: '#d97706', textColor: '#78350f', btnBg: '#fef3c7', btnColor: '#92400e' },
    info:    { bg: '#f9f0ff', border: '#e9d5ff', iconColor: '#9333ea', textColor: '#4c1d95', btnBg: '#f3e8ff', btnColor: '#7e22ce' },
    action:  { bg: '#f0fdf4', border: '#bbf7d0', iconColor: '#16a34a', textColor: '#14532d', btnBg: '#dcfce7', btnColor: '#166534' },
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
      <Link
        href={insight.actionHref}
        style={{
          flexShrink: 0, fontSize: 12, fontWeight: 600, color: cfg.btnColor,
          background: cfg.btnBg, borderRadius: 20, padding: '4px 12px',
          textDecoration: 'none', whiteSpace: 'nowrap', fontFamily: 'var(--font-body)',
        }}
      >
        {insight.actionLabel} →
      </Link>
    </div>
  );
}

// ── Metric card ───────────────────────────────────────────────────────────────
function MetricCard({ label, value, sub1, sub2, sub2Red }: {
  label: string; value: React.ReactNode; sub1?: string; sub2?: React.ReactNode; sub2Red?: boolean;
}) {
  return (
    <div style={{ background: 'white', border: '1px solid var(--cream-dark)', borderRadius: 12, padding: '20px 22px', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--ink-soft)', letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 10, fontFamily: 'var(--font-body)' }}>{label}</div>
      <div style={{ fontFamily: 'var(--font-display)', fontSize: 34, fontWeight: 800, color: 'var(--ink)', letterSpacing: '-0.03em', lineHeight: 1 }}>{value}</div>
      {sub1 && <div style={{ fontSize: 12, color: 'var(--ink-soft)', marginTop: 6, fontFamily: 'var(--font-body)' }}>{sub1}</div>}
      {sub2 && <div style={{ fontSize: 12, marginTop: 2, fontFamily: 'var(--font-body)', color: sub2Red ? '#dc2626' : 'var(--ink-soft)', fontWeight: sub2Red ? 600 : 400 }}>{sub2}</div>}
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
    <div style={{ background: dimmed ? '#fafaf8' : 'white', border: '1px solid var(--cream-dark)', borderRadius: 12, padding: '18px 22px', boxShadow: '0 1px 4px rgba(0,0,0,0.04)', opacity: dimmed ? 0.7 : 1 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 8 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <span style={{ color: 'var(--gold)', fontSize: 13, letterSpacing: '-1px' }}>
              {'★'.repeat(stars)}{'☆'.repeat(Math.max(0, 5 - stars))}
            </span>
            {r.verification_status === 'verified' && (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: 11, color: 'var(--forest)', fontWeight: 600 }}>
                <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                  <circle cx="6" cy="6" r="6" fill="var(--forest)" />
                  <polyline points="3,6 5,8.5 9,3.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Verified
              </span>
            )}
          </div>
          {r.title && <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 700, color: 'var(--ink)', margin: '0 0 4px' }}>{r.title}</h3>}
          {r.treatments?.name && <span style={{ fontSize: 11, color: 'var(--ink-soft)', background: 'var(--cream-dark)', padding: '2px 8px', borderRadius: 20 }}>{r.treatments.name}</span>}
        </div>
        <div style={{ fontSize: 12, color: 'var(--ink-faint)', flexShrink: 0, fontFamily: 'var(--font-body)' }}>
          {r.reviewer_display_name ?? 'Patient'} · {new Date(r.created_at).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })}
        </div>
      </div>
      <p style={{ fontSize: 13, color: 'var(--ink-mid)', lineHeight: 1.65, fontFamily: 'var(--font-body)', margin: 0 }}>{r.body}</p>
      {response?.body && (
        <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--cream-dark)' }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--forest)', marginBottom: 4, fontFamily: 'var(--font-body)' }}>Your response</p>
          <p style={{ fontSize: 13, color: 'var(--ink-mid)', lineHeight: 1.65, fontFamily: 'var(--font-body)', margin: 0 }}>{response.body}</p>
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
  userName, userInitial,
  isPaid,
  avgOverall, reviewCount, verifiedCount,
  profileViews30d, profileViewsPrev30d,
  newReviewsThisMonth, prevMonthReviews,
  responseRate, unrespondedCount,
  cityRank, cityTotal,
  monthlyData, scoreCards,
  publishedReviews, pendingReviews,
  insights, invites, aiInsights,
  dimensionRanks,
  allServices, practiceServiceIds,
}: Props) {
  const [tab, setTab] = useState<Tab>('overview');

  const viewsDelta = profileViewsPrev30d > 0
    ? Math.round(((profileViews30d - profileViewsPrev30d) / profileViewsPrev30d) * 100)
    : null;
  const reviewDelta = newReviewsThisMonth - prevMonthReviews;

  // ── Sidebar icons ─────────────────────────────────────────────────────────
  const navItems: { id: Tab; label: string; badge?: number; icon: React.ReactNode }[] = [
    {
      id: 'overview', label: 'Overview',
      icon: <svg width="15" height="15" viewBox="0 0 20 20" fill="none"><path d="M3 9.5L10 3l7 6.5V17a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" /></svg>,
    },
    {
      id: 'reviews', label: 'Reviews', badge: pendingReviews.length || undefined,
      icon: <svg width="15" height="15" viewBox="0 0 20 20" fill="none"><path d="M17 12a2 2 0 0 1-2 2H5l-3 3V5a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v7z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" /></svg>,
    },
    {
      id: 'insights', label: 'Insights',
      icon: <svg width="15" height="15" viewBox="0 0 20 20" fill="none"><rect x="3" y="12" width="3" height="5" rx="1" stroke="currentColor" strokeWidth="1.5" /><rect x="8.5" y="8" width="3" height="9" rx="1" stroke="currentColor" strokeWidth="1.5" /><rect x="14" y="4" width="3" height="13" rx="1" stroke="currentColor" strokeWidth="1.5" /></svg>,
    },
    {
      id: 'invites', label: 'Get Reviews',
      icon: <svg width="15" height="15" viewBox="0 0 20 20" fill="none"><path d="M3 5h14M3 10h10M3 15h7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /><circle cx="16" cy="14" r="3" stroke="currentColor" strokeWidth="1.5" /><path d="M16 13v2M16 16v.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" /></svg>,
    },
    {
      id: 'profile', label: 'Profile',
      icon: <svg width="15" height="15" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="7" r="3.5" stroke="currentColor" strokeWidth="1.5" /><path d="M3 17c0-3.3 3.1-6 7-6s7 2.7 7 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>,
    },
  ];

  return (
    <div style={{ display: 'flex', minHeight: 'calc(100vh - 60px)', background: '#f4f5f7' }}>

      {/* ── Sidebar ── */}
      <aside style={{
        width: 216, flexShrink: 0, background: 'var(--forest)',
        display: 'flex', flexDirection: 'column',
        position: 'sticky', top: 60, height: 'calc(100vh - 60px)',
        overflowY: 'auto',
      }}>
        {/* Practice selector */}
        <div style={{ padding: '20px 16px 16px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 700, color: 'white' }}>{initials(practiceName)}</span>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'white', fontFamily: 'var(--font-body)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {practiceName}
              </div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)', fontFamily: 'var(--font-body)', marginTop: 1 }}>
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
        <div style={{ padding: '12px 16px 20px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
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
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 800, color: 'var(--ink)', margin: 0, letterSpacing: '-0.02em' }}>
              {getGreeting()}, {userName}
            </h1>
            <p style={{ fontSize: 13, color: 'var(--ink-soft)', margin: '4px 0 0', fontFamily: 'var(--font-body)' }}>
              Here's what's happening with {practiceName}
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
            {/* Notification bell */}
            <button style={{ width: 36, height: 36, borderRadius: '50%', background: 'white', border: '1px solid var(--cream-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
              <svg width="15" height="15" viewBox="0 0 20 20" fill="none">
                <path d="M10 2a6 6 0 0 0-6 6v3l-1.5 2.5h15L16 11V8a6 6 0 0 0-6-6z" stroke="var(--ink-soft)" strokeWidth="1.5" strokeLinejoin="round" />
                <path d="M8 16a2 2 0 0 0 4 0" stroke="var(--ink-soft)" strokeWidth="1.5" />
              </svg>
            </button>
            {/* User avatar */}
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--forest)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: 'white', fontFamily: 'var(--font-display)' }}>{userInitial}</span>
            </div>
          </div>
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
              onGoToReviews={() => setTab('reviews')}
            />
          )}
          {tab === 'reviews' && (
            <ReviewsTab
              publishedReviews={publishedReviews} pendingReviews={pendingReviews}
              practiceId={practiceId} practiceSlug={practiceSlug}
              practiceName={practiceName} isPaid={isPaid}
            />
          )}
          {tab === 'insights' && <InsightsTab isPaid={isPaid} practiceSlug={practiceSlug} insights={insights} practiceId={practiceId} aiInsights={aiInsights} />}
          {tab === 'invites' && (
            <InviteTab
              practiceId={practiceId}
              practiceSlug={practiceSlug}
              practiceName={practiceName}
              invites={invites}
            />
          )}
          {tab === 'profile' && <ProfileTab practiceName={practiceName} practiceCity={practiceCity} practiceSlug={practiceSlug} practiceId={practiceId} allServices={allServices} practiceServiceIds={practiceServiceIds} />}
        </div>
      </div>
    </div>
  );
}

// ── Overview tab ──────────────────────────────────────────────────────────────
function OverviewTab({
  isPaid, practiceSlug, practiceCity,
  avgOverall, reviewCount,
  profileViews30d, viewsDelta,
  newReviewsThisMonth, reviewDelta,
  responseRate, unrespondedCount,
  cityRank, cityTotal, dimensionRanks,
  monthlyData, scoreCards, insights, pendingCount,
  onGoToReviews,
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
  onGoToReviews: () => void;
}) {
  const viewsTrendLabel = viewsDelta != null
    ? `${viewsDelta >= 0 ? '↑' : '↓'} ${Math.abs(viewsDelta)}% vs last month`
    : 'last 30 days';
  const reviewTrendLabel = reviewDelta !== 0
    ? `${reviewDelta > 0 ? '+' : ''}${reviewDelta} from last month`
    : 'same as last month';

  return (
    <div>
      {/* Metric cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 20 }}>
        <MetricCard
          label="Overall Rating"
          value={avgOverall ? Number(avgOverall).toFixed(1) : '—'}
          sub1={`from ${reviewCount} review${reviewCount !== 1 ? 's' : ''}`}
        />

        {isPaid ? (
          <MetricCard
            label="Profile Views"
            value={profileViews30d.toLocaleString()}
            sub1="last 30 days"
            sub2={viewsDelta != null ? viewsTrendLabel : undefined}
          />
        ) : (
          <div style={{ background: 'white', border: '1px solid var(--cream-dark)', borderRadius: 12, padding: '20px 22px', position: 'relative', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--ink-soft)', letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 10, fontFamily: 'var(--font-body)' }}>Profile Views</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 34, fontWeight: 800, color: 'var(--ink)', letterSpacing: '-0.03em', lineHeight: 1, filter: 'blur(8px)', userSelect: 'none' }}>1,240</div>
            <Link href={`/practices/${practiceSlug}/upgrade`} style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.75)', textDecoration: 'none', fontSize: 11, fontWeight: 700, color: 'var(--forest)', fontFamily: 'var(--font-body)', gap: 4 }}>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none"><rect x="3" y="11" width="18" height="11" rx="2" stroke="currentColor" strokeWidth="2" fill="none" /><path d="M7 11V7a5 5 0 0 1 10 0v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
              Pro only
            </Link>
          </div>
        )}

        <MetricCard
          label="New Reviews"
          value={newReviewsThisMonth}
          sub1="this month"
          sub2={reviewTrendLabel}
        />

        <MetricCard
          label="Response Rate"
          value={<span style={{ color: responseRate >= 80 ? 'var(--forest)' : responseRate >= 50 ? '#d97706' : '#dc2626' }}>{responseRate}%</span>}
          sub1={unrespondedCount > 0 ? `${unrespondedCount} awaiting reply` : 'All reviews answered'}
          sub2={unrespondedCount > 0 ? 'Action needed' : undefined}
          sub2Red={unrespondedCount > 0}
        />
      </div>

      {/* Pending moderation notice */}
      {pendingCount > 0 && (
        <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 10, padding: '11px 16px', marginBottom: 16, fontSize: 13, color: '#92400e', fontFamily: 'var(--font-body)' }}>
          {pendingCount} review{pendingCount !== 1 ? 's' : ''} awaiting moderation — not yet visible to patients.
        </div>
      )}

      {/* Insight banners */}
      {insights.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
          {insights.map((ins, i) => <InsightBanner key={i} insight={ins} />)}
        </div>
      )}

      {/* Charts row */}
      <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: 16, marginBottom: 20 }}>
        <div style={{ background: 'white', border: '1px solid var(--cream-dark)', borderRadius: 12, padding: '20px 24px', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--ink)', fontFamily: 'var(--font-body)' }}>Rating over time</div>
            <div style={{ fontSize: 11, color: 'var(--ink-faint)', fontFamily: 'var(--font-body)' }}>Last 6 months</div>
          </div>
          <div style={{ display: 'flex', gap: 14, marginBottom: 12 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: 'var(--ink-soft)', fontFamily: 'var(--font-body)' }}>
              <span style={{ width: 14, height: 2, background: 'var(--forest)', borderRadius: 1, display: 'inline-block' }} /> Rating
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: 'var(--ink-soft)', fontFamily: 'var(--font-body)' }}>
              <span style={{ width: 10, height: 8, background: 'var(--cream-dark)', borderRadius: 1, display: 'inline-block' }} /> Volume
            </span>
          </div>
          <RatingChart data={monthlyData} />
        </div>

        <div style={{ background: 'white', border: '1px solid var(--cream-dark)', borderRadius: 12, padding: '20px 24px', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--ink)', fontFamily: 'var(--font-body)', marginBottom: 16 }}>Patient scores</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {scoreCards.filter(s => s.label !== 'Overall').map(({ label, value }) => (
              <div key={label}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: 12, color: 'var(--ink-soft)', fontFamily: 'var(--font-body)' }}>{label}</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: value != null ? 'var(--ink)' : 'var(--ink-faint)', fontFamily: 'var(--font-body)' }}>
                    {value != null ? Number(value).toFixed(1) : '—'}
                  </span>
                </div>
                <div style={{ height: 5, borderRadius: 3, background: 'var(--cream-dark)', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: value != null ? `${(Number(value) / 5) * 100}%` : '0%', background: 'var(--forest)', borderRadius: 3 }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Competitor benchmarking (paid) */}
      {isPaid && (cityRank > 0 || dimensionRanks.length > 0) && (
        <div style={{ background: 'white', border: '1px solid var(--cream-dark)', borderRadius: 12, padding: '20px 24px', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink)', fontFamily: 'var(--font-body)', marginBottom: 4 }}>
            How you rank in {practiceCity}
          </div>
          {cityRank > 0 && (
            <p style={{ fontSize: 12, color: 'var(--ink-soft)', fontFamily: 'var(--font-body)', margin: '0 0 16px' }}>
              Overall: <strong style={{ color: 'var(--ink)' }}>#{cityRank}</strong> of {cityTotal} practices
            </p>
          )}
          {dimensionRanks.length > 0 && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 10 }}>
              {dimensionRanks.map(({ label, rank, total, score }) => {
                const isTop3 = rank <= 3;
                return (
                  <div
                    key={label}
                    style={{
                      padding: '10px 12px', borderRadius: 8,
                      background: isTop3 ? 'var(--forest-pale)' : 'var(--cream)',
                      border: `1px solid ${isTop3 ? 'rgba(28,69,53,0.2)' : 'var(--cream-dark)'}`,
                    }}
                  >
                    <div style={{ fontSize: 11, color: isTop3 ? 'var(--forest)' : 'var(--ink-soft)', fontFamily: 'var(--font-body)', marginBottom: 4 }}>
                      {label}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                      <span style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 800, color: isTop3 ? 'var(--forest)' : 'var(--ink)', letterSpacing: '-0.02em', lineHeight: 1 }}>
                        #{rank}
                      </span>
                      <span style={{ fontSize: 11, color: 'var(--ink-faint)', fontFamily: 'var(--font-body)' }}>
                        of {total}
                      </span>
                      {score != null && (
                        <span style={{ marginLeft: 'auto', fontSize: 12, fontWeight: 600, color: isTop3 ? 'var(--forest)' : 'var(--ink-mid)', fontFamily: 'var(--font-body)' }}>
                          {score.toFixed(1)}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Reviews tab ───────────────────────────────────────────────────────────────
function ReviewsTab({ publishedReviews, pendingReviews, practiceId, practiceSlug, practiceName, isPaid }: {
  publishedReviews: Review[]; pendingReviews: Review[];
  practiceId: string; practiceSlug: string; practiceName: string; isPaid: boolean;
}) {
  return (
    <div>
      {pendingReviews.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 700, color: 'var(--ink)', marginBottom: 12 }}>Awaiting moderation ({pendingReviews.length})</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {pendingReviews.map(r => <ReviewCard key={r.id} r={r} practiceId={practiceId} practiceSlug={practiceSlug} practiceName={practiceName} isPaid={isPaid} dimmed />)}
          </div>
        </div>
      )}
      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 700, color: 'var(--ink)', marginBottom: 12 }}>Published reviews ({publishedReviews.length})</h2>
      {publishedReviews.length === 0 ? (
        <div style={{ background: 'white', border: '1px solid var(--cream-dark)', borderRadius: 12, padding: '40px 24px', textAlign: 'center' }}>
          <p style={{ fontSize: 14, color: 'var(--ink-soft)', fontFamily: 'var(--font-body)', margin: 0 }}>No published reviews yet.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {publishedReviews.map(r => <ReviewCard key={r.id} r={r} practiceId={practiceId} practiceSlug={practiceSlug} practiceName={practiceName} isPaid={isPaid} />)}
        </div>
      )}
    </div>
  );
}

// ── Insights tab ──────────────────────────────────────────────────────────────
function InsightsTab({
  isPaid, practiceSlug, practiceId, insights, aiInsights,
}: {
  isPaid: boolean; practiceSlug: string; practiceId: string;
  insights: Insight[];
  aiInsights: { themes: SentimentTheme[]; generated_at: string } | null;
}) {
  const [themes, setThemes] = useState<SentimentTheme[]>(aiInsights?.themes ?? []);
  const [generatedAt, setGeneratedAt] = useState<string | null>(aiInsights?.generated_at ?? null);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleGenerate() {
    setGenerating(true);
    setError(null);
    const { generateSentimentThemes } = await import('./actions');
    const result = await generateSentimentThemes(practiceId, practiceSlug);
    if (result.error) setError(result.error);
    else if (result.themes) {
      setThemes(result.themes);
      setGeneratedAt(new Date().toISOString());
    }
    setGenerating(false);
  }

  const SENTIMENT_STYLE: Record<string, { bg: string; text: string; border: string }> = {
    positive: { bg: 'var(--forest-pale)', text: 'var(--forest)', border: 'rgba(28,69,53,0.2)' },
    negative: { bg: '#fef2f2', text: '#b91c1c', border: 'rgba(185,28,28,0.2)' },
    mixed:    { bg: '#fef9ee', text: '#92620a', border: 'rgba(146,98,10,0.2)' },
  };

  if (!isPaid) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 24px' }}>
        <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'var(--forest-pale)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" stroke="var(--forest)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, color: 'var(--ink)', marginBottom: 8 }}>AI-powered insights</h2>
        <p style={{ fontSize: 14, color: 'var(--ink-soft)', fontFamily: 'var(--font-body)', maxWidth: 320, margin: '0 auto 24px', lineHeight: 1.6 }}>
          Upgrade to Pro to unlock AI analysis — sentiment trends, common themes, and actionable recommendations.
        </p>
        <Link href={`/practices/${practiceSlug}/upgrade`} style={{ display: 'inline-flex', padding: '11px 32px', borderRadius: 50, background: 'var(--forest)', color: 'var(--cream)', fontSize: 14, fontWeight: 600, fontFamily: 'var(--font-body)', textDecoration: 'none' }}>
          Upgrade to Pro — £49/month
        </Link>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 700 }}>
      {/* Header + generate button */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20, gap: 16 }}>
        <div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 800, color: 'var(--ink)', margin: '0 0 6px', letterSpacing: '-0.02em' }}>
            Patient sentiment themes
          </h2>
          <p style={{ fontSize: 13, color: 'var(--ink-soft)', fontFamily: 'var(--font-body)', margin: 0 }}>
            {generatedAt
              ? `Last analysed ${new Date(generatedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}`
              : 'AI analysis of what your patients talk about most'}
          </p>
        </div>
        <button
          onClick={handleGenerate}
          disabled={generating}
          style={{
            flexShrink: 0, display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '9px 18px', borderRadius: 8,
            background: generating ? 'var(--ink-faint)' : 'var(--forest)',
            color: 'var(--cream)', border: 'none', fontSize: 13, fontWeight: 600,
            fontFamily: 'var(--font-body)', cursor: generating ? 'not-allowed' : 'pointer',
            transition: 'background var(--transition)',
          }}
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M6 1v2M6 9v2M1 6h2M9 6h2M2.5 2.5l1.4 1.4M8.1 8.1l1.4 1.4M2.5 9.5l1.4-1.4M8.1 3.9l1.4-1.4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
          </svg>
          {generating ? 'Analysing…' : themes.length ? 'Re-analyse' : 'Analyse reviews'}
        </button>
      </div>

      {error && (
        <p style={{ fontSize: 13, color: '#dc2626', marginBottom: 16, fontFamily: 'var(--font-body)' }}>{error}</p>
      )}

      {/* Themes grid */}
      {themes.length > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 24 }}>
          {themes.map((theme, i) => {
            const s = SENTIMENT_STYLE[theme.sentiment] ?? SENTIMENT_STYLE.mixed;
            return (
              <div
                key={i}
                style={{
                  background: 'white', border: '1.5px solid var(--cream-dark)',
                  borderRadius: 12, padding: '14px 16px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--ink)', fontFamily: 'var(--font-body)' }}>
                    {theme.topic}
                  </span>
                  <span
                    style={{
                      fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 20,
                      background: s.bg, color: s.text, border: `1px solid ${s.border}`,
                      fontFamily: 'var(--font-body)', textTransform: 'capitalize',
                    }}
                  >
                    {theme.sentiment}
                  </span>
                </div>
                <p style={{ fontSize: 12, color: 'var(--ink-soft)', fontFamily: 'var(--font-body)', lineHeight: 1.55, fontStyle: 'italic', margin: '0 0 8px' }}>
                  &ldquo;{theme.example}&rdquo;
                </p>
                <div style={{ fontSize: 11, color: 'var(--ink-faint)', fontFamily: 'var(--font-body)' }}>
                  Mentioned in {theme.count} {theme.count === 1 ? 'review' : 'reviews'}
                </div>
              </div>
            );
          })}
        </div>
      ) : !generating && (
        <div style={{ background: 'white', border: '1.5px solid var(--cream-dark)', borderRadius: 12, padding: '40px 24px', textAlign: 'center', marginBottom: 24 }}>
          <p style={{ fontSize: 13, color: 'var(--ink-faint)', fontFamily: 'var(--font-body)', margin: 0 }}>
            Click "Analyse reviews" to generate AI-powered sentiment themes from your patient feedback.
          </p>
        </div>
      )}

      {/* Rule-based insights */}
      {insights.length > 0 && (
        <div>
          <h3 style={{ fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: 700, color: 'var(--ink-soft)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>
            Action items
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {insights.map((ins, i) => <InsightBanner key={i} insight={ins} />)}
          </div>
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
function ProfileTab({ practiceName, practiceCity, practiceSlug, practiceId, allServices, practiceServiceIds }: {
  practiceName: string; practiceCity: string; practiceSlug: string; practiceId: string;
  allServices: ServiceDef[]; practiceServiceIds: string[];
}) {
  const [copied, setCopied] = useState(false);
  const [selectedServices, setSelectedServices] = useState<Set<string>>(new Set(practiceServiceIds));
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState<string | null>(null);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://smileproof.co.uk';

  async function handleSaveServices() {
    setSaving(true);
    setSaveMsg(null);
    const { updatePracticeServices } = await import('./actions');
    const result = await updatePracticeServices(practiceId, practiceSlug, Array.from(selectedServices));
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
    <div style={{ maxWidth: 600 }}>
      <div style={{ marginBottom: 28 }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 800, color: 'var(--ink)', margin: '0 0 6px', letterSpacing: '-0.02em' }}>
          Website badge
        </h2>
        <p style={{ fontSize: 13, color: 'var(--ink-soft)', fontFamily: 'var(--font-body)', margin: 0, lineHeight: 1.6 }}>
          Paste this snippet into your website to show your live SmileProof rating and review count — it updates automatically.
        </p>
      </div>

      {/* Preview */}
      <div style={{ background: 'white', border: '1.5px solid var(--cream-dark)', borderRadius: 12, padding: '20px 22px', marginBottom: 16 }}>
        <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--ink-soft)', marginBottom: 12, fontFamily: 'var(--font-body)' }}>
          Preview
        </p>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 10, border: '1.5px solid var(--cream-dark)', background: 'var(--cream)' }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--forest)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: 'white', fontFamily: 'var(--font-display)' }}>S</span>
          </div>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--ink)', fontFamily: 'var(--font-body)' }}>SmileProof</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <span style={{ color: '#f59e0b', fontSize: 11 }}>★★★★★</span>
              <span style={{ fontSize: 11, color: 'var(--ink-soft)', fontFamily: 'var(--font-body)' }}>Verified patient reviews</span>
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
            background: copied ? 'var(--forest)' : 'rgba(255,255,255,0.1)',
            color: 'white', border: 'none', fontSize: 11, fontWeight: 600,
            fontFamily: 'var(--font-body)', cursor: 'pointer',
            transition: 'background 0.2s',
          }}
        >
          {copied ? '✓ Copied' : 'Copy'}
        </button>
      </div>

      <p style={{ fontSize: 11, color: 'var(--ink-faint)', fontFamily: 'var(--font-body)', lineHeight: 1.6, margin: 0 }}>
        The badge fetches live data from SmileProof and renders a small widget linking to your profile. Works on any HTML page.
      </p>

      <div style={{ marginTop: 28, paddingTop: 24, borderTop: '1px solid var(--cream-dark)' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, marginBottom: 16 }}>
          <div>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, color: 'var(--ink)', margin: '0 0 4px', letterSpacing: '-0.01em' }}>Services offered</h3>
            <p style={{ fontSize: 13, color: 'var(--ink-soft)', fontFamily: 'var(--font-body)', margin: 0, lineHeight: 1.5 }}>
              Tell patients what you offer — shown on your profile and used to surface your practice in relevant searches.
            </p>
          </div>
          <button
            onClick={handleSaveServices}
            disabled={saving}
            style={{
              flexShrink: 0, padding: '9px 20px', borderRadius: 8,
              background: saving ? 'var(--ink-faint)' : 'var(--forest)',
              color: 'var(--cream)', border: 'none', fontSize: 13, fontWeight: 600,
              fontFamily: 'var(--font-body)', cursor: saving ? 'not-allowed' : 'pointer',
            }}
          >
            {saving ? 'Saving…' : 'Save services'}
          </button>
        </div>

        {saveMsg && (
          <p style={{ fontSize: 12, color: saveMsg === 'Saved' ? 'var(--forest)' : '#dc2626', fontFamily: 'var(--font-body)', marginBottom: 12 }}>
            {saveMsg === 'Saved' ? '✓ Services saved' : saveMsg}
          </p>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          {Object.entries(grouped).map(([category, services]) => (
            <div key={category}>
              <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--ink-soft)', marginBottom: 8, fontFamily: 'var(--font-body)' }}>
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
                        border: `1.5px solid ${checked ? 'var(--forest)' : 'var(--cream-dark)'}`,
                        background: checked ? 'var(--forest-pale)' : 'white',
                        color: checked ? 'var(--forest)' : 'var(--ink-soft)',
                        fontSize: 13, fontWeight: checked ? 600 : 400,
                        fontFamily: 'var(--font-body)',
                        transition: 'all 0.12s',
                      }}
                    >
                      {checked && (
                        <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                          <circle cx="6" cy="6" r="5.5" fill="var(--forest)" />
                          <polyline points="3,6 5,8.5 9,3.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
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
