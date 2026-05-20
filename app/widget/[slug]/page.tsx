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

  const score       = sum?.avg_overall ? Number(sum.avg_overall) : null;
  const reviewCount = sum?.review_count ?? 0;
  const verifiedCount = sum?.verified_count ?? 0;
  const displayCount  = verifiedCount > 0 ? verifiedCount : reviewCount;
  const stars         = score ? Math.round(score) : 0;
  const profileUrl    = `${process.env.NEXT_PUBLIC_SITE_URL}/practices/${slug}`;

  return (
    <a
      href={profileUrl}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 0,
        background: 'white',
        border: '1.5px solid #e5e7eb',
        borderRadius: 14,
        padding: '14px 18px',
        boxShadow: '0 1px 6px rgba(0,0,0,0.06)',
        textDecoration: 'none',
        fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
        boxSizing: 'border-box',
      }}
    >
      {/* SmileProof logo mark */}
      <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRight: '1.5px solid #e5e7eb', marginRight: 16, paddingRight: 16 }}>
        <svg width="40" height="34" viewBox="0 0 1364 1168" fill="none" aria-hidden>
          <path d="M988.827 1099.16C585.785 1285.63 126.911 1074.59 7.70226 650.456C4.73416 639.895 1.88195 629.138 0.653384 618.283C-3.84662 578.524 15.1342 549.794 50.2868 545.586C87.0498 541.186 105.848 561.789 114.48 595.512C142.83 706.265 197.655 801.513 279.619 881.776C595.479 1191.08 1124.09 1049.33 1242.19 623.253C1245.87 609.978 1248.38 596.254 1253.34 583.48C1264 556.014 1284.94 540.457 1314.33 544.475C1345.7 548.761 1362.46 570.067 1363.31 601.756C1364.28 638.34 1350.97 672.185 1338.92 705.693C1275.36 882.407 1160.03 1013.72 988.827 1099.16Z" fill="#1A1A18"/>
          <path d="M401.959 250.116C450.791 276.134 479.852 319.505 517.011 353.968C552.329 386.723 587.144 420.36 618.943 456.459C643.453 484.283 661.138 481.612 685.812 456.897C808.39 334.114 932.17 212.529 1055.52 90.5131C1075.1 71.1441 1094.41 51.503 1114.23 32.382C1154.45 -6.42057 1198.64 -10.5511 1231.25 21.071C1266.21 54.986 1262.79 99.8429 1221.27 140.734C1068.2 291.481 914.927 442.019 761.758 592.662C743.103 611.01 725.388 630.397 705.875 647.773C670.798 679.01 631.932 679.926 598.748 646.737C507.225 555.201 417.042 462.318 326.842 369.469C302.973 344.899 299.856 314.266 315.578 285.426C332.934 253.586 361.512 239.065 401.959 250.116Z" fill="#03451C"/>
        </svg>
      </div>

      {/* Right content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {/* Score + stars */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
          <span style={{ fontSize: 22, fontWeight: 800, color: '#111827', lineHeight: 1, letterSpacing: '-0.03em' }}>
            {score ? score.toFixed(1) : '—'}
          </span>
          <span style={{ color: '#f59e0b', fontSize: 18, letterSpacing: 1, lineHeight: 1 }}>
            {'★'.repeat(stars)}{'☆'.repeat(Math.max(0, 5 - stars))}
          </span>
        </div>

        {/* Review count */}
        <div style={{ fontSize: 12, color: '#6b7280', lineHeight: 1.4, marginBottom: 2 }}>
          Based on {displayCount} verified {displayCount === 1 ? 'review' : 'reviews'}
        </div>

        {/* Brand */}
        <div style={{ fontSize: 11, color: '#9ca3af', lineHeight: 1.4 }}>
          Powered by <span style={{ fontWeight: 700, color: '#1c4535' }}>SmileProof</span>
        </div>
      </div>
    </a>
  );
}
