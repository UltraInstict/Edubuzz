import type { APIRoute } from 'astro';
import { slugify } from '../../lib/slugify';
import { PROVINCES } from '../../lib/pocketbase';
import { JOBS_PUBLIC } from '../../lib/featureFlags';

export const GET: APIRoute = async ({ site }) => {
  const base = site?.origin || import.meta.env.SITE_URL || 'https://edubuzz.co.za';
  const lastmod = new Date().toISOString().slice(0, 10);

  const urls = JOBS_PUBLIC ? [
    ...PROVINCES.map((p) => ({ loc: `${base}/province/${slugify(p)}`, changefreq: 'daily', priority: '0.7' })),
    ...PROVINCES.map((p) => ({ loc: `${base}/jobs-in-${slugify(p)}`, changefreq: 'daily', priority: '0.7' })),
  ] : [];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url><loc>${u.loc}</loc><lastmod>${lastmod}</lastmod><changefreq>${u.changefreq}</changefreq><priority>${u.priority}</priority></url>`).join('\n')}
</urlset>`;
  return new Response(xml, { headers: { 'Content-Type': 'application/xml', 'Cache-Control': 'public, max-age=3600' } });
};
