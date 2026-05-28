'use client';

import { useState, useContext } from 'react';
import { respondToReview, generateReviewResponse } from './actions';
import { AccessTokenContext } from './token-context';
import { Sun, Lock } from 'lucide-react';

const D = {
  card2: '#17171f',
  border: 'rgba(255,255,255,0.07)', border2: 'rgba(255,255,255,0.12)',
  text: '#edeef5', soft: 'rgba(237,238,245,0.5)',
  faint: 'rgba(237,238,245,0.28)', xfaint: 'rgba(237,238,245,0.13)',
  accent: '#34d399', accentPale: 'rgba(52,211,153,0.08)',
} as const;

export function ResponseForm({
  reviewId,
  practiceId,
  practiceSlug,
  existing,
  reviewBody,
  reviewTitle,
  rating,
  practiceName,
  isPaid,
}: {
  reviewId: string;
  practiceId: string;
  practiceSlug: string;
  existing?: string;
  reviewBody: string;
  reviewTitle: string | null;
  rating: number;
  practiceName: string;
  isPaid: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [body, setBody] = useState(existing ?? '');
  const [pending, setPending] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const accessToken = useContext(AccessTokenContext);

  async function handleGenerate() {
    setGenerating(true);
    setError(null);
    const res = await generateReviewResponse(accessToken, reviewBody, reviewTitle, rating, practiceName, practiceId);
    if (res.error) setError(res.error);
    else if (res.text) setBody(res.text);
    setGenerating(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setError(null);
    const res = await respondToReview(accessToken, reviewId, practiceId, body, practiceSlug);
    if (res?.error) setError(res.error);
    else { setSaved(true); setOpen(false); }
    setPending(false);
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        style={{ marginTop: 12, fontSize: 12.5, fontWeight: 500, color: D.accent, background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontFamily: 'var(--font-body)', opacity: 0.75 }}
      >
        {existing || saved ? 'Edit response' : '+ Respond publicly'}
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{ position: 'relative' }}>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={3}
          placeholder="Write a public response to this review…"
          style={{ width: '100%', border: `1.5px solid ${D.border2}`, borderRadius: 8, padding: '10px 14px', paddingBottom: 40, fontSize: 13, fontFamily: 'var(--font-body)', color: D.text, background: D.card2, outline: 'none', resize: 'vertical', boxSizing: 'border-box' }}
        />
        {isPaid ? (
          <button
            type="button"
            onClick={handleGenerate}
            disabled={generating}
            style={{
              position: 'absolute', bottom: 10, right: 10,
              display: 'inline-flex', alignItems: 'center', gap: 5,
              padding: '4px 12px',
              background: generating ? 'rgba(255,255,255,0.04)' : D.accentPale,
              color: generating ? D.faint : D.accent,
              border: `1px solid ${generating ? D.border : 'rgba(52,211,153,0.2)'}`,
              borderRadius: 20, fontSize: 12, fontWeight: 600,
              fontFamily: 'var(--font-body)', cursor: generating ? 'not-allowed' : 'pointer',
            }}
          >
            <Sun size={11} strokeWidth={1.3} />
            {generating ? 'Generating…' : 'Generate with AI'}
          </button>
        ) : (
          <a
            href={`/practices/${practiceSlug}/upgrade`}
            style={{
              position: 'absolute', bottom: 10, right: 10,
              display: 'inline-flex', alignItems: 'center', gap: 5,
              padding: '4px 12px',
              background: 'rgba(255,255,255,0.04)', color: D.faint,
              border: `1px solid ${D.border}`, borderRadius: 20,
              fontSize: 12, fontWeight: 600, fontFamily: 'var(--font-body)',
              textDecoration: 'none',
            }}
          >
            <Lock size={10} strokeWidth={2} />
            AI replies — Pro
          </a>
        )}
      </div>
      {error && <p style={{ fontSize: 12, color: '#f87171', margin: 0 }}>{error}</p>}
      <div style={{ display: 'flex', gap: 8 }}>
        <button
          type="submit"
          disabled={pending}
          style={{ padding: '7px 18px', borderRadius: 8, background: pending ? D.xfaint : D.accent, color: '#0d0d12', border: 'none', fontSize: 13, fontWeight: 600, fontFamily: 'var(--font-body)', cursor: pending ? 'not-allowed' : 'pointer' }}
        >
          {pending ? 'Saving…' : 'Post response'}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          style={{ padding: '7px 14px', borderRadius: 8, background: 'none', border: `1px solid ${D.border}`, fontSize: 13, color: D.faint, fontFamily: 'var(--font-body)', cursor: 'pointer' }}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
