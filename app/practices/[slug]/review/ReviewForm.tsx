'use client';

import { useState } from 'react';
import { useActionState } from 'react';
import { submitReview } from '@/app/api/reviews/submit';

type Treatment = { id: string; name: string; category: string };
type Dentist  = { id: string; full_name: string };
type Practice = { id: string; name: string; city: string; slug: string };

const STEPS = ['Practice', 'Treatment', 'Scores', 'Write', 'Price', 'Submit'] as const;

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const THIS_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: 7 }, (_, i) => THIS_YEAR - i);
const PAYMENT_LABELS: Record<string, string> = { nhs: 'NHS', private: 'Private', insurance: 'Insurance' };

type Scores = {
  rating_overall: number;
  rating_cleanliness: number;
  rating_cost_transparency: number;
  rating_pain_management: number;
  rating_communication: number;
  rating_anxiety_handling: number;
  rating_treatment_results: number;
};

type FormState = {
  treatment_id: string;
  scores: Scores;
  title: string;
  body: string;
  reviewer_display_name: string;
  reviewer_email: string;
  anonymous: boolean;
  treatment_date: string;
  price_amount: string;
  price_payment_type: 'nhs' | 'private' | 'insurance' | '';
  nhs_status: 'yes' | 'no' | 'unsure' | '';
  followup_opted_in: boolean;
};

const SCORE_DIMS: { key: keyof Omit<Scores, 'rating_overall'>; label: string; desc: string }[] = [
  { key: 'rating_cleanliness',        label: 'Staff Friendliness',  desc: 'How friendly and welcoming was the team?' },
  { key: 'rating_communication',      label: 'Communication',        desc: 'How well did they explain your treatment?' },
  { key: 'rating_anxiety_handling',   label: 'Anxiety Handling',     desc: 'Did the team help with any nerves?' },
  { key: 'rating_pain_management',    label: 'Pain Management',      desc: 'Was discomfort well-managed?' },
  { key: 'rating_cost_transparency',  label: 'Value for Money',      desc: 'Were you happy with the cost?' },
  { key: 'rating_treatment_results',  label: 'Treatment Results',    desc: 'How happy are you with the outcome?' },
];

function StarRating({
  value,
  size = 20,
  onChange,
}: {
  value: number;
  size?: number;
  onChange?: (v: number) => void;
}) {
  const [hovered, setHovered] = useState<number | null>(null);
  const display = hovered ?? value;
  return (
    <span style={{ display: 'inline-flex', gap: 2 }}>
      {[1, 2, 3, 4, 5].map((n) => (
        <svg
          key={n}
          width={size}
          height={size}
          viewBox="0 0 16 16"
          style={{ cursor: onChange ? 'pointer' : 'default', flexShrink: 0 }}
          onMouseEnter={() => onChange && setHovered(n)}
          onMouseLeave={() => onChange && setHovered(null)}
          onClick={() => onChange && onChange(n)}
        >
          <polygon
            points="8,1.5 9.8,6 14.5,6.3 11,9.5 12.2,14 8,11.5 3.8,14 5,9.5 1.5,6.3 6.2,6"
            fill={n <= display ? 'var(--gold)' : 'var(--ink-faint)'}
            style={{ transition: 'fill 0.1s' }}
          />
        </svg>
      ))}
    </span>
  );
}

const LABEL_STYLE: React.CSSProperties = {
  display: 'block',
  fontSize: 13,
  fontWeight: 600,
  color: 'var(--ink-soft)',
  marginBottom: 6,
  fontFamily: 'var(--font-body)',
};

const INPUT_STYLE: React.CSSProperties = {
  width: '100%',
  padding: '12px 14px',
  borderRadius: 8,
  border: '1.5px solid var(--cream-dark)',
  fontSize: 14,
  fontFamily: 'var(--font-body)',
  color: 'var(--ink)',
  background: 'var(--cream)',
  outline: 'none',
  boxSizing: 'border-box',
};

function StepCard({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <div style={{ background: 'white', borderRadius: 'var(--radius)', padding: '28px 28px 24px', border: '1.5px solid var(--cream-dark)' }}>
      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, color: 'var(--ink)', marginBottom: 6, letterSpacing: '-0.02em' }}>
        {title}
      </h2>
      <p style={{ fontSize: 13, color: 'var(--forest)', fontFamily: 'var(--font-body)', marginBottom: 20 }}>{subtitle}</p>
      {children}
    </div>
  );
}

function NavButtons({
  onBack,
  onNext,
  nextDisabled,
  nextLabel = 'Next →',
}: {
  onBack?: () => void;
  onNext?: () => void;
  nextDisabled?: boolean;
  nextLabel?: string;
}) {
  return (
    <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
      {onBack && (
        <button
          type="button"
          onClick={onBack}
          style={{ padding: '12px 20px', borderRadius: 8, border: '1.5px solid var(--cream-dark)', background: 'transparent', cursor: 'pointer', fontSize: 14, color: 'var(--ink-mid)', fontFamily: 'var(--font-body)' }}
        >
          Back
        </button>
      )}
      {onNext && (
        <button
          type="button"
          onClick={onNext}
          disabled={nextDisabled}
          style={{
            flex: 1, padding: '12px', background: nextDisabled ? 'var(--ink-faint)' : 'var(--forest)',
            color: 'var(--cream)', border: 'none', borderRadius: 8,
            cursor: nextDisabled ? 'default' : 'pointer', fontSize: 14, fontWeight: 600,
            fontFamily: 'var(--font-body)', transition: 'background var(--transition)',
          }}
        >
          {nextLabel}
        </button>
      )}
    </div>
  );
}

export function ReviewForm({
  practice,
  treatments,
}: {
  practice: Practice;
  treatments: Treatment[];
  dentists: Dentist[];
}) {
  const [state, action, pending] = useActionState(submitReview, null);
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormState>({
    treatment_id: '',
    scores: { rating_overall: 0, rating_cleanliness: 0, rating_cost_transparency: 0, rating_pain_management: 0, rating_communication: 0, rating_anxiety_handling: 0, rating_treatment_results: 0 },
    title: '',
    body: '',
    reviewer_display_name: '',
    reviewer_email: '',
    anonymous: false,
    treatment_date: '',
    price_amount: '',
    price_payment_type: '',
    nhs_status: '',
    followup_opted_in: false,
  });

  const allScored = form.scores.rating_overall > 0 && SCORE_DIMS.every((d) => form.scores[d.key] > 0);
  const wordCount = form.body.trim().split(/\s+/).filter(Boolean).length;
  const bodyReady = form.title.trim().length > 3 && wordCount >= 8;

  const RATING_LABELS = ['', 'Poor', 'Below average', 'Average', 'Good', 'Excellent'];

  return (
    <div style={{ maxWidth: 640, margin: '0 auto', padding: '40px 16px' }}>
      {/* Cancel */}
      <a
        href={`/practices/${practice.slug}`}
        style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--ink-soft)', fontSize: 13, fontFamily: 'var(--font-body)', textDecoration: 'none', marginBottom: 28 }}
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M9 2L4 7l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Cancel
      </a>

      {/* Progress bar */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
          {STEPS.map((_, i) => (
            <div key={i} style={{ flex: 1, height: 3, borderRadius: 2, background: i <= step ? 'var(--forest)' : 'var(--cream-dark)', transition: 'background 0.4s' }} />
          ))}
        </div>
        <span style={{ fontSize: 12, color: 'var(--ink-soft)', fontFamily: 'var(--font-body)', fontWeight: 500 }}>
          Step {step + 1} of {STEPS.length} — {STEPS[step]}
        </span>
      </div>

      {/* Step 1: Practice */}
      {step === 0 && (
        <StepCard title="Which practice did you visit?" subtitle="Confirm the practice below.">
          <div
            style={{
              padding: '14px 16px', borderRadius: 10, border: '1.5px solid var(--forest)',
              background: 'var(--forest-pale)', marginBottom: 16,
            }}
          >
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 600, color: 'var(--ink)', marginBottom: 2 }}>
              {practice.name}
            </div>
            <div style={{ fontSize: 12, color: 'var(--ink-soft)', fontFamily: 'var(--font-body)' }}>
              {practice.city}
            </div>
          </div>
          <NavButtons onNext={() => setStep(1)} nextLabel="Confirm practice →" />
        </StepCard>
      )}

      {/* Step 2: Treatment */}
      {step === 1 && (
        <StepCard title="What treatment did you have?" subtitle="Select the option that best describes your visit.">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {treatments.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setForm((f) => ({ ...f, treatment_id: t.id }))}
                style={{
                  padding: '12px 14px', borderRadius: 10, border: '1.5px solid',
                  borderColor: form.treatment_id === t.id ? 'var(--forest)' : 'var(--cream-dark)',
                  background: form.treatment_id === t.id ? 'var(--forest-pale)' : 'white',
                  cursor: 'pointer', textAlign: 'left', fontSize: 13, fontFamily: 'var(--font-body)',
                  fontWeight: form.treatment_id === t.id ? 600 : 400,
                  color: form.treatment_id === t.id ? 'var(--forest)' : 'var(--ink-mid)',
                  transition: 'all var(--transition)',
                }}
              >
                {t.name}
              </button>
            ))}
          </div>
          <NavButtons onBack={() => setStep(0)} onNext={() => setStep(2)} nextDisabled={!form.treatment_id} />
        </StepCard>
      )}

      {/* Step 3: Scores */}
      {step === 2 && (
        <StepCard title="Rate your experience" subtitle="Tap the stars for each dimension.">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Overall */}
            <div style={{ textAlign: 'center', padding: '20px', background: 'var(--forest-pale)', borderRadius: 12, marginBottom: 8 }}>
              <div style={{ fontSize: 13, color: 'var(--forest)', fontFamily: 'var(--font-body)', fontWeight: 600, marginBottom: 10 }}>Overall Rating</div>
              <StarRating value={form.scores.rating_overall} size={36} onChange={(v) => setForm((f) => ({ ...f, scores: { ...f.scores, rating_overall: v } }))} />
              <div style={{ marginTop: 8, fontSize: 13, color: 'var(--ink-soft)', fontFamily: 'var(--font-body)' }}>
                {RATING_LABELS[form.scores.rating_overall] || 'Tap to rate'}
              </div>
            </div>
            {/* Dimensions */}
            {SCORE_DIMS.map((d) => (
              <div key={d.key}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink)', fontFamily: 'var(--font-body)' }}>{d.label}</div>
                    <div style={{ fontSize: 12, color: 'var(--ink-soft)', fontFamily: 'var(--font-body)' }}>{d.desc}</div>
                  </div>
                  <StarRating
                    value={form.scores[d.key]}
                    size={20}
                    onChange={(v) => setForm((f) => ({ ...f, scores: { ...f.scores, [d.key]: v } }))}
                  />
                </div>
              </div>
            ))}
          </div>
          <NavButtons onBack={() => setStep(1)} onNext={() => setStep(3)} nextDisabled={!allScored} />
        </StepCard>
      )}

      {/* Step 4: Write */}
      {step === 3 && (
        <StepCard title="Tell your story" subtitle="Help others understand what to expect.">
          <div style={{ marginBottom: 16 }}>
            <label style={LABEL_STYLE}>Review title</label>
            <input
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              placeholder="Summarise your experience in a line…"
              style={INPUT_STYLE}
            />
          </div>
          <div>
            <label style={LABEL_STYLE}>Your review</label>
            <textarea
              value={form.body}
              onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))}
              placeholder="What went well? What could be improved? Were you anxious before? How did the team put you at ease?"
              style={{ ...INPUT_STYLE, minHeight: 140, resize: 'vertical', lineHeight: 1.7 }}
            />
            <div style={{ fontSize: 12, color: wordCount >= 8 ? 'var(--forest)' : 'var(--ink-faint)', marginTop: 4, textAlign: 'right', fontFamily: 'var(--font-body)' }}>
              {wordCount}/8 min words
            </div>
          </div>
          <NavButtons onBack={() => setStep(2)} onNext={() => setStep(4)} nextDisabled={!bodyReady} nextLabel="Continue →" />
        </StepCard>
      )}

      {/* Step 5: Price */}
      {step === 4 && (
        <StepCard title="What did you pay?" subtitle="Optional — help others know what to expect. Your answer feeds into our price transparency data.">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Payment type */}
            <div>
              <label style={LABEL_STYLE}>Payment type</label>
              <div style={{ display: 'flex', gap: 8 }}>
                {(['nhs', 'private', 'insurance'] as const).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setForm((f) => ({
                      ...f,
                      price_payment_type: f.price_payment_type === type ? '' : type,
                      nhs_status: type === 'nhs' ? 'yes' : f.nhs_status,
                    }))}
                    style={{
                      flex: 1, padding: '10px 0', borderRadius: 8, border: '1.5px solid',
                      borderColor: form.price_payment_type === type ? 'var(--forest)' : 'var(--cream-dark)',
                      background: form.price_payment_type === type ? 'var(--forest-pale)' : 'white',
                      cursor: 'pointer', fontSize: 13, fontFamily: 'var(--font-body)',
                      fontWeight: form.price_payment_type === type ? 600 : 400,
                      color: form.price_payment_type === type ? 'var(--forest)' : 'var(--ink-mid)',
                      transition: 'all var(--transition)',
                    }}
                  >
                    {PAYMENT_LABELS[type]}
                  </button>
                ))}
              </div>
            </div>

            {/* NHS availability */}
            <div>
              <label style={LABEL_STYLE}>Was this practice accepting NHS patients?</label>
              <div style={{ display: 'flex', gap: 8 }}>
                {([
                  { value: 'yes',    label: 'Yes' },
                  { value: 'no',     label: 'No' },
                  { value: 'unsure', label: 'Not sure' },
                ] as const).map(({ value, label }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, nhs_status: f.nhs_status === value ? '' : value }))}
                    style={{
                      flex: 1, padding: '10px 0', borderRadius: 8, border: '1.5px solid',
                      borderColor: form.nhs_status === value ? 'var(--forest)' : 'var(--cream-dark)',
                      background: form.nhs_status === value ? 'var(--forest-pale)' : 'white',
                      cursor: 'pointer', fontSize: 13, fontFamily: 'var(--font-body)',
                      fontWeight: form.nhs_status === value ? 600 : 400,
                      color: form.nhs_status === value ? 'var(--forest)' : 'var(--ink-mid)',
                      transition: 'all var(--transition)',
                    }}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Amount */}
            <div>
              <label style={LABEL_STYLE}>Amount paid (£)</label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 14, color: 'var(--ink-soft)', fontFamily: 'var(--font-body)' }}>£</span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.price_amount}
                  onChange={(e) => setForm((f) => ({ ...f, price_amount: e.target.value }))}
                  placeholder="0.00"
                  style={{ ...INPUT_STYLE, paddingLeft: 28 }}
                />
              </div>
            </div>

            {/* Date */}
            <div>
              <label style={LABEL_STYLE}>Date of treatment</label>
              <div style={{ display: 'flex', gap: 8 }}>
                <select
                  value={form.treatment_date ? form.treatment_date.split('-')[1] ?? '' : ''}
                  onChange={(e) => {
                    const year = form.treatment_date ? form.treatment_date.split('-')[0] : THIS_YEAR.toString();
                    setForm((f) => ({ ...f, treatment_date: e.target.value ? `${year}-${e.target.value}` : '' }));
                  }}
                  style={{ ...INPUT_STYLE, flex: 1 }}
                >
                  <option value="">Month</option>
                  {MONTHS.map((name, i) => {
                    const val = String(i + 1).padStart(2, '0');
                    return <option key={val} value={val}>{name}</option>;
                  })}
                </select>
                <select
                  value={form.treatment_date ? form.treatment_date.split('-')[0] ?? '' : ''}
                  onChange={(e) => {
                    const month = form.treatment_date ? (form.treatment_date.split('-')[1] ?? '01') : '01';
                    setForm((f) => ({ ...f, treatment_date: e.target.value ? `${e.target.value}-${month}` : '' }));
                  }}
                  style={{ ...INPUT_STYLE, flex: '0 0 110px' }}
                >
                  <option value="">Year</option>
                  {YEARS.map((y) => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* NHS band info */}
            {form.price_payment_type === 'nhs' && (
              <div style={{ background: 'var(--forest-pale)', border: '1px solid rgba(28,69,53,0.15)', borderRadius: 8, padding: '10px 14px', fontSize: 12, color: 'var(--forest)', fontFamily: 'var(--font-body)', lineHeight: 1.5 }}>
                NHS Band 1 = £27.90 · Band 2 = £76.60 · Band 3 = £332.10 (from 1 April 2026)
              </div>
            )}
          </div>
          <NavButtons onBack={() => setStep(3)} onNext={() => setStep(5)} nextLabel="Continue →" />
        </StepCard>
      )}

      {/* Step 6: Submit */}
      {step === 5 && (
        <StepCard title="Almost done" subtitle="Add your details to verify your review.">
          {/* Summary */}
          <div style={{ background: 'var(--forest-pale)', borderRadius: 10, padding: 16, marginBottom: 20 }}>
            <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--forest)', marginBottom: 8, fontFamily: 'var(--font-body)' }}>Review summary</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 600, color: 'var(--ink)', marginBottom: 4 }}>{practice.name}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <StarRating value={form.scores.rating_overall} size={13} />
              <span style={{ fontSize: 12, color: 'var(--ink-soft)', fontFamily: 'var(--font-body)' }}>
                {treatments.find((t) => t.id === form.treatment_id)?.name}
              </span>
            </div>
            {form.title && (
              <div style={{ fontSize: 13, fontStyle: 'italic', color: 'var(--ink-mid)', fontFamily: 'var(--font-display)' }}>"{form.title}"</div>
            )}
            {form.price_amount && form.price_payment_type && (
              <div style={{ fontSize: 12, color: 'var(--ink-soft)', fontFamily: 'var(--font-body)', marginTop: 4 }}>
                £{Number(form.price_amount).toFixed(2)} · {form.price_payment_type}
              </div>
            )}
          </div>

          {/* Follow-up opt-in */}
          <div
            style={{
              border: '1.5px solid var(--cream-dark)',
              borderRadius: 12,
              padding: '16px 18px',
              marginBottom: 20,
              background: form.followup_opted_in ? 'var(--forest-pale)' : 'white',
              transition: 'background 0.2s',
            }}
          >
            <label style={{ display: 'flex', alignItems: 'flex-start', gap: 12, cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={form.followup_opted_in}
                onChange={(e) => setForm((f) => ({ ...f, followup_opted_in: e.target.checked }))}
                style={{ marginTop: 2, accentColor: 'var(--forest)', width: 16, height: 16, flexShrink: 0 }}
              />
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink)', fontFamily: 'var(--font-body)', marginBottom: 3 }}>
                  Send me a 3-month outcome check-in
                </div>
                <div style={{ fontSize: 13, color: 'var(--ink-soft)', fontFamily: 'var(--font-body)', lineHeight: 1.55 }}>
                  We&apos;ll email you in 3 months to see how the result has held up — helping future patients make better decisions.
                </div>
              </div>
            </label>
          </div>

          {/* Hidden form that gets submitted */}
          <form action={action}>
            <input type="hidden" name="practice_id" value={practice.id} />
            <input type="hidden" name="treatment_id" value={form.treatment_id} />
            <input type="hidden" name="rating_overall" value={form.scores.rating_overall} />
            <input type="hidden" name="rating_cleanliness" value={form.scores.rating_cleanliness} />
            <input type="hidden" name="rating_cost_transparency" value={form.scores.rating_cost_transparency} />
            <input type="hidden" name="rating_pain_management" value={form.scores.rating_pain_management} />
            <input type="hidden" name="rating_communication" value={form.scores.rating_communication} />
            <input type="hidden" name="rating_anxiety_handling" value={form.scores.rating_anxiety_handling} />
            <input type="hidden" name="rating_treatment_results" value={form.scores.rating_treatment_results} />
            <input type="hidden" name="title" value={form.title} />
            <input type="hidden" name="body" value={form.body} />
            <input type="hidden" name="reviewer_display_name" value={form.anonymous ? '' : form.reviewer_display_name} />
            {form.treatment_date && <input type="hidden" name="treatment_date" value={form.treatment_date + '-01'} />}
            {form.price_amount && <input type="hidden" name="price_amount_pounds" value={form.price_amount} />}
            {form.price_payment_type && <input type="hidden" name="price_payment_type" value={form.price_payment_type} />}
            {form.nhs_status && <input type="hidden" name="nhs_status" value={form.nhs_status} />}
            <input type="hidden" name="followup_opted_in" value={String(form.followup_opted_in)} />

            <div style={{ marginBottom: 16 }}>
              <label style={LABEL_STYLE}>Your name (or initials)</label>
              <input
                value={form.reviewer_display_name}
                onChange={(e) => setForm((f) => ({ ...f, reviewer_display_name: e.target.value }))}
                placeholder="e.g. Sarah M."
                style={INPUT_STYLE}
              />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={LABEL_STYLE}>Email address <span style={{ color: 'var(--ink-soft)', fontWeight: 400 }}>(for verification — not shown publicly)</span></label>
              <input
                name="reviewer_email"
                type="email"
                required
                value={form.reviewer_email}
                onChange={(e) => setForm((f) => ({ ...f, reviewer_email: e.target.value }))}
                placeholder="you@example.com"
                style={INPUT_STYLE}
              />
            </div>
            <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', marginBottom: 20, fontSize: 13, fontFamily: 'var(--font-body)', color: 'var(--ink-mid)' }}>
              <input
                type="checkbox"
                checked={form.anonymous}
                onChange={(e) => setForm((f) => ({ ...f, anonymous: e.target.checked }))}
              />
              Post as anonymous patient
            </label>

            <p style={{ fontSize: 12, color: 'var(--ink-faint)', fontFamily: 'var(--font-body)', lineHeight: 1.6, marginBottom: 20 }}>
              By submitting, you confirm this review reflects your genuine experience.
            </p>

            {state && 'error' in state && (
              <p style={{ fontSize: 13, color: '#e05c4b', marginBottom: 12, fontFamily: 'var(--font-body)' }}>
                Something went wrong — please try again.
              </p>
            )}

            <div style={{ display: 'flex', gap: 10 }}>
              <button
                type="button"
                onClick={() => setStep(4)}
                style={{ padding: '12px 20px', borderRadius: 8, border: '1.5px solid var(--cream-dark)', background: 'transparent', cursor: 'pointer', fontSize: 14, color: 'var(--ink-mid)', fontFamily: 'var(--font-body)' }}
              >
                Back
              </button>
              <button
                type="submit"
                disabled={pending || !form.reviewer_email}
                style={{
                  flex: 1, padding: '14px', background: pending || !form.reviewer_email ? 'var(--ink-faint)' : 'var(--forest)',
                  color: 'var(--cream)', border: 'none', borderRadius: 8,
                  cursor: pending || !form.reviewer_email ? 'default' : 'pointer',
                  fontSize: 15, fontWeight: 700, fontFamily: 'var(--font-body)',
                  transition: 'background var(--transition)',
                }}
              >
                {pending ? 'Submitting…' : 'Submit Review'}
              </button>
            </div>
          </form>
        </StepCard>
      )}
    </div>
  );
}
