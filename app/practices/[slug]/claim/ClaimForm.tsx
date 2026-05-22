'use client';

import { useState } from 'react';
import { requestClaim, verifyWebsiteClaim } from './actions';
import { Mail, Globe, FileText, Star, Check, ChevronLeft, Copy } from 'lucide-react';

type Step = 1 | 2 | 3;
type Method = 'email' | 'website' | 'manual';

const STEP_LABELS = ['Start', 'Verify ownership', 'Check inbox', 'Under review'];

const FEATURES = [
  {
    title: 'Verified badge',
    desc: 'Build trust with a SmileProof-verified checkmark on every listing.',
  },
  {
    title: 'Respond to reviews',
    desc: 'Reply publicly to patient feedback and show you care.',
  },
  {
    title: 'Practice dashboard',
    desc: 'Edit your profile details, photos, and opening hours.',
  },
  {
    title: 'Analytics',
    desc: 'See how many patients viewed your profile each month.',
  },
];

const METHODS: { id: Method; label: string; desc: string; icon: React.ReactNode }[] = [
  {
    id: 'email',
    label: 'Email',
    desc: "We'll send a code to your practice email address.",
    icon: <Mail size={16} strokeWidth={1.5} />,
  },
  {
    id: 'website',
    label: 'Website',
    desc: 'Add a small HTML snippet to your homepage to confirm ownership.',
    icon: <Globe size={16} strokeWidth={1.5} />,
  },
  {
    id: 'manual',
    label: 'Manual review',
    desc: 'Submit documentation and our team will verify within 2–3 business days.',
    icon: <FileText size={16} strokeWidth={1.5} />,
  },
];

function ProgressBar({ current }: { current: number }) {
  return (
    <div style={{ marginBottom: 28 }}>
      <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--forest)', marginBottom: 8, fontFamily: 'var(--font-body)' }}>
        Step {current} of 4 — {STEP_LABELS[current - 1]}
      </p>
      <div style={{ display: 'flex', gap: 4 }}>
        {STEP_LABELS.map((_, i) => (
          <div
            key={i}
            style={{
              flex: 1, height: 3, borderRadius: 2,
              background: i < current ? 'var(--forest)' : 'var(--cream-dark)',
              transition: 'background 0.3s',
            }}
          />
        ))}
      </div>
    </div>
  );
}

function MethodCard({
  method, selected, onClick,
}: {
  method: typeof METHODS[0]; selected: boolean; onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', gap: 14,
        width: '100%', padding: '14px 16px', borderRadius: 10, textAlign: 'left',
        background: selected ? 'var(--forest-pale)' : 'white',
        border: `1.5px solid ${selected ? 'var(--forest)' : 'var(--cream-dark)'}`,
        cursor: 'pointer', transition: 'all 0.15s',
      }}
    >
      <div style={{
        width: 36, height: 36, borderRadius: 8, flexShrink: 0,
        background: selected ? 'rgba(28,69,53,0.1)' : 'var(--cream-dark)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: selected ? 'var(--forest)' : 'var(--ink-soft)',
      }}>
        {method.icon}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: selected ? 'var(--forest)' : 'var(--ink)', fontFamily: 'var(--font-body)', marginBottom: 2 }}>
          {method.label}
        </div>
        <div style={{ fontSize: 12, color: 'var(--ink-soft)', fontFamily: 'var(--font-body)', lineHeight: 1.4 }}>
          {method.desc}
        </div>
      </div>
      {/* Radio */}
      <div style={{
        width: 18, height: 18, borderRadius: '50%', flexShrink: 0,
        border: `2px solid ${selected ? 'var(--forest)' : 'var(--cream-dark)'}`,
        background: selected ? 'var(--forest)' : 'white',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {selected && <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'white' }} />}
      </div>
    </button>
  );
}

export function ClaimForm({
  practiceId,
  practiceName,
  practiceCity,
  practiceSlug,
  practiceWebsite,
}: {
  practiceId: string;
  practiceName: string;
  practiceCity: string;
  practiceSlug: string;
  practiceWebsite: string | null;
}) {
  const [step, setStep] = useState<Step>(1);
  const [method, setMethod] = useState<Method>('email');
  const [email, setEmail] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState(practiceWebsite ?? '');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const snippet = `<meta name="smileproof-verification" content="sp-${practiceId}" />`;

  function initials(name: string) {
    return name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();
  }

  async function handleSendCode(e: React.FormEvent) {
    e.preventDefault();
    if (method !== 'email') return;
    setSubmitting(true);
    setError(null);
    const res = await requestClaim(practiceId, email);
    if (res.error) { setError(res.error); setSubmitting(false); }
    else setStep(3);
    setSubmitting(false);
  }

  // ── Step 1: Landing ──────────────────────────────────────────────────────
  if (step === 1) {
    return (
      <div>
        {/* Practice card */}
        <div style={{
          background: 'white', border: '1.5px solid var(--cream-dark)', borderRadius: 12,
          padding: '16px 20px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 14,
          boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
        }}>
          <div style={{
            width: 40, height: 40, borderRadius: 10, background: 'var(--forest-pale)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 700, color: 'var(--forest)' }}>
              {initials(practiceName)}
            </span>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--ink)', fontFamily: 'var(--font-display)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {practiceName}
            </div>
            <div style={{ fontSize: 12, color: 'var(--ink-soft)', fontFamily: 'var(--font-body)', marginTop: 1 }}>
              {practiceCity}
            </div>
          </div>
          <span style={{
            fontSize: 11, fontWeight: 600, color: 'var(--ink-soft)',
            background: 'var(--cream-dark)', borderRadius: 20, padding: '3px 10px',
            fontFamily: 'var(--font-body)', flexShrink: 0,
          }}>
            Unclaimed
          </span>
        </div>

        {/* Content card */}
        <div style={{
          background: 'white', border: '1.5px solid var(--cream-dark)', borderRadius: 12,
          padding: '28px 28px 24px', boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
        }}>
          {/* Star icon */}
          <div style={{
            width: 48, height: 48, borderRadius: 12, background: 'var(--forest-pale)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20,
          }}>
            <Star size={22} strokeWidth={1.6} style={{ color: 'var(--forest)' }} />
          </div>

          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 800, color: 'var(--ink)', margin: '0 0 10px', letterSpacing: '-0.02em' }}>
            Claim your profile
          </h1>
          <p style={{ fontSize: 14, color: 'var(--ink-soft)', lineHeight: 1.6, margin: '0 0 24px', fontFamily: 'var(--font-body)' }}>
            Verified practices get a badge, can respond to reviews, and access analytics on how patients view their profile.
          </p>

          {/* Feature list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 28 }}>
            {FEATURES.map(({ title, desc }) => (
              <div key={title} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <div style={{
                  width: 20, height: 20, borderRadius: '50%', flexShrink: 0, marginTop: 1,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Check size={16} strokeWidth={1.8} style={{ color: 'var(--forest)' }} />
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--ink)', fontFamily: 'var(--font-body)', marginBottom: 1 }}>{title}</div>
                  <div style={{ fontSize: 13, color: 'var(--ink-soft)', fontFamily: 'var(--font-body)', lineHeight: 1.45 }}>{desc}</div>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={() => setStep(2)}
            style={{
              width: '100%', padding: '14px', borderRadius: 10,
              background: 'var(--forest)', color: 'white', border: 'none',
              fontSize: 15, fontWeight: 700, fontFamily: 'var(--font-body)',
              cursor: 'pointer', letterSpacing: '-0.01em',
            }}
          >
            Start verification →
          </button>
          <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--ink-faint)', fontFamily: 'var(--font-body)', marginTop: 12, marginBottom: 0 }}>
            Free to claim · Takes under 5 minutes
          </p>
        </div>
      </div>
    );
  }

  // ── Step 2: Verify ownership ─────────────────────────────────────────────
  if (step === 2) {
    return (
      <div>
        <button
          onClick={() => setStep(1)}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 13, color: 'var(--ink-soft)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, marginBottom: 20, fontFamily: 'var(--font-body)' }}
        >
          <ChevronLeft size={14} strokeWidth={1.5} />
          Back
        </button>

        <ProgressBar current={2} />

        <div style={{
          background: 'white', border: '1.5px solid var(--cream-dark)', borderRadius: 12,
          padding: '28px 28px 24px', boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
        }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 800, color: 'var(--ink)', margin: '0 0 8px', letterSpacing: '-0.02em' }}>
            Verify ownership
          </h2>
          <p style={{ fontSize: 13, color: 'var(--ink-soft)', margin: '0 0 20px', fontFamily: 'var(--font-body)', lineHeight: 1.5 }}>
            Choose how you'd like to prove you're authorised to manage this listing.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
            {METHODS.map(m => (
              <MethodCard key={m.id} method={m} selected={method === m.id} onClick={() => setMethod(m.id)} />
            ))}
          </div>

          {method === 'email' && (
            <form onSubmit={handleSendCode}>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--ink-soft)', letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 8, fontFamily: 'var(--font-body)' }}>
                Send code to
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="hello@yourpractice.co.uk"
                style={{
                  width: '100%', border: '1.5px solid var(--cream-dark)', borderRadius: 8,
                  padding: '10px 14px', fontSize: 14, fontFamily: 'var(--font-body)', color: 'var(--ink)',
                  outline: 'none', background: 'white', boxSizing: 'border-box', marginBottom: 8,
                }}
              />
              <p style={{ fontSize: 12, color: 'var(--ink-soft)', marginBottom: 20, fontFamily: 'var(--font-body)', lineHeight: 1.5 }}>
                Must be an address at your practice domain. Check your spam folder if you don't receive it.
              </p>
              {error && (
                <p style={{ fontSize: 13, color: '#c0392b', background: '#fdf2f2', border: '1px solid #f5c6cb', borderRadius: 8, padding: '10px 14px', marginBottom: 16 }}>
                  {error}
                </p>
              )}
              <button
                type="submit"
                disabled={submitting}
                style={{
                  width: '100%', padding: '14px', borderRadius: 10,
                  background: submitting ? 'var(--ink-faint)' : 'var(--forest)',
                  color: 'white', border: 'none', fontSize: 15, fontWeight: 700,
                  fontFamily: 'var(--font-body)', cursor: submitting ? 'not-allowed' : 'pointer',
                }}
              >
                {submitting ? 'Sending…' : 'Send verification code'}
              </button>
            </form>
          )}

          {method === 'website' && (
            <form onSubmit={async e => {
              e.preventDefault();
              setSubmitting(true);
              setError(null);
              const res = await verifyWebsiteClaim(practiceId, email, websiteUrl);
              if (res.error) { setError(res.error); setSubmitting(false); }
              else setStep(3);
              setSubmitting(false);
            }}>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--ink-soft)', letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 8, fontFamily: 'var(--font-body)' }}>
                1. Add this to your homepage &lt;head&gt;
              </label>
              <div style={{ position: 'relative', marginBottom: 16 }}>
                <code style={{
                  display: 'block', background: 'var(--cream)', border: '1.5px solid var(--cream-dark)',
                  borderRadius: 8, padding: '12px 44px 12px 14px', fontSize: 12,
                  fontFamily: 'monospace', color: 'var(--ink)', wordBreak: 'break-all', lineHeight: 1.6,
                }}>
                  {snippet}
                </code>
                <button
                  type="button"
                  onClick={() => navigator.clipboard.writeText(snippet)}
                  title="Copy"
                  style={{
                    position: 'absolute', top: 10, right: 10, background: 'none', border: 'none',
                    cursor: 'pointer', color: 'var(--ink-soft)', padding: 4,
                  }}
                >
                  <Copy size={15} strokeWidth={1.5} />
                </button>
              </div>

              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--ink-soft)', letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 8, fontFamily: 'var(--font-body)' }}>
                2. Your website URL
              </label>
              <input
                type="url"
                required
                value={websiteUrl}
                onChange={e => setWebsiteUrl(e.target.value)}
                placeholder="https://yourpractice.co.uk"
                style={{
                  width: '100%', border: '1.5px solid var(--cream-dark)', borderRadius: 8,
                  padding: '10px 14px', fontSize: 14, fontFamily: 'var(--font-body)', color: 'var(--ink)',
                  outline: 'none', background: 'white', boxSizing: 'border-box', marginBottom: 8,
                }}
              />

              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--ink-soft)', letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 8, marginTop: 12, fontFamily: 'var(--font-body)' }}>
                3. Your email address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@yourpractice.co.uk"
                style={{
                  width: '100%', border: '1.5px solid var(--cream-dark)', borderRadius: 8,
                  padding: '10px 14px', fontSize: 14, fontFamily: 'var(--font-body)', color: 'var(--ink)',
                  outline: 'none', background: 'white', boxSizing: 'border-box', marginBottom: 16,
                }}
              />

              {error && (
                <p style={{ fontSize: 13, color: '#c0392b', background: '#fdf2f2', border: '1px solid #f5c6cb', borderRadius: 8, padding: '10px 14px', marginBottom: 16 }}>
                  {error}
                </p>
              )}
              <button
                type="submit"
                disabled={submitting}
                style={{
                  width: '100%', padding: '14px', borderRadius: 10,
                  background: submitting ? 'var(--ink-faint)' : 'var(--forest)',
                  color: 'white', border: 'none', fontSize: 15, fontWeight: 700,
                  fontFamily: 'var(--font-body)', cursor: submitting ? 'not-allowed' : 'pointer',
                }}
              >
                {submitting ? 'Checking your site…' : 'Verify and claim →'}
              </button>
            </form>
          )}

          {method === 'manual' && (
            <div>
              <div style={{ background: 'var(--cream)', border: '1px solid var(--cream-dark)', borderRadius: 8, padding: '14px 16px', marginBottom: 20, fontSize: 13, color: 'var(--ink-soft)', fontFamily: 'var(--font-body)', lineHeight: 1.5 }}>
                Email us with your GDC number or practice documentation and we'll verify you within 2–3 business days.
              </div>
              <a
                href={`mailto:hello@smileproof.co.uk?subject=Practice claim — ${encodeURIComponent(practiceName)}&body=Hi, I'd like to claim ${encodeURIComponent(practiceName)} via manual review.`}
                style={{
                  display: 'block', width: '100%', padding: '14px', borderRadius: 10,
                  background: 'var(--forest)', color: 'white', fontSize: 15, fontWeight: 700,
                  fontFamily: 'var(--font-body)', textDecoration: 'none', textAlign: 'center',
                  boxSizing: 'border-box',
                }}
              >
                Contact us to verify →
              </a>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── Step 3: Check inbox ──────────────────────────────────────────────────
  return (
    <div>
      <ProgressBar current={3} />
      <div style={{
        background: 'white', border: '1.5px solid var(--cream-dark)', borderRadius: 12,
        padding: '40px 28px', textAlign: 'center', boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
      }}>
        <div style={{
          width: 56, height: 56, borderRadius: '50%', background: 'var(--forest-pale)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px',
        }}>
          <Mail size={24} strokeWidth={1.5} style={{ color: 'var(--forest)' }} />
        </div>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 800, color: 'var(--ink)', marginBottom: 10, letterSpacing: '-0.02em' }}>
          Check your inbox
        </h2>
        <p style={{ fontSize: 14, color: 'var(--ink-soft)', lineHeight: 1.65, marginBottom: 6, fontFamily: 'var(--font-body)' }}>
          We've sent a verification link to
        </p>
        <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--ink)', marginBottom: 20, fontFamily: 'var(--font-body)' }}>
          {email}
        </p>
        <p style={{ fontSize: 13, color: 'var(--ink-faint)', fontFamily: 'var(--font-body)', lineHeight: 1.5 }}>
          Click the link in the email to complete your claim. Check your spam folder if it doesn't arrive.
        </p>
        <button
          onClick={() => { setStep(2); setError(null); }}
          style={{ marginTop: 24, fontSize: 13, color: 'var(--forest)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-body)', textDecoration: 'underline' }}
        >
          Wrong email? Go back
        </button>
      </div>
    </div>
  );
}
