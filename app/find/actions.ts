'use server';

import { z } from 'zod';
import { createAdminSupabase } from '@/lib/supabase';

const UK_POSTCODE = /^[A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2}$/i;
const MATCH_RADII_KM = [10, 20, 50];

const FindSchema = z.object({
  name:          z.string().min(1, 'Name is required').max(100).trim(),
  email:         z.string().email('Please enter a valid email').max(200).trim(),
  treatment:     z.string().max(100).trim().optional(),
  treatmentLabel:z.string().max(100).trim().optional(),
  postcode:      z.string().max(10).trim().optional(),
  nhsPrivate:    z.enum(['nhs', 'private', 'either']).optional(),
  preferences:   z.array(z.string().max(50)).optional(),
});

export type MatchedPractice = {
  id: string;
  name: string;
  slug: string;
  city: string;
  address_line1: string | null;
  claimed: boolean;
  avg_overall: number | null;
  review_count: number;
  insight: string;
  logo_url: string | null;
};

type RatingSummary = {
  practice_id: string;
  avg_overall: number | null;
  review_count: number | null;
  avg_anxiety: number | null;
};

type ServiceRow = {
  practice_id: string;
  services: { slug: string } | { slug: string }[] | null;
};

type PracticeRow = {
  id: string;
  name: string;
  slug: string;
  city: string;
  address_line1: string | null;
  claimed_by_user_id: string | null;
  ai_summary: string | null;
  practice_type: 'nhs' | 'private' | 'mixed';
  logo_url: string | null;
};

type NearbyPracticeRow = {
  id: string;
  distance_km: number;
};

const TREATMENT_SERVICE_SLUGS: Record<string, string[]> = {
  invisalign: ['invisalign'],
  implants:   ['implants', 'dental-implants'],
  nervous:    ['anxiety-friendly', 'nervous-patients'],
  whitening:  ['whitening', 'teeth-whitening'],
  emergency:  ['emergency', 'emergency-care'],
  checkup:    ['general-dentistry', 'hygiene'],
  nhs:        ['nhs'],
};

const TREATMENT_FALLBACK_INSIGHT: Record<string, string> = {
  invisalign: 'Certified Invisalign provider',
  implants:   'Dental implant specialist',
  nervous:    'Specialises in anxious patient care',
  whitening:  'Professional whitening treatments',
  emergency:  'Same-day emergency appointments available',
  checkup:    'General dentistry & hygiene',
  nhs:        'NHS treatment available',
  other:      'Dental practice',
};

async function geocodePostcode(postcode: string): Promise<{ lat: number; lng: number } | null> {
  const res = await fetch(
    `https://api.postcodes.io/postcodes/${encodeURIComponent(postcode)}`,
    { next: { revalidate: 86400 } },
  );
  if (!res.ok) return null;

  const json = await res.json() as {
    result?: { latitude?: number; longitude?: number };
  };
  const lat = json.result?.latitude;
  const lng = json.result?.longitude;

  return typeof lat === 'number' && typeof lng === 'number' ? { lat, lng } : null;
}

function serviceSlug(row: ServiceRow): string | null {
  if (!row.services) return null;
  if (Array.isArray(row.services)) return row.services[0]?.slug ?? null;
  return row.services.slug;
}

export async function submitFindFlow(
  rawInput: unknown,
): Promise<{ matches?: MatchedPractice[]; error?: string }> {
  const parsed = FindSchema.safeParse(rawInput);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Please fill in your details.' };
  }

  const { name, email, treatment, treatmentLabel, nhsPrivate, preferences } = parsed.data;
  const postcode = parsed.data.postcode?.trim().toUpperCase() || undefined;
  const admin = createAdminSupabase();

  let localPracticeIds: string[] | null = null;
  const distanceMap = new Map<string, number>();

  if (postcode) {
    if (!UK_POSTCODE.test(postcode)) {
      return { error: 'Please enter a valid UK postcode, or leave postcode blank.' };
    }

    const coords = await geocodePostcode(postcode);
    if (!coords) {
      return { error: 'Postcode not found - please check it or leave postcode blank.' };
    }

    for (const radiusKm of MATCH_RADII_KM) {
      const { data, error } = await admin.rpc('practices_near', {
        lat: coords.lat,
        lng: coords.lng,
        radius_km: radiusKm,
      });

      if (error) return { error: 'Could not search near that postcode. Please try again.' };

      const nearby = (data ?? []) as NearbyPracticeRow[];
      if (nearby.length > 0 || radiusKm === MATCH_RADII_KM[MATCH_RADII_KM.length - 1]) {
        localPracticeIds = nearby.map((p) => p.id);
        nearby.forEach((p) => distanceMap.set(p.id, p.distance_km));
        break;
      }
    }
  }

  // Save lead (non-blocking)
  admin.from('patient_leads').insert({
    name,
    email,
    treatment_interest: treatmentLabel ?? treatment ?? null,
    postcode: postcode ?? null,
    source: 'find-flow',
  }).then(() => {});

  // --- Build candidate list ---

  // 1. Rating summaries
  const { data: summaries } = await admin
    .from('practice_rating_summary')
    .select('practice_id, avg_overall, review_count, avg_anxiety');

  const summaryMap = Object.fromEntries(
    ((summaries ?? []) as RatingSummary[]).map(s => [s.practice_id, s]),
  ) as Record<string, RatingSummary | undefined>;

  // 2. Service-to-practice mapping (reuse working join pattern)
  const targetSlugs = treatment ? (TREATMENT_SERVICE_SLUGS[treatment] ?? []) : [];
  let serviceMatchIds: Set<string> | null = null;

  if (targetSlugs.length > 0) {
    const { data: svcRows } = await admin
      .from('practice_services')
      .select('practice_id, services(slug)');

    if (svcRows) {
      const matched = (svcRows as ServiceRow[]).filter((r) =>
        serviceSlug(r) ? targetSlugs.includes(serviceSlug(r)!) : false,
      );
      if (matched.length >= 3) {
        serviceMatchIds = new Set(matched.map((r) => r.practice_id));
      }
    }
  }

  // 3. Fetch practices
  let query = admin
    .from('practices')
    .select('id, name, slug, city, address_line1, claimed_by_user_id, ai_summary, practice_type, logo_url')
    .limit(300);

  if (localPracticeIds !== null) {
    if (localPracticeIds.length === 0) {
      return { matches: [] };
    }
    query = query.in('id', localPracticeIds);
  }

  if (nhsPrivate === 'nhs') {
    query = query.in('practice_type', ['nhs', 'mixed']);
  } else if (nhsPrivate === 'private') {
    query = query.in('practice_type', ['private', 'mixed']);
  }

  const { data: allPractices } = await query;
  let candidates = ((allPractices ?? []) as PracticeRow[]);

  // Service filter
  if (serviceMatchIds !== null) {
    const filtered = candidates.filter(p => serviceMatchIds!.has(p.id));
    if (filtered.length >= 3) candidates = filtered;
  }

  // Anxiety preference filter
  if (preferences?.includes('anxiety-friendly')) {
    const anxious = candidates.filter(p => (summaryMap[p.id]?.avg_anxiety ?? 0) >= 4);
    if (anxious.length >= 3) candidates = anxious;
  }

  // Sort: claimed + highly rated first
  candidates.sort((a, b) => {
    const aDistanceScore = postcode ? -(distanceMap.get(a.id) ?? 999) / 10 : 0;
    const bDistanceScore = postcode ? -(distanceMap.get(b.id) ?? 999) / 10 : 0;
    const aScore = aDistanceScore + (!!a.claimed_by_user_id ? 3 : 0) + (summaryMap[a.id]?.avg_overall ?? 0);
    const bScore = bDistanceScore + (!!b.claimed_by_user_id ? 3 : 0) + (summaryMap[b.id]?.avg_overall ?? 0);
    return bScore - aScore;
  });

  const fallbackInsight = treatment ? (TREATMENT_FALLBACK_INSIGHT[treatment] ?? 'Dental practice') : 'Dental practice';

  const matches: MatchedPractice[] = candidates.slice(0, 6).map(p => {
    const s = summaryMap[p.id];
    const isClaimed = !!p.claimed_by_user_id;
    const reviewCount = s?.review_count ?? 0;
    const showAI = !!p.ai_summary && (reviewCount >= 5 || isClaimed);

    let insight = fallbackInsight;
    if (showAI && p.ai_summary) {
      insight = p.ai_summary.length > 90 ? p.ai_summary.slice(0, 90) + '…' : p.ai_summary;
    }

    return {
      id: p.id,
      name: p.name,
      slug: p.slug,
      city: p.city,
      address_line1: p.address_line1 ?? null,
      claimed: isClaimed,
      avg_overall: s?.avg_overall ?? null,
      review_count: reviewCount,
      insight,
      logo_url: p.logo_url ?? null,
    };
  });

  return { matches };
}
