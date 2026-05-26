import type { MetadataRoute } from 'next';
import { createAdminSupabase } from '@/lib/supabase';

const BASE = 'https://www.smileproof.co.uk';

const STATIC_PAGES: MetadataRoute.Sitemap = [
  { url: BASE,                       priority: 1.0,  changeFrequency: 'daily'   },
  { url: `${BASE}/find`,             priority: 0.9,  changeFrequency: 'weekly'  },
  { url: `${BASE}/search`,           priority: 0.9,  changeFrequency: 'daily'   },
  { url: `${BASE}/how-it-works`,     priority: 0.7,  changeFrequency: 'monthly' },
  { url: `${BASE}/for-dentists`,     priority: 0.7,  changeFrequency: 'monthly' },
  { url: `${BASE}/trust`,            priority: 0.6,  changeFrequency: 'monthly' },
  { url: `${BASE}/contact`,          priority: 0.5,  changeFrequency: 'monthly' },
  { url: `${BASE}/terms`,            priority: 0.3,  changeFrequency: 'yearly'  },
  { url: `${BASE}/privacy`,          priority: 0.3,  changeFrequency: 'yearly'  },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = createAdminSupabase();

  const [practicesRes, treatmentsRes, citiesRes] = await Promise.all([
    supabase
      .from('practices')
      .select('slug, updated_at')
      .order('updated_at', { ascending: false }),
    supabase
      .from('treatments')
      .select('slug'),
    supabase
      .from('practices')
      .select('city')
      .not('city', 'is', null),
  ]);

  const practices: MetadataRoute.Sitemap = (practicesRes.data ?? []).map(p => ({
    url: `${BASE}/practices/${p.slug}`,
    lastModified: p.updated_at ? new Date(p.updated_at) : undefined,
    priority: 0.85,
    changeFrequency: 'weekly',
  }));

  const treatments: MetadataRoute.Sitemap = (treatmentsRes.data ?? []).map(t => ({
    url: `${BASE}/treatments/${t.slug}`,
    priority: 0.75,
    changeFrequency: 'weekly',
  }));

  const uniqueCities = [
    ...new Set(
      (citiesRes.data ?? [])
        .map(p => p.city?.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''))
        .filter(Boolean)
    ),
  ];

  const cities: MetadataRoute.Sitemap = uniqueCities.map(city => ({
    url: `${BASE}/dentists/${city}`,
    priority: 0.7,
    changeFrequency: 'weekly',
  }));

  return [...STATIC_PAGES, ...practices, ...treatments, ...cities];
}
