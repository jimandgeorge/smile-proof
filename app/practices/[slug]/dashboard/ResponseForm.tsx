'use client';

import { useState } from 'react';
import { respondToReview, generateReviewResponse } from './actions';

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

  async function handleGenerate() {
    setGenerating(true);
    setError(null);
    const res = await generateReviewResponse(reviewBody, reviewTitle, rating, practiceName, practiceId);
    if (res.error) setError(res.error);
    else if (res.text) setBody(res.text);
    setGenerating(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setError(null);
    const res = await respondToReview(reviewId, practiceId, body, practiceSlug);
    if (res?.error) setError(res.error);
    else { setSaved(true); setOpen(false); }
    setPending(false);
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        style={{ marginTop: 12, fontSize: 13, fontWeight: 500, color: 'var(--forest)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontFamily: 'var(--font-body)' }}
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
          style={{ width: '100%', border: '1.5px solid var(--cream-dark)', borderRadius: 8, padding: '10px 14px', paddingBottom: 40, fontSize: 13, fontFamily: 'var(--font-body)', color: 'var(--ink)', outline: 'none', resize: 'vertical', boxSizing: 'border-box' }}
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
              background: generating ? 'var(--ink-faint)' : 'var(--forest-pale)',
              color: 'var(--forest)', border: '1px solid rgba(28,69,53,0.2)',
              borderRadius: 20, fontSize: 12, fontWeight: 600,
              fontFamily: 'var(--font-body)', cursor: generating ? 'not-allowed' : 'pointer',
            }}
          >
            <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
              <path d="M6 1v2M6 9v2M1 6h2M9 6h2M2.5 2.5l1.4 1.4M8.1 8.1l1.4 1.4M2.5 9.5l1.4-1.4M8.1 3.9l1.4-1.4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
            </svg>
            {generating ? 'Generating…' : 'Generate with AI'}
          </button>
        ) : (
          <a
            href={`/practices/${practiceSlug}/upgrade`}
            style={{
              position: 'absolute', bottom: 10, right: 10,
              display: 'inline-flex', alignItems: 'center', gap: 5,
              padding: '4px 12px',
              background: 'var(--cream-dark)', color: 'var(--ink-soft)',
              border: '1px solid var(--cream-dark)', borderRadius: 20,
              fontSize: 12, fontWeight: 600, fontFamily: 'var(--font-body)',
              textDecoration: 'none',
            }}
          >
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
              <rect x="3" y="11" width="18" height="11" rx="2" stroke="currentColor" strokeWidth="2" fill="none" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            AI replies — Pro
          </a>
        )}
      </div>
      {error && (
        <p style={{ fontSize: 12, color: '#c0392b' }}>{error}</p>
      )}
      <div style={{ display: 'flex', gap: 8 }}>
        <button
          type="submit"
          disabled={pending}
          style={{ padding: '7px 18px', borderRadius: 50, background: pending ? 'var(--ink-faint)' : 'var(--forest)', color: 'var(--cream)', border: 'none', fontSize: 13, fontWeight: 600, fontFamily: 'var(--font-body)', cursor: pending ? 'not-allowed' : 'pointer', transition: 'var(--transition)' }}
        >
          {pending ? 'Saving…' : 'Post response'}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          style={{ padding: '7px 14px', borderRadius: 50, background: 'none', border: 'none', fontSize: 13, color: 'var(--ink-soft)', fontFamily: 'var(--font-body)', cursor: 'pointer' }}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
