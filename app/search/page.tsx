import Link from 'next/link';
import { createServerSupabase } from '@/lib/supabase';
import PracticeCard, { PracticeCardData } from '@/app/components/PracticeCard';
import LocationButton from './LocationButton';

const PAGE_SIZE = 20;
const UK_POSTCODE_FULL    = /^[A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2}$/i;
const UK_POSTCODE_OUTWARD = /^[A-Z]{1,2}\d[A-Z\d]?$/i;

type SearchParams = Promise<{ q?: string; lat?: string; lng?: string; radius?: string; page?: string }>;

async function geocodePostcode(postcode: string) {
  const res = await fetch(
    `https://api.postcodes.io/postcodes/${encodeURIComponent(postcode.trim())}`,
    { next: { revalidate: 86400 } }
  );
  if (!res.ok) return null;
  const json = await res.json();
  return { lat: json.result.latitude as number, lng: json.result.longitude as number };
}

async function reverseGeocode(lat: number, lng: number): Promise<string | null> {
  const res = await fetch(
    `https://api.postcodes.io/postcodes?lon=${lng}&lat=${lat}&limit=1`,
    { next: { revalidate: 3600 } }
  );
  if (!res.ok) return null;
  const json = await res.json();
  const result = json.result?.[0];
  if (!result?.postcode) return null;
  return extractOutwardCode(result.postcode);
}

async function geocodeOutcode(outcode: string) {
  const res = await fetch(
    `https://api.postcodes.io/outcodes/${encodeURIComponent(outcode.trim().toUpperCase())}`,
    { next: { revalidate: 86400 } }
  );
  if (!res.ok) return null;
  const json = await res.json();
  return { lat: json.result.latitude as number, lng: json.result.longitude as number };
}

function extractOutwardCode(postcode: string): string {
  const upper = postcode.trim().toUpperCase().replace(/\s+/g, ' ');
  const spaceIdx = upper.indexOf(' ');
  return spaceIdx > 0 ? upper.slice(0, spaceIdx) : upper.slice(0, 4);
}

async function searchByPostcodePrefix(outwardCode: string): Promise<PracticeCardData[]> {
  const supabase = await createServerSupabase();
  const [practicesRes, summariesRes, servicesRes] = await Promise.all([
    supabase
      .from('practices')
      .select('id, slug, name, city, address_line1, practice_type, website, claimed_by_user_id, ai_summary')
      .ilike('postcode', `${outwardCode}%`)
      .order('name')
      .limit(30),
    supabase
      .from('practice_rating_summary')
      .select('practice_id, avg_overall, avg_cleanliness, avg_pain, avg_cost, avg_communication, avg_anxiety, review_count'),
    supabase
      .from('practice_services')
      .select('practice_id, services(slug, name)'),
  ]);

  const summaryMap: Record<string, any> = {};
  for (const s of summariesRes.data ?? []) summaryMap[s.practice_id] = s;

  const servicesByPractice = new Map<string, { slug: string; name: string }[]>();
  for (const row of (servicesRes.data ?? [])) {
    const ps = row as any;
    if (!ps.services) continue;
    const list = servicesByPractice.get(ps.practice_id) ?? [];
    list.push(ps.services);
    servicesByPractice.set(ps.practice_id, list);
  }

  return (practicesRes.data ?? []).map((p) => {
    const s = summaryMap[p.id];
    return {
      ...p,
      avg_overall:       s?.avg_overall       ?? null,
      review_count:      s?.review_count       ?? 0,
      avg_cleanliness:   s?.avg_cleanliness    ?? null,
      avg_pain:          s?.avg_pain           ?? null,
      avg_cost:          s?.avg_cost           ?? null,
      avg_communication: s?.avg_communication  ?? null,
      avg_anxiety:       s?.avg_anxiety        ?? null,
      services:          servicesByPractice.get(p.id) ?? [],
    };
  });
}

async function searchByText(query: string): Promise<PracticeCardData[]> {
  const supabase = await createServerSupabase();
  const [practicesRes, summariesRes, servicesRes] = await Promise.all([
    supabase
      .from('practices')
      .select('id, slug, name, city, address_line1, practice_type, website, claimed_by_user_id, ai_summary')
      .or(`name.ilike.%${query}%,city.ilike.%${query}%`)
      .order('name')
      .limit(200),
    supabase
      .from('practice_rating_summary')
      .select('practice_id, avg_overall, avg_cleanliness, avg_pain, avg_cost, avg_communication, avg_anxiety, review_count'),
    supabase
      .from('practice_services')
      .select('practice_id, services(slug, name)'),
  ]);

  const summaryMap: Record<string, any> = {};
  for (const s of summariesRes.data ?? []) summaryMap[s.practice_id] = s;

  const servicesByPractice = new Map<string, { slug: string; name: string }[]>();
  for (const row of (servicesRes.data ?? [])) {
    const ps = row as any;
    if (!ps.services) continue;
    const list = servicesByPractice.get(ps.practice_id) ?? [];
    list.push(ps.services);
    servicesByPractice.set(ps.practice_id, list);
  }

  return (practicesRes.data ?? []).map((p) => {
    const s = summaryMap[p.id];
    return {
      ...p,
      avg_overall:       s?.avg_overall       ?? null,
      review_count:      s?.review_count       ?? 0,
      avg_cleanliness:   s?.avg_cleanliness    ?? null,
      avg_pain:          s?.avg_pain           ?? null,
      avg_cost:          s?.avg_cost           ?? null,
      avg_communication: s?.avg_communication  ?? null,
      avg_anxiety:       s?.avg_anxiety        ?? null,
      services:          servicesByPractice.get(p.id) ?? [],
    };
  });
}

export default async function SearchPage({ searchParams }: { searchParams: SearchParams }) {
  const { q, lat, lng, radius, page: pageParam } = await searchParams;
  const radiusKm = Math.min(Number(radius) || 10, 50);
  const page = Math.max(1, Number(pageParam) || 1);

  let practices: PracticeCardData[] = [];
  let error: string | null = null;
  let resultLabel: string | null = null;
  let isPostcode = false;
  const isGeo = !!(lat && lng && !isNaN(Number(lat)) && !isNaN(Number(lng)));

  if (isGeo) {
    const supabase = await createServerSupabase();
    const { data, error: dbError } = await supabase.rpc('practices_near', {
      lat: Number(lat),
      lng: Number(lng),
      radius_km: radiusKm,
    });
    if (dbError) {
      error = dbError.message;
    } else {
      practices = (data ?? []) as PracticeCardData[];
      if (practices.length > 0) {
        resultLabel = `${practices.length} practice${practices.length !== 1 ? 's' : ''} near you`;
      } else {
        // Geo search found nothing — practices near here likely lack coordinates.
        // Reverse geocode to get the outward code and fall back to a text match.
        const outward = await reverseGeocode(Number(lat), Number(lng));
        if (outward) {
          practices = await searchByPostcodePrefix(outward);
          resultLabel = practices.length > 0
            ? `${practices.length} practice${practices.length !== 1 ? 's' : ''} in the ${outward} area`
            : `No practices found near your location`;
        } else {
          resultLabel = `No practices found within ${radiusKm} km of your location`;
        }
      }
    }
  } else if (q?.trim()) {
    const qTrimmed = q.trim();
    const isFullPostcode    = UK_POSTCODE_FULL.test(qTrimmed);
    const isOutwardPostcode = !isFullPostcode && UK_POSTCODE_OUTWARD.test(qTrimmed);
    isPostcode = isFullPostcode;

    if (isFullPostcode) {
      // Geocode → radius search, fallback to postcode prefix text match
      const coords = await geocodePostcode(qTrimmed);
      if (!coords) {
        error = 'Postcode not found — please check and try again.';
      } else {
        const supabase = await createServerSupabase();
        const { data, error: dbError } = await supabase.rpc('practices_near', {
          lat: coords.lat,
          lng: coords.lng,
          radius_km: radiusKm,
        });
        if (dbError) {
          error = dbError.message;
        } else {
          practices = (data ?? []) as PracticeCardData[];
          if (practices.length > 0) {
            resultLabel = `${practices.length} practice${practices.length !== 1 ? 's' : ''} within ${radiusKm} km of ${qTrimmed.toUpperCase()}`;
          } else {
            // Fallback: match by postcode outward code
            const outward = extractOutwardCode(qTrimmed);
            practices = await searchByPostcodePrefix(outward);
            resultLabel = practices.length > 0
              ? `${practices.length} practice${practices.length !== 1 ? 's' : ''} in the ${outward} area`
              : `No practices found near ${qTrimmed.toUpperCase()}`;
          }
        }
      }
    } else if (isOutwardPostcode) {
      // Outward-code input (e.g. "SW1A", "M20") — text match on postcode column
      const outward = qTrimmed.toUpperCase();
      practices = await searchByPostcodePrefix(outward);
      if (practices.length === 0) {
        // Try geocoding the outcode for a radius search as a second attempt
        const coords = await geocodeOutcode(outward);
        if (coords) {
          const supabase = await createServerSupabase();
          const { data } = await supabase.rpc('practices_near', {
            lat: coords.lat,
            lng: coords.lng,
            radius_km: radiusKm,
          });
          practices = (data ?? []) as PracticeCardData[];
        }
      }
      resultLabel = practices.length > 0
        ? `${practices.length} practice${practices.length !== 1 ? 's' : ''} in the ${outward} area`
        : `No practices found in the ${outward} area`;
    } else {
      practices = await searchByText(qTrimmed);
      resultLabel = practices.length === 0
        ? `No practices found for "${qTrimmed}"`
        : `${practices.length} practice${practices.length !== 1 ? 's' : ''} matching "${qTrimmed}"`;
    }
  }

  const totalPages = Math.ceil(practices.length / PAGE_SIZE);
  const paginated = practices.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const baseQuery = isGeo
    ? `lat=${lat}&lng=${lng}&radius=${radiusKm}`
    : `q=${encodeURIComponent(q ?? '')}${isPostcode ? `&radius=${radiusKm}` : ''}`;

  return (
    <main style={{ maxWidth: 768, margin: '0 auto', padding: '32px 16px' }}>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 700, color: 'var(--ink)', marginBottom: 24, letterSpacing: '-0.02em' }}>
        Find a dentist
      </h1>

      <form method="GET" style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <input
          name="q"
          defaultValue={isGeo ? '' : q}
          placeholder="Practice name, city or postcode…"
          style={{ flex: 1, borderRadius: 50, background: 'white', padding: '10px 20px', fontSize: 15, outline: 'none', border: '1.5px solid var(--cream-dark)', color: 'var(--ink)', fontFamily: 'var(--font-body)' }}
        />
        {(isPostcode || isGeo) && (
          <select
            name="radius"
            defaultValue={String(radiusKm)}
            style={{ borderRadius: 50, background: 'white', border: '1.5px solid var(--cream-dark)', padding: '10px 16px', fontSize: 14, outline: 'none', color: 'var(--ink)', fontFamily: 'var(--font-body)' }}
          >
            <option value="5">5 km</option>
            <option value="10">10 km</option>
            <option value="20">20 km</option>
            <option value="50">50 km</option>
          </select>
        )}
        <button
          type="submit"
          style={{ borderRadius: 50, padding: '10px 24px', background: 'var(--forest)', color: 'var(--cream)', fontSize: 14, fontWeight: 600, border: 'none', cursor: 'pointer', fontFamily: 'var(--font-body)', transition: 'var(--transition)' }}
        >
          Search
        </button>
      </form>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
        <span style={{ fontSize: 13, color: 'var(--ink-faint)', fontFamily: 'var(--font-body)' }}>or</span>
        <LocationButton radius={radiusKm} />
      </div>

      {error && (
        <p style={{ color: '#c0392b', fontSize: 14, marginBottom: 16 }}>{error}</p>
      )}

      {resultLabel && !error && (
        <p style={{ fontSize: 14, color: 'var(--ink-soft)', marginBottom: 20 }}>{resultLabel}</p>
      )}

      {(!q || practices.length === 0) && !error && (
        <div style={{ background: 'var(--forest-pale)', border: '1px solid rgba(28,69,53,0.15)', borderRadius: 12, padding: '14px 20px', marginBottom: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
          <p style={{ fontSize: 14, color: 'var(--ink-mid)' }}>
            Can't find your dentist?{' '}
            <span style={{ color: 'var(--ink-soft)' }}>Practices outside England may not be listed yet.</span>
          </p>
          <Link
            href="/practices/add"
            style={{ flexShrink: 0, borderRadius: 50, padding: '6px 16px', fontSize: 13, fontWeight: 600, color: 'white', background: 'var(--forest)', textDecoration: 'none' }}
          >
            Add a practice
          </Link>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {paginated.map((p) => (
          <PracticeCard key={p.id} practice={p} />
        ))}
      </div>

      {totalPages > 1 && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginTop: 32 }}>
          {page > 1 ? (
            <Link
              href={`/search?${baseQuery}&page=${page - 1}`}
              style={{ padding: '8px 20px', borderRadius: 8, border: '1.5px solid var(--cream-dark)', background: 'white', color: 'var(--ink-mid)', fontSize: 14, fontWeight: 500, textDecoration: 'none' }}
            >
              ← Previous
            </Link>
          ) : (
            <span style={{ padding: '8px 20px', borderRadius: 8, border: '1.5px solid var(--cream-dark)', color: 'var(--ink-faint)', fontSize: 14, fontWeight: 500 }}>← Previous</span>
          )}
          <span style={{ fontSize: 14, color: 'var(--ink-soft)' }}>Page {page} of {totalPages}</span>
          {page < totalPages ? (
            <Link
              href={`/search?${baseQuery}&page=${page + 1}`}
              style={{ padding: '8px 20px', borderRadius: 8, border: '1.5px solid var(--cream-dark)', background: 'white', color: 'var(--ink-mid)', fontSize: 14, fontWeight: 500, textDecoration: 'none' }}
            >
              Next →
            </Link>
          ) : (
            <span style={{ padding: '8px 20px', borderRadius: 8, border: '1.5px solid var(--cream-dark)', color: 'var(--ink-faint)', fontSize: 14, fontWeight: 500 }}>Next →</span>
          )}
        </div>
      )}
    </main>
  );
}
