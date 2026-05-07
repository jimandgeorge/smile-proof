'use client';

import { useState, useEffect, useRef } from 'react';

type Props = { score: number };

export default function ToothScore({ score }: Props) {
  const r = 28;
  const circumference = 2 * Math.PI * r;
  const fill = Math.min(Math.max(score / 5, 0), 1);
  const offset = circumference * (1 - fill);

  const strokeColor =
    score >= 4.5 ? 'var(--forest)' : score >= 3.5 ? 'var(--gold)' : '#e05252';

  const [open, setOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  return (
    <div style={{ position: 'relative', display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
      <svg width="80" height="80" viewBox="0 0 80 80" style={{ transform: 'rotate(-90deg)' }}>
        <circle cx="40" cy="40" r={r} fill="none" stroke="var(--cream-dark)" strokeWidth="5" />
        <circle
          cx="40" cy="40" r={r} fill="none"
          stroke={strokeColor} strokeWidth="5"
          strokeDasharray={circumference} strokeDashoffset={offset}
          strokeLinecap="round"
        />
        <text
          x="40" y="44" textAnchor="middle"
          style={{ transform: 'rotate(90deg)', transformOrigin: '40px 40px', fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, fill: 'var(--ink)' }}
        >
          {score.toFixed(1)}
        </text>
      </svg>

      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        <span style={{ fontSize: 11, color: 'var(--ink-soft)' }}>Overall Score</span>
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-label="How is this score calculated?"
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 14, height: 14, borderRadius: '50%', background: 'var(--ink-faint)', border: 'none', cursor: 'pointer', padding: 0, flexShrink: 0 }}
        >
          <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
            <text x="4" y="6.5" textAnchor="middle" fontSize="7" fontWeight="700" fill="var(--ink-soft)" fontFamily="var(--font-body)">i</text>
          </svg>
        </button>
      </div>

      {open && (
        <div
          ref={popoverRef}
          style={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            right: 0,
            width: 240,
            background: 'white',
            border: '1.5px solid var(--cream-dark)',
            borderRadius: 10,
            boxShadow: '0 8px 24px rgba(0,0,0,0.10)',
            padding: '14px 16px',
            zIndex: 50,
            textAlign: 'left',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--ink)', fontFamily: 'var(--font-display)' }}>
              How is the score calculated?
            </span>
            <button
              type="button"
              onClick={() => setOpen(false)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: 'var(--ink-faint)', lineHeight: 1, fontSize: 16, marginLeft: 8, flexShrink: 0 }}
              aria-label="Close"
            >
              ×
            </button>
          </div>
          <p style={{ fontSize: 12, color: 'var(--ink-soft)', fontFamily: 'var(--font-body)', lineHeight: 1.6, margin: 0 }}>
            <strong style={{ color: 'var(--ink-mid)' }}>Weighted average</strong> — To ensure all practices start with a balanced score, our calculation includes 7 neutral (3.5★) reviews by default. This has less impact as more real reviews come in.
          </p>
        </div>
      )}
    </div>
  );
}
