import type { APIRoute } from 'astro';
import { ARTICLES, RESOURCE_CATEGORIES } from '../../content/resources';
import { SALARY_GUIDES } from '../../content/salary-guides';

export const GET: APIRoute = async ({ site }) => {
  const base = site?.origin || import.meta.env.SITE_URL || 'https://edubuzz.co.za';

  const urls: { loc: string; lastmod: string; priority: string; changefreq: string }[] = [];

  // Resources index
  urls.push({ loc: `${base}/resources`, lastmod: new Date().toISOString().slice(0, 10), priority: '0.8', changefreq: 'weekly' });

  // Category filter pages
  for (const cat of RESOURCE_CATEGORIES) {
    urls.push({ loc: `${base}/resources?category=${cat.id}`, lastmod: new Date().toISOString().slice(0, 10), priority: '0.6', changefreq: 'weekly' });
  }

  // Individual articles
  for (const article of ARTICLES) {
    urls.push({ loc: `${base}/resources/${article.slug}`, lastmod: article.updated, priority: '0.7', changefreq: 'monthly' });
  }

  // Salary guides index
  urls.push({ loc: `${base}/salary`, lastmod: new Date().toISOString().slice(0, 10), priority: '0.8', changefreq: 'weekly' });

  // Individual salary guides
  for (const guide of SALARY_GUIDES) {
    urls.push({ loc: `${base}/salary/${guide.slug}`, lastmod: guide.updated, priority: '0.7', changefreq: 'monthly' });
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url><loc>${u.loc}</loc><lastmod>${u.lastmod}</lastmod><changefreq>${u.changefreq}</changefreq><priority>${u.priority}</priority></url>`).join('\n')}
</urlset>`;
  return new Response(xml, { headers: { 'Content-Type': 'application/xml', 'Cache-Control': 'public, max-age=3600' } });
};
