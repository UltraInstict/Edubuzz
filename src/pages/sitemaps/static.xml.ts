import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ site }) => {
  const base = site?.origin || import.meta.env.SITE_URL || 'https://edubuzz.co.za';
  const lastmod = new Date().toISOString().slice(0, 10);

  const urls = [
    { loc: `${base}/`, priority: '1.0', changefreq: 'daily' },
    { loc: `${base}/jobs`, priority: '0.9', changefreq: 'daily' },
    { loc: `${base}/companies`, priority: '0.7', changefreq: 'daily' },
    { loc: `${base}/categories`, priority: '0.7', changefreq: 'weekly' },
    { loc: `${base}/provinces`, priority: '0.7', changefreq: 'weekly' },
    { loc: `${base}/post-job`, priority: '0.8', changefreq: 'monthly' },
    { loc: `${base}/contact`, priority: '0.4', changefreq: 'monthly' },
    { loc: `${base}/about`, priority: '0.5', changefreq: 'monthly' },
    { loc: `${base}/advertise`, priority: '0.5', changefreq: 'monthly' },
    { loc: `${base}/resources`, priority: '0.5', changefreq: 'monthly' },
    { loc: `${base}/salary`, priority: '0.7', changefreq: 'weekly' },
    { loc: `${base}/pricing`, priority: '0.5', changefreq: 'monthly' },
    { loc: `${base}/privacy`, priority: '0.3', changefreq: 'yearly' },
    { loc: `${base}/terms`, priority: '0.3', changefreq: 'yearly' },
    { loc: `${base}/remote-jobs`, priority: '0.8', changefreq: 'daily' },
    { loc: `${base}/internships`, priority: '0.8', changefreq: 'daily' },
    { loc: `${base}/graduate-jobs`, priority: '0.7', changefreq: 'daily' },
    { loc: `${base}/learnerships`, priority: '0.7', changefreq: 'daily' },
    { loc: `${base}/bursaries`, priority: '0.7', changefreq: 'daily' },
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url><loc>${u.loc}</loc><lastmod>${lastmod}</lastmod><changefreq>${u.changefreq}</changefreq><priority>${u.priority}</priority></url>`).join('\n')}
</urlset>`;
  return new Response(xml, { headers: { 'Content-Type': 'application/xml', 'Cache-Control': 'public, max-age=3600' } });
};
