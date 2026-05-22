'use client';

import { useState, useTransition, useContext } from 'react';
import { generateOpportunityInsights } from './actions';
import type { OpportunityInsightData } from './actions';
import { AccessTokenContext } from './token-context';

type Props = {
  practiceId: string;
  practiceSlug: string;
  reviewCount: number;
  initialInsights: OpportunityInsightData | null;
};

const CATEGORY_LABELS: Record<string, string> = {
  communication:         'Communication',
  wait_times:            'Wait Times',
  nervous_patients:      'Nervous Patients',
  pricing_transparency:  'Pricing Clarity',
  treatment_satisfaction:'Treatment Results',
  staff_friendliness:    'Staff Friendliness',
  booking_experience:    'Booking Experience',
};

function scoreColor(score: number): string {
  if (score >= 4.3) return '#16a34a';
  if (score >= 3.5) return '#ca8a04';
  if (score >= 2.5) return '#ea580c';
  return '#dc2626';
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const h = Math.floor(diff / 3600000);
  if (h < 1) return 'less than an hour ago';
  if (h < 24) return `${h} hour${h !== 1 ? 's' : ''} ago`;
  const d = Math.floor(h / 24);
  return `${d} day${d !== 1 ? 's' : ''} ago`;
}

function SectionHeader({ label }: { label: string }) {
  return (
    <p style={{
      fontSize: 11, fontWeight: 700, textTransform: 'uppercase',
      letterSpacing: '0.1em', color: 'var(--ink-soft)',
      fontFamily: 'var(--font-body)', margin: '0 0 12px',
    }}>
      {label}
    </p>
  );
}

function StrengthCard({ text, category, mentionCount }: { text: string; category: string; mentionCount?: number }) {
  return (
    <div style={{
      background: '#f0fdf4', border: '1px solid #bbf7d0',
      borderRadius: 10, padding: '14px 16px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
          <circle cx="7" cy="7" r="6.5" fill="#16a34a" />
          <path d="M4.5 7l1.8 1.8 3.2-3.2" stroke="white" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span style={{ fontSize: 11, fontWeight: 700, color: '#16a34a', fontFamily: 'var(--font-body)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          {CATEGORY_LABELS[category] ?? category}
        </span>
        {mentionCount != null && (
          <span style={{ marginLeft: 'auto', fontSize: 11, color: '#16a34a', fontFamily: 'var(--font-body)' }}>
            {mentionCount} mentions
          </span>
        )}
      </div>
      <p style={{ fontSize: 13, color: '#14532d', fontFamily: 'var(--font-body)', lineHeight: 1.6, margin: 0 }}>
        {text}
      </p>
    </div>
  );
}

function WeaknessCard({ text, category, pctMentions }: { text: string; category: string; pctMentions?: number }) {
  return (
    <div style={{
      background: '#fffbeb', border: '1px solid #fde68a',
      borderRadius: 10, padding: '14px 16px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
          <path d="M7 1.5L13 12.5H1L7 1.5z" fill="#d97706" />
          <path d="M7 5.5v3M7 10v.5" stroke="white" strokeWidth="1.3" strokeLinecap="round" />
        </svg>
        <span style={{ fontSize: 11, fontWeight: 700, color: '#92400e', fontFamily: 'var(--font-body)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          {CATEGORY_LABELS[category] ?? category}
        </span>
        {pctMentions != null && (
          <span style={{ marginLeft: 'auto', fontSize: 11, color: '#92400e', fontFamily: 'var(--font-body)' }}>
            {pctMentions}% of reviews
          </span>
        )}
      </div>
      <p style={{ fontSize: 13, color: '#78350f', fontFamily: 'var(--font-body)', lineHeight: 1.6, margin: 0 }}>
        {text}
      </p>
    </div>
  );
}

function OpportunityCard({ recommendation, category, rationale, index }: { recommendation: string; category: string; rationale: string; index: number }) {
  return (
    <div style={{
      display: 'flex', gap: 16, alignItems: 'flex-start',
      background: 'white', border: '1.5px solid var(--cream-dark)',
      borderLeft: '4px solid var(--forest)',
      borderRadius: 10, padding: '16px 18px',
    }}>
      <div style={{
        width: 28, height: 28, borderRadius: 8, flexShrink: 0,
        background: 'var(--forest)', color: 'white',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 700,
      }}>
        {index + 1}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5 }}>
          <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--ink)', fontFamily: 'var(--font-body)', margin: 0 }}>
            {recommendation}
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--forest)', background: 'var(--forest-pale)', borderRadius: 20, padding: '2px 8px', fontFamily: 'var(--font-body)' }}>
            {CATEGORY_LABELS[category] ?? category}
          </span>
          <p style={{ fontSize: 12, color: 'var(--ink-soft)', fontFamily: 'var(--font-body)', margin: 0, lineHeight: 1.5 }}>
            {rationale}
          </p>
        </div>
      </div>
    </div>
  );
}

function CategoryScores({ scores }: { scores: Record<string, number> }) {
  const entries = Object.entries(CATEGORY_LABELS).map(([key, label]) => ({
    key, label, score: scores[key] ?? null,
  })).sort((a, b) => (b.score ?? 0) - (a.score ?? 0));

  return (
    <div style={{
      background: 'white', border: '1.5px solid var(--cream-dark)',
      borderRadius: 12, padding: '20px 22px',
    }}>
      <SectionHeader label="Category Scores" />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {entries.map(({ key, label, score }) => (
          <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 12, color: 'var(--ink-soft)', fontFamily: 'var(--font-body)', width: 148, flexShrink: 0 }}>
              {label}
            </span>
            <div style={{ flex: 1, height: 6, borderRadius: 3, background: 'var(--cream-dark)', overflow: 'hidden' }}>
              <div style={{
                height: '100%',
                width: score != null ? `${(score / 5) * 100}%` : '0%',
                background: score != null ? scoreColor(score) : 'var(--ink-faint)',
                borderRadius: 3,
                transition: 'width 0.6s cubic-bezier(0.4,0,0.2,1)',
              }} />
            </div>
            <span style={{
              fontSize: 12, fontWeight: 700, fontFamily: 'var(--font-body)',
              color: score != null ? scoreColor(score) : 'var(--ink-faint)',
              width: 28, textAlign: 'right', flexShrink: 0,
            }}>
              {score != null ? score.toFixed(1) : '—'}
            </span>
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
  const newReviewsSince = insights ? reviewCount - insights.review_count : 0;

  const handleGenerate = () => {
    setError('');
    startTransition(async () => {
      const result = await generateOpportunityInsights(accessToken, practiceId, practiceSlug);
      if (result.error) { setError(result.error); return; }
      if (result.insights) setInsights(result.insights);
    });
  };

  // ── No insights yet ────────────────────────────────────────────────────────
  if (!insights && !isPending) {
    return (
      <div style={{ maxWidth: 640 }}>
        <div style={{ marginBottom: 28 }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 800, color: 'var(--ink)', margin: '0 0 6px', letterSpacing: '-0.02em' }}>
            AI Opportunities
          </h2>
          <p style={{ fontSize: 13, color: 'var(--ink-soft)', fontFamily: 'var(--font-body)', margin: 0 }}>
            Structured intelligence derived from your patient reviews.
          </p>
        </div>

        <div style={{
          background: 'white', border: '1.5px solid var(--cream-dark)',
          borderRadius: 16, padding: '48px 40px', textAlign: 'center',
        }}>
          <div style={{
            width: 56, height: 56, borderRadius: 14,
            background: 'var(--forest-pale)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 20px',
          }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path d="M12 3l1.8 5.5H19l-4.6 3.3 1.7 5.5L12 14l-4.1 3.3 1.7-5.5L5 8.5h5.2z" stroke="var(--forest)" strokeWidth="1.5" strokeLinejoin="round" />
            </svg>
          </div>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, color: 'var(--ink)', marginBottom: 10 }}>
            Generate your practice intelligence report
          </h3>
          <p style={{ fontSize: 14, color: 'var(--ink-soft)', fontFamily: 'var(--font-body)', lineHeight: 1.65, maxWidth: 400, margin: '0 auto 28px' }}>
            Analyses your {reviewCount} patient review{reviewCount !== 1 ? 's' : ''} to identify strengths, surface problems, and generate targeted recommendations.
          </p>

          {reviewCount < 2 ? (
            <p style={{ fontSize: 13, color: 'var(--ink-faint)', fontFamily: 'var(--font-body)' }}>
              At least 2 published reviews are needed to generate insights.
            </p>
          ) : (
            <>
              <button
                onClick={handleGenerate}
                style={{
                  padding: '12px 28px', borderRadius: 9, background: 'var(--forest)',
                  color: 'white', border: 'none', cursor: 'pointer',
                  fontSize: 14, fontWeight: 700, fontFamily: 'var(--font-body)',
                  marginBottom: 12,
                }}
              >
                Generate insights
              </button>
              <p style={{ fontSize: 12, color: 'var(--ink-faint)', fontFamily: 'var(--font-body)', margin: 0 }}>
                Takes ~15 seconds · Cached until new reviews arrive
              </p>
            </>
          )}

          {error && (
            <p style={{ fontSize: 13, color: '#dc2626', fontFamily: 'var(--font-body)', marginTop: 12 }}>{error}</p>
          )}
        </div>
      </div>
    );
  }

  // ── Generating ─────────────────────────────────────────────────────────────
  if (isPending) {
    return (
      <div style={{ maxWidth: 640 }}>
        <div style={{ marginBottom: 28 }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 800, color: 'var(--ink)', margin: '0 0 6px', letterSpacing: '-0.02em' }}>
            AI Opportunities
          </h2>
        </div>
        <div style={{
          background: 'white', border: '1.5px solid var(--cream-dark)',
          borderRadius: 16, padding: '56px 40px', textAlign: 'center',
        }}>
          <div style={{
            width: 40, height: 40, borderRadius: '50%',
            border: '3px solid var(--forest-pale)',
            borderTop: '3px solid var(--forest)',
            animation: 'spin 0.8s linear infinite',
            margin: '0 auto 20px',
          }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink)', fontFamily: 'var(--font-body)', marginBottom: 4 }}>
            Analysing {reviewCount} reviews…
          </p>
          <p style={{ fontSize: 13, color: 'var(--ink-soft)', fontFamily: 'var(--font-body)', margin: 0 }}>
            This takes about 15 seconds.
          </p>
        </div>
      </div>
    );
  }

  // ── Has insights ────────────────────────────────────────────────────────────
  return (
    <div style={{ maxWidth: 720 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, marginBottom: 20 }}>
        <div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 800, color: 'var(--ink)', margin: '0 0 4px', letterSpacing: '-0.02em' }}>
            AI Opportunities
          </h2>
          <p style={{ fontSize: 12, color: 'var(--ink-soft)', fontFamily: 'var(--font-body)', margin: 0 }}>
            Based on {insights!.review_count} review{insights!.review_count !== 1 ? 's' : ''} · Generated {timeAgo(insights!.generated_at)}
          </p>
        </div>
        <button
          onClick={handleGenerate}
          disabled={isPending}
          style={{
            flexShrink: 0, padding: '8px 14px', borderRadius: 8,
            background: 'white', color: 'var(--ink-mid)',
            border: '1.5px solid var(--cream-dark)',
            cursor: 'pointer', fontSize: 12, fontWeight: 600,
            fontFamily: 'var(--font-body)',
          }}
        >
          Refresh
        </button>
      </div>

      {/* Stale banner */}
      {isStale && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          background: '#fffbeb', border: '1px solid #fde68a',
          borderRadius: 10, padding: '10px 14px', marginBottom: 20,
        }}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
            <path d="M7 1.5L13 12.5H1L7 1.5z" fill="#d97706" />
            <path d="M7 5.5v3M7 10v.5" stroke="white" strokeWidth="1.3" strokeLinecap="round" />
          </svg>
          <p style={{ fontSize: 13, color: '#92400e', fontFamily: 'var(--font-body)', margin: 0, flex: 1 }}>
            {newReviewsSince} new review{newReviewsSince !== 1 ? 's' : ''} since your last report — refresh for updated insights.
          </p>
        </div>
      )}

      {error && (
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, padding: '10px 14px', marginBottom: 20 }}>
          <p style={{ fontSize: 13, color: '#dc2626', fontFamily: 'var(--font-body)', margin: 0 }}>{error}</p>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>

        {/* Strengths */}
        {insights!.strengths.length > 0 && (
          <div>
            <SectionHeader label="What's Working Well" />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {insights!.strengths.map((s, i) => (
                <StrengthCard key={i} category={s.category} text={s.text} mentionCount={s.mention_count} />
              ))}
            </div>
          </div>
        )}

        {/* Weaknesses */}
        {insights!.weaknesses.length > 0 && (
          <div>
            <SectionHeader label="Areas for Improvement" />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {insights!.weaknesses.map((w, i) => (
                <WeaknessCard key={i} category={w.category} text={w.text} pctMentions={w.pct_mentions} />
              ))}
            </div>
          </div>
        )}

        {/* Opportunities */}
        {insights!.opportunities.length > 0 && (
          <div>
            <SectionHeader label="Growth Opportunities" />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {insights!.opportunities.map((o, i) => (
                <OpportunityCard key={i} index={i} category={o.category} recommendation={o.recommendation} rationale={o.rationale} />
              ))}
            </div>
          </div>
        )}

        {/* Category scores */}
        {Object.keys(insights!.category_scores).length > 0 && (
          <CategoryScores scores={insights!.category_scores} />
        )}
      </div>
    </div>
  );
}
