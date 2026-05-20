'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { submitEnquiry } from './actions';

type Props = {
  practiceId: string;
  practiceSlug: string;
  practiceName: string;
  isClaimed: boolean;
  phone?: string | null;
  email?: string | null;
  website?: string | null;
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px 12px',
  border: '1.5px solid var(--cream-dark)',
  borderRadius: 8,
  fontSize: 14,
  fontFamily: 'var(--font-body)',
  color: 'var(--ink)',
  background: 'white',
  boxSizing: 'border-box',
  outline: 'none',
};

export default function PracticeSidebar({
  practiceId,
  practiceSlug,
  practiceName,
  isClaimed,
  phone,
  email,
  website,
}: Props) {
  const [showEnquiry, setShowEnquiry] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await submitEnquiry(fd);
      if (result?.success) {
        setSubmitted(true);
        setShowEnquiry(false);
      } else {
        setError(result?.error ?? 'Something went wrong. Please try again.');
      }
    });
  }

  if (isClaimed) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {/* Primary CTA card */}
        <div style={{ background: 'var(--forest)', borderRadius: 16, padding: '24px 20px' }}>
          <p style={{
            fontSize: 11, fontWeight: 700, letterSpacing: '0.08em',
            textTransform: 'uppercase', color: 'rgba(255,255,255,0.55)', marginBottom: 8,
          }}>
            Ready to book?
          </p>
          <p style={{
            fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700,
            color: 'white', lineHeight: 1.3, marginBottom: 20,
          }}>
            Contact {practiceName}
          </p>

          {phone && (
            <a
              href={`tel:${phone.replace(/\s/g, '')}`}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                background: 'white', color: 'var(--forest)',
                borderRadius: 10, padding: '12px 16px',
                fontWeight: 700, fontSize: 15, textDecoration: 'none',
                marginBottom: 10,
              }}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M3 2.5C3 2.5 4 2 5.5 4.5L4.5 6s1 2.5 5.5 5.5l1.5-1c2.5 1.5 2 2.5 2 2.5C13 14 11 15 9 14 5 12 1 8 1 5c-1-2 1-3 2-2.5z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" fill="none" />
              </svg>
              {phone}
            </a>
          )}

          {email && !phone && (
            <a
              href={`mailto:${email}`}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                background: 'white', color: 'var(--forest)',
                borderRadius: 10, padding: '12px 16px',
                fontWeight: 700, fontSize: 15, textDecoration: 'none',
                marginBottom: 10,
              }}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <rect x="1.5" y="3.5" width="13" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.3" />
                <path d="M1.5 5.5l6.5 4 6.5-4" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
              </svg>
              Email practice
            </a>
          )}

          {submitted ? (
            <div style={{ background: 'rgba(255,255,255,0.15)', borderRadius: 10, padding: '14px 16px', textAlign: 'center' }}>
              <p style={{ color: 'white', fontSize: 14, fontWeight: 700, marginBottom: 4 }}>Enquiry sent!</p>
              <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12 }}>
                {practiceName} will be in touch shortly.
              </p>
            </div>
          ) : (
            <button
              onClick={() => setShowEnquiry(v => !v)}
              style={{
                width: '100%',
                background: showEnquiry ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.18)',
                color: 'white',
                border: '1.5px solid rgba(255,255,255,0.3)',
                borderRadius: 10, padding: '11px 16px',
                fontWeight: 600, fontSize: 14, cursor: 'pointer',
              }}
            >
              {showEnquiry ? 'Cancel' : 'Send an Enquiry'}
            </button>
          )}
        </div>

        {/* Enquiry form */}
        {showEnquiry && !submitted && (
          <form
            onSubmit={handleSubmit}
            style={{ background: 'white', border: '1.5px solid var(--cream-dark)', borderRadius: 16, padding: '20px' }}
          >
            <input type="hidden" name="practice_id" value={practiceId} />
            <p style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 700, color: 'var(--ink)', marginBottom: 16 }}>
              Enquire about treatment
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <input name="name" required placeholder="Your name" style={inputStyle} />
              <input name="email" type="email" required placeholder="Email address" style={inputStyle} />
              <input name="treatment_interest" placeholder="Treatment interest (optional)" style={inputStyle} />
              <textarea
                name="message"
                placeholder="Any questions or details…"
                rows={3}
                style={{ ...inputStyle, resize: 'vertical' }}
              />
              {error && (
                <p style={{ fontSize: 13, color: '#dc2626' }}>{error}</p>
              )}
              <button
                type="submit"
                disabled={isPending}
                style={{
                  background: 'var(--forest)', color: 'white', border: 'none',
                  borderRadius: 8, padding: '12px', fontWeight: 600, fontSize: 14,
                  cursor: isPending ? 'not-allowed' : 'pointer', opacity: isPending ? 0.7 : 1,
                }}
              >
                {isPending ? 'Sending…' : 'Send Enquiry'}
              </button>
            </div>
          </form>
        )}

        {/* Verified trust signal */}
        <div style={{ background: 'var(--cream)', border: '1px solid var(--cream-dark)', borderRadius: 12, padding: '16px 18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
            <svg width="14" height="14" viewBox="0 0 12 12" fill="none">
              <circle cx="6" cy="6" r="6" fill="var(--forest)" />
              <polyline points="3,6 5,8.5 9,3.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--forest)', fontFamily: 'var(--font-body)' }}>
              Verified practice
            </span>
          </div>
          <p style={{ fontSize: 12, color: 'var(--ink-soft)', lineHeight: 1.65, fontFamily: 'var(--font-body)' }}>
            This practice has been verified by SmileProof and actively manages their profile.
          </p>
        </div>

        {/* Write a review */}
        <div style={{ background: 'white', border: '1.5px solid var(--cream-dark)', borderRadius: 12, padding: '16px 18px' }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)', marginBottom: 4, fontFamily: 'var(--font-body)' }}>
            Been here before?
          </p>
          <p style={{ fontSize: 13, color: 'var(--ink-soft)', marginBottom: 12, fontFamily: 'var(--font-body)' }}>
            Your review helps other patients choose confidently.
          </p>
          <Link
            href={`/practices/${practiceSlug}/review`}
            style={{
              display: 'block', textAlign: 'center',
              background: 'var(--cream)', color: 'var(--ink)',
              border: '1.5px solid var(--cream-dark)',
              borderRadius: 8, padding: '10px 14px',
              fontWeight: 600, fontSize: 13, textDecoration: 'none',
              fontFamily: 'var(--font-body)',
            }}
          >
            Write a Review
          </Link>
        </div>
      </div>
    );
  }

  // Unclaimed practice
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {/* Get matched CTA */}
      <div style={{
        background: 'linear-gradient(135deg, var(--forest-pale) 0%, #e8f4ed 100%)',
        border: '1.5px solid rgba(28,69,53,0.15)',
        borderRadius: 16, padding: '24px 20px',
      }}>
        <p style={{
          fontSize: 11, fontWeight: 700, letterSpacing: '0.08em',
          textTransform: 'uppercase', color: 'var(--forest)', marginBottom: 8,
        }}>
          Not sure this is right?
        </p>
        <p style={{
          fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 700,
          color: 'var(--ink)', lineHeight: 1.35, marginBottom: 16,
        }}>
          Find the right dentist for your specific needs
        </p>
        <Link
          href="/find"
          style={{
            display: 'block', textAlign: 'center',
            background: 'var(--forest)', color: 'white',
            borderRadius: 10, padding: '12px 16px',
            fontWeight: 700, fontSize: 14, textDecoration: 'none',
            fontFamily: 'var(--font-body)',
          }}
        >
          Find my perfect dentist
        </Link>
      </div>

      {/* Write a review */}
      <div style={{ background: 'white', border: '1.5px solid var(--cream-dark)', borderRadius: 12, padding: '16px 18px' }}>
        <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)', marginBottom: 4, fontFamily: 'var(--font-body)' }}>
          Been here before?
        </p>
        <p style={{ fontSize: 13, color: 'var(--ink-soft)', marginBottom: 12, fontFamily: 'var(--font-body)' }}>
          Your review helps other patients choose confidently.
        </p>
        <Link
          href={`/practices/${practiceSlug}/review`}
          style={{
            display: 'block', textAlign: 'center',
            background: 'var(--cream)', color: 'var(--ink)',
            border: '1.5px solid var(--cream-dark)',
            borderRadius: 8, padding: '10px 14px',
            fontWeight: 600, fontSize: 13, textDecoration: 'none',
            fontFamily: 'var(--font-body)',
          }}
        >
          Write a Review
        </Link>
      </div>

      {/* Claim prompt */}
      <div style={{ background: 'var(--cream)', border: '1.5px solid rgba(28,69,53,0.15)', borderRadius: 16, padding: '20px 18px' }}>
        <p style={{
          fontSize: 11, fontWeight: 700, letterSpacing: '0.08em',
          textTransform: 'uppercase', color: 'var(--forest)', marginBottom: 6,
          fontFamily: 'var(--font-body)',
        }}>
          Own this practice?
        </p>
        <p style={{
          fontSize: 14, fontWeight: 700, color: 'var(--ink)',
          lineHeight: 1.35, marginBottom: 14, fontFamily: 'var(--font-display)',
        }}>
          Claim your free profile and unlock:
        </p>
        <ul style={{ margin: '0 0 16px', padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[
            'Direct patient enquiries',
            'AI-generated insights (from 2 reviews)',
            'Priority placement in search',
            'Booking & contact tools',
          ].map(item => (
            <li key={item} style={{ display: 'flex', alignItems: 'flex-start', gap: 7, fontSize: 12, color: 'var(--ink-soft)', fontFamily: 'var(--font-body)', lineHeight: 1.45 }}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0, marginTop: 1 }}>
                <circle cx="7" cy="7" r="6" fill="var(--forest)" opacity=".15" />
                <path d="M4.5 7l1.8 1.8 3.2-3.2" stroke="var(--forest)" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              {item}
            </li>
          ))}
        </ul>
        <Link
          href={`/practices/${practiceSlug}/claim`}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            background: 'var(--forest)', color: 'white',
            borderRadius: 10, padding: '11px 16px',
            fontWeight: 700, fontSize: 13, textDecoration: 'none',
            fontFamily: 'var(--font-body)',
          }}
        >
          Claim your free profile
          <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
            <path d="M2.5 6h7M7 3.5L9.5 6 7 8.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </Link>
        <p style={{ fontSize: 11, color: 'var(--ink-faint)', textAlign: 'center', marginTop: 8, fontFamily: 'var(--font-body)' }}>
          Free — takes 2 minutes
        </p>
      </div>
    </div>
  );
}
