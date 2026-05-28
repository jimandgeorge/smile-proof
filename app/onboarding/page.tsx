'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { createClient } from '@/lib/supabase';
import { Check, ArrowRight, Building2, MapPin, Stethoscope } from 'lucide-react';

type PracticeType = 'nhs' | 'private' | 'mixed';

const PRACTICE_TYPES: { value: PracticeType; label: string; description: string }[] = [
  { value: 'nhs',     label: 'NHS',     description: 'Primarily NHS-funded patients' },
  { value: 'private', label: 'Private', description: 'Primarily private patients' },
  { value: 'mixed',   label: 'Mixed',   description: 'Both NHS and private' },
];

const inputStyle: React.CSSProperties = {
  width: '100%',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: 8,
  padding: '11px 14px 11px 38px',
  fontSize: 14,
  fontFamily: 'var(--font-body)',
  color: '#edeef5',
  background: 'rgba(255,255,255,0.04)',
  outline: 'none',
  boxSizing: 'border-box',
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: 11,
  fontWeight: 700,
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
  color: 'rgba(237,238,245,0.4)',
  fontFamily: 'var(--font-body)',
  marginBottom: 8,
};

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [name, setName] = useState('');
  const [city, setCity] = useState('');
  const [postcode, setPostcode] = useState('');
  const [practiceType, setPracticeType] = useState<PracticeType>('mixed');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [slug, setSlug] = useState('');
  const [checking, setChecking] = useState(true);

  // Redirect if not logged in; check for existing practice handled by API
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        router.replace('/auth/login');
        return;
      }
      setChecking(false);
    });
  }, [router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !city.trim()) {
      setError('Practice name and city are required.');
      return;
    }
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/practices/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), city: city.trim(), postcode: postcode.trim(), practice_type: practiceType }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? 'Something went wrong. Please try again.');
        setLoading(false);
        return;
      }
      setSlug(data.slug);
      setStep(2);
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  if (checking) {
    return (
      <div style={{ minHeight: '100vh', background: '#07070e', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#34d399', boxShadow: '0 0 8px rgba(52,211,153,0.8)' }} />
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#07070e', display: 'flex', flexDirection: 'column' }}>
      {/* Top bar */}
      <div style={{ padding: '20px 32px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <Image src="/SP-Logo-Light.svg" alt="SmileProof" width={130} height={24} style={{ display: 'block', height: 'auto' }} />
      </div>

      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px' }}>
        <div style={{ width: '100%', maxWidth: 480 }}>

          {step === 1 ? (
            <>
              {/* Step indicator */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 32 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ width: 22, height: 22, borderRadius: '50%', background: '#34d399', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: '#07070e', fontFamily: 'var(--font-body)' }}>1</span>
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 600, color: '#34d399', fontFamily: 'var(--font-body)' }}>Your practice</span>
                </div>
                <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.08)' }} />
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ width: 22, height: 22, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontSize: 11, fontWeight: 600, color: 'rgba(237,238,245,0.3)', fontFamily: 'var(--font-body)' }}>2</span>
                  </div>
                  <span style={{ fontSize: 12, color: 'rgba(237,238,245,0.3)', fontFamily: 'var(--font-body)' }}>Connect reviews</span>
                </div>
              </div>

              <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 800, color: '#edeef5', letterSpacing: '-0.025em', margin: '0 0 8px' }}>
                Tell us about your practice.
              </h1>
              <p style={{ fontSize: 14, color: 'rgba(237,238,245,0.45)', fontFamily: 'var(--font-body)', margin: '0 0 32px', lineHeight: 1.6 }}>
                This sets up your intelligence dashboard. You can update these details any time from Settings.
              </p>

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                {/* Practice name */}
                <div>
                  <label style={labelStyle}>Practice name</label>
                  <div style={{ position: 'relative' }}>
                    <Building2 size={14} style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: 'rgba(237,238,245,0.25)', pointerEvents: 'none' }} />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={e => setName(e.target.value)}
                      placeholder="City Dental Practice"
                      style={inputStyle}
                    />
                  </div>
                </div>

                {/* City + Postcode */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 140px', gap: 12 }}>
                  <div>
                    <label style={labelStyle}>City</label>
                    <div style={{ position: 'relative' }}>
                      <MapPin size={14} style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: 'rgba(237,238,245,0.25)', pointerEvents: 'none' }} />
                      <input
                        type="text"
                        required
                        value={city}
                        onChange={e => setCity(e.target.value)}
                        placeholder="London"
                        style={inputStyle}
                      />
                    </div>
                  </div>
                  <div>
                    <label style={labelStyle}>Postcode</label>
                    <input
                      type="text"
                      value={postcode}
                      onChange={e => setPostcode(e.target.value)}
                      placeholder="SW1A 1AA"
                      style={{ ...inputStyle, paddingLeft: 14 }}
                    />
                  </div>
                </div>

                {/* Practice type */}
                <div>
                  <label style={labelStyle}>Practice type</label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                    {PRACTICE_TYPES.map(({ value, label, description }) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setPracticeType(value)}
                        style={{
                          padding: '12px 8px',
                          borderRadius: 8,
                          border: practiceType === value
                            ? '1px solid rgba(52,211,153,0.5)'
                            : '1px solid rgba(255,255,255,0.08)',
                          background: practiceType === value
                            ? 'rgba(52,211,153,0.07)'
                            : 'rgba(255,255,255,0.02)',
                          cursor: 'pointer',
                          textAlign: 'center',
                          transition: 'all 0.15s',
                        }}
                      >
                        <div style={{ fontSize: 13, fontWeight: 700, color: practiceType === value ? '#34d399' : 'rgba(237,238,245,0.65)', fontFamily: 'var(--font-body)', marginBottom: 3 }}>{label}</div>
                        <div style={{ fontSize: 10.5, color: 'rgba(237,238,245,0.3)', fontFamily: 'var(--font-body)', lineHeight: 1.3 }}>{description}</div>
                      </button>
                    ))}
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
                  style={{ width: '100%', padding: '13px', borderRadius: 8, background: loading ? 'rgba(52,211,153,0.4)' : '#34d399', color: '#07070e', border: 'none', fontSize: 14, fontWeight: 700, fontFamily: 'var(--font-body)', cursor: loading ? 'not-allowed' : 'pointer', letterSpacing: '-0.01em', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
                >
                  {loading ? 'Setting up…' : (
                    <>
                      Continue
                      <ArrowRight size={14} strokeWidth={2.5} />
                    </>
                  )}
                </button>
              </form>
            </>
          ) : (
            /* Step 2: Connect Google Reviews */
            <>
              {/* Step indicator */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 32 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ width: 22, height: 22, borderRadius: '50%', background: 'rgba(52,211,153,0.12)', border: '1px solid rgba(52,211,153,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Check size={10} strokeWidth={2.5} style={{ color: '#34d399' }} />
                  </div>
                  <span style={{ fontSize: 12, color: 'rgba(237,238,245,0.4)', fontFamily: 'var(--font-body)' }}>Your practice</span>
                </div>
                <div style={{ flex: 1, height: 1, background: '#34d399', opacity: 0.3 }} />
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ width: 22, height: 22, borderRadius: '50%', background: '#34d399', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: '#07070e', fontFamily: 'var(--font-body)' }}>2</span>
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 600, color: '#34d399', fontFamily: 'var(--font-body)' }}>Connect reviews</span>
                </div>
              </div>

              <div style={{ width: 52, height: 52, borderRadius: 14, background: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24 }}>
                <Stethoscope size={22} strokeWidth={1.5} style={{ color: '#34d399' }} />
              </div>

              <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 800, color: '#edeef5', letterSpacing: '-0.025em', margin: '0 0 8px' }}>
                Practice created.
              </h1>
              <p style={{ fontSize: 14, color: 'rgba(237,238,245,0.48)', fontFamily: 'var(--font-body)', margin: '0 0 32px', lineHeight: 1.65 }}>
                Your intelligence dashboard is ready. Connect your Google Reviews from the Settings tab to unlock AI analysis.
              </p>

              {/* What's next */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 32 }}>
                {[
                  { step: '1', text: 'Your dashboard is live — explore Practice Health', done: true },
                  { step: '2', text: 'Go to Settings → Connect Google Reviews', done: false },
                  { step: '3', text: 'Run your first AI intelligence report', done: false },
                ].map(({ step: s, text, done }) => (
                  <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8 }}>
                    <div style={{ width: 22, height: 22, borderRadius: '50%', background: done ? 'rgba(52,211,153,0.1)' : 'rgba(255,255,255,0.04)', border: done ? '1px solid rgba(52,211,153,0.3)' : '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      {done
                        ? <Check size={9} strokeWidth={2.5} style={{ color: '#34d399' }} />
                        : <span style={{ fontSize: 10, fontWeight: 600, color: 'rgba(237,238,245,0.3)', fontFamily: 'var(--font-body)' }}>{s}</span>
                      }
                    </div>
                    <span style={{ fontSize: 13, color: done ? 'rgba(237,238,245,0.6)' : 'rgba(237,238,245,0.45)', fontFamily: 'var(--font-body)' }}>{text}</span>
                  </div>
                ))}
              </div>

              <button
                onClick={() => router.push(`/practices/${slug}/dashboard`)}
                style={{ width: '100%', padding: '13px', borderRadius: 8, background: '#34d399', color: '#07070e', border: 'none', fontSize: 14, fontWeight: 700, fontFamily: 'var(--font-body)', cursor: 'pointer', letterSpacing: '-0.01em', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
              >
                Go to your dashboard
                <ArrowRight size={14} strokeWidth={2.5} />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
