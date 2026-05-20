'use client';

import { useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase';

function getRedirectBase() {
  return typeof window !== 'undefined'
    ? window.location.origin
    : (process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000');
}

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const supabase = createClient();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const redirectBase = getRedirectBase();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${redirectBase}/auth/reset-password`,
    });
    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      setSent(true);
    }
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>

      {/* ── Left panel ── */}
      <div style={{
        width: 400, flexShrink: 0, background: 'var(--forest)',
        position: 'relative', overflow: 'hidden',
        display: 'flex', flexDirection: 'column', padding: '40px 40px 48px',
      }}>
        <div style={{ position: 'absolute', top: -120, right: -100, width: 420, height: 420, borderRadius: '50%', background: 'rgba(255,255,255,0.04)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: 80, right: -180, width: 360, height: 360, borderRadius: '50%', background: 'rgba(255,255,255,0.04)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: 100, left: -80, width: 300, height: 300, borderRadius: '50%', background: 'rgba(255,255,255,0.04)', pointerEvents: 'none' }} />

        <div style={{ position: 'relative', zIndex: 1, marginBottom: 'auto' }}>
          <div style={{ marginBottom: 4 }}>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 700, color: 'white', letterSpacing: '-0.02em' }}>
              Smile<em style={{ fontStyle: 'italic', color: '#f59e0b' }}>Proof</em>
            </span>
          </div>
          <p style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.45)', letterSpacing: '0.12em', textTransform: 'uppercase', fontFamily: 'var(--font-body)', margin: '0 0 60px' }}>
            Trusted Dental Reviews
          </p>

          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 36, fontWeight: 800, color: 'white', lineHeight: 1.15, letterSpacing: '-0.02em', margin: '0 0 16px' }}>
            No worries.<br />
            <em style={{ fontStyle: 'italic' }}>Happens to us all.</em>
          </h2>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)', lineHeight: 1.65, fontFamily: 'var(--font-body)', margin: '0 0 32px', maxWidth: 280 }}>
            Enter your email and we&apos;ll send you a link to reset your password. It only takes a minute.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {['Secure reset link', 'Expires after 1 hour', 'No account needed to browse'].map(item => (
              <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 20, height: 20, borderRadius: '50%', background: 'rgba(245,158,11,0.2)', border: '1.5px solid rgba(245,158,11,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <svg width="9" height="9" viewBox="0 0 10 10" fill="none">
                    <polyline points="2,5 4,7.5 8,2.5" stroke="#f59e0b" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.75)', fontFamily: 'var(--font-body)' }}>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right panel ── */}
      <div style={{ flex: 1, background: 'var(--cream)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px' }}>
        <div style={{ width: '100%', maxWidth: 400 }}>

          {sent ? (
            /* ── Sent state ── */
            <div style={{ textAlign: 'center' }}>
              <div style={{
                width: 64, height: 64, borderRadius: '50%',
                background: 'var(--forest-pale)', border: '2px solid var(--forest)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 24px',
              }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" stroke="var(--forest)" strokeWidth="1.5" strokeLinecap="round" />
                  <polyline points="22,6 12,13 2,6" stroke="var(--forest)" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </div>
              <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 30, fontWeight: 800, color: 'var(--ink)', margin: '0 0 12px', letterSpacing: '-0.02em' }}>
                Check your inbox.
              </h1>
              <p style={{ fontSize: 14, color: 'var(--ink-soft)', fontFamily: 'var(--font-body)', margin: '0 0 8px', lineHeight: 1.65 }}>
                We sent a password reset link to
              </p>
              <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--ink)', fontFamily: 'var(--font-body)', margin: '0 0 32px' }}>
                {email}
              </p>
              <p style={{ fontSize: 13, color: 'var(--ink-faint)', fontFamily: 'var(--font-body)', margin: '0 0 32px', lineHeight: 1.65 }}>
                The link expires in 1 hour. Check your spam folder if you don&apos;t see it.
              </p>
              <button
                onClick={() => { setSent(false); setEmail(''); }}
                style={{
                  background: 'none', border: '1.5px solid var(--cream-dark)', borderRadius: 8,
                  padding: '10px 20px', fontSize: 13, fontWeight: 500,
                  fontFamily: 'var(--font-body)', color: 'var(--ink-soft)', cursor: 'pointer',
                  marginBottom: 16,
                }}
              >
                Try a different email
              </button>
            </div>
          ) : (
            /* ── Form state ── */
            <>
              <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 30, fontWeight: 800, color: 'var(--ink)', margin: '0 0 8px', letterSpacing: '-0.02em' }}>
                Forgot password?
              </h1>
              <p style={{ fontSize: 14, color: 'var(--ink-soft)', margin: '0 0 28px', fontFamily: 'var(--font-body)' }}>
                Enter your email and we&apos;ll send you a reset link.
              </p>

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--ink-soft)', letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 8, fontFamily: 'var(--font-body)' }}>
                    Email address
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    autoFocus
                    style={{
                      width: '100%', border: '1.5px solid var(--cream-dark)', borderRadius: 8,
                      padding: '11px 14px', fontSize: 14, fontFamily: 'var(--font-body)', color: 'var(--ink)',
                      outline: 'none', background: 'white', boxSizing: 'border-box',
                    }}
                  />
                </div>

                {error && (
                  <p style={{ fontSize: 13, color: '#dc2626', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '10px 14px', margin: 0, fontFamily: 'var(--font-body)' }}>
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    width: '100%', padding: '13px', borderRadius: 8, marginTop: 4,
                    background: loading ? 'var(--ink-faint)' : 'var(--forest)',
                    color: 'white', border: 'none', fontSize: 15, fontWeight: 700,
                    fontFamily: 'var(--font-body)', cursor: loading ? 'not-allowed' : 'pointer',
                    letterSpacing: '-0.01em',
                  }}
                >
                  {loading ? 'Sending…' : 'Send reset link'}
                </button>
              </form>
            </>
          )}

          <p style={{ textAlign: 'center', fontSize: 14, color: 'var(--ink-soft)', fontFamily: 'var(--font-body)', margin: '24px 0 10px' }}>
            Remember it now?{' '}
            <Link href="/auth/login" style={{ fontWeight: 700, color: 'var(--ink)', textDecoration: 'none' }}>
              Sign in
            </Link>
          </p>
          <p style={{ textAlign: 'center', margin: 0 }}>
            <Link href="/" style={{ fontSize: 13, color: 'var(--ink-faint)', fontFamily: 'var(--font-body)', textDecoration: 'underline', textUnderlineOffset: 2 }}>
              Continue browsing as guest
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
