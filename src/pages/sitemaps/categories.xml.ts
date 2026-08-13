import type { APIRoute } from 'astro';
import { getCategories } from '../../lib/pocketbase';
import { CATEGORIES } from '../../lib/slugify';
import { JOBS_PUBLIC } from '../../lib/featureFlags';

export const GET: APIRoute = async ({ site }) => {
  const base = site?.origin || import.meta.env.SITE_URL || 'https://edubuzz.co.za';
  const lastmod = new Date().toISOString().slice(0, 10);
  const categories = JOBS_PUBLIC ? await getCategories().catch(() => []) : [];
  const slugs = categories.length ? categories.map((c) => c.slug) : (JOBS_PUBLIC ? CATEGORIES : []);

  const urls = slugs.map((slug) => ({
    loc: `${base}/category/${slug}`,
    changefreq: 'daily',
  }));

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url><loc>${u.loc}</loc><lastmod>${lastmod}</lastmod><changefreq>${u.changefreq}</changefreq><priority>0.7</priority></url>`).join('\n')}
</urlset>`;
  return new Response(xml, { headers: { 'Content-Type': 'application/xml', 'Cache-Control': 'public, max-age=3600' } });
};
