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
    fields: 'id,title,company,city,province,category,description,salary_min,salary_max,slug,created,job_type',
  }).catch(() => []);

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<source publisher="Edubuzz" publisherurl="${base}">
  <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
  ${(jobs as any[]).map((job) => `<job>
    <url>${esc(`${base}/job/${job.slug}`)}</url>
    <title>${cdata(job.title)}</title>
    <description>${cdata((job.description || '').replace(/<[^>]+>/g, '').trim().slice(0, 8000))}</description>
    <salary>${cdata(job.salary_min || job.salary_max ? `R${job.salary_min || ''} - R${job.salary_max || ''}` : '')}</salary>
    <location>${cdata(job.city ? `${job.city}, ${job.province}` : job.province || '')}</location>
    <company>${cdata(job.company)}</company>
    <date>${job.created ? new Date(job.created).toISOString().slice(0, 10) : ''}</date>
    <category>${cdata(job.category || '')}</category>
    <job_type>${cdata(job.job_type || '')}</job_type>
  </job>`).join('\n  ')}
</source>`;
  return new Response(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8', 'Cache-Control': 'public, max-age=3600' } });
};
