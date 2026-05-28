'use client';

import { useState, useTransition, useContext } from 'react';
import { generateOpportunityInsights } from './actions';
import type { OpportunityInsightData } from './actions';
import { AlertTriangle, Star, RefreshCw } from 'lucide-react';
import { AccessTokenContext } from './token-context';

type Props = {
  practiceId: string;
  practiceSlug: string;
  reviewCount: number;
  initialInsights: OpportunityInsightData | null;
};

const D = {
  bg: '#0d0d12', card: '#13131a', card2: '#17171f',
  border: 'rgba(255,255,255,0.07)', border2: 'rgba(255,255,255,0.12)',
  divider: 'rgba(255,255,255,0.05)',
  text: '#edeef5', mid: 'rgba(237,238,245,0.72)', soft: 'rgba(237,238,245,0.5)',
  faint: 'rgba(237,238,245,0.28)', xfaint: 'rgba(237,238,245,0.13)',
  accent: '#34d399', accentPale: 'rgba(52,211,153,0.08)',
  gold: '#fbbf24',
} as const;

const CATEGORY_LABELS: Record<string, string> = {
  communication:          'Communication',
  wait_times:             'Wait Times',
  nervous_patients:       'Nervous Patients',
  pricing_transparency:   'Pricing Clarity',
  treatment_satisfaction: 'Treatment Results',
  staff_friendliness:     'Staff Friendliness',
  booking_experience:     'Booking Experience',
};

function scoreColor(s: number) {
  if (s >= 4.3) return '#34d399';
  if (s >= 3.5) return '#a3e635';
  if (s >= 2.5) return '#fbbf24';
  return '#f87171';
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const h = Math.floor(diff / 3600000);
  if (h < 1) return 'just now';
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d} day${d !== 1 ? 's' : ''} ago`;
}

function MicroLabel({ text, color = D.faint }: { text: string; color?: string }) {
  return (
    <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color, fontFamily: 'var(--font-body)', marginBottom: 10 }}>
      {text}
    </div>
  );
}

function Divider() {
  return <div style={{ height: 1, background: D.divider, margin: '32px 0' }} />;
}

function SignalItem({ type, category, text, stat, statLabel, quote }: {
  type: 'strength' | 'weakness';
  category: string; text: string;
  stat?: number; statLabel?: string;
  quote?: string;
}) {
  const isS = type === 'strength';
  const accentCol = isS ? 'rgba(52,211,153,0.3)' : 'rgba(251,191,36,0.3)';
  const statCol   = isS ? D.accent : D.gold;
  return (
    <div style={{ paddingLeft: 14, borderLeft: `2px solid ${accentCol}`, paddingTop: 2, paddingBottom: 2 }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 8, marginBottom: 4 }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: D.text, fontFamily: 'var(--font-body)', letterSpacing: '-0.01em' }}>
          {CATEGORY_LABELS[category] ?? category}
        </span>
        {stat != null && (
          <span style={{ fontSize: 11.5, fontWeight: 600, color: statCol, fontFamily: 'var(--font-body)', flexShrink: 0, opacity: 0.8 }}>
            {stat} {statLabel}
          </span>
        )}
      </div>
      <p style={{ fontSize: 12.5, color: D.soft, fontFamily: 'var(--font-body)', lineHeight: 1.65, margin: quote ? '0 0 8px' : '0' }}>
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

function OpportunityCard({ recommendation, category, rationale, index }: {
  recommendation: string; category: string; rationale: string; index: number;
}) {
  return (
    <div style={{ background: D.card2, borderRadius: 10, padding: '16px 18px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 8 }}>
        <div style={{ width: 22, height: 22, borderRadius: 6, flexShrink: 0, background: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.15)', color: D.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontSize: 11, fontWeight: 800, marginTop: 1 }}>
          {index + 1}
        </div>
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: 14, fontWeight: 700, color: D.text, fontFamily: 'var(--font-body)', margin: '0 0 5px', lineHeight: 1.35, letterSpacing: '-0.01em' }}>
            {recommendation}
          </p>
          <span style={{ fontSize: 11, fontWeight: 600, color: 'rgba(52,211,153,0.7)', background: D.accentPale, borderRadius: 20, padding: '1px 8px', fontFamily: 'var(--font-body)' }}>
            {CATEGORY_LABELS[category] ?? category}
          </span>
        </div>
      </div>
      <p style={{ fontSize: 13, color: D.soft, fontFamily: 'var(--font-body)', lineHeight: 1.65, margin: 0, paddingLeft: 34 }}>
        {rationale}
      </p>
    </div>
  );
}

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
                <div style={{ height: '100%', width: score != null ? `${(score / 5) * 100}%` : '0%', background: score != null ? scoreColor(score) : D.xfaint, borderRadius: 2, transition: 'width 0.6s cubic-bezier(0.4,0,0.2,1)' }} />
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

export default function OpportunitiesTab({ practiceId, practiceSlug, reviewCount, initialInsights }: Props) {
  const [insights, setInsights] = useState<OpportunityInsightData | null>(initialInsights);
  const [error, setError] = useState('');
  const [isPending, startTransition] = useTransition();
  const accessToken = useContext(AccessTokenContext);

  const isStale = insights != null && reviewCount > insights.review_count;
  const newSince = insights ? reviewCount - insights.review_count : 0;

  const handleGenerate = () => {
    setError('');
    startTransition(async () => {
      const result = await generateOpportunityInsights(accessToken, practiceId, practiceSlug);
      if (result.error) { setError(result.error); return; }
      if (result.insights) setInsights(result.insights);
    });
  };

  if (!insights && !isPending) {
    return (
      <div style={{ maxWidth: 560 }}>
        <div style={{ marginBottom: 28 }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 800, color: D.text, margin: '0 0 4px', letterSpacing: '-0.02em' }}>AI Opportunities</h2>
          <p style={{ fontSize: 13, color: D.faint, fontFamily: 'var(--font-body)', margin: 0 }}>Structured intelligence derived from your patient reviews.</p>
        </div>
        <div style={{ background: D.card, border: `1px solid ${D.border}`, borderRadius: 14, padding: '52px 44px', textAlign: 'center' }}>
          <div style={{ width: 48, height: 48, borderRadius: 12, background: D.accentPale, border: '1px solid rgba(52,211,153,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
            <Star size={20} strokeWidth={1.5} style={{ color: D.accent }} aria-hidden />
          </div>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 700, color: D.text, margin: '0 0 8px', letterSpacing: '-0.01em' }}>Generate your practice report</h3>
          <p style={{ fontSize: 13, color: D.soft, fontFamily: 'var(--font-body)', lineHeight: 1.7, maxWidth: 360, margin: '0 auto 28px' }}>
            Analyses your {reviewCount} patient review{reviewCount !== 1 ? 's' : ''} to identify strengths, surface problems, and generate targeted recommendations.
          </p>
          {reviewCount < 2 ? (
            <p style={{ fontSize: 13, color: D.faint, fontFamily: 'var(--font-body)' }}>At least 2 published reviews are needed.</p>
          ) : (
            <>
              <button onClick={handleGenerate} style={{ padding: '11px 28px', borderRadius: 9, background: D.accent, color: '#0d0d12', border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 700, fontFamily: 'var(--font-body)', marginBottom: 12, letterSpacing: '-0.01em' }}>
                Generate insights
              </button>
              <p style={{ fontSize: 12, color: D.xfaint, fontFamily: 'var(--font-body)', margin: 0 }}>Takes ~15 seconds · Cached until new reviews arrive</p>
            </>
          )}
          {error && <p style={{ fontSize: 13, color: '#f87171', fontFamily: 'var(--font-body)', marginTop: 14 }}>{error}</p>}
        </div>
      </div>
    );
  }

  if (isPending) {
    return (
      <div style={{ maxWidth: 560 }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 800, color: D.text, margin: '0 0 28px', letterSpacing: '-0.02em' }}>AI Opportunities</h2>
        <div style={{ background: D.card, border: `1px solid ${D.border}`, borderRadius: 14, padding: '60px 44px', textAlign: 'center' }}>
          <div style={{ width: 36, height: 36, borderRadius: '50%', border: `3px solid ${D.accentPale}`, borderTop: `3px solid ${D.accent}`, animation: 'spin 0.8s linear infinite', margin: '0 auto 20px' }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          <p style={{ fontSize: 14, fontWeight: 600, color: D.text, fontFamily: 'var(--font-body)', margin: '0 0 4px' }}>Analysing {reviewCount} reviews…</p>
          <p style={{ fontSize: 13, color: D.faint, fontFamily: 'var(--font-body)', margin: 0 }}>About 15 seconds.</p>
        </div>
      </div>
    );
  }

  const ins = insights!;

  return (
    <div style={{ maxWidth: 900 }}>

      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, marginBottom: 32 }}>
        <div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 800, color: D.text, margin: '0 0 4px', letterSpacing: '-0.02em' }}>AI Opportunities</h2>
          <p style={{ fontSize: 12, color: D.faint, fontFamily: 'var(--font-body)', margin: 0 }}>
            Based on {ins.review_count} review{ins.review_count !== 1 ? 's' : ''} · updated {timeAgo(ins.generated_at)}
          </p>
        </div>
        <button
          onClick={handleGenerate}
          style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: 6, padding: '7px 12px', borderRadius: 8, background: 'transparent', color: D.faint, border: `1px solid ${D.border}`, cursor: 'pointer', fontSize: 12, fontWeight: 600, fontFamily: 'var(--font-body)' }}
        >
          <RefreshCw size={11} strokeWidth={2} aria-hidden />
          Refresh
        </button>
      </div>

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

      {(ins.strengths.length > 0 || ins.weaknesses.length > 0) && (
        <>
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
          <Divider />
        </>
      )}

      {ins.opportunities.length > 0 && (
        <>
          <MicroLabel text="Growth opportunities" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 32 }}>
            {ins.opportunities.map((o, i) => (
              <OpportunityCard key={i} index={i} category={o.category} recommendation={o.recommendation} rationale={o.rationale} />
            ))}
          </div>
        </>
      )}

      {Object.keys(ins.category_scores).length > 0 && (
        <CategoryScores scores={ins.category_scores} />
      )}

    </div>
  );
}
