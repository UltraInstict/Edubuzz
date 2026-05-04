import type { APIRoute } from 'astro';
import { getAllJobSlugs, getCategories, PROVINCES } from '../lib/pocketbase';

export const GET: APIRoute = async ({ site }) => {
  const base = site?.origin || 'https://edubuzz.co.za';

  const [jobSlugs, categories] = await Promise.all([
    getAllJobSlugs(),
    getCategories(),
  ]);

  const staticUrls = [
    { loc: `${base}/`,          priority: '1.0', changefreq: 'daily' },
    { loc: `${base}/post-job`,  priority: '0.8', changefreq: 'monthly' },
    { loc: `${base}/about`,     priority: '0.5', changefreq: 'monthly' },
    { loc: `${base}/contact`,   priority: '0.5', changefreq: 'monthly' },
    ...categories.map(c => ({
      loc: `${base}/category/${c.slug}`,
      priority: '0.8',
      changefreq: 'daily',
    })),
    ...PROVINCES.map(p => ({
      loc: `${base}/province/${p.toLowerCase().replace(/\s+/g, '-')}`,
      priority: '0.7',
      changefreq: 'daily',
    })),
    ...jobSlugs.map(slug => ({
      loc: `${base}/job/${slug}`,
      priority: '0.9',
      changefreq: 'weekly',
    })),
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticUrls.map(u => `  <url>
    <loc>${u.loc}</loc>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600',
    },
  });
};
