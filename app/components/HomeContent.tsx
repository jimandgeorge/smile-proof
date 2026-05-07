'use client';

import { useState } from 'react';
import Link from 'next/link';
import PracticeCard, { PracticeCardData } from './PracticeCard';

type Section = { label: string; emoji: string; tagline: string; practices: PracticeCardData[] };
type Props = {
  intentSections: Section[];
  browsePractices: PracticeCardData[];
  totalPractices: number;
  totalReviews: number;
  avgPain: number | null;
  avgCommunication: number | null;
  avgValue: number | null;
};

function CompactCard({ practice: p, metricValue }: { practice: PracticeCardData; metricValue: number | null | undefined }) {
  const [hovered, setHovered] = useState(false);
  const barWidth = metricValue ? `${(metricValue / 5) * 100}%` : '0%';

  return (
    <Link
      href={`/practices/${p.slug}`}
      style={{ textDecoration: 'none' }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div
        style={{
          background: 'white',
          border: `1.5px solid ${hovered ? 'var(--forest)' : 'var(--cream-dark)'}`,
          borderRadius: 12,
          padding: 16,
          cursor: 'pointer',
          transition: 'border-color 0.15s',
          display: 'flex',
          flexDirection: 'column',
          gap: 6,
          height: '100%',
          boxSizing: 'border-box',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: 'var(--forest-pale)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 14,
              fontFamily: 'var(--font-display)',
              fontWeight: 700,
              color: 'var(--forest)',
              flexShrink: 0,
            }}
          >
            {p.name.charAt(0).toUpperCase()}
          </div>
          <span
            style={{
              fontSize: 14,
              fontWeight: 700,
              color: 'var(--ink)',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              flex: 1,
              minWidth: 0,
            }}
          >
            {p.name}
          </span>
          {p.avg_overall != null && (
            <span
              style={{
                fontSize: 13,
                color: 'var(--gold)',
                fontWeight: 600,
                flexShrink: 0,
                whiteSpace: 'nowrap',
              }}
            >
              {Number(p.avg_overall).toFixed(1)} ★
            </span>
          )}
        </div>

        <div style={{ fontSize: 12, color: 'var(--ink-soft)' }}>{p.city}</div>

        <div
          style={{
            height: 3,
            borderRadius: 2,
            background: 'var(--cream-dark)',
            overflow: 'hidden',
            marginTop: 2,
          }}
        >
          <div
            style={{
              height: '100%',
              width: barWidth,
              background: 'var(--forest)',
              borderRadius: 2,
            }}
          />
        </div>

        <div style={{ fontSize: 12, color: 'var(--forest)', fontWeight: 600, marginTop: 2 }}>
          See experience →
        </div>
      </div>
    </Link>
  );
}

export default function HomeContent({
  intentSections,
  browsePractices,
  totalPractices,
  totalReviews,
  avgPain,
  avgCommunication,
}: Props) {
  const insightPills: string[] = [
    `Based on ${totalReviews.toLocaleString()} patient reviews`,
    ...(avgPain != null ? [`Pain management ${avgPain.toFixed(1)}/5`] : []),
    ...(avgCommunication != null ? [`Communication ${avgCommunication.toFixed(1)}/5`] : []),
    'NHS & private practices covered',
  ];

  const sectionMetricKeys: Array<keyof PracticeCardData> = ['avg_anxiety', 'avg_cost', 'avg_overall'];

  return (
    <div style={{ maxWidth: 1080, margin: '0 auto', padding: '0 24px' }}>
      <div
        style={{
          padding: '14px 0',
          borderBottom: '1px solid var(--cream-dark)',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          flexWrap: 'wrap',
          marginBottom: 40,
        }}
      >
        {insightPills.map((pill, i) => (
          <span key={pill} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {i > 0 && (
              <span style={{ color: 'var(--ink-faint)', fontSize: 14, lineHeight: 1 }}>·</span>
            )}
            <span style={{ fontSize: 13, color: 'var(--ink-soft)' }}>{pill}</span>
          </span>
        ))}
      </div>

      {intentSections.map((section, idx) => {
        const metricKey = sectionMetricKeys[idx];
        return (
          <div key={section.label} style={{ marginBottom: 40 }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 14,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 20 }}>{section.emoji}</span>
                <span
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: 16,
                    fontWeight: 700,
                    color: 'var(--ink)',
                  }}
                >
                  {section.label}
                </span>
                <span style={{ fontSize: 13, color: 'var(--ink-soft)' }}>{section.tagline}</span>
              </div>
              <Link
                href="/search"
                style={{
                  fontSize: 13,
                  color: 'var(--forest)',
                  textDecoration: 'none',
                  fontWeight: 500,
                  flexShrink: 0,
                }}
              >
                View all →
              </Link>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: 12,
              }}
            >
              {section.practices.map((p) => (
                <CompactCard
                  key={p.id}
                  practice={p}
                  metricValue={p[metricKey] as number | null | undefined}
                />
              ))}
            </div>
          </div>
        );
      })}

      <div
        style={{
          background: 'var(--forest)',
          borderRadius: 16,
          padding: '48px 32px',
          maxWidth: 680,
          margin: '0 auto',
          marginBottom: 48,
          textAlign: 'center',
        }}
      >
        <h2
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 24,
            fontWeight: 800,
            color: 'white',
            marginBottom: 12,
          }}
        >
          Not sure which dentist is right for you?
        </h2>
        <p
          style={{
            color: 'rgba(255,255,255,0.65)',
            fontSize: 15,
            marginBottom: 24,
            lineHeight: 1.6,
          }}
        >
          Tell us what matters most — we'll point you to the right practice.
        </p>
        <Link
          href="/search"
          style={{
            display: 'inline-block',
            background: '#f59e0b',
            color: '#1c1c0a',
            borderRadius: 50,
            padding: '12px 32px',
            fontWeight: 700,
            fontSize: 15,
            textDecoration: 'none',
            fontFamily: 'var(--font-body)',
          }}
        >
          Find my dentist
        </Link>
      </div>

      <div style={{ marginBottom: 48 }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 20,
          }}
        >
          <h2
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 20,
              fontWeight: 700,
              color: 'var(--ink)',
            }}
          >
            Browse all practices
          </h2>
          <Link
            href="/search"
            style={{
              fontSize: 14,
              color: 'var(--forest)',
              textDecoration: 'none',
              fontWeight: 600,
            }}
          >
            View all {totalPractices} →
          </Link>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: 16,
          }}
        >
          {browsePractices.map((p) => (
            <PracticeCard key={p.id} practice={p} />
          ))}
        </div>

        <div style={{ textAlign: 'center', marginTop: 24 }}>
          <Link
            href="/search"
            style={{
              color: 'var(--forest)',
              fontWeight: 600,
              fontSize: 14,
              textDecoration: 'none',
            }}
          >
            View all {totalPractices} practices →
          </Link>
        </div>
      </div>
    </div>
  );
}
