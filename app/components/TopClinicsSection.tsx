import Link from 'next/link';
import { ClinicCard, type BestForClinic } from './BestForSection';

type Props = {
  clinics: BestForClinic[];
  viewAllHref?: string;
  title?: string;
  eyebrow?: string;
};

export default function TopClinicsSection({ clinics, viewAllHref = '/search', title = 'Top-rated dentists in your area', eyebrow = 'Top rated' }: Props) {
  return (
    <section className="w-full" style={{ background: 'var(--cream)' }}>
      <div className="mx-auto px-5 py-16 sm:py-20" style={{ maxWidth: 1200 }}>

        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-8">
          <div>
            <p
              className="uppercase mb-2"
              style={{ fontFamily: 'var(--font-body)', fontSize: 11, fontWeight: 700, color: 'var(--forest)', letterSpacing: '0.12em' }}
            >
              {eyebrow}
            </p>
            <h2
              className="font-bold"
              style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(20px,3vw,26px)', color: 'var(--ink)', letterSpacing: '-0.02em', lineHeight: 1.2 }}
            >
              {title}
            </h2>
          </div>
          <Link
            href={viewAllHref}
            style={{ fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600, color: 'var(--ink-soft)', textDecoration: 'none', whiteSpace: 'nowrap', paddingTop: 2 }}
          >
            View all →
          </Link>
        </div>

        {/* 4-col grid */}
        {clinics.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {clinics.slice(0, 6).map((clinic) => (
              <ClinicCard key={clinic.slug} clinic={clinic} />
            ))}
          </div>
        ) : (
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--ink-soft)', textAlign: 'center', padding: '24px 0' }}>
            No clinics yet — we&apos;re adding practices across England.
          </p>
        )}

      </div>
    </section>
  );
}
