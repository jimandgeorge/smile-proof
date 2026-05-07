'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase';

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [ready, setReady] = useState(false);

  const supabase = createClient();

  useEffect(() => {
    // Supabase exchanges the token from the URL fragment on load
    supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') setReady(true);
    });
  }, [supabase.auth]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      setDone(true);
      setTimeout(() => router.push('/'), 2000);
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

        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ marginBottom: 4 }}>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 700, color: 'white', letterSpacing: '-0.02em' }}>
              Smile<em style={{ fontStyle: 'italic', color: '#f59e0b' }}>Proof</em>
            </span>
          </div>
          <p style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.45)', letterSpacing: '0.12em', textTransform: 'uppercase', fontFamily: 'var(--font-body)', margin: '0 0 60px' }}>
            Trusted Dental Reviews
          </p>

          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 36, fontWeight: 800, color: 'white', lineHeight: 1.15, letterSpacing: '-0.02em', margin: '0 0 16px' }}>
            Choose a new<br />
            <em style={{ fontStyle: 'italic' }}>password.</em>
          </h2>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)', lineHeight: 1.65, fontFamily: 'var(--font-body)', margin: '0 0 32px', maxWidth: 280 }}>
            Pick something secure you&apos;ll remember. At least 8 characters is a good start.
          </p>
        </div>
      </div>

      {/* ── Right panel ── */}
      <div style={{ flex: 1, background: 'var(--cream)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px' }}>
        <div style={{ width: '100%', maxWidth: 400 }}>

          {done ? (
            <div style={{ textAlign: 'center' }}>
              <div style={{
                width: 64, height: 64, borderRadius: '50%',
                background: 'var(--forest-pale)', border: '2px solid var(--forest)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 24px',
              }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                  <polyline points="20,6 9,17 4,12" stroke="var(--forest)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 30, fontWeight: 800, color: 'var(--ink)', margin: '0 0 12px', letterSpacing: '-0.02em' }}>
                Password updated.
              </h1>
              <p style={{ fontSize: 14, color: 'var(--ink-soft)', fontFamily: 'var(--font-body)', margin: 0 }}>
                Redirecting you home…
              </p>
            </div>
          ) : !ready ? (
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontSize: 14, color: 'var(--ink-soft)', fontFamily: 'var(--font-body)', margin: '0 0 24px' }}>
                Verifying your reset link…
              </p>
              <Link href="/auth/forgot-password" style={{ fontSize: 13, color: 'var(--ink-faint)', fontFamily: 'var(--font-body)', textDecoration: 'underline', textUnderlineOffset: 2 }}>
                Request a new link
              </Link>
            </div>
          ) : (
            <>
              <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 30, fontWeight: 800, color: 'var(--ink)', margin: '0 0 8px', letterSpacing: '-0.02em' }}>
                Set new password.
              </h1>
              <p style={{ fontSize: 14, color: 'var(--ink-soft)', margin: '0 0 28px', fontFamily: 'var(--font-body)' }}>
                Must be at least 8 characters.
              </p>

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--ink-soft)', letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 8, fontFamily: 'var(--font-body)' }}>
                    New password
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      minLength={8}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="At least 8 characters"
                      autoFocus
                      style={{
                        width: '100%', border: '1.5px solid var(--cream-dark)', borderRadius: 8,
                        padding: '11px 42px 11px 14px', fontSize: 14, fontFamily: 'var(--font-body)', color: 'var(--ink)',
                        outline: 'none', background: 'white', boxSizing: 'border-box',
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(p => !p)}
                      style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: 2, color: 'var(--ink-faint)', display: 'flex' }}
                    >
                      {showPassword ? (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                          <line x1="1" y1="1" x2="23" y2="23" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                        </svg>
                      ) : (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                          <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.5" />
                        </svg>
                      )}
                    </button>
                  </div>
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
                  {loading ? 'Saving…' : 'Update password'}
                </button>
              </form>
            </>
          )}

          <p style={{ textAlign: 'center', margin: '24px 0 0' }}>
            <Link href="/" style={{ fontSize: 13, color: 'var(--ink-faint)', fontFamily: 'var(--font-body)', textDecoration: 'underline', textUnderlineOffset: 2 }}>
              Continue browsing as guest
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
