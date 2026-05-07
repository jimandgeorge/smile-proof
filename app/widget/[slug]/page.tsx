import { notFound } from 'next/navigation';
import { createAdminSupabase } from '@/lib/supabase';

type Params = { params: Promise<{ slug: string }> };

export default async function WidgetPage({ params }: Params) {
  const { slug } = await params;
  const admin = createAdminSupabase();

  const { data: practice } = await admin
    .from('practices')
    .select('id, name, slug')
    .eq('slug', slug)
    .single();

  if (!practice) notFound();

  const { data: sum } = await admin
    .from('practice_rating_summary')
    .select('avg_overall, review_count, verified_count')
    .eq('practice_id', practice.id)
    .maybeSingle();

  const score = sum?.avg_overall ? Number(sum.avg_overall) : null;
  const reviewCount = sum?.review_count ?? 0;
  const verifiedCount = sum?.verified_count ?? 0;
  const stars = score ? Math.round(score) : 0;
  const profileUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/practices/${slug}`;

  const strokeColor = !score ? '#d4cfc8'
    : score >= 4.5 ? '#1c4535'
    : score >= 3.5 ? '#c9a84c'
    : '#e05252';

  const r = 18;
  const circ = 2 * Math.PI * r;

  return (
    <a
      href={profileUrl}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 12,
        background: 'white',
        border: '1.5px solid #e8e3db',
        borderRadius: 12,
        padding: '10px 14px',
        width: 300,
        boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
        textDecoration: 'none',
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}
    >
      {/* Score ring */}
      <svg width="48" height="48" viewBox="0 0 48 48" style={{ transform: 'rotate(-90deg)', flexShrink: 0 }}>
        <circle cx="24" cy="24" r={r} fill="none" stroke="#e8e3db" strokeWidth="3.5" />
        {score && (
          <circle
            cx="24" cy="24" r={r} fill="none"
            stroke={strokeColor} strokeWidth="3.5"
            strokeDasharray={circ}
            strokeDashoffset={circ * (1 - score / 5)}
            strokeLinecap="round"
          />
        )}
        <text
          x="24" y="28" textAnchor="middle"
          style={{ transform: 'rotate(90deg)', transformOrigin: '24px 24px', fontSize: 13, fontWeight: 700, fill: '#2a2a2a' }}
        >
          {score ? score.toFixed(1) : '—'}
        </text>
      </svg>

      {/* Practice info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#2a2a2a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {practice.name}
        </div>
        <div style={{ color: '#c9a84c', fontSize: 13, margin: '3px 0', letterSpacing: '-0.5px' }}>
          {'★'.repeat(stars)}{'☆'.repeat(Math.max(0, 5 - stars))}
        </div>
        <div style={{ fontSize: 11, color: '#999' }}>
          {reviewCount} review{reviewCount !== 1 ? 's' : ''}{verifiedCount > 0 ? ` · ${verifiedCount} verified` : ''}
        </div>
      </div>

      {/* Brand */}
      <div style={{ flexShrink: 0, textAlign: 'right', borderLeft: '1px solid #e8e3db', paddingLeft: 12 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: '#1c4535', letterSpacing: '-0.02em' }}>
          Smile<em style={{ fontStyle: 'italic' }}>Proof</em>
        </div>
        <div style={{ fontSize: 9, color: '#bbb', marginTop: 2 }}>smileproof.co.uk</div>
      </div>
    </a>
  );
}
