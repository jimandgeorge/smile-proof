'use client';

import { useState, useTransition, useRef, useContext } from 'react';
import { CheckCircle } from 'lucide-react';
import { sendReviewInvite } from './actions';
import { AccessTokenContext } from './token-context';

const D = {
  bg: '#0d0d12', sidebar: '#09090d', card: '#13131a', card2: '#1a1a24',
  border: 'rgba(255,255,255,0.07)', border2: 'rgba(255,255,255,0.12)',
  text: '#edeef5', mid: 'rgba(237,238,245,0.72)', soft: 'rgba(237,238,245,0.5)',
  faint: 'rgba(237,238,245,0.28)', accent: '#34d399', accentPale: 'rgba(52,211,153,0.1)',
  gold: '#fbbf24',
} as const;

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
  const accessToken = useContext(AccessTokenContext);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    setError(null);
    setSuccess(false);
    startTransition(async () => {
      const result = await sendReviewInvite(accessToken, practiceId, practiceSlug, practiceName, data);
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
    display: 'block', fontSize: 12, fontWeight: 600, color: D.soft,
    marginBottom: 5, fontFamily: 'var(--font-body)', textTransform: 'uppercase', letterSpacing: '0.06em',
  };
  const INPUT: React.CSSProperties = {
    width: '100%', padding: '10px 12px', borderRadius: 8,
    border: `1.5px solid ${D.border2}`, fontSize: 14,
    fontFamily: 'var(--font-body)', color: D.text, background: D.card2,
    outline: 'none', boxSizing: 'border-box',
  };

  const reviewed = invites.filter(i => i.review_id).length;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 340px', gap: 24, alignItems: 'start' }}>

      {/* Left: form */}
      <div>
        <div style={{ marginBottom: 20 }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 800, color: D.text, margin: '0 0 6px', letterSpacing: '-0.02em' }}>
            Request a review
          </h2>
          <p style={{ fontSize: 13, color: D.soft, fontFamily: 'var(--font-body)', margin: 0, lineHeight: 1.6 }}>
            Send a branded email to a patient asking them to share their experience. Each invite links directly to your review form.
          </p>
        </div>

        <div style={{ background: D.card, border: `1.5px solid ${D.border}`, borderRadius: 12, padding: '22px 24px' }}>
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
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: D.accent, marginBottom: 12, fontFamily: 'var(--font-body)', fontWeight: 600 }}>
                <CheckCircle size={16} strokeWidth={1.5} style={{ color: D.accent }} />
                Invite sent successfully!
              </div>
            )}

            <button
              type="submit"
              disabled={isPending}
              style={{
                padding: '10px 24px', borderRadius: 8,
                background: isPending ? D.faint : D.accent,
                color: '#0d0d12', border: 'none',
                fontSize: 14, fontWeight: 600, fontFamily: 'var(--font-body)',
                cursor: isPending ? 'not-allowed' : 'pointer',
                transition: 'background var(--transition)',
              }}
            >
              {isPending ? 'Sending…' : 'Send invite →'}
            </button>
          </form>
        </div>
      </div>

      {/* Right: history */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <h3 style={{ fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: 700, color: D.soft, textTransform: 'uppercase', letterSpacing: '0.08em', margin: 0 }}>
            Sent invites
          </h3>
          {invites.length > 0 && (
            <span style={{ fontSize: 12, color: D.faint, fontFamily: 'var(--font-body)' }}>
              {reviewed}/{invites.length} reviewed
            </span>
          )}
        </div>

        {invites.length === 0 ? (
          <div style={{ background: D.card, border: `1.5px solid ${D.border}`, borderRadius: 12, padding: '32px 20px', textAlign: 'center' }}>
            <p style={{ fontSize: 13, color: D.faint, fontFamily: 'var(--font-body)', margin: 0 }}>
              No invites sent yet.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
            {invites.map((inv) => (
              <div
                key={inv.id}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  background: D.card, border: `1.5px solid ${D.border}`,
                  borderRadius: 10, padding: '11px 14px',
                }}
              >
                <div style={{ width: 7, height: 7, borderRadius: '50%', flexShrink: 0, background: inv.review_id ? D.accent : 'rgba(255,255,255,0.2)' }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: D.text, fontFamily: 'var(--font-body)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {inv.patient_name ? `${inv.patient_name}` : inv.patient_email}
                  </div>
                  <div style={{ fontSize: 11, color: D.faint, fontFamily: 'var(--font-body)', marginTop: 1 }}>
                    {new Date(inv.sent_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                    {inv.patient_name ? ` · ${inv.patient_email}` : ''}
                  </div>
                </div>
                <span style={{ flexShrink: 0, fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 20, background: inv.review_id ? D.accentPale : 'rgba(255,255,255,0.06)', color: inv.review_id ? D.accent : D.soft, fontFamily: 'var(--font-body)' }}>
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
