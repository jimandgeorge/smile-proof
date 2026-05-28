'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Mail, AlertCircle, CheckCircle } from 'lucide-react';
import { createClient } from '@/lib/supabase';

export default function ConfirmExpiredPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleResend(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.resend({ type: 'signup', email });
    if (error) {
      setError(error.message);
    } else {
      setSent(true);
    }
    setLoading(false);
  }

  return (
    <div style={{ minHeight: '100vh', background: '#07070e', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px' }}>
      <div style={{ width: '100%', maxWidth: 400 }}>
        <div style={{ marginBottom: 36, textAlign: 'center' }}>
          <Image src="/SP-Logo-Light.svg" alt="SmileProof" width={120} height={22} style={{ display: 'inline-block', height: 'auto' }} />
        </div>

        {sent ? (
          <div style={{ textAlign: 'center' }}>
            <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              <CheckCircle size={22} strokeWidth={1.5} style={{ color: '#34d399' }} />
            </div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 800, color: '#edeef5', margin: '0 0 10px', letterSpacing: '-0.02em' }}>
              Confirmation sent
            </h1>
            <p style={{ fontSize: 14, color: 'rgba(237,238,245,0.48)', lineHeight: 1.65, fontFamily: 'var(--font-body)', margin: '0 0 6px' }}>
              We sent a new confirmation link to
            </p>
            <p style={{ fontSize: 15, fontWeight: 600, color: '#edeef5', margin: '0 0 24px', fontFamily: 'var(--font-body)' }}>
              {email}
            </p>
            <p style={{ fontSize: 13, color: 'rgba(237,238,245,0.32)', fontFamily: 'var(--font-body)', lineHeight: 1.5 }}>
              Check your spam folder if it doesn&apos;t arrive within a minute.
            </p>
            <p style={{ marginTop: 28, fontSize: 14, color: 'rgba(237,238,245,0.4)', fontFamily: 'var(--font-body)' }}>
              <Link href="/auth/login" style={{ fontWeight: 600, color: '#34d399', textDecoration: 'none' }}>Back to sign in</Link>
            </p>
          </div>
        ) : (
          <>
            <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              <AlertCircle size={20} strokeWidth={1.5} style={{ color: '#f87171' }} />
            </div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 800, color: '#edeef5', margin: '0 0 10px', letterSpacing: '-0.02em', textAlign: 'center' }}>
              Confirmation link expired
            </h1>
            <p style={{ fontSize: 14, color: 'rgba(237,238,245,0.48)', lineHeight: 1.65, fontFamily: 'var(--font-body)', margin: '0 0 28px', textAlign: 'center' }}>
              Email confirmation links expire after 24 hours. Enter your email below to receive a new one.
            </p>

            <form onSubmit={handleResend} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
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

              {error && (
                <p style={{ fontSize: 13, color: '#f87171', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, padding: '10px 14px', margin: 0, fontFamily: 'var(--font-body)' }}>
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                style={{ width: '100%', padding: '12px', borderRadius: 8, background: loading ? 'rgba(52,211,153,0.4)' : '#34d399', color: '#07070e', border: 'none', fontSize: 14, fontWeight: 700, fontFamily: 'var(--font-body)', cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
              >
                <Mail size={15} strokeWidth={2} />
                {loading ? 'Sending…' : 'Resend confirmation email'}
              </button>
            </form>

            <p style={{ textAlign: 'center', fontSize: 14, color: 'rgba(237,238,245,0.4)', fontFamily: 'var(--font-body)', margin: '24px 0 0' }}>
              Already confirmed?{' '}
              <Link href="/auth/login" style={{ fontWeight: 600, color: '#34d399', textDecoration: 'none' }}>Sign in</Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
