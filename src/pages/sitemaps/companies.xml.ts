import type { APIRoute } from 'astro';
import { getEmployers } from '../../lib/pocketbase';
import { COMPANY_GUIDES } from '../../content/company-guides';

export const GET: APIRoute = async ({ site }) => {
  const base = site?.origin || import.meta.env.SITE_URL || 'https://edubuzz.co.za';
  const lastmod = new Date().toISOString().slice(0, 10);
  const result = await getEmployers({ perPage: 500, verifiedOnly: true }).catch(() => ({ items: [] }));

  // Curated employer guides + existing PocketBase employers (deduplicated)
  const employerSlugs = new Set<string>(COMPANY_GUIDES.map(g => g.slug));
  const all: { slug: string }[] = [
    ...COMPANY_GUIDES.map(g => ({ slug: g.slug })),
    ...result.items.filter((e: any) => !employerSlugs.has(e.company_slug)).map((e: any) => ({ slug: e.company_slug })),
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${all.map((e) => `  <url><loc>${base}/company/${e.slug}</loc><lastmod>${lastmod}</lastmod><changefreq>weekly</changefreq><priority>0.7</priority></url>`).join('\n')}
</urlset>`;
  return new Response(xml, { headers: { 'Content-Type': 'application/xml', 'Cache-Control': 'public, max-age=3600' } });
};
