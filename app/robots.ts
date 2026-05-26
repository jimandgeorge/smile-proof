import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin/',
          '/dashboard',
          '/api/',
          '/auth/',
          '/practices/*/dashboard',
          '/practices/*/claim',
          '/practices/*/upgrade',
          '/widget/',
        ],
      },
    ],
    sitemap: 'https://www.smileproof.co.uk/sitemap.xml',
  };
}
