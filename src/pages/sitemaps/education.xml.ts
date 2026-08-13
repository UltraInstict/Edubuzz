import type { APIRoute } from 'astro';
import { EDUCATION_GUIDES } from '../../content/education-guides';

export const GET: APIRoute = async ({ site }) => {
  const base = site?.origin || import.meta.env.SITE_URL || 'https://edubuzz.co.za';
  const lastmod = new Date().toISOString();

  const urls = [
    `${base}/education`,
    ...EDUCATION_GUIDES.map(g => `${base}/education/${g.slug}`),
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((loc) => `  <url><loc>${loc}</loc><lastmod>${lastmod.slice(0, 10)}</lastmod><changefreq>monthly</changefreq><priority>0.8</priority></url>`).join('\n')}
</urlset>`;
  return new Response(xml, { headers: { 'Content-Type': 'application/xml', 'Cache-Control': 'public, max-age=3600' } });
};
