import type { APIRoute } from 'astro';
import { PROVINCE_HUBS } from '../../content/province-hubs';
import { INDUSTRY_HUBS } from '../../content/industry-hubs';

export const GET: APIRoute = async ({ site }) => {
  const base = site?.origin || import.meta.env.SITE_URL || 'https://edubuzz.co.za';
  const lastmod = new Date().toISOString().slice(0, 10);

  const urls: { loc: string; priority: string; changefreq: string }[] = [];

  // Province career hubs
  for (const hub of PROVINCE_HUBS) {
    urls.push({ loc: `${base}/province/${hub.hubSlug}`, priority: '0.7', changefreq: 'weekly' });
  }

  // Industry authority hubs
  for (const hub of INDUSTRY_HUBS) {
    urls.push({ loc: `${base}/industry/${hub.slug}`, priority: '0.7', changefreq: 'weekly' });
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url><loc>${u.loc}</loc><lastmod>${lastmod}</lastmod><changefreq>${u.changefreq}</changefreq><priority>${u.priority}</priority></url>`).join('\n')}
</urlset>`;
  return new Response(xml, { headers: { 'Content-Type': 'application/xml', 'Cache-Control': 'public, max-age=3600' } });
};
