'use client';

import { useState, useTransition } from 'react';
import { submitFollowup } from './actions';

const LABELS = ['', 'Poor', 'Below average', 'Average', 'Good', 'Excellent'];

function StarRating({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hovered, setHovered] = useState<number | null>(null);
  const display = hovered ?? value;
  return (
    <span style={{ display: 'inline-flex', gap: 3 }}>
      {[1, 2, 3, 4, 5].map((n) => (
        <svg
          key={n}
          width={28}
          height={28}
          viewBox="0 0 16 16"
          style={{ cursor: 'pointer', flexShrink: 0 }}
          onMouseEnter={() => setHovered(n)}
          onMouseLeave={() => setHovered(null)}
          onClick={() => onChange(n)}
        >
          <polygon
            points="8,1.5 9.8,6 14.5,6.3 11,9.5 12.2,14 8,11.5 3.8,14 5,9.5 1.5,6.3 6.2,6"
            fill={n <= display ? 'var(--gold)' : 'var(--ink-faint)'}
            style={{ transition: 'fill 0.1s' }}
          />
        </svg>
      ))}
    </span>
  );
}

export default function FollowupForm({
  reviewId,
  token,
  practiceName,
}: {
  reviewId: string;
  token: string;
  practiceName: string;
}) {
  const [body, setBody] = useState('');
  const [rating, setRating] = useState(0);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (body.trim().length < 20) return;
    startTransition(async () => {
      const result = await submitFollowup({ reviewId, token, body, rating: rating || null });
      if (result?.error) {
        setError(result.error);
      } else {
        setDone(true);
      }
    });
  }

  if (done) {
    return (
      <div
        className="rounded-2xl text-center"
        style={{ border: '1.5px solid var(--cream-dark)', padding: '40px 28px', background: 'white' }}
      >
        <div
          className="mx-auto mb-4 flex items-center justify-center rounded-full"
          style={{ width: 52, height: 52, background: 'var(--forest-pale)' }}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path d="M5 12l4 4 10-10" stroke="var(--forest)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <h2
          className="font-bold mb-2"
          style={{ fontFamily: 'var(--font-display)', fontSize: 22, color: 'var(--ink)' }}
        >
          Thanks for the update!
        </h2>
        <p style={{ fontSize: 14, color: 'var(--ink-soft)', fontFamily: 'var(--font-body)', lineHeight: 1.65 }}>
          Your follow-up has been added to your review of {practiceName}. It helps future patients make better decisions.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl"
      style={{ border: '1.5px solid var(--cream-dark)', padding: '24px', background: 'white' }}
    >
      {/* Updated rating */}
      <div style={{ marginBottom: 22 }}>
        <label
          style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--ink-soft)', marginBottom: 10, fontFamily: 'var(--font-body)' }}
        >
          Updated overall rating <span style={{ fontWeight: 400, color: 'var(--ink-faint)' }}>(optional)</span>
        </label>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <StarRating value={rating} onChange={setRating} />
          {rating > 0 && (
            <span style={{ fontSize: 13, color: 'var(--ink-soft)', fontFamily: 'var(--font-body)' }}>
              {LABELS[rating]}
            </span>
          )}
        </div>
      </div>

      {/* Outcome text */}
      <div style={{ marginBottom: 20 }}>
        <label
          style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--ink-soft)', marginBottom: 6, fontFamily: 'var(--font-body)' }}
        >
          How has the result held up?
        </label>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={4}
          placeholder="e.g. The filling is still holding up great three months on. No sensitivity and I'm really happy with the result…"
          style={{
            width: '100%',
            padding: '12px 14px',
            borderRadius: 8,
            border: '1.5px solid var(--cream-dark)',
            fontSize: 14,
            fontFamily: 'var(--font-body)',
            color: 'var(--ink)',
            background: 'var(--cream)',
            outline: 'none',
            boxSizing: 'border-box',
            resize: 'vertical',
            lineHeight: 1.7,
          }}
        />
        <div
          style={{
            fontSize: 12,
            color: body.length >= 20 ? 'var(--forest)' : 'var(--ink-faint)',
            marginTop: 4,
            textAlign: 'right',
            fontFamily: 'var(--font-body)',
          }}
        >
          {body.length}/20 min characters
        </div>
      </div>

      {error && (
        <p style={{ fontSize: 13, color: '#dc2626', marginBottom: 12, fontFamily: 'var(--font-body)' }}>
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={isPending || body.trim().length < 20}
        style={{
          width: '100%',
          padding: '13px',
          borderRadius: 8,
          background: isPending || body.trim().length < 20 ? 'var(--ink-faint)' : 'var(--forest)',
          color: 'var(--cream)',
          border: 'none',
          fontSize: 15,
          fontWeight: 700,
          fontFamily: 'var(--font-body)',
          cursor: isPending || body.trim().length < 20 ? 'not-allowed' : 'pointer',
          transition: 'background var(--transition)',
        }}
      >
        {isPending ? 'Saving…' : 'Submit follow-up'}
      </button>
    </form>
  );
}
