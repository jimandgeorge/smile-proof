'use client';

import { useState, useTransition, useContext } from 'react';
import { generatePracticeIntelligence } from './actions';
import type { OpportunityInsightData } from './actions';
import { AlertTriangle, Info, Star, RefreshCw } from 'lucide-react';
import { AccessTokenContext } from './token-context';
import { createClient } from '@/lib/supabase';

const D = {
  bg: '#0d0d12', card: '#13131a', card2: '#17171f',
  border: 'rgba(255,255,255,0.07)', border2: 'rgba(255,255,255,0.12)',
  divider: 'rgba(255,255,255,0.05)',
  text: '#edeef5', mid: 'rgba(237,238,245,0.72)', soft: 'rgba(237,238,245,0.5)',
  faint: 'rgba(237,238,245,0.28)', xfaint: 'rgba(237,238,245,0.13)',
  accent: '#34d399', accentPale: 'rgba(52,211,153,0.08)',
  gold: '#fbbf24',
} as const;

type Props = {
  practiceId: string;
  practiceSlug: string;
  reviewCount: number;
  initialInsights: OpportunityInsightData | null;
};

const CATEGORY_LABELS: Record<string, string> = {
  communication:          'Communication',
  wait_times:             'Wait Times',
  nervous_patients:       'Nervous Patients',
  pricing_transparency:   'Pricing Clarity',
  treatment_satisfaction: 'Treatment Results',
  staff_friendliness:     'Staff Friendliness',
  booking_experience:     'Booking Experience',
};

const CATEGORY_IMPACT: Record<string, string> = {
  communication:          'Linked to treatment acceptance confidence',
  wait_times:             'Affects repeat bookings & review sentiment',
  nervous_patients:       'Unlocks underserved high-value patient segment',
  pricing_transparency:   'Affects conversion from enquiry to booking',
  treatment_satisfaction: 'Primary driver of referrals & 5-star reviews',
  staff_friendliness:     'Core retention driver across all patient types',
  booking_experience:     'First impression — shapes willingness to return',
};

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const h = Math.floor(diff / 3600000);
  if (h < 1) return 'just now';
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d} day${d !== 1 ? 's' : ''} ago`;
}

function scoreColor(s: number) {
  if (s >= 4.3) return '#34d399';
  if (s >= 3.5) return '#a3e635';
  if (s >= 2.5) return '#fbbf24';
  return '#f87171';
}

function trustLabel(s: number): string {
  if (s >= 4.5) return 'Excellent';
  if (s >= 4.0) return 'Strong';
  if (s >= 3.5) return 'Good';
  if (s >= 2.5) return 'Fair';
  return 'Needs attention';
}

// ── Micro label ───────────────────────────────────────────────────────────────
function MicroLabel({ text, color = D.faint }: { text: string; color?: string }) {
  return (
    <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color, fontFamily: 'var(--font-body)', marginBottom: 10 }}>
      {text}
    </div>
  );
}

// ── Section divider ───────────────────────────────────────────────────────────
function Divider({ label }: { label?: string }) {
  if (!label) return <div style={{ height: 1, background: D.divider, margin: '36px 0' }} />;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '36px 0 24px' }}>
      <div style={{ flex: 1, height: 1, background: D.divider }} />
      <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: D.xfaint, fontFamily: 'var(--font-body)', whiteSpace: 'nowrap' }}>{label}</span>
      <div style={{ flex: 1, height: 1, background: D.divider }} />
    </div>
  );
}

// ── Confidence notice ─────────────────────────────────────────────────────────
function ConfidenceBanner({ count }: { count: number }) {
  if (count >= 15) return null;
  const isLow = count < 5;
  return (
    <div style={{
      display: 'flex', alignItems: 'flex-start', gap: 9,
      background: isLow ? 'rgba(251,191,36,0.05)' : 'transparent',
      border: `1px solid ${isLow ? 'rgba(251,191,36,0.15)' : D.border}`,
      borderRadius: 9, padding: '10px 13px', marginBottom: 28,
    }}>
      {isLow
        ? <AlertTriangle size={13} strokeWidth={1.2} style={{ flexShrink: 0, marginTop: 1, color: D.gold }} aria-hidden />
        : <Info size={13} strokeWidth={1.3} style={{ flexShrink: 0, marginTop: 1, color: D.faint }} aria-hidden />
      }
      <span style={{ fontSize: 12, color: isLow ? 'rgba(251,191,36,0.7)' : D.faint, fontFamily: 'var(--font-body)', lineHeight: 1.6 }}>
        <strong style={{ color: isLow ? D.gold : D.soft, fontWeight: 600 }}>
          {isLow ? 'Low confidence' : 'Early signal'}
        </strong>
        {' '}— {isLow
          ? `based on ${count} review${count !== 1 ? 's' : ''} only. Patterns will sharpen with more data.`
          : `based on ${count} reviews. Useful signal, but trends may shift as more come in.`
        }
      </span>
    </div>
  );
}

// ── Hero trust score ──────────────────────────────────────────────────────────
function TrustScoreHero({ scores, reviewCount }: { scores: Record<string, number>; reviewCount: number }) {
  const vals = Object.values(scores).filter(s => s != null && s > 0);
  if (vals.length === 0) return null;
  const avg = vals.reduce((a, b) => a + b, 0) / vals.length;
  const color = scoreColor(avg);
  const topEntry = Object.entries(scores)
    .filter(([, v]) => v > 0)
    .sort(([, a], [, b]) => b - a)[0];

  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 40, marginBottom: 8, paddingBottom: 32, borderBottom: `1px solid ${D.divider}` }}>
      <div>
        <MicroLabel text="Patient Trust Score" color={D.faint} />
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 56, fontWeight: 800, color, lineHeight: 1, letterSpacing: '-0.04em' }}>
            {avg.toFixed(1)}
          </span>
          <span style={{ fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: 600, color: D.soft, letterSpacing: '-0.01em' }}>/ 5</span>
        </div>
        <div style={{ fontSize: 13, color: D.soft, fontFamily: 'var(--font-body)', marginTop: 5, fontWeight: 500 }}>
          {trustLabel(avg)}
          <span style={{ color: D.xfaint, marginLeft: 8 }}>·</span>
          <span style={{ color: D.faint, marginLeft: 8 }}>{vals.length} categories rated</span>
        </div>
      </div>

      {topEntry && (
        <div style={{ paddingLeft: 32, borderLeft: `1px solid ${D.divider}` }}>
          <MicroLabel text="Strongest signal" color={D.faint} />
          <div style={{ fontSize: 16, fontWeight: 700, color: D.text, fontFamily: 'var(--font-body)', letterSpacing: '-0.01em' }}>
            {CATEGORY_LABELS[topEntry[0]] ?? topEntry[0]}
          </div>
          <div style={{ fontSize: 12, color: D.soft, fontFamily: 'var(--font-body)', marginTop: 3 }}>
            {topEntry[1].toFixed(1)} score · {CATEGORY_IMPACT[topEntry[0]] ?? ''}
          </div>
        </div>
      )}

      <div style={{ paddingLeft: 32, borderLeft: `1px solid ${D.divider}` }}>
        <MicroLabel text="Data sources" color={D.faint} />
        <div style={{ fontSize: 16, fontWeight: 700, color: D.text, fontFamily: 'var(--font-body)', letterSpacing: '-0.01em' }}>
          {reviewCount} reviews
        </div>
        <div style={{ fontSize: 12, color: D.soft, fontFamily: 'var(--font-body)', marginTop: 3 }}>
          SmileProof + Google
        </div>
      </div>
    </div>
  );
}

// ── Priority focus (AI recommendation) ───────────────────────────────────────
function PriorityFocus({ recommendation, rationale, evidence }: {
  recommendation: string; rationale: string; evidence?: string;
}) {
  return (
    <div style={{ marginBottom: 36 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
        <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(52,211,153,0.6)', fontFamily: 'var(--font-body)' }}>
          AI · Priority focus
        </div>
      </div>
      <div style={{ borderLeft: '2px solid rgba(52,211,153,0.25)', paddingLeft: 18 }}>
        <p style={{ fontSize: 17, fontWeight: 700, color: D.text, fontFamily: 'var(--font-body)', margin: '0 0 8px', lineHeight: 1.35, letterSpacing: '-0.02em' }}>
          {recommendation}
        </p>
        <p style={{ fontSize: 13.5, color: D.soft, fontFamily: 'var(--font-body)', margin: evidence ? '0 0 12px' : '0', lineHeight: 1.65 }}>
          {rationale}
        </p>
        {evidence && (
          <p style={{ fontSize: 12.5, color: D.faint, fontFamily: 'var(--font-body)', margin: 0, fontStyle: 'italic', lineHeight: 1.55 }}>
            &ldquo;{evidence}&rdquo;
          </p>
        )}
      </div>
    </div>
  );
}

// ── Signal item (strength / area) ─────────────────────────────────────────────
function SignalItem({ type, category, text, stat, statLabel, quote }: {
  type: 'strength' | 'weakness';
  category: string; text: string;
  stat?: number; statLabel?: string;
  quote?: string;
}) {
  const isS = type === 'strength';
  const accentCol = isS ? 'rgba(52,211,153,0.3)' : 'rgba(251,191,36,0.3)';
  const labelCol  = isS ? D.accent : D.gold;

  return (
    <div style={{ paddingLeft: 14, borderLeft: `2px solid ${accentCol}`, paddingTop: 2, paddingBottom: 2 }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 8, marginBottom: 4 }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: D.text, fontFamily: 'var(--font-body)', letterSpacing: '-0.01em' }}>
          {CATEGORY_LABELS[category] ?? category}
        </span>
        {stat != null && (
          <span style={{ fontSize: 11.5, fontWeight: 600, color: labelCol, fontFamily: 'var(--font-body)', flexShrink: 0, opacity: 0.8 }}>
            {stat} {statLabel}
          </span>
        )}
      </div>
      {CATEGORY_IMPACT[category] && (
        <div style={{ fontSize: 11, color: D.xfaint, fontFamily: 'var(--font-body)', lineHeight: 1.4, marginBottom: 5 }}>
          {CATEGORY_IMPACT[category]}
        </div>
      )}
      <p style={{ fontSize: 12.5, color: D.soft, fontFamily: 'var(--font-body)', lineHeight: 1.6, margin: quote ? '0 0 8px' : '0' }}>
        {text}
      </p>
      {quote && (
        <p style={{ fontSize: 12, color: D.faint, fontFamily: 'var(--font-body)', margin: 0, fontStyle: 'italic', lineHeight: 1.5 }}>
          &ldquo;{quote}&rdquo;
        </p>
      )}
    </div>
  );
}

// ── Impact badge ──────────────────────────────────────────────────────────────
const IMPACT_CFG = {
  high_impact: { label: 'High impact', bg: 'rgba(234,88,12,0.08)',  text: '#fb923c', border: 'rgba(234,88,12,0.2)' },
  quick_win:   { label: 'Quick win',   bg: D.accentPale,            text: D.accent,  border: 'rgba(52,211,153,0.18)' },
  monitor:     { label: 'Monitor',     bg: 'rgba(255,255,255,0.03)', text: D.faint,   border: D.border },
} as const;

function ImpactBadge({ impact }: { impact?: string }) {
  const cfg = IMPACT_CFG[impact as keyof typeof IMPACT_CFG];
  if (!cfg) return null;
  return (
    <span style={{
      fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em',
      padding: '2px 7px', borderRadius: 20, whiteSpace: 'nowrap', flexShrink: 0,
      background: cfg.bg, color: cfg.text, border: `1px solid ${cfg.border}`,
      fontFamily: 'var(--font-body)',
    }}>
      {cfg.label}
    </span>
  );
}

// ── Opportunity card ──────────────────────────────────────────────────────────
function OpportunityCard({ item, index }: { item: OpportunityInsightData['opportunities'][0]; index: number }) {
  const impact = (item as any).impact as string | undefined;
  const evidence = (item as any).evidence as string | undefined;

  return (
    <div style={{ background: D.card2, borderRadius: 10, padding: '16px 18px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 10 }}>
        <div style={{ width: 22, height: 22, borderRadius: 6, flexShrink: 0, background: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.15)', color: D.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontSize: 11, fontWeight: 800, marginTop: 1 }}>
          {index + 1}
        </div>
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: 14, fontWeight: 700, color: D.text, fontFamily: 'var(--font-body)', margin: '0 0 5px', lineHeight: 1.35, letterSpacing: '-0.01em' }}>
            {item.recommendation}
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: 'rgba(52,211,153,0.7)', background: D.accentPale, borderRadius: 20, padding: '1px 8px', fontFamily: 'var(--font-body)' }}>
              {CATEGORY_LABELS[item.category] ?? item.category}
            </span>
            <ImpactBadge impact={impact} />
          </div>
        </div>
      </div>
      <p style={{ fontSize: 13, color: D.soft, fontFamily: 'var(--font-body)', lineHeight: 1.65, margin: evidence ? '0 0 10px' : '0', paddingLeft: 34 }}>
        {item.rationale}
      </p>
      {evidence && (
        <p style={{ fontSize: 12, color: D.faint, fontFamily: 'var(--font-body)', margin: '0', fontStyle: 'italic', paddingLeft: 34, lineHeight: 1.5 }}>
          &ldquo;{evidence}&rdquo;
        </p>
      )}
    </div>
  );
}

// ── Category scores ───────────────────────────────────────────────────────────
function CategoryScores({ scores }: { scores: Record<string, number> }) {
  const entries = Object.entries(CATEGORY_LABELS)
    .map(([key, label]) => ({ key, label, score: scores[key] ?? null }))
    .sort((a, b) => (b.score ?? 0) - (a.score ?? 0));

  return (
    <div style={{ background: D.card, border: `1px solid ${D.border}`, borderRadius: 12, padding: '18px 20px' }}>
      <MicroLabel text="Category Breakdown" />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
        {entries.map(({ key, label, score }) => (
          <div key={key}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
              <span style={{ fontSize: 12, color: score != null ? D.soft : D.xfaint, fontFamily: 'var(--font-body)', width: 140, flexShrink: 0 }}>{label}</span>
              <div style={{ flex: 1, height: 3, borderRadius: 2, background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: score != null ? `${(score / 5) * 100}%` : '0%', background: score != null ? scoreColor(score) : D.xfaint, borderRadius: 2, transition: 'width 0.6s cubic-bezier(0.4,0,0.2,1)', opacity: score != null ? 1 : 0.4 }} />
              </div>
              <span style={{ fontSize: 12, fontWeight: 600, fontFamily: 'var(--font-body)', color: score != null ? scoreColor(score) : D.xfaint, width: 26, textAlign: 'right', flexShrink: 0 }}>
                {score != null ? score.toFixed(1) : '—'}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────
export default function PracticeIntelligenceTab({ practiceId, practiceSlug, reviewCount, initialInsights }: Props) {
  const [insights, setInsights] = useState<OpportunityInsightData | null>(initialInsights);
  const [error, setError] = useState('');
  const [isPending, startTransition] = useTransition();
  const accessToken = useContext(AccessTokenContext);

  const isStale = insights != null && reviewCount > insights.review_count;
  const newSince = insights ? reviewCount - insights.review_count : 0;

  const handleGenerate = () => {
    setError('');
    startTransition(async () => {
      // Always get a fresh token — the initial token from page load expires after ~1 hour
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token ?? accessToken;

      const result = await generatePracticeIntelligence(token, practiceId, practiceSlug);
      if (result.error) { setError(result.error); return; }
      if (result.insights) setInsights(result.insights);
    });
  };

  // ── Empty state ───────────────────────────────────────────────────────────
  if (!insights && !isPending) {
    return (
      <div>
        <div style={{ marginBottom: 28 }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 800, color: D.text, margin: '0 0 4px', letterSpacing: '-0.02em' }}>Practice Intelligence</h2>
          <p style={{ fontSize: 13, color: D.faint, fontFamily: 'var(--font-body)', margin: 0 }}>Patterns from your patient reviews — what&rsquo;s working, what to fix, where to grow.</p>
        </div>
        <div style={{ background: D.card, border: `1px solid ${D.border}`, borderRadius: 14, padding: '52px 44px', textAlign: 'center' }}>
          <div style={{ width: 48, height: 48, borderRadius: 12, background: D.accentPale, border: '1px solid rgba(52,211,153,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
            <Star size={20} strokeWidth={1.5} style={{ color: D.accent }} aria-hidden />
          </div>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 700, color: D.text, margin: '0 0 8px', letterSpacing: '-0.01em' }}>Generate your practice report</h3>
          <p style={{ fontSize: 13, color: D.soft, fontFamily: 'var(--font-body)', lineHeight: 1.7, maxWidth: 360, margin: '0 auto 28px' }}>
            Reads your {reviewCount} patient review{reviewCount !== 1 ? 's' : ''} and surfaces patterns — what patients value, what frustrates them, and what to act on.
          </p>
          {reviewCount < 2 ? (
            <p style={{ fontSize: 13, color: D.faint, fontFamily: 'var(--font-body)' }}>You need at least 2 published reviews to generate a report.</p>
          ) : (
            <>
              <button onClick={handleGenerate} style={{ padding: '11px 28px', borderRadius: 9, background: D.accent, color: '#0d0d12', border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 700, fontFamily: 'var(--font-body)', marginBottom: 12, letterSpacing: '-0.01em' }}>
                Generate report
              </button>
              <p style={{ fontSize: 12, color: D.xfaint, fontFamily: 'var(--font-body)', margin: 0 }}>Takes ~15 seconds · Cached until you refresh</p>
            </>
          )}
          {error && <p style={{ fontSize: 13, color: '#f87171', fontFamily: 'var(--font-body)', marginTop: 14 }}>{error}</p>}
        </div>
      </div>
    );
  }

  // ── Loading state — only for initial generation (no existing report yet) ──
  if (isPending && !insights) {
    return (
      <div>
        <div style={{ marginBottom: 28 }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 800, color: D.text, margin: '0 0 4px', letterSpacing: '-0.02em' }}>Practice Intelligence</h2>
        </div>
        <div style={{ background: D.card, border: `1px solid ${D.border}`, borderRadius: 14, padding: '60px 44px', textAlign: 'center' }}>
          <div style={{ width: 36, height: 36, borderRadius: '50%', border: `3px solid ${D.accentPale}`, borderTop: `3px solid ${D.accent}`, animation: 'spin 0.8s linear infinite', margin: '0 auto 20px' }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          <p style={{ fontSize: 14, fontWeight: 600, color: D.text, fontFamily: 'var(--font-body)', margin: '0 0 4px' }}>Reading {reviewCount} reviews…</p>
          <p style={{ fontSize: 13, color: D.faint, fontFamily: 'var(--font-body)', margin: 0 }}>About 15 seconds.</p>
        </div>
      </div>
    );
  }

  // ── Report ────────────────────────────────────────────────────────────────
  const ins = insights!;
  const topOpportunity = ins.opportunities[0];
  const remainingOpportunities = ins.opportunities.slice(1);

  return (
    <div>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, marginBottom: 32 }}>
        <div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 800, color: D.text, margin: '0 0 4px', letterSpacing: '-0.02em' }}>Practice Intelligence</h2>
          <p style={{ fontSize: 12, color: D.faint, fontFamily: 'var(--font-body)', margin: 0 }}>
            Based on {ins.review_count} review{ins.review_count !== 1 ? 's' : ''} · updated {timeAgo(ins.generated_at)}
          </p>
        </div>
        <button
          onClick={handleGenerate}
          disabled={isPending}
          style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: 6, padding: '7px 12px', borderRadius: 8, background: 'transparent', color: isPending ? D.xfaint : D.faint, border: `1px solid ${D.border}`, cursor: isPending ? 'not-allowed' : 'pointer', fontSize: 12, fontWeight: 600, fontFamily: 'var(--font-body)' }}
        >
          <RefreshCw size={11} strokeWidth={2} style={{ animation: isPending ? 'spin 0.8s linear infinite' : 'none' }} aria-hidden />
          {isPending ? 'Refreshing…' : 'Refresh'}
        </button>
      </div>

      <ConfidenceBanner count={ins.review_count} />

      {/* Stale notice */}
      {isStale && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(251,191,36,0.04)', border: '1px solid rgba(251,191,36,0.14)', borderRadius: 9, padding: '9px 13px', marginBottom: 24 }}>
          <AlertTriangle size={12} strokeWidth={1.2} style={{ color: D.gold, flexShrink: 0 }} aria-hidden />
          <p style={{ fontSize: 12.5, color: 'rgba(251,191,36,0.7)', fontFamily: 'var(--font-body)', margin: 0, flex: 1 }}>
            {newSince} new review{newSince !== 1 ? 's' : ''} since this report
          </p>
          <button onClick={handleGenerate} style={{ flexShrink: 0, fontSize: 11.5, fontWeight: 600, color: D.gold, background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.2)', borderRadius: 6, padding: '3px 9px', cursor: 'pointer', fontFamily: 'var(--font-body)' }}>
            Refresh
          </button>
        </div>
      )}

      {error && (
        <div style={{ background: 'rgba(220,38,38,0.06)', border: '1px solid rgba(220,38,38,0.2)', borderRadius: 9, padding: '10px 13px', marginBottom: 20 }}>
          <p style={{ fontSize: 13, color: '#f87171', fontFamily: 'var(--font-body)', margin: 0 }}>{error}</p>
        </div>
      )}

      {/* Hero trust score */}
      {Object.keys(ins.category_scores).length > 0 && (
        <TrustScoreHero scores={ins.category_scores} reviewCount={ins.review_count} />
      )}

      {/* AI Priority focus */}
      {topOpportunity && (
        <>
          <div style={{ height: 32 }} />
          <PriorityFocus
            recommendation={topOpportunity.recommendation}
            rationale={topOpportunity.rationale}
            evidence={(topOpportunity as any).evidence}
          />
        </>
      )}

      {/* Strengths + Areas — explicit 2 columns */}
      {(ins.strengths.length > 0 || ins.weaknesses.length > 0) && (
        <>
          <Divider />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 }}>

            {ins.strengths.length > 0 && (
              <div>
                <MicroLabel text="What's working" />
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                  {ins.strengths.map((s, i) => (
                    <SignalItem key={i} type="strength" category={s.category} text={s.text}
                      stat={s.mention_count} statLabel="mentions" quote={(s as any).quote} />
                  ))}
                </div>
              </div>
            )}

            {ins.weaknesses.length > 0 && (
              <div>
                <MicroLabel text="Areas to address" />
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                  {ins.weaknesses.map((w, i) => (
                    <SignalItem key={i} type="weakness" category={w.category} text={w.text}
                      stat={w.pct_mentions} statLabel="% of reviews" quote={(w as any).quote} />
                  ))}
                </div>
              </div>
            )}

          </div>
        </>
      )}

      {/* Growth opportunities + scores */}
      {(remainingOpportunities.length > 0 || Object.keys(ins.category_scores).length > 0) && (
        <>
          <Divider />
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 280px', gap: 32, alignItems: 'start' }}>

            {remainingOpportunities.length > 0 && (
              <div>
                <MicroLabel text="Growth opportunities" />
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {remainingOpportunities.map((o, i) => (
                    <OpportunityCard key={i} item={o} index={i + 1} />
                  ))}
                </div>
              </div>
            )}

            {Object.keys(ins.category_scores).length > 0 && (
              <div>
                <CategoryScores scores={ins.category_scores} />
              </div>
            )}

          </div>
        </>
      )}

    </div>
  );
}
