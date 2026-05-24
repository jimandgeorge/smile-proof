'use client';

import { useState } from 'react';

type Plan = 'growth' | 'pro';

export default function UpgradeButtons({ slug }: { slug: string }) {
  const [loading, setLoading] = useState<Plan | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleUpgrade(plan: Plan) {
    setLoading(plan);
    setError(null);
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, plan }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Something went wrong');
      window.location.href = data.url;
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong');
      setLoading(null);
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {error && (
        <p style={{ fontSize: 13, color: '#dc2626', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '10px 14px', margin: 0, fontFamily: 'var(--font-body)' }}>
          {error}
        </p>
      )}
      <button
        onClick={() => handleUpgrade('growth')}
        disabled={!!loading}
        style={{
          width: '100%', padding: '13px', borderRadius: 50,
          background: loading === 'growth' ? 'var(--ink-faint)' : 'var(--forest)',
          color: 'white', border: 'none', fontSize: 15, fontWeight: 700,
          fontFamily: 'var(--font-body)', cursor: loading ? 'not-allowed' : 'pointer',
          letterSpacing: '-0.01em',
        }}
      >
        {loading === 'growth' ? 'Redirecting…' : 'Start Growth — £49/month'}
      </button>
      <button
        onClick={() => handleUpgrade('pro')}
        disabled={!!loading}
        style={{
          width: '100%', padding: '13px', borderRadius: 50,
          background: loading === 'pro' ? 'var(--ink-faint)' : 'var(--ink)',
          color: 'white', border: 'none', fontSize: 15, fontWeight: 700,
          fontFamily: 'var(--font-body)', cursor: loading ? 'not-allowed' : 'pointer',
          letterSpacing: '-0.01em',
        }}
      >
        {loading === 'pro' ? 'Redirecting…' : 'Start Pro — £99/month'}
      </button>
    </div>
  );
}
