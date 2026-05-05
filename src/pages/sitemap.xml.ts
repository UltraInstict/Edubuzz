import type { APIRoute } from 'astro';
import { getAllJobSlugs, getCategories, getEmployers, getPB, JOB_TYPES, PROVINCES } from '../lib/pocketbase';
import { CATEGORIES, slugify } from '../lib/slugify';

function url(loc: string, priority: string, changefreq = 'daily', lastmod = new Date().toISOString()) {
  return `  <url><loc>${loc}</loc><lastmod>${lastmod}</lastmod><changefreq>${changefreq}</changefreq><priority>${priority}</priority></url>`;
}

export const GET: APIRoute = async ({ site }) => {
  const base = site?.origin || import.meta.env.SITE_URL || 'https://edubuzz.co.za';
  const pb = getPB();
  const [jobSlugs, categories, employers, jobs] = await Promise.all([
    getAllJobSlugs().catch(() => []),
    getCategories().catch(() => []),
    getEmployers({ perPage: 500, verifiedOnly: true }).catch(() => ({ items: [] })),
    pb.collection('jobs').getFullList({ filter: 'active=true', fields: 'city,category,province,company,employer_id,updated' }).catch(() => []),
  ]);

  const cities = [...new Set((jobs as any[]).map((job) => job.city).filter(Boolean).map(slugify))];
  const categorySlugs = categories.length ? categories.map((cat) => cat.slug || slugify(cat.name)) : CATEGORIES;
  const entries = [
    url(`${base}/`, '1.0'),
    url(`${base}/jobs`, '0.9'),
    url(`${base}/companies`, '0.7'),
    url(`${base}/post-job`, '0.8', 'monthly'),
    ...jobSlugs.map((slug) => url(`${base}/job/${slug}`, '0.8', 'weekly')),
    ...categorySlugs.map((slug) => url(`${base}/jobs/${slug}`, '0.7')),
    ...PROVINCES.map((province) => url(`${base}/province/${slugify(province)}`, '0.7')),
    ...PROVINCES.flatMap((province) => categorySlugs.map((category) => url(`${base}/jobs/${category}/${slugify(province)}`, '0.7'))),
    ...cities.map((city) => url(`${base}/jobs/${city}`, '0.6')),
    ...['r0-r10000','r10000-r20000','r20000-r30000','r30000-r50000','r50000-plus'].map((range) => url(`${base}/jobs/salary/${range}`, '0.6')),
    ...JOB_TYPES.map((type) => url(`${base}/jobs/type/${slugify(type)}`, '0.6')),
    ...employers.items.map((employer: any) => url(`${base}/company/${employer.company_slug}`, '0.7')),
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries.join('\n')}
</urlset>`;
  return new Response(xml, { headers: { 'Content-Type': 'application/xml', 'Cache-Control': 'public, max-age=3600' } });
};
