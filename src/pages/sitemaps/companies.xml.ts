import type { APIRoute } from 'astro';
import { COMPANY_GUIDES } from '../../content/company-guides';

export const GET: APIRoute = async ({ site }) => {
  const base = site?.origin || import.meta.env.SITE_URL || 'https://edubuzz.co.za';
  // Only reviewed, indexable guides belong here. PB-only records are noindexed.

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${COMPANY_GUIDES.map((g) => `  <url><loc>${base}/company/${g.slug}</loc><lastmod>${g.updated}</lastmod><changefreq>monthly</changefreq><priority>0.7</priority></url>`).join('\n')}
</urlset>`;
  return new Response(xml, { headers: { 'Content-Type': 'application/xml', 'Cache-Control': 'public, max-age=3600' } });
};
