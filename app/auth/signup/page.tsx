'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Eye, EyeOff, Check, Mail } from 'lucide-react';
import { createClient } from '@/lib/supabase';

function getRedirectBase() {
  return typeof window !== 'undefined'
    ? window.location.origin
    : (process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000');
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

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const redirectBase = getRedirectBase();
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: name.trim() || undefined },
        emailRedirectTo: `${redirectBase}/auth/callback`,
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
      <div className="auth-left-panel" style={{
        width: 400, flexShrink: 0, background: 'var(--forest)',
        position: 'relative', overflow: 'hidden',
        flexDirection: 'column', padding: '40px 40px 48px',
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
            {['Rated on pain, value, anxiety & more', 'Reviews verified by real patients', 'NHS & private practices across England'].map(item => (
              <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 20, height: 20, borderRadius: '50%', background: 'rgba(245,158,11,0.2)', border: '1.5px solid rgba(245,158,11,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Check size={9} strokeWidth={1.5} style={{ color: '#f59e0b' }} />
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
                <Mail size={24} strokeWidth={1.5} style={{ color: 'var(--forest)' }} />
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
                      {showPassword ? <EyeOff size={16} strokeWidth={1.5} /> : <Eye size={16} strokeWidth={1.5} />}
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
