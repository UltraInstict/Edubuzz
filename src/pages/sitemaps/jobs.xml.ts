import type { APIRoute } from 'astro';
import { getPB } from '../../lib/pocketbase';

export const GET: APIRoute = async ({ site }) => {
  const base = site?.origin || import.meta.env.SITE_URL || 'https://edubuzz.co.za';
  const pb = getPB();
  const today = new Date().toISOString().slice(0, 10);
  const jobs = await pb.collection('jobs').getFullList({
    filter: `active=true&&expires>"${today}"`,
    fields: 'slug,created,updated',
    sort: '-created',
  }).catch(() => []);

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${jobs.map((j: any) => {
  const lastmod = (j.updated || j.created || '').slice(0, 10);
  return `  <url><loc>${base}/job/${j.slug}</loc><lastmod>${lastmod}</lastmod><changefreq>weekly</changefreq><priority>0.8</priority></url>`;
}).join('\n')}
</urlset>`;
  return new Response(xml, { headers: { 'Content-Type': 'application/xml', 'Cache-Control': 'public, max-age=3600' } });
};
