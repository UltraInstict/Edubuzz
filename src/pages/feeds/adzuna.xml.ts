import type { APIRoute } from 'astro';
import { getPB } from '../../lib/pocketbase';
import { siteBase } from '../../lib/constants';
import { JOBS_PUBLIC } from '../../lib/featureFlags';

function cdata(value: unknown) {
  return `<![CDATA[${String(value ?? '').replaceAll(']]>', ']]]]><![CDATA[>')}]]>`;
}

function esc(value: unknown) {
  return String(value ?? '').replace(/[<>&'"]/g, (char) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' }[char]!));
}

export const GET: APIRoute = async () => {
  if (!JOBS_PUBLIC) {
    return new Response('', { status: 200, headers: { 'Content-Type': 'application/xml', 'Cache-Control': 'public, max-age=3600' } });
  }
  const base = siteBase();
  const today = new Date().toISOString().slice(0, 10);
  const jobs = await getPB().collection('jobs').getFullList({
    filter: `active=true&&expires>"${today}"`,
    sort: '-created',
    fields: 'id,title,company,city,province,category,description,salary_min,salary_max,slug,created',
  }).catch(() => []);

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<ads>
  ${(jobs as any[]).map((job) => `<ad>
    <id>${esc(job.id)}</id>
    <title>${cdata(job.title)}</title>
    <description>${cdata((job.description || '').replace(/<[^>]+>/g, '').trim())}</description>
    <location><display>${esc(job.city ? `${job.city}, ${job.province}` : job.province)}</display></location>
    <salary_min>${job.salary_min || ''}</salary_min>
    <salary_max>${job.salary_max || ''}</salary_max>
    <currency>ZAR</currency>
    <category>${cdata(job.category || '')}</category>
    <company>${cdata(job.company)}</company>
    <url>${esc(`${base}/job/${job.slug}`)}</url>
    <date>${job.created ? new Date(job.created).toISOString().slice(0, 10) : ''}</date>
  </ad>`).join('\n  ')}
</ads>`;
  return new Response(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8', 'Cache-Control': 'public, max-age=3600' } });
};
