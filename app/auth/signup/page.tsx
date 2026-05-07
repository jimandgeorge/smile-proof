'use client';

import { useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? '';

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
      <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
    </svg>
  );
}

export default function SignUpPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  const supabase = createClient();

  async function handleGoogleSignUp() {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${SITE_URL}/auth/callback` },
    });
  }

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: name.trim() || undefined },
        emailRedirectTo: `${SITE_URL}/auth/callback`,
      },
    });
    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      setDone(true);
    }
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>

      {/* ── Left panel (identical to login) ── */}
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
            Real reviews.<br />
            <em style={{ fontStyle: 'italic' }}>Real patients.</em>
          </h2>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)', lineHeight: 1.65, fontFamily: 'var(--font-body)', margin: '0 0 32px', maxWidth: 280 }}>
            Rated on what actually matters — pain, cleanliness, value, and outcomes. Not just a star.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {['12,400+ verified reviews', 'Scores on 5 key dimensions', 'NHS & private practices'].map(item => (
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

        <div style={{
          position: 'relative', zIndex: 1, marginTop: 48,
          background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)',
          borderRadius: 12, padding: '20px 20px 18px',
        }}>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.8)', fontStyle: 'italic', lineHeight: 1.65, fontFamily: 'var(--font-body)', margin: '0 0 14px' }}>
            "Finally a review site that tells me whether the treatment actually hurt — not just how pretty the waiting room was."
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'rgba(245,158,11,0.15)', border: '1.5px solid rgba(245,158,11,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: '#f59e0b', fontFamily: 'var(--font-display)' }}>R</span>
            </div>
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'white', fontFamily: 'var(--font-body)' }}>Rachel T.</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', fontFamily: 'var(--font-body)' }}>Verified reviewer</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Right panel ── */}
      <div style={{ flex: 1, background: 'var(--cream)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px' }}>
        <div style={{ width: '100%', maxWidth: 400 }}>

          {done ? (
            /* ── Confirmation state ── */
            <div style={{ textAlign: 'center' }}>
              <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'var(--forest-pale)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M3 8l7.89 5.26a2 2 0 0 0 2.22 0L21 8M5 19h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2z" stroke="var(--forest)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 800, color: 'var(--ink)', margin: '0 0 10px', letterSpacing: '-0.02em' }}>
                Check your inbox
              </h2>
              <p style={{ fontSize: 14, color: 'var(--ink-soft)', lineHeight: 1.65, margin: '0 0 6px', fontFamily: 'var(--font-body)' }}>
                We sent a confirmation link to
              </p>
              <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--ink)', margin: '0 0 20px', fontFamily: 'var(--font-body)' }}>
                {email}
              </p>
              <p style={{ fontSize: 13, color: 'var(--ink-faint)', fontFamily: 'var(--font-body)', lineHeight: 1.5 }}>
                Click the link to activate your account. Check your spam folder if it doesn't arrive.
              </p>
              <p style={{ marginTop: 28, fontSize: 14, color: 'var(--ink-soft)', fontFamily: 'var(--font-body)' }}>
                Already confirmed?{' '}
                <Link href="/auth/login" style={{ fontWeight: 700, color: 'var(--ink)', textDecoration: 'none' }}>Sign in</Link>
              </p>
            </div>
          ) : (
            /* ── Sign-up form ── */
            <>
              <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 30, fontWeight: 800, color: 'var(--ink)', margin: '0 0 8px', letterSpacing: '-0.02em' }}>
                Create your account.
              </h1>
              <p style={{ fontSize: 14, color: 'var(--ink-soft)', margin: '0 0 28px', fontFamily: 'var(--font-body)' }}>
                Join thousands of patients making better dental decisions.
              </p>

              <button
                onClick={handleGoogleSignUp}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                  padding: '12px 16px', borderRadius: 8, background: 'white',
                  border: '1.5px solid var(--cream-dark)', cursor: 'pointer',
                  fontSize: 14, fontWeight: 500, color: 'var(--ink)', fontFamily: 'var(--font-body)',
                  marginBottom: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                }}
              >
                <GoogleIcon />
                Continue with Google
              </button>

              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                <div style={{ flex: 1, height: 1, background: 'var(--cream-dark)' }} />
                <span style={{ fontSize: 12, color: 'var(--ink-faint)', fontFamily: 'var(--font-body)' }}>or</span>
                <div style={{ flex: 1, height: 1, background: 'var(--cream-dark)' }} />
              </div>

              <form onSubmit={handleSignUp} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--ink-soft)', letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 8, fontFamily: 'var(--font-body)' }}>
                    Full name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Sarah Johnson"
                    style={{
                      width: '100%', border: '1.5px solid var(--cream-dark)', borderRadius: 8,
                      padding: '11px 14px', fontSize: 14, fontFamily: 'var(--font-body)', color: 'var(--ink)',
                      outline: 'none', background: 'white', boxSizing: 'border-box',
                    }}
                  />
                </div>

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
                    style={{
                      width: '100%', border: '1.5px solid var(--cream-dark)', borderRadius: 8,
                      padding: '11px 14px', fontSize: 14, fontFamily: 'var(--font-body)', color: 'var(--ink)',
                      outline: 'none', background: 'white', boxSizing: 'border-box',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--ink-soft)', letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 8, fontFamily: 'var(--font-body)' }}>
                    Password
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      minLength={8}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="At least 8 characters"
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
                  <p style={{ fontSize: 12, color: 'var(--ink-faint)', margin: '6px 0 0', fontFamily: 'var(--font-body)' }}>
                    Must be at least 8 characters.
                  </p>
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
                  {loading ? 'Creating account…' : 'Create account'}
                </button>
              </form>

              <p style={{ textAlign: 'center', fontSize: 14, color: 'var(--ink-soft)', fontFamily: 'var(--font-body)', margin: '20px 0 10px' }}>
                Already have an account?{' '}
                <Link href="/auth/login" style={{ fontWeight: 700, color: 'var(--ink)', textDecoration: 'none' }}>
                  Sign in
                </Link>
              </p>
              <p style={{ textAlign: 'center', margin: 0 }}>
                <Link href="/" style={{ fontSize: 13, color: 'var(--ink-faint)', fontFamily: 'var(--font-body)', textDecoration: 'underline', textUnderlineOffset: 2 }}>
                  Continue browsing as guest
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
