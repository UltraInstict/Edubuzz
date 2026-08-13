import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ site }) => {
  const base = site?.origin || import.meta.env.SITE_URL || 'https://edubuzz.co.za';
  const lastmod = new Date().toISOString().slice(0, 10);

  const urls = [
    { loc: `${base}/`, priority: '1.0', changefreq: 'daily' },
    { loc: `${base}/education`, priority: '0.9', changefreq: 'weekly' },
    { loc: `${base}/careers`, priority: '0.9', changefreq: 'weekly' },
    { loc: `${base}/resources`, priority: '0.8', changefreq: 'weekly' },
    { loc: `${base}/salary`, priority: '0.8', changefreq: 'weekly' },
    { loc: `${base}/companies`, priority: '0.8', changefreq: 'weekly' },
    { loc: `${base}/industry`, priority: '0.7', changefreq: 'weekly' },
    { loc: `${base}/contact`, priority: '0.4', changefreq: 'monthly' },
    { loc: `${base}/about`, priority: '0.5', changefreq: 'monthly' },
    { loc: `${base}/privacy`, priority: '0.3', changefreq: 'yearly' },
    { loc: `${base}/terms`, priority: '0.3', changefreq: 'yearly' },
    { loc: `${base}/cookie-policy`, priority: '0.3', changefreq: 'yearly' },
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url><loc>${u.loc}</loc><lastmod>${lastmod}</lastmod><changefreq>${u.changefreq}</changefreq><priority>${u.priority}</priority></url>`).join('\n')}
</urlset>`;
  return new Response(xml, { headers: { 'Content-Type': 'application/xml', 'Cache-Control': 'public, max-age=3600' } });
};
