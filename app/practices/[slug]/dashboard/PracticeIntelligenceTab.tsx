'use client';

import { useState, useTransition, useContext } from 'react';
import { generatePracticeIntelligence } from './actions';
import type { OpportunityInsightData, SentimentTheme } from './actions';
import { AlertTriangle, Info, ArrowRight, CheckCircle, Star } from 'lucide-react';
import { AccessTokenContext } from './token-context';

const D = {
  bg: '#0d0d12', sidebar: '#09090d', card: '#13131a', card2: '#1a1a24',
  border: 'rgba(255,255,255,0.07)', border2: 'rgba(255,255,255,0.12)',
  text: '#edeef5', mid: 'rgba(237,238,245,0.72)', soft: 'rgba(237,238,245,0.5)',
  faint: 'rgba(237,238,245,0.28)', accent: '#34d399', accentPale: 'rgba(52,211,153,0.1)',
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

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const h = Math.floor(diff / 3600000);
  if (h < 1) return 'just now';
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d} day${d !== 1 ? 's' : ''} ago`;
}

function scoreColor(s: number) {
  if (s >= 4.3) return '#16a34a';
  if (s >= 3.5) return '#ca8a04';
  if (s >= 2.5) return '#ea580c';
  return '#dc2626';
}

function SectionLabel({ text }: { text: string }) {
  return (
    <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: D.soft, fontFamily: 'var(--font-body)', margin: '0 0 14px' }}>
      {text}
    </p>
  );
}

// ── Confidence banner ─────────────────────────────────────────────────────────
function ConfidenceBanner({ count }: { count: number }) {
  if (count >= 15) return null;
  const isLow = count < 5;
  return (
    <div style={{
      display: 'flex', alignItems: 'flex-start', gap: 10,
      background: isLow ? 'rgba(251,191,36,0.06)' : 'rgba(255,255,255,0.03)',
      border: `1px solid ${isLow ? 'rgba(251,191,36,0.18)' : D.border}`,
      borderRadius: 10, padding: '11px 14px', marginBottom: 20,
    }}>
      {isLow
        ? <AlertTriangle size={14} strokeWidth={1.2} style={{ flexShrink: 0, marginTop: 1, color: D.gold }} aria-hidden />
        : <Info size={14} strokeWidth={1.3} style={{ flexShrink: 0, marginTop: 1, color: D.faint }} aria-hidden />
      }
      <div>
        <span style={{ fontSize: 12, fontWeight: 700, color: isLow ? D.gold : D.soft, fontFamily: 'var(--font-body)' }}>
          {isLow ? 'Low confidence' : 'Early-stage insight'}
        </span>
        <span style={{ fontSize: 12, color: isLow ? 'rgba(251,191,36,0.65)' : D.faint, fontFamily: 'var(--font-body)', marginLeft: 6 }}>
          {isLow
            ? `— based on ${count} review${count !== 1 ? 's' : ''} only. Patterns will sharpen with more data.`
            : `— based on ${count} reviews. Useful signal, but trends may shift as more reviews come in.`
          }
        </span>
      </div>
    </div>
  );
}

// ── Recommended next step ─────────────────────────────────────────────────────
function NextStepCard({ recommendation, rationale, evidence }: {
  recommendation: string; rationale: string; evidence?: string;
}) {
  return (
    <div style={{
      background: 'linear-gradient(135deg, rgba(52,211,153,0.07) 0%, rgba(52,211,153,0.02) 100%)',
      border: '1.5px solid rgba(52,211,153,0.18)',
      borderRadius: 12, padding: '18px 22px', marginBottom: 28,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
        <div style={{ width: 18, height: 18, borderRadius: 5, background: D.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <ArrowRight size={9} strokeWidth={1.3} style={{ color: '#0d0d12' }} aria-hidden />
        </div>
        <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: D.accent, fontFamily: 'var(--font-body)' }}>
          Recommended next step
        </span>
      </div>
      <p style={{ fontSize: 15, fontWeight: 700, color: D.text, fontFamily: 'var(--font-body)', margin: '0 0 5px', lineHeight: 1.4 }}>
        {recommendation}
      </p>
      <p style={{ fontSize: 13, color: D.soft, fontFamily: 'var(--font-body)', margin: evidence ? '0 0 10px' : '0', lineHeight: 1.6 }}>
        {rationale}
      </p>
      {evidence && (
        <p style={{ fontSize: 12, color: D.faint, fontFamily: 'var(--font-body)', margin: '0', fontStyle: 'italic', borderLeft: '2px solid rgba(52,211,153,0.25)', paddingLeft: 10 }}>
          {evidence}
        </p>
      )}
    </div>
  );
}

// ── Impact badge ──────────────────────────────────────────────────────────────
const IMPACT_CFG = {
  high_impact: { label: 'High impact', bg: 'rgba(234,88,12,0.1)',  text: '#fb923c', border: 'rgba(234,88,12,0.22)' },
  quick_win:   { label: 'Quick win',   bg: 'rgba(52,211,153,0.08)', text: D.accent, border: 'rgba(52,211,153,0.2)' },
  monitor:     { label: 'Monitor',     bg: 'rgba(255,255,255,0.04)', text: D.faint,  border: D.border },
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
    <div style={{ background: D.card, border: `1.5px solid ${D.border}`, borderLeft: '3px solid rgba(52,211,153,0.5)', borderRadius: 10, padding: '16px 18px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 8 }}>
        <div style={{ width: 20, height: 20, borderRadius: 6, flexShrink: 0, background: 'rgba(52,211,153,0.1)', color: D.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontSize: 11, fontWeight: 700, marginTop: 2 }}>
          {index + 1}
        </div>
        <p style={{ fontSize: 14, fontWeight: 700, color: D.text, fontFamily: 'var(--font-body)', margin: 0, flex: 1, lineHeight: 1.4 }}>
          {item.recommendation}
        </p>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8, paddingLeft: 30 }}>
        <span style={{ fontSize: 11, fontWeight: 600, color: D.accent, background: D.accentPale, borderRadius: 20, padding: '2px 8px', fontFamily: 'var(--font-body)', whiteSpace: 'nowrap' }}>
          {CATEGORY_LABELS[item.category] ?? item.category}
        </span>
        <ImpactBadge impact={impact} />
      </div>
      <p style={{ fontSize: 13, color: D.soft, fontFamily: 'var(--font-body)', lineHeight: 1.6, margin: evidence ? '0 0 10px' : '0', paddingLeft: 30 }}>
        {item.rationale}
      </p>
      {evidence && (
        <p style={{ fontSize: 12, color: D.faint, fontFamily: 'var(--font-body)', margin: '0', fontStyle: 'italic', borderLeft: `2px solid ${D.border2}`, paddingLeft: 10, marginLeft: 30, lineHeight: 1.5 }}>
          {evidence}
        </p>
      )}
    </div>
  );
}

// ── Signal card (strength / weakness) ────────────────────────────────────────
function SignalCard({ type, category, text, stat, statLabel, quote }: {
  type: 'strength' | 'weakness';
  category: string; text: string;
  stat?: number; statLabel?: string;
  quote?: string;
}) {
  const isS = type === 'strength';
  const col = isS ? '#34d399' : '#fbbf24';
  const alpha = isS ? 'rgba(52,211,153,' : 'rgba(251,191,36,';

  return (
    <div style={{ background: `${alpha}0.05)`, border: `1px solid ${alpha}0.14)`, borderRadius: 10, padding: '14px 16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 7 }}>
        {isS
          ? <CheckCircle size={12} strokeWidth={1.3} style={{ color: col }} aria-hidden />
          : <AlertTriangle size={12} strokeWidth={1.2} style={{ color: col }} aria-hidden />
        }
        <span style={{ fontSize: 11, fontWeight: 700, color: col, textTransform: 'uppercase', letterSpacing: '0.07em', fontFamily: 'var(--font-body)', flex: 1 }}>
          {CATEGORY_LABELS[category] ?? category}
        </span>
        {stat != null && (
          <span style={{ fontSize: 11, fontWeight: 600, color: col, fontFamily: 'var(--font-body)', flexShrink: 0, opacity: 0.85 }}>
            {stat} {statLabel}
          </span>
        )}
      </div>
      <p style={{ fontSize: 13, color: D.mid, fontFamily: 'var(--font-body)', lineHeight: 1.6, margin: quote ? '0 0 9px' : '0' }}>
        {text}
      </p>
      {quote && (
        <p style={{ fontSize: 12, color: D.faint, fontFamily: 'var(--font-body)', margin: '0', fontStyle: 'italic', borderLeft: `2px solid ${alpha}0.28)`, paddingLeft: 9, lineHeight: 1.5 }}>
          &ldquo;{quote}&rdquo;
        </p>
      )}
    </div>
  );
}

// ── Theme card ────────────────────────────────────────────────────────────────
function ThemeCard({ theme }: { theme: SentimentTheme }) {
  const cfg = {
    positive: { badge: D.accentPale,              badgeText: D.accent,  border: 'rgba(52,211,153,0.18)',  dot: '#34d399' },
    negative: { badge: 'rgba(220,38,38,0.08)',    badgeText: '#f87171', border: 'rgba(220,38,38,0.18)',   dot: '#f87171' },
    mixed:    { badge: 'rgba(251,191,36,0.08)',   badgeText: D.gold,    border: 'rgba(251,191,36,0.18)',  dot: D.gold },
  }[theme.sentiment] ?? { badge: D.card2, badgeText: D.soft, border: D.border, dot: D.faint };

  return (
    <div style={{ background: D.card, border: `1.5px solid ${D.border}`, borderRadius: 10, padding: '14px 15px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, marginBottom: 8 }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: D.text, fontFamily: 'var(--font-body)', lineHeight: 1.3 }}>{theme.topic}</span>
        <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 20, background: cfg.badge, color: cfg.badgeText, border: `1px solid ${cfg.border}`, fontFamily: 'var(--font-body)', textTransform: 'capitalize', flexShrink: 0 }}>
          {theme.sentiment}
        </span>
      </div>
      {theme.example && (
        <p style={{ fontSize: 12, color: D.soft, fontFamily: 'var(--font-body)', lineHeight: 1.55, fontStyle: 'italic', margin: '0 0 9px', borderLeft: `2px solid ${cfg.border}`, paddingLeft: 9 }}>
          &ldquo;{theme.example}&rdquo;
        </p>
      )}
      <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
        <span style={{ width: 5, height: 5, borderRadius: '50%', background: cfg.dot, display: 'inline-block', flexShrink: 0 }} />
        <span style={{ fontSize: 11, color: D.faint, fontFamily: 'var(--font-body)' }}>
          {theme.count} {theme.count === 1 ? 'mention' : 'mentions'}
        </span>
      </div>
    </div>
  );
}

// ── Category scores ───────────────────────────────────────────────────────────
function CategoryScores({ scores }: { scores: Record<string, number> }) {
  const entries = Object.entries(CATEGORY_LABELS)
    .map(([key, label]) => ({ key, label, score: scores[key] ?? null }))
    .sort((a, b) => (b.score ?? 0) - (a.score ?? 0));

  return (
    <div style={{ background: D.card, border: `1.5px solid ${D.border}`, borderRadius: 12, padding: '18px 20px' }}>
      <SectionLabel text="Category Scores" />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {entries.map(({ key, label, score }) => (
          <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 12, color: D.soft, fontFamily: 'var(--font-body)', width: 148, flexShrink: 0 }}>{label}</span>
            <div style={{ flex: 1, height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: score != null ? `${(score / 5) * 100}%` : '0%', background: score != null ? scoreColor(score) : D.faint, borderRadius: 2, transition: 'width 0.6s cubic-bezier(0.4,0,0.2,1)' }} />
            </div>
            <span style={{ fontSize: 12, fontWeight: 700, fontFamily: 'var(--font-body)', color: score != null ? scoreColor(score) : D.faint, width: 26, textAlign: 'right', flexShrink: 0 }}>
              {score != null ? score.toFixed(1) : '—'}
            </span>
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
      const result = await generatePracticeIntelligence(accessToken, practiceId, practiceSlug);
      if (result.error) { setError(result.error); return; }
      if (result.insights) setInsights(result.insights);
    });
  };

  // ── Empty state ───────────────────────────────────────────────────────────
  if (!insights && !isPending) {
    return (
      <div style={{ maxWidth: 600 }}>
        <div style={{ marginBottom: 24 }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 800, color: D.text, margin: '0 0 4px', letterSpacing: '-0.02em' }}>Practice Intelligence</h2>
          <p style={{ fontSize: 13, color: D.soft, fontFamily: 'var(--font-body)', margin: 0 }}>Patterns from your patient reviews — what's working, what to fix, where to grow.</p>
        </div>
        <div style={{ background: D.card, border: `1.5px solid ${D.border}`, borderRadius: 14, padding: '48px 40px', textAlign: 'center' }}>
          <div style={{ width: 52, height: 52, borderRadius: 13, background: D.accentPale, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 18px' }}>
            <Star size={22} strokeWidth={1.5} style={{ color: D.accent }} aria-hidden />
          </div>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 700, color: D.text, marginBottom: 8 }}>Generate your practice report</h3>
          <p style={{ fontSize: 13, color: D.soft, fontFamily: 'var(--font-body)', lineHeight: 1.65, maxWidth: 380, margin: '0 auto 24px' }}>
            Reads your {reviewCount} patient review{reviewCount !== 1 ? 's' : ''} and surfaces patterns — what patients value, what frustrates them, and what to act on.
          </p>
          {reviewCount < 2 ? (
            <p style={{ fontSize: 13, color: D.faint, fontFamily: 'var(--font-body)' }}>You need at least 2 published reviews to generate a report.</p>
          ) : (
            <>
              <button onClick={handleGenerate} style={{ padding: '11px 26px', borderRadius: 9, background: D.accent, color: '#0d0d12', border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 700, fontFamily: 'var(--font-body)', marginBottom: 10 }}>
                Generate report
              </button>
              <p style={{ fontSize: 12, color: D.faint, fontFamily: 'var(--font-body)', margin: 0 }}>Takes ~15 seconds · Cached until you refresh</p>
            </>
          )}
          {error && <p style={{ fontSize: 13, color: '#f87171', fontFamily: 'var(--font-body)', marginTop: 12 }}>{error}</p>}
        </div>
      </div>
    );
  }

  // ── Loading state ─────────────────────────────────────────────────────────
  if (isPending) {
    return (
      <div style={{ maxWidth: 600 }}>
        <div style={{ marginBottom: 24 }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 800, color: D.text, margin: '0 0 4px', letterSpacing: '-0.02em' }}>Practice Intelligence</h2>
        </div>
        <div style={{ background: D.card, border: `1.5px solid ${D.border}`, borderRadius: 14, padding: '56px 40px', textAlign: 'center' }}>
          <div style={{ width: 38, height: 38, borderRadius: '50%', border: `3px solid ${D.accentPale}`, borderTop: `3px solid ${D.accent}`, animation: 'spin 0.8s linear infinite', margin: '0 auto 18px' }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          <p style={{ fontSize: 14, fontWeight: 600, color: D.text, fontFamily: 'var(--font-body)', marginBottom: 4 }}>Reading {reviewCount} reviews…</p>
          <p style={{ fontSize: 13, color: D.soft, fontFamily: 'var(--font-body)', margin: 0 }}>About 15 seconds.</p>
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
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, marginBottom: 20 }}>
        <div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 800, color: D.text, margin: '0 0 3px', letterSpacing: '-0.02em' }}>Practice Intelligence</h2>
          <p style={{ fontSize: 12, color: D.faint, fontFamily: 'var(--font-body)', margin: 0 }}>
            Based on {ins.review_count} review{ins.review_count !== 1 ? 's' : ''} · updated {timeAgo(ins.generated_at)}
          </p>
        </div>
        <button
          onClick={handleGenerate}
          style={{ flexShrink: 0, padding: '7px 13px', borderRadius: 8, background: D.card, color: D.soft, border: `1.5px solid ${D.border}`, cursor: 'pointer', fontSize: 12, fontWeight: 600, fontFamily: 'var(--font-body)' }}
        >
          Refresh
        </button>
      </div>

      <ConfidenceBanner count={ins.review_count} />

      {isStale && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(251,191,36,0.06)', border: '1px solid rgba(251,191,36,0.18)', borderRadius: 10, padding: '10px 14px', marginBottom: 20 }}>
          <AlertTriangle size={13} strokeWidth={1.2} style={{ color: D.gold }} aria-hidden />
          <p style={{ fontSize: 13, color: D.gold, fontFamily: 'var(--font-body)', margin: 0, flex: 1 }}>
            {newSince} new review{newSince !== 1 ? 's' : ''} since this report — refresh to include them.
          </p>
          <button onClick={handleGenerate} style={{ flexShrink: 0, fontSize: 12, fontWeight: 600, color: D.gold, background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.25)', borderRadius: 6, padding: '4px 10px', cursor: 'pointer', fontFamily: 'var(--font-body)' }}>
            Refresh now
          </button>
        </div>
      )}

      {error && (
        <div style={{ background: 'rgba(220,38,38,0.08)', border: '1px solid rgba(220,38,38,0.25)', borderRadius: 10, padding: '10px 14px', marginBottom: 20 }}>
          <p style={{ fontSize: 13, color: '#f87171', fontFamily: 'var(--font-body)', margin: 0 }}>{error}</p>
        </div>
      )}

      {/* Recommended next step */}
      {topOpportunity && (
        <NextStepCard
          recommendation={topOpportunity.recommendation}
          rationale={topOpportunity.rationale}
          evidence={(topOpportunity as any).evidence}
        />
      )}

      {/* 2-column main grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 340px', gap: 28, alignItems: 'start' }}>

        {/* Left: remaining opportunities + themes */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>

          {remainingOpportunities.length > 0 && (
            <div>
              <SectionLabel text="Growth Opportunities" />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {remainingOpportunities.map((o, i) => (
                  <OpportunityCard key={i} item={o} index={i + 1} />
                ))}
              </div>
            </div>
          )}

          {ins.themes.length > 0 && (
            <div>
              <SectionLabel text="Patient Themes" />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {ins.themes.map((t, i) => <ThemeCard key={i} theme={t} />)}
              </div>
            </div>
          )}

        </div>

        {/* Right: signals + scores */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

          {ins.strengths.length > 0 && (
            <div>
              <SectionLabel text="What's Working" />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
                {ins.strengths.map((s, i) => (
                  <SignalCard key={i} type="strength" category={s.category} text={s.text}
                    stat={s.mention_count} statLabel="mentions" quote={(s as any).quote} />
                ))}
              </div>
            </div>
          )}

          {ins.weaknesses.length > 0 && (
            <div>
              <SectionLabel text="Areas to Address" />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
                {ins.weaknesses.map((w, i) => (
                  <SignalCard key={i} type="weakness" category={w.category} text={w.text}
                    stat={w.pct_mentions} statLabel="% of reviews" quote={(w as any).quote} />
                ))}
              </div>
            </div>
          )}

          {Object.keys(ins.category_scores).length > 0 && (
            <CategoryScores scores={ins.category_scores} />
          )}

        </div>
      </div>
    </div>
  );
}
