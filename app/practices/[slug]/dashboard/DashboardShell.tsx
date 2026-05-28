'use client';

import { useState, useEffect, useContext } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import TeamTab, { type TeamDentist } from './TeamTab';
import PracticeIntelligenceTab from './PracticeIntelligenceTab';
import type { OpportunityInsightData } from './actions';
import { updatePracticeServices } from './actions';
import { AccessTokenContext } from './token-context';
import { Settings, LogOut, Home, Star, Users, User, ArrowRight, Upload, CheckCircle, Lock, RefreshCw, Mail } from 'lucide-react';

const D = {
  bg: '#0d0d12', sidebar: '#09090d', card: '#13131a', card2: '#17171f',
  border: 'rgba(255,255,255,0.07)', border2: 'rgba(255,255,255,0.12)',
  divider: 'rgba(255,255,255,0.05)',
  text: '#edeef5', mid: 'rgba(237,238,245,0.72)', soft: 'rgba(237,238,245,0.5)',
  faint: 'rgba(237,238,245,0.28)', xfaint: 'rgba(237,238,245,0.13)',
  accent: '#34d399', accentPale: 'rgba(52,211,153,0.08)',
  gold: '#fbbf24',
} as const;

function MicroLabel({ text, color = D.faint }: { text: string; color?: string }) {
  return (
    <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color, fontFamily: 'var(--font-body)', marginBottom: 10 }}>
      {text}
    </div>
  );
}

function SectionDivider({ label }: { label?: string }) {
  if (!label) return <div style={{ height: 1, background: D.divider, margin: '28px 0' }} />;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '28px 0 20px' }}>
      <div style={{ flex: 1, height: 1, background: D.divider }} />
      <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: D.xfaint, fontFamily: 'var(--font-body)', whiteSpace: 'nowrap' }}>{label}</span>
      <div style={{ flex: 1, height: 1, background: D.divider }} />
    </div>
  );
}

type ServiceDef = { id: string; slug: string; name: string; category: string; sort_order: number };
type DimensionRank = { label: string; rank: number; total: number; score: number | null };

type Props = {
  practiceId: string; practiceSlug: string; practiceName: string;
  practiceCity: string; practicePostcode: string; practiceType: string | null;
  userName: string; userInitial: string; userEmail: string; isOAuthUser: boolean;
  logoUrl: string | null;
  isPaid: boolean;
  profileViews30d: number; profileViewsPrev30d: number;
  cityRank: number; cityTotal: number;
  dimensionRanks: DimensionRank[];
  allServices: ServiceDef[];
  practiceServiceIds: string[];
  teamDentists: TeamDentist[];
  opportunityInsights: OpportunityInsightData | null;
  googleReviewCount: number;
  googleAvgRating: number | null;
  initialAccessToken: string;
};

type Tab = 'overview' | 'intelligence' | 'profile' | 'team' | 'settings';

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}

function initials(name: string) {
  return name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();
}

// ── Header actions ────────────────────────────────────────────────────────────
function HeaderActions({ userInitial, onSettingsClick, userEmail }: {
  userInitial: string; onSettingsClick: () => void; userEmail: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
      <div style={{ position: 'relative' }}>
        <button
          onClick={() => setOpen(o => !o)}
          style={{ width: 36, height: 36, borderRadius: '50%', background: D.accent, border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
        >
          <span style={{ fontSize: 14, fontWeight: 700, color: 'white', fontFamily: 'var(--font-display)' }}>{userInitial}</span>
        </button>

        {open && (
          <>
            <div onClick={() => setOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 40 }} />
            <div style={{ position: 'absolute', top: 44, right: 0, zIndex: 50, background: D.card, border: `1.5px solid ${D.border2}`, borderRadius: 12, boxShadow: '0 8px 32px rgba(0,0,0,0.4)', minWidth: 200, overflow: 'hidden' }}>
              <div style={{ padding: '12px 16px', borderBottom: `1px solid ${D.border}` }}>
                <p style={{ fontSize: 11, fontWeight: 600, color: D.soft, fontFamily: 'var(--font-body)', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 2px' }}>Signed in as</p>
                <p style={{ fontSize: 13, color: D.text, fontFamily: 'var(--font-body)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{userEmail}</p>
              </div>
              <div style={{ padding: '6px 4px' }}>
                <button onClick={() => { onSettingsClick(); setOpen(false); }} style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '9px 12px', borderRadius: 8, border: 'none', background: 'transparent', cursor: 'pointer', fontSize: 13, color: D.mid, fontFamily: 'var(--font-body)', textAlign: 'left' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.06)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  <span style={{ color: D.soft }}><Settings size={13} strokeWidth={1.5} /></span>
                  Settings
                </button>
                <div style={{ height: 1, background: D.border, margin: '4px 8px' }} />
                <a href="/auth/logout" style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '9px 12px', borderRadius: 8, fontSize: 13, color: '#dc2626', fontFamily: 'var(--font-body)', textDecoration: 'none' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(220,38,38,0.1)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  <LogOut size={13} strokeWidth={1.5} />
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

// ── Sidebar nav item ──────────────────────────────────────────────────────────
function NavItem({ icon, label, active, onClick }: {
  icon: React.ReactNode; label: string; active: boolean; onClick: () => void;
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
    </button>
  );
}

// ── Management Summary ────────────────────────────────────────────────────────
function ManagementSummaryCard({ summary, generatedAt }: { summary: string; generatedAt: string }) {
  const date = new Date(generatedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  return (
    <div style={{ borderLeft: '2px solid rgba(52,211,153,0.25)', paddingLeft: 18, marginBottom: 4 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(52,211,153,0.6)', fontFamily: 'var(--font-body)' }}>
          AI · Management summary
        </span>
        <span style={{ fontSize: 10, color: D.xfaint, fontFamily: 'var(--font-body)', marginLeft: 'auto' }}>
          {date}
        </span>
      </div>
      <p style={{ margin: 0, fontSize: 13.5, color: D.soft, lineHeight: 1.7, fontFamily: 'var(--font-body)' }}>
        {summary}
      </p>
    </div>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────
export default function DashboardShell({
  practiceId, practiceSlug, practiceName, practiceCity, practiceType,
  userName, userInitial, userEmail, isOAuthUser, logoUrl,
  isPaid,
  profileViews30d, profileViewsPrev30d,
  cityRank, cityTotal, dimensionRanks,
  allServices, practiceServiceIds,
  teamDentists, opportunityInsights,
  googleReviewCount, googleAvgRating,
  initialAccessToken,
}: Props) {
  const searchParams = useSearchParams();
  const googleParam = searchParams.get('google');
  const [tab, setTab] = useState<Tab>(googleParam === 'pick_location' ? 'settings' : 'overview');
  const [accessToken, setAccessToken] = useState(initialAccessToken);

  useEffect(() => {
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

  const viewsDelta = profileViewsPrev30d > 0
    ? Math.round(((profileViews30d - profileViewsPrev30d) / profileViewsPrev30d) * 100)
    : null;

  const navItems: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'overview',      label: 'Practice Health', icon: <Home size={15} strokeWidth={1.5} /> },
    { id: 'intelligence',  label: 'Intelligence',    icon: <Star size={15} strokeWidth={1.4} /> },
    { id: 'team',          label: 'Team',            icon: <Users size={15} strokeWidth={1.5} /> },
    { id: 'profile',       label: 'Profile',         icon: <User size={15} strokeWidth={1.5} /> },
    { id: 'settings',      label: 'Settings',        icon: <Settings size={15} strokeWidth={1.5} /> },
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
              active={tab === item.id} onClick={() => setTab(item.id)} />
          ))}
        </nav>

        {/* Bottom */}
        <div style={{ padding: '12px 16px 20px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          {!isPaid && (
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, color: '#f59e0b', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8, fontFamily: 'var(--font-body)' }}>Free plan</div>
              <Link
                href={`/practices/${practiceSlug}/upgrade`}
                style={{ display: 'block', width: '100%', padding: '9px 0', borderRadius: 8, background: '#f59e0b', color: '#1c1c0a', fontSize: 13, fontWeight: 700, fontFamily: 'var(--font-body)', textDecoration: 'none', textAlign: 'center', boxSizing: 'border-box' }}
              >
                Upgrade
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
              Here's your intelligence overview for {practiceName}
            </p>
          </div>
          <HeaderActions
            userInitial={userInitial}
            onSettingsClick={() => setTab('settings')}
            userEmail={userEmail}
          />
        </div>

        {/* Tab content */}
        <div style={{ flex: 1, padding: '0 32px 40px' }}>
          {tab === 'overview' && (
            <OverviewTab
              isPaid={isPaid}
              practiceSlug={practiceSlug}
              practiceCity={practiceCity}
              profileViews30d={profileViews30d}
              viewsDelta={viewsDelta}
              cityRank={cityRank}
              cityTotal={cityTotal}
              dimensionRanks={dimensionRanks}
              managementSummary={opportunityInsights?.management_summary ?? null}
              managementSummaryDate={opportunityInsights?.generated_at ?? null}
              googleReviewCount={googleReviewCount}
              googleAvgRating={googleAvgRating}
              opportunityInsights={opportunityInsights}
              teamCount={teamDentists.length}
              onGoToIntelligence={() => setTab('intelligence')}
              onGoToSettings={() => setTab('settings')}
              onGoToTeam={() => setTab('team')}
            />
          )}
          {tab === 'intelligence' && (
            <PracticeIntelligenceTab
              practiceId={practiceId}
              practiceSlug={practiceSlug}
              reviewCount={googleReviewCount}
              initialInsights={opportunityInsights}
            />
          )}
          {tab === 'team' && <TeamTab practiceId={practiceId} practiceSlug={practiceSlug} initialDentists={teamDentists} />}
          {tab === 'profile' && <ProfileTab practiceName={practiceName} practiceCity={practiceCity} practiceSlug={practiceSlug} practiceId={practiceId} allServices={allServices} practiceServiceIds={practiceServiceIds} initialLogoUrl={logoUrl} />}
          {tab === 'settings' && <SettingsTab userEmail={userEmail} isOAuthUser={isOAuthUser} practiceId={practiceId} practiceSlug={practiceSlug} practiceName={practiceName} practiceCity={practiceCity} isPaid={isPaid} />}
        </div>
      </div>
    </div>
    </AccessTokenContext.Provider>
  );
}

// ── Setup checklist ───────────────────────────────────────────────────────────
function SetupChecklist({ hasGoogleReviews, hasIntelligence, teamCount, onGoToSettings, onGoToIntelligence, onGoToTeam }: {
  hasGoogleReviews: boolean; hasIntelligence: boolean; teamCount: number;
  onGoToSettings: () => void; onGoToIntelligence: () => void; onGoToTeam: () => void;
}) {
  const steps = [
    { done: true,             label: 'Claim your practice',     sub: 'Verified dashboard access',                         action: null as (() => void) | null, actionLabel: '' },
    { done: hasGoogleReviews, label: 'Connect Google Reviews',  sub: 'Import your reviews for AI analysis',               action: onGoToSettings,     actionLabel: 'Go to Settings' },
    { done: hasIntelligence,  label: 'Run intelligence report', sub: 'Analyse reviews to surface insights and actions',   action: hasGoogleReviews ? onGoToIntelligence : null, actionLabel: 'Go to Intelligence' },
    { done: teamCount > 0,    label: 'Add your team',           sub: 'Add dentists to your practice profile',             action: onGoToTeam,         actionLabel: 'Go to Team' },
  ];
  if (steps.every(s => s.done)) return null;
  const completedCount = steps.filter(s => s.done).length;

  return (
    <div style={{ background: D.card, border: `1px solid ${D.border}`, borderRadius: 12, padding: '18px 20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <MicroLabel text="Getting started" color={D.soft} />
        <span style={{ fontSize: 11, color: D.xfaint, fontFamily: 'var(--font-body)' }}>{completedCount} / {steps.length}</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {steps.map((step, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
            <div style={{ width: 20, height: 20, borderRadius: '50%', flexShrink: 0, marginTop: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: step.done ? 'rgba(52,211,153,0.12)' : 'rgba(255,255,255,0.04)', border: `1.5px solid ${step.done ? 'rgba(52,211,153,0.35)' : 'rgba(255,255,255,0.1)'}` }}>
              {step.done
                ? <CheckCircle size={10} strokeWidth={2.5} style={{ color: D.accent }} />
                : <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'rgba(255,255,255,0.15)', display: 'block' }} />
              }
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: step.done ? 400 : 600, color: step.done ? D.xfaint : D.text, fontFamily: 'var(--font-body)', textDecoration: step.done ? 'line-through' : 'none', marginBottom: step.done ? 0 : 2 }}>
                {step.label}
              </div>
              {!step.done && (
                <div style={{ fontSize: 12, color: D.faint, fontFamily: 'var(--font-body)', lineHeight: 1.45 }}>
                  {step.sub}
                  {step.action && (
                    <button onClick={step.action} style={{ display: 'block', marginTop: 5, fontSize: 11, fontWeight: 600, color: D.accent, background: 'transparent', border: 'none', padding: 0, cursor: 'pointer', fontFamily: 'var(--font-body)' }}>
                      {step.actionLabel} →
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Overview tab ──────────────────────────────────────────────────────────────

const CATEGORY_SCORE_LABELS: Record<string, string> = {
  communication:         'Communication',
  wait_times:            'Wait Times',
  nervous_patients:      'Anxiety Handling',
  pricing_transparency:  'Price Transparency',
  treatment_satisfaction: 'Treatment Results',
  staff_friendliness:    'Staff Friendliness',
  booking_experience:    'Booking Experience',
};

const CATEGORY_SCORE_ORDER = [
  'staff_friendliness', 'communication', 'nervous_patients',
  'treatment_satisfaction', 'pricing_transparency', 'wait_times', 'booking_experience',
];

function OverviewTab({
  isPaid, practiceSlug, practiceCity,
  profileViews30d, viewsDelta,
  cityRank, cityTotal, dimensionRanks,
  managementSummary, managementSummaryDate,
  googleReviewCount, googleAvgRating,
  opportunityInsights, teamCount,
  onGoToIntelligence, onGoToSettings, onGoToTeam,
}: {
  isPaid: boolean; practiceSlug: string; practiceCity: string;
  profileViews30d: number; viewsDelta: number | null;
  cityRank: number; cityTotal: number;
  dimensionRanks: DimensionRank[];
  managementSummary: string | null;
  managementSummaryDate: string | null;
  googleReviewCount: number;
  googleAvgRating: number | null;
  opportunityInsights: OpportunityInsightData | null;
  teamCount: number;
  onGoToIntelligence: () => void;
  onGoToSettings: () => void;
  onGoToTeam: () => void;
}) {
  const rankingMeaningful = cityTotal >= 3 && cityRank > 0;
  const rankingEarly = cityTotal > 0 && cityTotal < 3 && cityRank > 0;

  const categoryScores = opportunityInsights?.category_scores
    ? CATEGORY_SCORE_ORDER
        .filter(key => opportunityInsights.category_scores[key] != null)
        .map(key => ({ key, label: CATEGORY_SCORE_LABELS[key] ?? key, value: opportunityInsights.category_scores[key] }))
    : [];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 300px', gap: 20, alignItems: 'start' }}>

      {/* ── Left column ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, minWidth: 0 }}>

        {/* Management summary */}
        {managementSummary && managementSummaryDate && (
          <ManagementSummaryCard summary={managementSummary} generatedAt={managementSummaryDate} />
        )}

        {/* Google rating hero */}
        {googleReviewCount > 0 ? (
          <div style={{ background: 'linear-gradient(135deg, #1a3829 0%, #0e1c14 100%)', borderRadius: 14, padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 20 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <div style={{ width: 22, height: 22, borderRadius: 5, background: 'rgba(66,133,244,0.15)', border: '1px solid rgba(66,133,244,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                </div>
                <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.5)', fontFamily: 'var(--font-body)' }}>Google Reviews</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 6 }}>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: 48, fontWeight: 800, letterSpacing: '-0.04em', lineHeight: 1, color: 'white' }}>
                  {googleAvgRating?.toFixed(1) ?? '—'}
                </span>
                <span style={{ fontSize: 16, color: 'rgba(255,255,255,0.35)', fontFamily: 'var(--font-body)', fontWeight: 400 }}>/5</span>
              </div>
              <div style={{ display: 'flex', gap: 2, marginBottom: 6 }}>
                {[1, 2, 3, 4, 5].map(i => {
                  const filled = googleAvgRating != null && i <= Math.round(googleAvgRating);
                  return <Star key={i} size={13} strokeWidth={0} fill={filled ? '#fbbf24' : 'rgba(255,255,255,0.18)'} />;
                })}
              </div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', fontFamily: 'var(--font-body)' }}>
                {googleReviewCount} Google review{googleReviewCount !== 1 ? 's' : ''}
              </div>
            </div>

            {isPaid && profileViews30d > 0 && (
              <div style={{ borderLeft: '1px solid rgba(255,255,255,0.12)', paddingLeft: 24 }}>
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
        ) : (
          /* No Google data yet — prompt to connect */
          <div style={{ background: D.card, border: `1.5px solid ${D.border}`, borderRadius: 14, padding: '24px 28px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(66,133,244,0.1)', border: '1px solid rgba(66,133,244,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700, color: D.text, margin: '0 0 6px', letterSpacing: '-0.01em' }}>
                  Connect Google Reviews
                </h3>
                <p style={{ fontSize: 13, color: D.soft, fontFamily: 'var(--font-body)', margin: '0 0 16px', lineHeight: 1.6 }}>
                  Import your Google reviews to unlock AI intelligence analysis. Takes under a minute.
                </p>
                <button
                  onClick={onGoToSettings}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '9px 18px', borderRadius: 8, background: D.accent, color: '#0d0d12', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600, fontFamily: 'var(--font-body)' }}
                >
                  Connect in Settings →
                </button>
              </div>
            </div>
          </div>
        )}

        {/* AI category scores */}
        {categoryScores.length > 0 && (
          <div style={{ background: D.card, border: `1px solid ${D.border}`, borderRadius: 12, padding: '18px 20px' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 14 }}>
              <MicroLabel text="AI category scores" color={D.soft} />
              <span style={{ fontSize: 10, color: D.xfaint, fontFamily: 'var(--font-body)' }}>from {opportunityInsights!.review_count} reviews</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
              {categoryScores.map(({ key, label, value }) => {
                const color = value >= 4.3 ? '#16a34a' : value >= 3.5 ? '#ca8a04' : '#ea580c';
                return (
                  <div key={key}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                      <span style={{ fontSize: 12, color: D.soft, fontFamily: 'var(--font-body)' }}>{label}</span>
                      <span style={{ fontSize: 12, fontWeight: 700, color, fontFamily: 'var(--font-body)' }}>
                        {value.toFixed(1)}
                      </span>
                    </div>
                    <div style={{ height: 5, borderRadius: 3, background: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${(value / 5) * 100}%`, background: color, borderRadius: 3, transition: 'width 0.6s ease' }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Getting started checklist */}
        <SetupChecklist
          hasGoogleReviews={googleReviewCount > 0}
          hasIntelligence={opportunityInsights != null}
          teamCount={teamCount}
          onGoToSettings={onGoToSettings}
          onGoToIntelligence={onGoToIntelligence}
          onGoToTeam={onGoToTeam}
        />

        {/* No intelligence yet — CTA */}
        {!opportunityInsights && googleReviewCount >= 2 && (
          <div style={{ background: D.accentPale, border: `1px solid rgba(52,211,153,0.2)`, borderRadius: 12, padding: '18px 20px', display: 'flex', alignItems: 'center', gap: 14 }}>
            <Star size={20} strokeWidth={1.4} style={{ color: D.accent, flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: D.text, fontFamily: 'var(--font-body)', marginBottom: 3 }}>
                Intelligence analysis ready
              </div>
              <div style={{ fontSize: 13, color: D.soft, fontFamily: 'var(--font-body)' }}>
                {googleReviewCount} Google reviews imported — run your first AI report.
              </div>
            </div>
            <button
              onClick={onGoToIntelligence}
              style={{ flexShrink: 0, padding: '9px 16px', borderRadius: 8, background: D.accent, color: '#0d0d12', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600, fontFamily: 'var(--font-body)', whiteSpace: 'nowrap' }}
            >
              Run analysis →
            </button>
          </div>
        )}
      </div>

      {/* ── Right column ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

        {/* Practice snapshot */}
        <div style={{ background: D.card, border: `1px solid ${D.border}`, borderRadius: 12, padding: '18px 20px' }}>
          <MicroLabel text="Practice snapshot" color={D.soft} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {([
              { label: 'Google reviews', value: googleReviewCount > 0 ? String(googleReviewCount) : null },
              { label: 'Average rating',  value: googleAvgRating != null ? `★ ${googleAvgRating.toFixed(1)}` : null },
              { label: 'Team members',    value: teamCount > 0 ? String(teamCount) : null },
              { label: 'AI report',       value: opportunityInsights ? 'Generated' : null },
            ] as { label: string; value: string | null }[]).map(({ label, value }) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 12, color: D.faint, fontFamily: 'var(--font-body)' }}>{label}</span>
                <span style={{ fontSize: 12, fontWeight: 600, color: value ? D.mid : D.xfaint, fontFamily: 'var(--font-body)' }}>
                  {value ?? '—'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Profile views (free plan upsell) */}
        {!isPaid && (
          <div style={{ background: D.card, border: `1px solid ${D.border}`, borderRadius: 12, padding: '18px 20px', position: 'relative', overflow: 'hidden' }}>
            <MicroLabel text="Profile views" color={D.soft} />
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 36, fontWeight: 800, color: D.text, letterSpacing: '-0.03em', lineHeight: 1, filter: 'blur(7px)', userSelect: 'none', marginBottom: 4 }}>1,240</div>
            <div style={{ fontSize: 11, color: D.faint, fontFamily: 'var(--font-body)', filter: 'blur(4px)', userSelect: 'none' }}>↑ 24% vs last month</div>
            <Link href={`/practices/${practiceSlug}/upgrade`} style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'rgba(13,13,18,0.82)', textDecoration: 'none', gap: 5 }}>
              <Lock size={14} strokeWidth={1.8} style={{ color: D.accent }} />
              <span style={{ fontSize: 12, fontWeight: 700, color: D.accent, fontFamily: 'var(--font-body)' }}>Unlock with Pro</span>
            </Link>
          </div>
        )}

        {/* Local standing */}
        {isPaid && (rankingMeaningful || rankingEarly) && (
          <div style={{ background: D.card, border: `1px solid ${D.border}`, borderRadius: 12, padding: '18px 20px' }}>
            <MicroLabel text={`${practiceCity} standing`} color={D.soft} />
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

        {/* Intelligence summary card */}
        {opportunityInsights && (
          <div style={{ background: D.card, border: `1px solid ${D.border}`, borderRadius: 12, padding: '18px 20px' }}>
            <MicroLabel text="Last intelligence report" color={D.soft} />
            <div style={{ fontSize: 13, color: D.mid, fontFamily: 'var(--font-body)', marginBottom: 12 }}>
              {new Date(opportunityInsights.generated_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
              <span style={{ color: D.faint }}> · {opportunityInsights.review_count} reviews analysed</span>
            </div>
            <button
              onClick={onGoToIntelligence}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 600, color: D.accent, background: D.accentPale, border: `1px solid rgba(52,211,153,0.2)`, borderRadius: 6, padding: '5px 12px', cursor: 'pointer', fontFamily: 'var(--font-body)' }}
            >
              <Star size={11} strokeWidth={1.4} />
              View full report
            </button>
          </div>
        )}

        {/* Pro upsell: competitor benchmarking */}
        {!isPaid && (
          <div style={{ background: D.card, border: `1px solid ${D.border}`, borderRadius: 12, padding: '18px 20px', position: 'relative', overflow: 'hidden' }}>
            <MicroLabel text="Local comparison" color={D.soft} />
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
              <Lock size={14} strokeWidth={1.8} style={{ color: D.accent }} />
              <span style={{ fontSize: 12, fontWeight: 700, color: D.accent, fontFamily: 'var(--font-body)' }}>Competitor benchmarking</span>
              <span style={{ fontSize: 11, color: D.soft, fontFamily: 'var(--font-body)' }}>See how you rank locally</span>
            </Link>
          </div>
        )}
      </div>
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
  const [selectedServices, setSelectedServices] = useState<Set<string>>(new Set(practiceServiceIds));
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState<string | null>(null);
  const [logoUrl, setLogoUrl] = useState<string | null>(initialLogoUrl);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoUploading, setLogoUploading] = useState(false);
  const [logoMsg, setLogoMsg] = useState<string | null>(null);
  const accessToken = useContext(AccessTokenContext);

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

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32, alignItems: 'start' }}>
      <div>

      {/* Logo upload */}
      <div style={{ marginBottom: 32 }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 800, color: D.text, margin: '0 0 6px', letterSpacing: '-0.02em' }}>
          Practice logo
        </h2>
        <p style={{ fontSize: 13, color: D.soft, fontFamily: 'var(--font-body)', margin: '0 0 16px', lineHeight: 1.6 }}>
          Upload your practice logo — it appears on your dashboard.
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 72, height: 72, borderRadius: 14, border: `1.5px solid ${D.border}`, background: D.card2, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 }}>
            {(logoPreview ?? logoUrl)
              ? <img src={logoPreview ?? logoUrl!} alt="Logo preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : <span style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 700, color: D.accent }}>{practiceName.charAt(0).toUpperCase()}</span>
            }
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <label style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 8, border: `1.5px solid ${D.border}`, background: D.card2, cursor: 'pointer', fontSize: 13, fontWeight: 500, color: D.mid, fontFamily: 'var(--font-body)' }}>
              <Upload size={14} strokeWidth={1.5} />
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

      </div>

      <div>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, marginBottom: 16 }}>
          <div>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 700, color: D.text, margin: '0 0 4px', letterSpacing: '-0.02em' }}>Services offered</h3>
            <p style={{ fontSize: 13, color: D.soft, fontFamily: 'var(--font-body)', margin: 0, lineHeight: 1.5 }}>
              Tell us what your practice offers — used to surface you in relevant intelligence benchmarks.
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
              <MicroLabel text={CATEGORY_LABELS[category] ?? category} color={D.soft} />
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
                        <CheckCircle size={11} strokeWidth={1.5} style={{ color: D.accent }} />
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

// ── Google Business Profile connection ───────────────────────────────────────
function GoogleConnectionSection({ practiceId, defaultSearchQuery }: { practiceId: string; defaultSearchQuery: string }) {
  const [searchQuery, setSearchQuery]   = useState(defaultSearchQuery);
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(null);
  const [reviewCount, setReviewCount]   = useState(0);
  const [syncing, setSyncing]           = useState(false);
  const [syncPhase, setSyncPhase]       = useState<'idle' | 'submitting' | 'waiting'>('idle');
  const [syncMsg, setSyncMsg]           = useState<string | null>(null);
  const [loaded, setLoaded]             = useState(false);

  useEffect(() => {
    fetch(`/api/google-business/connection?practiceId=${practiceId}`)
      .then(r => r.json())
      .then(d => {
        if (d.connection) {
          setLastSyncedAt(d.connection.last_synced_at ?? null);
          setReviewCount(d.connection.review_count ?? 0);
          if (d.connection.search_query) setSearchQuery(d.connection.search_query);
          if (d.connection.pending_request_id) {
            setSyncing(true);
            setSyncPhase('waiting');
            resumePoll(d.connection.pending_request_id);
          }
        }
        setLoaded(true);
      })
      .catch(() => setLoaded(true));
  }, [practiceId]); // eslint-disable-line react-hooks/exhaustive-deps

  function resumePoll(requestId: string, attempts = 0) {
    const poll = async (): Promise<void> => {
      attempts++;
      if (attempts > 120) {
        setSyncMsg('Import is taking longer than expected — check back in a few minutes.');
        setSyncing(false); setSyncPhase('idle');
        return;
      }
      const statusRes = await fetch(
        `/api/google-business/sync-status?requestId=${requestId}&practiceId=${practiceId}`,
      );
      const statusData = await statusRes.json();
      if (!statusRes.ok) {
        setSyncMsg(statusData.error ?? 'Status check failed');
        setSyncing(false); setSyncPhase('idle');
        return;
      }
      if (statusData.status === 'complete') {
        setSyncMsg(`Imported ${statusData.imported} reviews`);
        setLastSyncedAt(new Date().toISOString());
        setReviewCount(statusData.total ?? statusData.imported);
        setSyncing(false); setSyncPhase('idle');
        return;
      }
      setTimeout(poll, 10000);
    };
    setTimeout(poll, 5000);
  }

  async function syncReviews() {
    setSyncing(true);
    setSyncMsg(null);
    setSyncPhase('submitting');

    const postRes = await fetch('/api/google-business/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ practiceId, searchQuery }),
    });
    const postData = await postRes.json();
    if (!postRes.ok) {
      setSyncMsg(postData.error ?? 'Failed to submit import');
      setSyncing(false); setSyncPhase('idle');
      return;
    }

    setSyncPhase('waiting');
    resumePoll(postData.requestId as string);
  }

  if (!loaded) return null;

  return (
    <div style={{ background: D.card, border: `1px solid ${D.border}`, borderRadius: 12, padding: '24px 28px', marginBottom: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
        <div style={{ width: 28, height: 28, borderRadius: 7, background: 'rgba(66,133,244,0.12)', border: '1px solid rgba(66,133,244,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
        </div>
        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700, color: D.text, margin: 0, letterSpacing: '-0.01em' }}>Google Reviews</h3>
      </div>

      <p style={{ fontSize: 13, color: D.soft, fontFamily: 'var(--font-body)', lineHeight: 1.6, margin: '0 0 16px' }}>
        Import your Google reviews for intelligence analysis. They are used only in your dashboard — never shown publicly.
      </p>

      <div style={{ marginBottom: 14 }}>
        <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: D.soft, fontFamily: 'var(--font-body)', marginBottom: 5 }}>
          Search query
        </label>
        <input
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="e.g. Smith Dental London"
          style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: `1.5px solid ${D.border2}`, fontSize: 13, fontFamily: 'var(--font-body)', outline: 'none', boxSizing: 'border-box', background: D.card2, color: D.text }}
        />
        <p style={{ fontSize: 11, color: D.faint, fontFamily: 'var(--font-body)', margin: '5px 0 0' }}>
          Edit if your practice name on Google differs from SmileProof.
        </p>
      </div>

      {lastSyncedAt && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, padding: '7px 10px', background: D.accentPale, border: '1px solid rgba(52,211,153,0.2)', borderRadius: 8 }}>
          <CheckCircle size={12} strokeWidth={1.5} style={{ color: D.accent, flexShrink: 0 }} />
          <span style={{ fontSize: 12, color: D.accent, fontFamily: 'var(--font-body)' }}>
            Last imported: {new Date(lastSyncedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
            {reviewCount > 0 && ` · ${reviewCount} reviews`}
          </span>
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <button
        onClick={syncReviews}
        disabled={syncing || !searchQuery.trim()}
        style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '9px 18px', borderRadius: 8, border: `1.5px solid ${D.border}`, background: D.card2, color: D.mid, fontSize: 13, fontWeight: 600, fontFamily: 'var(--font-body)', cursor: (syncing || !searchQuery.trim()) ? 'not-allowed' : 'pointer', opacity: !searchQuery.trim() ? 0.5 : 1 }}
      >
        <RefreshCw size={13} strokeWidth={1.5} style={{ animation: syncing ? 'spin 1s linear infinite' : 'none' }} />
        {syncPhase === 'submitting' ? 'Submitting…' : syncPhase === 'waiting' ? 'Fetching reviews…' : lastSyncedAt ? 'Re-import reviews' : 'Import Google reviews'}
      </button>

      {syncMsg && (
        <p style={{ fontSize: 12, fontFamily: 'var(--font-body)', color: syncMsg.startsWith('Imported') ? D.accent : '#f87171', marginTop: 10 }}>
          {syncMsg}
        </p>
      )}
    </div>
  );
}

// ── Billing section ───────────────────────────────────────────────────────────
function BillingSection({ isPaid, practiceSlug }: { isPaid: boolean; practiceSlug: string }) {
  const [loading, setLoading] = useState(false);

  async function openPortal() {
    setLoading(true);
    try {
      const res = await fetch('/api/stripe/portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug: practiceSlug }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ background: D.card, border: `1px solid ${D.border}`, borderRadius: 12, padding: '24px 28px', marginBottom: 16 }}>
      <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700, color: D.text, margin: '0 0 16px', letterSpacing: '-0.01em' }}>Billing</h3>
      {isPaid ? (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: D.accent, background: D.accentPale, border: '1px solid rgba(52,211,153,0.25)', borderRadius: 20, padding: '3px 10px', fontFamily: 'var(--font-body)' }}>Pro plan active</span>
          </div>
          <button
            onClick={openPortal}
            disabled={loading}
            style={{ padding: '9px 20px', borderRadius: 8, border: `1.5px solid ${D.border}`, background: D.card2, color: D.mid, fontSize: 13, fontWeight: 600, fontFamily: 'var(--font-body)', cursor: loading ? 'not-allowed' : 'pointer' }}
          >
            {loading ? 'Opening…' : 'Manage billing'}
          </button>
        </div>
      ) : (
        <div>
          <p style={{ fontSize: 13, color: D.soft, fontFamily: 'var(--font-body)', margin: '0 0 14px' }}>
            You&apos;re on the free plan.
          </p>
          <a
            href={`/practices/${practiceSlug}/upgrade`}
            style={{ display: 'inline-block', padding: '9px 20px', borderRadius: 8, background: D.accent, color: 'white', fontSize: 13, fontWeight: 600, fontFamily: 'var(--font-body)', textDecoration: 'none' }}
          >
            Upgrade
          </a>
        </div>
      )}
    </div>
  );
}

// ── Settings tab ──────────────────────────────────────────────────────────────
function SettingsTab({ userEmail, isOAuthUser, practiceId, practiceSlug, practiceCity, isPaid, practiceName }: {
  userEmail: string; isOAuthUser: boolean;
  practiceId: string; practiceSlug: string; practiceName: string; practiceCity: string; isPaid: boolean;
}) {
  const [pwNew, setPwNew] = useState('');
  const [pwConfirm, setPwConfirm] = useState('');
  const [pwSaving, setPwSaving] = useState(false);
  const [pwMsg, setPwMsg] = useState<{ ok: boolean; text: string } | null>(null);

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
      setPwNew(''); setPwConfirm('');
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

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 340px', gap: 20, alignItems: 'start' }}>
      {/* Google Reviews — left (primary) */}
      <GoogleConnectionSection practiceId={practiceId} defaultSearchQuery={`${practiceName} ${practiceCity}`} />
      {/* Right column: Billing + Account */}
      <div>
      <BillingSection isPaid={isPaid} practiceSlug={practiceSlug} />
      <Section title="Account">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', borderRadius: 8, background: D.card2, marginBottom: 16, border: `1px solid ${D.border}` }}>
          <Mail size={14} strokeWidth={1.5} style={{ flexShrink: 0, color: D.soft }} />
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
      </div>
      </div>
    </div>
  );
}
