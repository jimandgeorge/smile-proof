import { notFound } from 'next/navigation';
import Link from 'next/link';
import { createServerSupabase, createAdminSupabase } from '@/lib/supabase';

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params) {
  const { slug } = await params;
  const supabase = await createServerSupabase();
  const { data } = await supabase.from('dentists').select('full_name').eq('slug', slug).single();
  if (!data) return { title: 'Dentist not found' };
  return {
    title: `${data.full_name} — Dentist Reviews | SmileProof`,
    description: `Patient reviews and ratings for ${data.full_name}.`,
  };
}

export default async function DentistPage({ params }: Params) {
  const { slug } = await params;
  const supabase = await createServerSupabase();
  const admin = createAdminSupabase();

  const { data: dentist, error } = await supabase
    .from('dentists')
    .select('id, full_name, gdc_number, specialisms')
    .eq('slug', slug)
    .single();

  if (error || !dentist) notFound();

  const [practiceLinksRes, reviewsRes] = await Promise.all([
    supabase
      .from('practice_dentists')
      .select('practices(id, name, slug, city)')
      .eq('dentist_id', dentist.id)
      .eq('active', true),
    admin
      .from('reviews')
      .select(`
        id, title, body, rating_overall, rating_anxiety_handling,
        verification_status, treatment_date, created_at,
        reviewer_display_name, helpful_count,
        treatments(name),
        practices(name, slug, city)
      `)
      .eq('dentist_id', dentist.id)
      .eq('moderation_status', 'published')
      .order('created_at', { ascending: false })
      .limit(20),
  ]);

  const practices = (practiceLinksRes.data ?? []).map((r: any) => r.practices).filter(Boolean);
  const reviews = reviewsRes.data ?? [];

  const avgOverall = reviews.length > 0
    ? reviews.reduce((sum, r: any) => sum + (r.rating_overall ?? 0), 0) / reviews.length
    : null;

  const specialisms: string[] = dentist.specialisms ?? [];

  return (
    <main style={{ maxWidth: 760, margin: '0 auto', padding: '32px 20px 80px' }}>
      <Link
        href="/"
        style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--ink-soft)', textDecoration: 'none', marginBottom: 24 }}
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M9 2L4 7l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Back
      </Link>

      {/* Header card */}
      <div
        style={{
          background: 'white',
          borderRadius: 16,
          border: '1.5px solid var(--cream-dark)',
          padding: '28px 32px',
          marginBottom: 24,
        }}
      >
        <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>
          <div
            style={{
              width: 72, height: 72, borderRadius: 14, flexShrink: 0,
              background: 'var(--forest-pale)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 700, color: 'var(--forest)',
            }}
          >
            {dentist.full_name.charAt(0).toUpperCase()}
          </div>

          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 4 }}>
              <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 700, color: 'var(--ink)', margin: 0 }}>
                {dentist.full_name}
              </h1>
              {dentist.gdc_number && (
                <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--ink-soft)', background: 'var(--cream-dark)', borderRadius: 20, padding: '2px 8px', fontFamily: 'var(--font-body)' }}>
                  GDC {dentist.gdc_number}
                </span>
              )}
            </div>

            {specialisms.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
                {specialisms.map((s: string) => (
                  <span key={s} style={{ fontSize: 12, fontWeight: 600, color: 'var(--forest)', background: 'var(--forest-pale)', border: '1px solid rgba(28,69,53,0.15)', borderRadius: 20, padding: '3px 10px', fontFamily: 'var(--font-body)' }}>
                    {s}
                  </span>
                ))}
              </div>
            )}

            {avgOverall !== null && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, color: 'var(--ink)' }}>
                  {avgOverall.toFixed(1)}
                </span>
                <span style={{ color: 'var(--gold)', fontSize: 14, letterSpacing: '-0.5px' }}>
                  {'★'.repeat(Math.round(avgOverall))}{'☆'.repeat(5 - Math.round(avgOverall))}
                </span>
                <span style={{ fontSize: 12, color: 'var(--ink-soft)', fontFamily: 'var(--font-body)' }}>
                  from {reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}
                </span>
              </div>
            )}
          </div>
        </div>

        {practices.length > 0 && (
          <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid var(--cream-dark)' }}>
            <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--ink-soft)', marginBottom: 10, fontFamily: 'var(--font-body)' }}>
              Works at
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {practices.map((p: any) => (
                <Link
                  key={p.id}
                  href={`/practices/${p.slug}`}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 5,
                    padding: '7px 14px',
                    background: 'var(--cream)',
                    border: '1.5px solid var(--cream-dark)',
                    borderRadius: 10,
                    fontSize: 13, fontWeight: 600, color: 'var(--ink)',
                    fontFamily: 'var(--font-body)', textDecoration: 'none',
                  }}
                >
                  {p.name}
                  <span style={{ fontSize: 11, color: 'var(--ink-soft)', fontWeight: 400 }}>{p.city}</span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Reviews */}
      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, color: 'var(--ink)', marginBottom: 14, letterSpacing: '-0.01em' }}>
        Patient reviews
      </h2>

      {reviews.length === 0 ? (
        <div style={{ background: 'white', border: '1.5px solid var(--cream-dark)', borderRadius: 12, padding: '40px 32px', textAlign: 'center' }}>
          <p style={{ fontSize: 14, color: 'var(--ink-soft)', fontFamily: 'var(--font-body)' }}>No reviews yet for this dentist.</p>
        </div>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 14 }}>
          {reviews.map((r: any) => (
            <li
              key={r.id}
              style={{ background: 'white', borderRadius: 12, padding: '20px 22px', border: '1.5px solid var(--cream-dark)' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <span style={{ color: 'var(--gold)', fontSize: 13, letterSpacing: '-0.5px' }}>
                      {'★'.repeat(r.rating_overall)}{'☆'.repeat(5 - r.rating_overall)}
                    </span>
                    <span style={{ fontSize: 11, color: 'var(--ink-soft)', fontFamily: 'var(--font-body)' }}>
                      {new Date(r.created_at).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}
                    </span>
                    {r.verification_status === 'verified' && (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: 11, color: 'var(--forest)', fontWeight: 600, fontFamily: 'var(--font-body)' }}>
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                          <circle cx="6" cy="6" r="6" fill="var(--forest)" />
                          <polyline points="3,6 5,8.5 9,3.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        Verified
                      </span>
                    )}
                  </div>
                  {r.title && (
                    <h4 style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 600, color: 'var(--ink)', margin: 0 }}>
                      {r.title}
                    </h4>
                  )}
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  {r.reviewer_display_name && (
                    <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink-mid)', marginBottom: 4, fontFamily: 'var(--font-body)' }}>
                      {r.reviewer_display_name}
                    </div>
                  )}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                    {r.treatments && (
                      <span style={{ fontSize: 11, fontWeight: 600, background: 'var(--cream-dark)', color: 'var(--ink-soft)', borderRadius: 20, padding: '3px 8px', fontFamily: 'var(--font-body)' }}>
                        {r.treatments.name}
                      </span>
                    )}
                    {r.practices && (
                      <Link
                        href={`/practices/${r.practices.slug}`}
                        style={{ fontSize: 11, color: 'var(--forest)', fontFamily: 'var(--font-body)', fontWeight: 500, textDecoration: 'none' }}
                      >
                        {r.practices.name} →
                      </Link>
                    )}
                  </div>
                </div>
              </div>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--ink-mid)', lineHeight: 1.7, margin: 0 }}>
                {r.body}
              </p>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
