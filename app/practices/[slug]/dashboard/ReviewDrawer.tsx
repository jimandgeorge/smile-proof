'use client';

import { useEffect } from 'react';
import { X } from 'lucide-react';
import type { ReviewItem } from './actions';

const D = {
  bg: '#0d0d12', card: '#13131a',
  border: 'rgba(255,255,255,0.07)',
  text: '#edeef5', mid: 'rgba(237,238,245,0.72)', soft: 'rgba(237,238,245,0.5)',
  faint: 'rgba(237,238,245,0.28)', xfaint: 'rgba(237,238,245,0.13)',
  accent: '#34d399', accentPale: 'rgba(52,211,153,0.08)',
} as const;

export type DrawerTopic = {
  label: string;
  insightText: string;
  keywords: string[];
  score?: number;
  accentColor?: string;
};

export const CATEGORY_KEYWORDS: Record<string, string[]> = {
  communication:          ['explain', 'explained', 'told', 'inform', 'clear', 'communic', 'listen', 'answer', 'discuss', 'thorough'],
  wait_times:             ['wait', 'waiting', 'waited', 'late', 'delay', 'quick', 'fast', 'prompt', 'queue', 'punctual'],
  nervous_patients:       ['nervous', 'anxious', 'anxiety', 'fear', 'scared', 'phobia', 'calm', 'reassur', 'gentle', 'relax', 'comfort', 'dread', 'worri'],
  pricing_transparency:   ['price', 'cost', 'charg', 'expens', 'value', 'fee', 'nhs', 'private', 'afford', 'transpar', 'quote', 'payment'],
  treatment_satisfaction: ['treatment', 'result', 'satisf', 'pleas', 'excellent', 'procedure', 'filling', 'crown', 'implant', 'clean', 'hygien', 'pain'],
  staff_friendliness:     ['staff', 'friendly', 'kind', 'welcom', 'receptionist', 'nurse', 'team', 'warm', 'helpful', 'polite', 'lovely', 'caring', 'professional'],
  booking_experience:     ['book', 'appointment', 'schedul', 'cancel', 'reschedul', 'availab', 'easy', 'online', 'phone', 'call'],
};

export function filterReviewsForTopic(
  reviews: ReviewItem[],
  keywords: string[],
): Array<ReviewItem & { hits: number }> {
  const lower = keywords.map(k => k.toLowerCase());
  return reviews
    .map(r => {
      const body = r.body.toLowerCase();
      const hits = lower.filter(k => body.includes(k)).length;
      return { ...r, hits };
    })
    .filter(r => r.hits > 0)
    .sort((a, b) => b.hits - a.hits || (b.rating ?? 0) - (a.rating ?? 0));
}

function highlightText(text: string, keywords: string[]): React.ReactNode {
  if (!keywords.length) return text;
  const escaped = [...keywords]
    .map(k => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
    .sort((a, b) => b.length - a.length);
  const parts = text.split(new RegExp(`(${escaped.join('|')})`, 'gi'));
  const matchRe = new RegExp(`^(${escaped.join('|')})$`, 'i');
  return parts.map((part, i) =>
    matchRe.test(part)
      ? <mark key={i} style={{ background: 'rgba(52,211,153,0.18)', color: D.accent, borderRadius: 2, padding: '0 2px', fontStyle: 'normal', fontWeight: 600 }}>{part}</mark>
      : part
  );
}

function Stars({ rating }: { rating: number | null }) {
  if (rating == null) return null;
  return (
    <div style={{ display: 'flex', gap: 2 }}>
      {[1,2,3,4,5].map(s => (
        <svg key={s} width="11" height="11" viewBox="0 0 24 24" fill={s <= rating ? '#fbbf24' : 'rgba(255,255,255,0.12)'} stroke="none">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
        </svg>
      ))}
    </div>
  );
}

type Props = {
  topic: DrawerTopic | null;
  reviews: ReviewItem[];
  loading: boolean;
  onClose: () => void;
};

export default function ReviewDrawer({ topic, reviews, loading, onClose }: Props) {
  const isOpen = topic !== null;

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  const filtered = topic ? filterReviewsForTopic(reviews, topic.keywords) : [];
  const accentCol = topic?.accentColor ?? D.accent;

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, zIndex: 40,
          background: 'rgba(7,7,14,0.6)',
          opacity: isOpen ? 1 : 0,
          pointerEvents: isOpen ? 'auto' : 'none',
          transition: 'opacity 0.2s ease',
          backdropFilter: isOpen ? 'blur(2px)' : 'none',
        }}
      />

      {/* Panel */}
      <div style={{
        position: 'fixed', top: 0, right: 0, bottom: 0, zIndex: 50,
        width: 440, maxWidth: '90vw',
        background: D.bg,
        borderLeft: `1px solid ${D.border}`,
        transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
        transition: 'transform 0.25s cubic-bezier(0.4,0,0.2,1)',
        display: 'flex', flexDirection: 'column',
        overflow: 'hidden',
      }}>
        {topic && (
          <>
            {/* Header */}
            <div style={{ padding: '20px 24px 16px', borderBottom: `1px solid ${D.border}`, flexShrink: 0 }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 12 }}>
                <div>
                  <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(52,211,153,0.6)', fontFamily: 'var(--font-body)', marginBottom: 4 }}>
                    Source reviews
                  </div>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 800, color: D.text, margin: 0, letterSpacing: '-0.02em', lineHeight: 1.2 }}>
                    {topic.label}
                  </h3>
                  {topic.score != null && (
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginTop: 5 }}>
                      <span style={{ fontSize: 22, fontWeight: 800, fontFamily: 'var(--font-display)', color: accentCol, letterSpacing: '-0.03em', lineHeight: 1 }}>
                        {topic.score.toFixed(1)}
                      </span>
                      <span style={{ fontSize: 12, color: D.faint, fontFamily: 'var(--font-body)' }}>&thinsp;/ 5</span>
                    </div>
                  )}
                </div>
                <button
                  onClick={onClose}
                  aria-label="Close"
                  style={{ flexShrink: 0, background: 'rgba(255,255,255,0.04)', border: `1px solid ${D.border}`, borderRadius: 8, width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: D.faint }}
                >
                  <X size={14} strokeWidth={2} />
                </button>
              </div>

              {/* Insight quote */}
              <div style={{ background: D.card, border: `1px solid ${D.border}`, borderRadius: 8, padding: '10px 13px' }}>
                <p style={{ fontSize: 12.5, color: D.soft, fontFamily: 'var(--font-body)', margin: 0, lineHeight: 1.6, fontStyle: 'italic' }}>
                  &ldquo;{topic.insightText}&rdquo;
                </p>
              </div>
            </div>

            {/* Count bar */}
            <div style={{ padding: '10px 24px', borderBottom: `1px solid ${D.border}`, flexShrink: 0 }}>
              <span style={{ fontSize: 11.5, fontWeight: 600, color: D.faint, fontFamily: 'var(--font-body)' }}>
                {loading
                  ? 'Loading reviews…'
                  : filtered.length > 0
                    ? `${filtered.length} review${filtered.length !== 1 ? 's' : ''} mentioning this`
                    : 'No matching reviews found'}
              </span>
            </div>

            {/* Scrollable reviews */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '16px 24px', display: 'flex', flexDirection: 'column', gap: 10 }}>
              {loading ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 120 }}>
                  <div style={{ width: 24, height: 24, borderRadius: '50%', border: `2px solid ${D.accentPale}`, borderTop: `2px solid ${D.accent}`, animation: 'spin 0.8s linear infinite' }} />
                  <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                </div>
              ) : filtered.length === 0 ? (
                <p style={{ textAlign: 'center', fontSize: 13, color: D.xfaint, fontFamily: 'var(--font-body)', paddingTop: 48 }}>
                  No reviews closely match this topic.
                </p>
              ) : (
                filtered.map(r => (
                  <div key={r.id} style={{ background: D.card, border: `1px solid ${D.border}`, borderRadius: 10, padding: '12px 14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                      <Stars rating={r.rating} />
                      {r.published_at && (
                        <span style={{ fontSize: 11, color: D.xfaint, fontFamily: 'var(--font-body)' }}>
                          {new Date(r.published_at).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })}
                        </span>
                      )}
                    </div>
                    <p style={{ fontSize: 13, color: D.mid, fontFamily: 'var(--font-body)', lineHeight: 1.65, margin: 0 }}>
                      {highlightText(r.body, topic.keywords)}
                    </p>
                  </div>
                ))
              )}
            </div>
          </>
        )}
      </div>
    </>
  );
}
