'use client';

import { useState, useTransition, useRef } from 'react';
import { sendReviewInvite } from './actions';

export type Invite = {
  id: string;
  patient_email: string;
  patient_name: string | null;
  sent_at: string;
  review_id: string | null;
};

type Props = {
  practiceId: string;
  practiceSlug: string;
  practiceName: string;
  invites: Invite[];
};

export default function InviteTab({ practiceId, practiceSlug, practiceName, invites: initial }: Props) {
  const [invites, setInvites] = useState<Invite[]>(initial);
  const [isPending, startTransition] = useTransition();
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    setError(null);
    setSuccess(false);
    startTransition(async () => {
      const result = await sendReviewInvite(practiceId, practiceSlug, practiceName, data);
      if (result.error) {
        setError(result.error);
      } else {
        setSuccess(true);
        formRef.current?.reset();
        const email = data.get('email') as string;
        const name = (data.get('name') as string) || null;
        setInvites((prev) => [{
          id: crypto.randomUUID(),
          patient_email: email,
          patient_name: name,
          sent_at: new Date().toISOString(),
          review_id: null,
        }, ...prev]);
      }
    });
  }

  const LABEL: React.CSSProperties = {
    display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--ink-soft)',
    marginBottom: 5, fontFamily: 'var(--font-body)', textTransform: 'uppercase', letterSpacing: '0.06em',
  };
  const INPUT: React.CSSProperties = {
    width: '100%', padding: '10px 12px', borderRadius: 8,
    border: '1.5px solid var(--cream-dark)', fontSize: 14,
    fontFamily: 'var(--font-body)', color: 'var(--ink)', background: 'white',
    outline: 'none', boxSizing: 'border-box',
  };

  return (
    <div style={{ maxWidth: 680 }}>

      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 800, color: 'var(--ink)', margin: '0 0 6px', letterSpacing: '-0.02em' }}>
          Request a review
        </h2>
        <p style={{ fontSize: 13, color: 'var(--ink-soft)', fontFamily: 'var(--font-body)', margin: 0, lineHeight: 1.6 }}>
          Send a branded email to a patient asking them to share their experience. Each invite is one-time and links directly to your review form.
        </p>
      </div>

      {/* Form card */}
      <div style={{ background: 'white', border: '1.5px solid var(--cream-dark)', borderRadius: 12, padding: '22px 24px', marginBottom: 28 }}>
        <form ref={formRef} onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
            <div>
              <label style={LABEL}>Patient email *</label>
              <input name="email" type="email" required placeholder="patient@email.com" style={INPUT} />
            </div>
            <div>
              <label style={LABEL}>First name <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(optional)</span></label>
              <input name="name" type="text" placeholder="e.g. Sarah" style={INPUT} />
            </div>
          </div>

          {error && (
            <p style={{ fontSize: 13, color: '#dc2626', marginBottom: 12, fontFamily: 'var(--font-body)' }}>{error}</p>
          )}
          {success && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--forest)', marginBottom: 12, fontFamily: 'var(--font-body)', fontWeight: 600 }}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="8" r="7" fill="var(--forest-pale)" stroke="var(--forest)" strokeWidth="1.3" />
                <path d="M5 8l2.5 2.5L12 5.5" stroke="var(--forest)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Invite sent successfully!
            </div>
          )}

          <button
            type="submit"
            disabled={isPending}
            style={{
              padding: '10px 24px', borderRadius: 8,
              background: isPending ? 'var(--ink-faint)' : 'var(--forest)',
              color: 'var(--cream)', border: 'none',
              fontSize: 14, fontWeight: 600, fontFamily: 'var(--font-body)',
              cursor: isPending ? 'not-allowed' : 'pointer',
              transition: 'background var(--transition)',
            }}
          >
            {isPending ? 'Sending…' : 'Send invite →'}
          </button>
        </form>
      </div>

      {/* Sent invites list */}
      <div>
        <h3 style={{ fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: 700, color: 'var(--ink-soft)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>
          Sent invites ({invites.length})
        </h3>

        {invites.length === 0 ? (
          <div style={{ background: 'white', border: '1.5px solid var(--cream-dark)', borderRadius: 12, padding: '32px 24px', textAlign: 'center' }}>
            <p style={{ fontSize: 13, color: 'var(--ink-faint)', fontFamily: 'var(--font-body)', margin: 0 }}>
              No invites sent yet. Start by inviting a recent patient above.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {invites.map((inv) => (
              <div
                key={inv.id}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  background: 'white', border: '1.5px solid var(--cream-dark)',
                  borderRadius: 10, padding: '12px 16px',
                }}
              >
                {/* Status dot */}
                <div
                  style={{
                    width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
                    background: inv.review_id ? 'var(--forest)' : 'var(--ink-faint)',
                  }}
                />

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)', fontFamily: 'var(--font-body)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {inv.patient_name ? `${inv.patient_name} — ` : ''}{inv.patient_email}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--ink-faint)', fontFamily: 'var(--font-body)', marginTop: 2 }}>
                    Sent {new Date(inv.sent_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </div>
                </div>

                <span
                  style={{
                    flexShrink: 0, fontSize: 11, fontWeight: 600,
                    padding: '3px 8px', borderRadius: 20,
                    background: inv.review_id ? 'var(--forest-pale)' : 'var(--cream-dark)',
                    color: inv.review_id ? 'var(--forest)' : 'var(--ink-faint)',
                    fontFamily: 'var(--font-body)',
                  }}
                >
                  {inv.review_id ? 'Reviewed' : 'Pending'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
