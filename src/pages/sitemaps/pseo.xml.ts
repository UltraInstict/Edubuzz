import type { APIRoute } from 'astro';
import { JOB_TYPES, PROVINCES } from '../../lib/pocketbase';
import { slugify, CATEGORIES } from '../../lib/slugify';

export const GET: APIRoute = async ({ site }) => {
  const base = site?.origin || import.meta.env.SITE_URL || 'https://edubuzz.co.za';
  const lastmod = new Date().toISOString().slice(0, 10);

  const urls: { loc: string; priority: string; changefreq: string }[] = [];

  for (const type of JOB_TYPES) {
    urls.push({ loc: `${base}/jobs/type/${slugify(type)}`, priority: '0.6', changefreq: 'weekly' });
  }

  for (const category of CATEGORIES) {
    for (const province of PROVINCES) {
      urls.push({
        loc: `${base}/${category}-jobs-in-${slugify(province)}`,
        priority: '0.6',
        changefreq: 'daily',
      });
    }
  }

  // Career guide PSEO pages
  for (const category of CATEGORIES) {
    urls.push({ loc: `${base}/cv-tips-for-${category}`, priority: '0.5', changefreq: 'monthly' });
    urls.push({ loc: `${base}/interview-tips-${category}-jobs`, priority: '0.5', changefreq: 'monthly' });
    urls.push({ loc: `${base}/how-to-get-into-${category}-in-south-africa`, priority: '0.5', changefreq: 'monthly' });
    urls.push({ loc: `${base}/bursaries-for-${category}-students`, priority: '0.5', changefreq: 'monthly' });
  }

  for (const province of PROVINCES) {
    if (province === 'Remote') continue;
    urls.push({ loc: `${base}/learnerships-in-${slugify(province)}`, priority: '0.5', changefreq: 'monthly' });
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url><loc>${u.loc}</loc><lastmod>${lastmod}</lastmod><changefreq>${u.changefreq}</changefreq><priority>${u.priority}</priority></url>`).join('\n')}
</urlset>`;
  return new Response(xml, { headers: { 'Content-Type': 'application/xml', 'Cache-Control': 'public, max-age=3600' } });
};
