'use client';

import { useState } from 'react';

const NHS_BAND_RATES: Record<number, number> = {
  1: 2680,   // £26.80
  2: 7350,   // £73.50
  3: 28430,  // £284.30
};

const PAYMENT_TYPE_LABELS: Record<string, string> = {
  nhs: 'NHS',
  private: 'Private',
  insurance: 'Insurance',
};

const PAYMENT_TYPE_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  nhs:       { bg: 'var(--forest-pale)', text: 'var(--forest)',  border: 'rgba(28,69,53,0.2)' },
  private:   { bg: '#fdf8ee',            text: '#92620a',        border: 'rgba(146,98,10,0.2)' },
  insurance: { bg: '#f0f2ff',            text: '#3b41c8',        border: 'rgba(59,65,200,0.2)' },
};

export type PriceRow = {
  treatment_id: string;
  treatment_name: string;
  treatment_category: string;
  treatment_nhs_band: number | null;
  payment_type: string;
  report_count: number;
  avg_pence: number;
  min_pence: number;
  max_pence: number;
};

function pence(p: number) {
  return `£${(p / 100).toFixed(2).replace(/\.00$/, '')}`;
}

export default function PriceTransparencySection({ rows }: { rows: PriceRow[] }) {
  const treatments = Array.from(
    new Map(rows.map((r) => [r.treatment_id, { id: r.treatment_id, name: r.treatment_name }])).values()
  );

  const [selectedId, setSelectedId] = useState<string>(treatments[0]?.id ?? '');

  if (rows.length === 0) return null;

  const selected = treatments.find((t) => t.id === selectedId) ?? treatments[0];
  const filtered = rows.filter((r) => r.treatment_id === selected?.id);
  const nhsBand = filtered[0]?.treatment_nhs_band ?? null;
  const totalReports = filtered.reduce((n, r) => n + r.report_count, 0);

  return (
    <section
      style={{
        background: 'white',
        borderRadius: 'var(--radius)',
        border: '1.5px solid var(--cream-dark)',
        padding: '22px 24px',
        marginBottom: 24,
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: 7,
            background: 'var(--forest)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <circle cx="7" cy="7" r="5.5" stroke="white" strokeWidth="1.4" />
            <path d="M7 4v1.5M7 9.5V8M5.5 6.5c0-.83.67-1.5 1.5-1.5s1.5.67 1.5 1.5c0 .55-.3 1.03-.75 1.28L7 8" stroke="white" strokeWidth="1.2" strokeLinecap="round" />
          </svg>
        </div>
        <span
          style={{
            fontSize: 12,
            fontWeight: 700,
            color: 'var(--forest)',
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
          }}
        >
          What patients paid
        </span>
        <span
          style={{
            marginLeft: 'auto',
            fontSize: 11,
            color: 'var(--ink-faint)',
            fontFamily: 'var(--font-body)',
          }}
        >
          Patient-reported · not guaranteed
        </span>
      </div>

      {/* Treatment filter pills */}
      <div
        style={{
          display: 'flex',
          gap: 6,
          flexWrap: 'wrap',
          marginBottom: 18,
        }}
      >
        {treatments.map((t) => (
          <button
            key={t.id}
            onClick={() => setSelectedId(t.id)}
            style={{
              padding: '5px 12px',
              borderRadius: 20,
              border: '1.5px solid',
              borderColor: t.id === selectedId ? 'var(--forest)' : 'var(--cream-dark)',
              background: t.id === selectedId ? 'var(--forest)' : 'transparent',
              color: t.id === selectedId ? 'var(--cream)' : 'var(--ink-soft)',
              fontSize: 12,
              fontWeight: 600,
              fontFamily: 'var(--font-body)',
              cursor: 'pointer',
              transition: 'all var(--transition)',
            }}
          >
            {t.name}
          </button>
        ))}
      </div>

      {/* NHS reference band */}
      {nhsBand && NHS_BAND_RATES[nhsBand] && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '8px 12px',
            borderRadius: 8,
            background: 'var(--forest-pale)',
            marginBottom: 14,
            fontSize: 12,
            color: 'var(--forest)',
            fontFamily: 'var(--font-body)',
          }}
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <circle cx="6" cy="6" r="5" stroke="var(--forest)" strokeWidth="1.2" />
            <path d="M6 5v4M6 3.5v.5" stroke="var(--forest)" strokeWidth="1.2" strokeLinecap="round" />
          </svg>
          NHS Band {nhsBand} rate: <strong>{pence(NHS_BAND_RATES[nhsBand])}</strong> (2024/25)
        </div>
      )}

      {/* Payment type breakdown */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {filtered.map((row) => {
          const colors = PAYMENT_TYPE_COLORS[row.payment_type] ?? PAYMENT_TYPE_COLORS.private;
          const showRange = row.min_pence !== row.max_pence;
          return (
            <div
              key={row.payment_type}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '12px 14px',
                borderRadius: 10,
                background: colors.bg,
                border: `1.5px solid ${colors.border}`,
              }}
            >
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: colors.text,
                  width: 70,
                  flexShrink: 0,
                  fontFamily: 'var(--font-body)',
                }}
              >
                {PAYMENT_TYPE_LABELS[row.payment_type] ?? row.payment_type}
              </span>

              <div style={{ flex: 1 }}>
                <span
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: 20,
                    fontWeight: 700,
                    color: 'var(--ink)',
                    letterSpacing: '-0.02em',
                  }}
                >
                  {pence(row.avg_pence)}
                </span>
                {showRange && (
                  <span
                    style={{
                      fontSize: 12,
                      color: 'var(--ink-soft)',
                      marginLeft: 8,
                      fontFamily: 'var(--font-body)',
                    }}
                  >
                    avg · {pence(row.min_pence)}–{pence(row.max_pence)} range
                  </span>
                )}
              </div>

              <span
                style={{
                  fontSize: 11,
                  color: 'var(--ink-faint)',
                  fontFamily: 'var(--font-body)',
                  flexShrink: 0,
                }}
              >
                {row.report_count} {row.report_count === 1 ? 'report' : 'reports'}
              </span>
            </div>
          );
        })}
      </div>

      {/* Footer note */}
      <p
        style={{
          marginTop: 12,
          fontSize: 11,
          color: 'var(--ink-faint)',
          fontFamily: 'var(--font-body)',
          lineHeight: 1.5,
        }}
      >
        Based on {totalReports} patient-reported {totalReports === 1 ? 'price' : 'prices'} for {selected?.name}. Prices are self-reported and may vary.
      </p>
    </section>
  );
}
