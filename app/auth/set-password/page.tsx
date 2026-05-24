'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Eye, EyeOff } from 'lucide-react';
import { createClient } from '@/lib/supabase';

function SetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get('next') ?? '/';

  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      window.location.href = next;
    }
  }

  return (
    <div style={{ width: '100%', maxWidth: 400 }}>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 800, color: 'var(--ink)', margin: '0 0 8px', letterSpacing: '-0.02em' }}>
        Set your password
      </h1>
      <p style={{ fontSize: 14, color: 'var(--ink-soft)', margin: '0 0 28px', fontFamily: 'var(--font-body)', lineHeight: 1.55 }}>
        Create a password so you can sign in to your dashboard once your claim is approved.
      </p>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
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
          {loading ? 'Saving…' : 'Set password'}
        </button>
      </form>
    </div>
  );
}

export default function SetPasswordPage() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--cream)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px' }}>
      <Suspense>
        <SetPasswordForm />
      </Suspense>
    </div>
  );
}
