'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Mail, Check } from 'lucide-react';
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
              No worries.<br />
              <span style={{ color: '#34d399' }}>Happens to all of us.</span>
            </h2>
            <p style={{ fontSize: 14, color: 'rgba(237,238,245,0.5)', lineHeight: 1.68, fontFamily: 'var(--font-body)', margin: '0 0 36px', maxWidth: 300 }}>
              Enter your email and we&apos;ll send a secure link to reset your password. It only takes a minute.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {['Secure reset link via email', 'Link expires after 1 hour', 'Your data is always protected'].map(item => (
                <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 18, height: 18, borderRadius: '50%', background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Check size={8} strokeWidth={2.5} style={{ color: '#34d399' }} />
                  </div>
                  <span style={{ fontSize: 13, color: 'rgba(237,238,245,0.65)', fontFamily: 'var(--font-body)' }}>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Right panel ── */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px' }}>
        <div style={{ width: '100%', maxWidth: 380 }}>

          {sent ? (
            <div style={{ textAlign: 'center' }}>
              <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                <Mail size={22} strokeWidth={1.5} style={{ color: '#34d399' }} />
              </div>
              <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 800, color: '#edeef5', margin: '0 0 12px', letterSpacing: '-0.02em' }}>
                Check your inbox.
              </h1>
              <p style={{ fontSize: 14, color: 'rgba(237,238,245,0.48)', fontFamily: 'var(--font-body)', margin: '0 0 8px', lineHeight: 1.65 }}>
                We sent a password reset link to
              </p>
              <p style={{ fontSize: 15, fontWeight: 600, color: '#edeef5', fontFamily: 'var(--font-body)', margin: '0 0 20px' }}>
                {email}
              </p>
              <p style={{ fontSize: 13, color: 'rgba(237,238,245,0.35)', fontFamily: 'var(--font-body)', margin: '0 0 28px', lineHeight: 1.65 }}>
                The link expires in 1 hour. Check your spam folder if you don&apos;t see it.
              </p>
              <button
                onClick={() => { setSent(false); setEmail(''); }}
                style={{ background: 'none', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 8, padding: '10px 20px', fontSize: 13, fontWeight: 500, fontFamily: 'var(--font-body)', color: 'rgba(237,238,245,0.5)', cursor: 'pointer' }}
              >
                Try a different email
              </button>
            </div>
          ) : (
            <>
              <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 800, color: '#edeef5', margin: '0 0 8px', letterSpacing: '-0.025em' }}>
                Forgot password?
              </h1>
              <p style={{ fontSize: 14, color: 'rgba(237,238,245,0.45)', margin: '0 0 32px', fontFamily: 'var(--font-body)' }}>
                Enter your email and we&apos;ll send you a reset link.
              </p>

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
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
                    autoFocus
                    style={{ width: '100%', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '11px 14px', fontSize: 14, fontFamily: 'var(--font-body)', color: '#edeef5', outline: 'none', background: 'rgba(255,255,255,0.04)', boxSizing: 'border-box' }}
                  />
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
                  {loading ? 'Sending…' : 'Send reset link'}
                </button>
              </form>
            </>
          )}

          <p style={{ textAlign: 'center', fontSize: 14, color: 'rgba(237,238,245,0.4)', fontFamily: 'var(--font-body)', margin: '24px 0 0' }}>
            Remember it now?{' '}
            <Link href="/auth/login" style={{ fontWeight: 600, color: '#34d399', textDecoration: 'none' }}>
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
