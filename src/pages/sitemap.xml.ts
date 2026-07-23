import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ site }) => {
  const base = site?.origin || import.meta.env.SITE_URL || 'https://edubuzz.co.za';
  const lastmod = new Date().toISOString();

  const sitemaps = [
    `${base}/sitemaps/static.xml`,
    `${base}/sitemaps/jobs.xml`,
    `${base}/sitemaps/categories.xml`,
    `${base}/sitemaps/provinces.xml`,
    `${base}/sitemaps/companies.xml`,
    `${base}/sitemaps/pseo.xml`,
    `${base}/sitemaps/resources.xml`,
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemaps.map((loc) => `  <sitemap><loc>${loc}</loc><lastmod>${lastmod}</lastmod></sitemap>`).join('\n')}
</sitemapindex>`;
  return new Response(xml, { headers: { 'Content-Type': 'application/xml', 'Cache-Control': 'public, max-age=3600' } });
};
