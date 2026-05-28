'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Eye, EyeOff, Check } from 'lucide-react';
import { createClient } from '@/lib/supabase';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const supabase = createClient();

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { data: authData, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      const { data: practice } = await supabase
        .from('practices')
        .select('slug')
        .eq('claimed_by_user_id', authData.user.id)
        .limit(1)
        .maybeSingle();
      router.push(practice?.slug ? `/practices/${practice.slug}/dashboard` : '/onboarding');
      router.refresh();
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
        {/* Grid */}
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(52,211,153,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(52,211,153,0.025) 1px, transparent 1px)', backgroundSize: '56px 56px', pointerEvents: 'none' }} />
        {/* Glow */}
        <div style={{ position: 'absolute', top: '-5%', right: '-10%', width: 400, height: 400, background: 'radial-gradient(circle, rgba(52,211,153,0.06) 0%, transparent 65%)', pointerEvents: 'none' }} />

        <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', height: '100%' }}>
          {/* Logo */}
          <div style={{ marginBottom: 64 }}>
            <Image src="/SP-Logo-Light.svg" alt="SmileProof" width={140} height={26} style={{ display: 'block', height: 'auto' }} />
          </div>

          <div style={{ flex: 1 }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 34, fontWeight: 800, color: '#edeef5', lineHeight: 1.12, letterSpacing: '-0.03em', margin: '0 0 16px' }}>
              Your practice.<br />
              <span style={{ color: '#34d399' }}>Understood.</span>
            </h2>
            <p style={{ fontSize: 14, color: 'rgba(237,238,245,0.5)', lineHeight: 1.68, fontFamily: 'var(--font-body)', margin: '0 0 36px', maxWidth: 300 }}>
              AI-powered intelligence from your Google Reviews — surfacing what patients really think about your practice.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                'AI analysis of your Google Reviews',
                '7-dimension practice scorecard',
                'Actionable management summaries',
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

          {/* Quote card */}
          <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: '18px 20px' }}>
            <p style={{ fontSize: 13, color: 'rgba(237,238,245,0.65)', fontStyle: 'italic', lineHeight: 1.65, fontFamily: 'var(--font-body)', margin: '0 0 14px' }}>
              &ldquo;The AI report flagged our wait time issue before it showed up in our Google score. We fixed it within a week.&rdquo;
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#34d399', fontFamily: 'var(--font-display)' }}>J</span>
              </div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#edeef5', fontFamily: 'var(--font-body)' }}>James K.</div>
                <div style={{ fontSize: 11, color: 'rgba(237,238,245,0.35)', fontFamily: 'var(--font-body)' }}>Practice owner, Leeds</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Right panel ── */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px' }}>
        <div style={{ width: '100%', maxWidth: 380 }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 800, color: '#edeef5', margin: '0 0 8px', letterSpacing: '-0.025em' }}>
            Welcome back.
          </h1>
          <p style={{ fontSize: 14, color: 'rgba(237,238,245,0.45)', margin: '0 0 32px', fontFamily: 'var(--font-body)' }}>
            Sign in to your practice intelligence dashboard.
          </p>

          <form onSubmit={handleSignIn} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
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
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <label style={{ fontSize: 11, fontWeight: 700, color: 'rgba(237,238,245,0.4)', letterSpacing: '0.08em', textTransform: 'uppercase', fontFamily: 'var(--font-body)' }}>
                  Password
                </label>
                <Link href="/auth/forgot-password" style={{ fontSize: 13, fontWeight: 500, color: 'rgba(237,238,245,0.45)', textDecoration: 'none', fontFamily: 'var(--font-body)' }}>
                  Forgot password?
                </Link>
              </div>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Your password"
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
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          <p style={{ textAlign: 'center', fontSize: 14, color: 'rgba(237,238,245,0.4)', fontFamily: 'var(--font-body)', margin: '24px 0 0' }}>
            Don&apos;t have an account?{' '}
            <Link href="/auth/signup" style={{ fontWeight: 600, color: '#34d399', textDecoration: 'none' }}>
              Sign up free
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
