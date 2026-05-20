'use client';

import { useState } from 'react';

const ENQUIRY_TYPES = [
  { value: '', label: 'Select an enquiry type…' },
  { value: 'patient',     label: 'Patient — finding a dentist or review help' },
  { value: 'clinic',      label: 'Clinic — profile, claiming, or reviews' },
  { value: 'partnership', label: 'Partnerships & dental groups' },
  { value: 'press',       label: 'Press & media' },
  { value: 'other',       label: 'Something else' },
];

const INPUT_STYLE: React.CSSProperties = {
  width: '100%',
  border: '1.5px solid var(--cream-dark)',
  borderRadius: 10,
  padding: '12px 16px',
  fontSize: 15,
  fontFamily: 'var(--font-body)',
  color: 'var(--ink)',
  background: 'white',
  outline: 'none',
  boxSizing: 'border-box',
  transition: 'border-color 0.15s',
};

const LABEL_STYLE: React.CSSProperties = {
  display: 'block',
  fontSize: 12,
  fontWeight: 700,
  letterSpacing: '0.07em',
  textTransform: 'uppercase',
  color: 'var(--ink-soft)',
  fontFamily: 'var(--font-body)',
  marginBottom: 8,
};

export default function ContactForm() {
  const [fields, setFields] = useState({ name: '', email: '', type: '', message: '' });
  const [focused, setFocused] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function set(key: string, value: string) {
    setFields(f => ({ ...f, [key]: value }));
  }

  function focusStyle(name: string): React.CSSProperties {
    return { ...INPUT_STYLE, borderColor: focused === name ? 'rgba(28,69,53,0.5)' : 'var(--cream-dark)' };
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!fields.name || !fields.email || !fields.type || !fields.message) {
      setError('Please fill in all fields.');
      return;
    }
    setError(null);
    setLoading(true);
    // Simulate sending — wire up to an API route or email service when ready
    await new Promise(r => setTimeout(r, 900));
    setLoading(false);
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div style={{ textAlign: 'center', padding: '48px 24px' }}>
        <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'var(--forest-pale)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path d="M5 13l4 4L19 7" stroke="var(--forest)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 800, color: 'var(--ink)', marginBottom: 10, letterSpacing: '-0.02em' }}>
          Message received
        </h3>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 15, color: 'var(--ink-soft)', lineHeight: 1.65, maxWidth: 380, margin: '0 auto' }}>
          Thanks for reaching out. We'll get back to you within 1 business day.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }} className="sm:grid block">
        <div>
          <label htmlFor="contact-name" style={LABEL_STYLE}>Your name</label>
          <input
            id="contact-name"
            type="text"
            autoComplete="name"
            placeholder="Jane Smith"
            value={fields.name}
            onChange={e => set('name', e.target.value)}
            onFocus={() => setFocused('name')}
            onBlur={() => setFocused(null)}
            style={focusStyle('name')}
          />
        </div>
        <div>
          <label htmlFor="contact-email" style={LABEL_STYLE}>Email address</label>
          <input
            id="contact-email"
            type="email"
            autoComplete="email"
            placeholder="jane@example.com"
            value={fields.email}
            onChange={e => set('email', e.target.value)}
            onFocus={() => setFocused('email')}
            onBlur={() => setFocused(null)}
            style={focusStyle('email')}
          />
        </div>
      </div>

      <div>
        <label htmlFor="contact-type" style={LABEL_STYLE}>Enquiry type</label>
        <select
          id="contact-type"
          value={fields.type}
          onChange={e => set('type', e.target.value)}
          onFocus={() => setFocused('type')}
          onBlur={() => setFocused(null)}
          style={{ ...focusStyle('type'), color: fields.type ? 'var(--ink)' : 'var(--ink-faint)', appearance: 'none', backgroundImage: `url("data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%239ca3af' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 16px center' }}
        >
          {ENQUIRY_TYPES.map(({ value, label }) => (
            <option key={value} value={value} disabled={value === ''}>{label}</option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="contact-message" style={LABEL_STYLE}>Message</label>
        <textarea
          id="contact-message"
          rows={5}
          placeholder="Tell us what you need help with…"
          value={fields.message}
          onChange={e => set('message', e.target.value)}
          onFocus={() => setFocused('message')}
          onBlur={() => setFocused(null)}
          style={{ ...focusStyle('message'), resize: 'vertical', minHeight: 120 }}
        />
      </div>

      {error && (
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: '#dc2626', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '10px 14px', margin: 0 }}>
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        style={{
          padding: '14px',
          borderRadius: 10,
          background: loading ? 'var(--ink-faint)' : 'var(--forest)',
          color: 'white',
          border: 'none',
          fontSize: 15,
          fontWeight: 700,
          fontFamily: 'var(--font-body)',
          cursor: loading ? 'not-allowed' : 'pointer',
          letterSpacing: '-0.01em',
          transition: 'opacity 0.15s',
        }}
      >
        {loading ? 'Sending…' : 'Send message'}
      </button>
    </form>
  );
}
