'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
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
    const { data, error } = await supabase.auth.signUp({
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
    } else if (data.user && data.user.identities && data.user.identities.length === 0) {
      setError('An account with this email already exists. Please sign in instead.');
      setLoading(false);
    } else {
      setDone(true);
    }
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#07070e' }}>

      {/* ── Left panel ── */}
      <div className="auth-left-panel" style={{
        width: 420, flexShrink: 0,
        background: 'linear-gradient(160deg, #0e0e1a 0%, #09090f 100%)',
        borderRight: '1px solid rgba(255,255,255,0.06)',
        position: 'relative', overflow: 'hidden',
        flexDirection: 'column', padding: '44px 44px 48px',
      }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(52,211,153,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(52,211,153,0.025) 1px, transparent 1px)', backgroundSize: '56px 56px', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: '-5%', right: '-10%', width: 400, height: 400, background: 'radial-gradient(circle, rgba(52,211,153,0.06) 0%, transparent 65%)', pointerEvents: 'none' }} />

        <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', height: '100%' }}>
          <div style={{ marginBottom: 64 }}>
            <Image src="/SP-Logo-Light.svg" alt="SmileProof" width={140} height={26} style={{ display: 'block', height: 'auto' }} />
          </div>

          <div style={{ flex: 1 }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 34, fontWeight: 800, color: '#edeef5', lineHeight: 1.12, letterSpacing: '-0.03em', margin: '0 0 16px' }}>
              Intelligence for<br />
              <span style={{ color: '#34d399' }}>every practice.</span>
            </h2>
            <p style={{ fontSize: 14, color: 'rgba(237,238,245,0.5)', lineHeight: 1.68, fontFamily: 'var(--font-body)', margin: '0 0 36px', maxWidth: 300 }}>
              Connect your Google Reviews and unlock AI-powered insight into what your patients actually experience.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                'Connect Google Reviews in minutes',
                'AI intelligence reports from day one',
                'Benchmark against local practices',
              ].map(item => (
                <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 18, height: 18, borderRadius: '50%', background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Check size={8} strokeWidth={2.5} style={{ color: '#34d399' }} />
                  </div>
                  <span style={{ fontSize: 13, color: 'rgba(237,238,245,0.65)', fontFamily: 'var(--font-body)' }}>{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: '18px 20px' }}>
            <p style={{ fontSize: 13, color: 'rgba(237,238,245,0.65)', fontStyle: 'italic', lineHeight: 1.65, fontFamily: 'var(--font-body)', margin: '0 0 14px' }}>
              &ldquo;We had no idea wait times were such a consistent theme until SmileProof showed us. Fixed in two weeks.&rdquo;
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#34d399', fontFamily: 'var(--font-display)' }}>S</span>
              </div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#edeef5', fontFamily: 'var(--font-body)' }}>Sarah M.</div>
                <div style={{ fontSize: 11, color: 'rgba(237,238,245,0.35)', fontFamily: 'var(--font-body)' }}>Practice manager, Bristol</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Right panel ── */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px' }}>
        <div style={{ width: '100%', maxWidth: 380 }}>

          {done ? (
            <div style={{ textAlign: 'center' }}>
              <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                <Mail size={22} strokeWidth={1.5} style={{ color: '#34d399' }} />
              </div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 800, color: '#edeef5', margin: '0 0 10px', letterSpacing: '-0.02em' }}>
                Check your inbox
              </h2>
              <p style={{ fontSize: 14, color: 'rgba(237,238,245,0.48)', lineHeight: 1.65, margin: '0 0 6px', fontFamily: 'var(--font-body)' }}>
                We sent a confirmation link to
              </p>
              <p style={{ fontSize: 15, fontWeight: 600, color: '#edeef5', margin: '0 0 20px', fontFamily: 'var(--font-body)' }}>
                {email}
              </p>
              <p style={{ fontSize: 13, color: 'rgba(237,238,245,0.35)', fontFamily: 'var(--font-body)', lineHeight: 1.5 }}>
                Click the link to activate your account. Check your spam folder if it doesn&apos;t arrive.
              </p>
              <p style={{ marginTop: 28, fontSize: 14, color: 'rgba(237,238,245,0.4)', fontFamily: 'var(--font-body)' }}>
                Already confirmed?{' '}
                <Link href="/auth/login" style={{ fontWeight: 600, color: '#34d399', textDecoration: 'none' }}>Sign in</Link>
              </p>
            </div>
          ) : (
            <>
              <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 800, color: '#edeef5', margin: '0 0 8px', letterSpacing: '-0.025em' }}>
                Create your account.
              </h1>
              <p style={{ fontSize: 14, color: 'rgba(237,238,245,0.45)', margin: '0 0 32px', fontFamily: 'var(--font-body)' }}>
                Claim your practice and start your free intelligence dashboard.
              </p>

              <form onSubmit={handleSignUp} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'rgba(237,238,245,0.4)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8, fontFamily: 'var(--font-body)' }}>
                    Full name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Jane Smith"
                    style={{ width: '100%', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '11px 14px', fontSize: 14, fontFamily: 'var(--font-body)', color: '#edeef5', outline: 'none', background: 'rgba(255,255,255,0.04)', boxSizing: 'border-box' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'rgba(237,238,245,0.4)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8, fontFamily: 'var(--font-body)' }}>
                    Email address
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="you@practice.co.uk"
                    style={{ width: '100%', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '11px 14px', fontSize: 14, fontFamily: 'var(--font-body)', color: '#edeef5', outline: 'none', background: 'rgba(255,255,255,0.04)', boxSizing: 'border-box' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'rgba(237,238,245,0.4)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8, fontFamily: 'var(--font-body)' }}>
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
                      style={{ width: '100%', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '11px 42px 11px 14px', fontSize: 14, fontFamily: 'var(--font-body)', color: '#edeef5', outline: 'none', background: 'rgba(255,255,255,0.04)', boxSizing: 'border-box' }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(p => !p)}
                      style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: 2, color: 'rgba(237,238,245,0.3)', display: 'flex' }}
                    >
                      {showPassword ? <EyeOff size={16} strokeWidth={1.5} /> : <Eye size={16} strokeWidth={1.5} />}
                    </button>
                  </div>
                  <p style={{ fontSize: 12, color: 'rgba(237,238,245,0.28)', margin: '6px 0 0', fontFamily: 'var(--font-body)' }}>
                    Must be at least 8 characters.
                  </p>
                </div>

                {error && (
                  <p style={{ fontSize: 13, color: '#f87171', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, padding: '10px 14px', margin: 0, fontFamily: 'var(--font-body)' }}>
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  style={{ width: '100%', padding: '13px', borderRadius: 8, marginTop: 4, background: loading ? 'rgba(52,211,153,0.4)' : '#34d399', color: '#07070e', border: 'none', fontSize: 14, fontWeight: 700, fontFamily: 'var(--font-body)', cursor: loading ? 'not-allowed' : 'pointer', letterSpacing: '-0.01em' }}
                >
                  {loading ? 'Creating account…' : 'Create account'}
                </button>
              </form>

              <p style={{ textAlign: 'center', fontSize: 14, color: 'rgba(237,238,245,0.4)', fontFamily: 'var(--font-body)', margin: '24px 0 0' }}>
                Already have an account?{' '}
                <Link href="/auth/login" style={{ fontWeight: 600, color: '#34d399', textDecoration: 'none' }}>
                  Sign in
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
