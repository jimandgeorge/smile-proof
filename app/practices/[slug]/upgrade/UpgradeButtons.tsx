'use client';

import { useState } from 'react';

export default function UpgradeButtons({ slug }: { slug: string }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleUpgrade() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, plan: 'pro' }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Something went wrong');
      window.location.href = data.url;
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong');
      setLoading(false);
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {error && (
        <p style={{ fontSize: 13, color: '#f87171', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, padding: '10px 14px', margin: 0, fontFamily: 'var(--font-body)' }}>
          {error}
        </p>
      )}
      <button
        onClick={handleUpgrade}
        disabled={loading}
        style={{
          width: '100%', padding: '14px',
          borderRadius: 10,
          background: loading ? 'rgba(52,211,153,0.4)' : '#34d399',
          color: '#07070e', border: 'none',
          fontSize: 15, fontWeight: 700,
          fontFamily: 'var(--font-body)',
          cursor: loading ? 'not-allowed' : 'pointer',
          letterSpacing: '-0.01em',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        }}
      >
        {loading ? 'Redirecting to checkout…' : 'Start Practice — £99/month'}
        {!loading && (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
        )}
      </button>
    </div>
  );
}
