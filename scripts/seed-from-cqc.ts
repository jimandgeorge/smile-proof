// scripts/seed-from-cqc.ts
// Seeds the `practices` table from the CQC Care Directory API (England only).
//
// 1. Sign up free at: https://api-portal.service.cqc.org.uk/signup
// 2. Add to .env.local:  CQC_SUBSCRIPTION_KEY=your_key_here
// 3. Run from the dental-reviews directory:
//    npx tsx scripts/seed-from-cqc.ts

import { config } from 'dotenv';
config({ path: '.env.local' });
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

const CQC_BASE = 'https://api.service.cqc.org.uk/public/v1';
const KEY = process.env.CQC_SUBSCRIPTION_KEY!;
const HEADERS = { 'Ocp-Apim-Subscription-Key': KEY };
const CONCURRENCY = 10; // parallel detail fetches

if (!KEY) {
  console.error('Missing CQC_SUBSCRIPTION_KEY in .env.local');
  process.exit(1);
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

async function fetchPage(page: number): Promise<{ ids: string[]; totalPages: number; total: number }> {
  // primaryInspectionCategoryCode=P1 = dedicated dental practices only (excludes hospitals with incidental dental depts)
  const url = `${CQC_BASE}/locations?primaryInspectionCategoryCode=P1&page=${page}&perPage=500`;
  const res = await fetch(url, { headers: HEADERS });
  if (!res.ok) throw new Error(`List page ${page}: ${res.status} ${await res.text()}`);
  const json = await res.json() as { locations: { locationId: string }[]; totalPages: number; total: number };
  return { ids: json.locations.map((l) => l.locationId), totalPages: json.totalPages, total: json.total };
}

async function fetchDetail(id: string): Promise<any> {
  const res = await fetch(`${CQC_BASE}/locations/${id}`, { headers: HEADERS });
  if (!res.ok) throw new Error(`Detail ${id}: ${res.status}`);
  return res.json();
}

async function processBatch(ids: string[], seenSlugs: Set<string>, batchNum: number, total: number) {
  const details = await Promise.all(ids.map((id) => fetchDetail(id).catch(() => null)));

  for (const detail of details) {
    if (!detail) continue;

    let slug = slugify(`${detail.name}-${detail.postalAddressTownCity ?? ''}`);
    let suffix = 2;
    while (seenSlugs.has(slug)) slug = `${slug}-${suffix++}`;
    seenSlugs.add(slug);

    const { error } = await supabase.from('practices').upsert(
      {
        slug,
        name: detail.name,
        address_line1: detail.postalAddressLine1 ?? '',
        address_line2: detail.postalAddressLine2 ?? null,
        city: detail.postalAddressTownCity ?? 'Unknown',
        postcode: detail.postalCode ?? '',
        latitude: detail.onspdLatitude ?? null,
        longitude: detail.onspdLongitude ?? null,
        phone: detail.mainPhoneNumber ?? null,
        website: detail.website ?? null,
        practice_type: 'mixed',
        cqc_id: detail.locationId,
      },
      { onConflict: 'cqc_id' },
    );

    if (error) console.error(`  ✗ ${detail.name}: ${error.message}`);
  }

  process.stdout.write(`\r  ${batchNum * CONCURRENCY}/${total} processed`);
}

async function main() {
  // Pass 1: collect all location IDs
  console.log('Fetching location IDs…');
  const allIds: string[] = [];
  let page = 1;

  while (true) {
    const { ids, totalPages, total } = await fetchPage(page);
    allIds.push(...ids);
    process.stdout.write(`\r  Page ${page}/${totalPages} (${allIds.length}/${total} IDs)`);
    if (page >= totalPages) break;
    page++;
  }

  console.log(`\nFound ${allIds.length} dental practices.`);

  // Pass 2: fetch details in parallel batches
  console.log(`Fetching details (${CONCURRENCY} at a time)…`);
  const seenSlugs = new Set<string>();

  for (let i = 0; i < allIds.length; i += CONCURRENCY) {
    const batch = allIds.slice(i, i + CONCURRENCY);
    await processBatch(batch, seenSlugs, i / CONCURRENCY + 1, allIds.length);
  }

  console.log(`\nDone. ${allIds.length} practices upserted.`);
}

main().catch((e) => { console.error(e); process.exit(1); });
