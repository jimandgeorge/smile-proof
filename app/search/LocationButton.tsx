'use client';

import { useState } from 'react';

export default function LocationButton({ radius = 10 }: { radius?: number }) {
  const [state, setState] = useState<'idle' | 'loading' | 'error'>('idle');
  const [message, setMessage] = useState('Location access denied - try entering a postcode instead.');

  function handleClick() {
    setMessage('Location access denied - try entering a postcode instead.');

    if (!navigator.geolocation) {
      setState('error');
      setMessage('Your browser does not support location - try entering a postcode instead.');
      return;
    }

    setState('loading');
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        window.location.assign(`/search?lat=${coords.latitude.toFixed(6)}&lng=${coords.longitude.toFixed(6)}&radius=${radius}`);
      },
      (err) => {
        setState('error');
        setMessage(
          err.code === err.PERMISSION_DENIED
            ? 'Location access denied - try entering a postcode instead.'
            : err.code === err.TIMEOUT
              ? 'Location timed out - try again or enter a postcode.'
              : 'Could not get your location - try entering a postcode instead.'
        );
      },
      { enableHighAccuracy: false, maximumAge: 60000, timeout: 12000 }
    );
  }

  if (state === 'error') {
    return (
      <p style={{ fontSize: 13, color: 'var(--ink-soft)', fontFamily: 'var(--font-body)' }}>
        {message}
      </p>
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={state === 'loading'}
      aria-label="Use my location"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        fontSize: 13,
        fontWeight: 600,
        fontFamily: 'var(--font-body)',
        color: state === 'loading' ? 'var(--ink-faint)' : 'var(--forest)',
        background: 'transparent',
        border: '1.5px solid',
        borderColor: state === 'loading' ? 'var(--cream-dark)' : 'rgba(28,69,53,0.3)',
        borderRadius: 999,
        padding: '7px 16px',
        cursor: state === 'loading' ? 'default' : 'pointer',
        transition: 'all 0.15s',
      }}
    >
      <svg width="13" height="13" viewBox="0 0 14 14" fill="none" aria-hidden>
        <circle cx="7" cy="7" r="3" stroke="currentColor" strokeWidth="1.4" />
        <line x1="7" y1="1" x2="7" y2="3.2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
        <line x1="7" y1="10.8" x2="7" y2="13" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
        <line x1="1" y1="7" x2="3.2" y2="7" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
        <line x1="10.8" y1="7" x2="13" y2="7" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      </svg>
      {state === 'loading' ? 'Locating...' : 'Use my location'}
    </button>
  );
}
