import type { APIRoute } from 'astro';
import { getPB } from '../../lib/pocketbase';
import { siteBase } from '../../lib/constants';
import { JOBS_PUBLIC } from '../../lib/featureFlags';

function cdata(value: unknown) {
  return `<![CDATA[${String(value ?? '').replaceAll(']]>', ']]]]><![CDATA[>')}]]>`;
}

export const GET: APIRoute = async () => {
  if (!JOBS_PUBLIC) {
    return new Response('', { status: 200, headers: { 'Content-Type': 'application/xml', 'Cache-Control': 'public, max-age=3600' } });
  }
  const base = siteBase();
  const pb = getPB();
  const today = new Date().toISOString().slice(0, 10);
  const jobs = await pb.collection('jobs').getFullList({
    filter: `active=true&&expires>"${today}"`,
    fields: 'id,title,company,city,province,category,job_type,description,salary_min,salary_max,apply_url,apply_email,created,expires,slug',
    sort: '-created',
  }).catch(() => []);
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<source>
  <publisher>Edubuzz</publisher>
  <publisherurl>${base}</publisherurl>
  <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
  ${jobs.map((j: any) => `<job>
    <title>${cdata(j.title)}</title>
    <date>${cdata(j.created)}</date>
    <referencenumber>${cdata(j.id)}</referencenumber>
    <url>${cdata(`${base}/job/${j.slug}`)}</url>
    <company>${cdata(j.company)}</company>
    <city>${cdata(j.city)}</city>
    <state>${cdata(j.province)}</state>
    <country>${cdata('South Africa')}</country>
    <postalcode></postalcode>
    <description>${cdata(j.description)}</description>
    <salary>${cdata(`${j.salary_min ? `R${j.salary_min}` : ''} ${j.salary_max ? `- R${j.salary_max}` : ''}`)}</salary>
    <category>${cdata(j.category)}</category>
    <jobtype>${cdata(j.job_type)}</jobtype>
    <expirationdate>${cdata(j.expires)}</expirationdate>
  </job>`).join('')}
</source>`;
  return new Response(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8', 'Cache-Control': 'public, max-age=3600' } });
};
