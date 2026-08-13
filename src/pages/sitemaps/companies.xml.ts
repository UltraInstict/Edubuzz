import type { APIRoute } from 'astro';
import { getEmployers } from '../../lib/pocketbase';
import { COMPANY_GUIDES } from '../../content/company-guides';

/** Exact-identity duplicates redirected to curated guides — excluded from sitemap. */
const REDIRECTED_SLUGS = new Set(['shoprite-group', 'capitec-bank', 'standard-bank-group', 'clicks-group', 'takealot-com']);

export const GET: APIRoute = async ({ site }) => {
  const base = site?.origin || import.meta.env.SITE_URL || 'https://edubuzz.co.za';
  const lastmod = new Date().toISOString().slice(0, 10);
  const result = await getEmployers({ perPage: 500, verifiedOnly: true }).catch(() => ({ items: [] }));

  // Curated guides + PB employers that are NOT redirects or duplicate stubs.
  // PB-only stub pages are noindexed and excluded from the public sitemap
  // during the AdSense phase; curated guides are the canonical destinations.
  const curatedSlugs = new Set(COMPANY_GUIDES.map(g => g.slug));
  const employers = result.items.filter((e: any) => !REDIRECTED_SLUGS.has(e.company_slug) && !curatedSlugs.has(e.company_slug));

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${COMPANY_GUIDES.map((g) => `  <url><loc>${base}/company/${g.slug}</loc><lastmod>${lastmod}</lastmod><changefreq>monthly</changefreq><priority>0.7</priority></url>`).join('\n')}
${employers.map((e: any) => `  <url><loc>${base}/company/${e.company_slug}</loc><lastmod>${lastmod}</lastmod><changefreq>monthly</changefreq><priority>0.5</priority></url>`).join('\n')}
</urlset>`;
  return new Response(xml, { headers: { 'Content-Type': 'application/xml', 'Cache-Control': 'public, max-age=3600' } });
};
