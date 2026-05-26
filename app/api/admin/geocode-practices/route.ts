import { NextRequest, NextResponse } from 'next/server';
import { createAdminSupabase } from '@/lib/supabase';

export const runtime = 'nodejs';
export const maxDuration = 300;

const BATCH = 100;

type PostcodesIoBulkResult = {
  query: string;
  result: { latitude: number; longitude: number } | null;
};

async function bulkGeocode(postcodes: string[]): Promise<Map<string, { lat: number; lng: number }>> {
  const res = await fetch('https://api.postcodes.io/postcodes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ postcodes }),
  });
  if (!res.ok) return new Map();
  const json = await res.json() as { result: PostcodesIoBulkResult[] };
  const map = new Map<string, { lat: number; lng: number }>();
  for (const item of json.result ?? []) {
    if (item.result?.latitude && item.result?.longitude) {
      map.set(item.query.trim().toUpperCase(), {
        lat: item.result.latitude,
        lng: item.result.longitude,
      });
    }
  }
  return map;
}

export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return NextResponse.json({ error: 'CRON_SECRET not configured' }, { status: 500 });
  const auth = req.headers.get('authorization') ?? '';
  if (auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const admin = createAdminSupabase();

  const { data: practices, error } = await admin
    .from('practices')
    .select('id, postcode')
    .not('postcode', 'is', null)
    .or('latitude.is.null,longitude.is.null');

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!practices?.length) return NextResponse.json({ message: 'Nothing to geocode', updated: 0 });

  let updated = 0;
  let failed = 0;

  for (let i = 0; i < practices.length; i += BATCH) {
    const batch = practices.slice(i, i + BATCH);
    const postcodes = batch.map(p => p.postcode as string);
    const coords = await bulkGeocode(postcodes);

    for (const p of batch) {
      const c = coords.get((p.postcode as string).trim().toUpperCase());
      if (!c) { failed++; continue; }
      const { error: upErr } = await admin
        .from('practices')
        .update({ latitude: c.lat, longitude: c.lng })
        .eq('id', p.id);
      if (upErr) { failed++; } else { updated++; }
    }
  }

  return NextResponse.json({
    message: 'Done',
    total: practices.length,
    updated,
    failed,
  });
}
