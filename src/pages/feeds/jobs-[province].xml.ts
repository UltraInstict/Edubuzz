import type { APIRoute } from 'astro';
import { getPB } from '../../lib/pocketbase';
import { provinceName } from '../../lib/slugify';
import { siteBase } from '../../lib/constants';
import { JOBS_PUBLIC } from '../../lib/featureFlags';

function cdata(value: unknown) {
  return `<![CDATA[${String(value ?? '')}]]>`;
}

export const GET: APIRoute = async ({ params }) => {
  if (!JOBS_PUBLIC) {
    return new Response('', { status: 200, headers: { 'Content-Type': 'application/xml', 'Cache-Control': 'public, max-age=3600' } });
  }
  const base = siteBase();
  const slug = (params.province || '').replace(/^jobs-/, '').replace(/\.xml$/, '');
  const province = provinceName(slug);
  const today = new Date().toISOString().slice(0, 10);
  const jobs = await getPB().collection('jobs').getFullList({
    filter: `active=true&&expires>"${today}"&&province="${province}"`,
    sort: '-created',
    fields: 'id,title,company,city,province,category,job_type,description,salary_min,salary_max,created,expires,slug',
  }).catch(() => []);
  const xml = `<?xml version="1.0" encoding="UTF-8"?><source><publisher>Edubuzz</publisher>${jobs.map((j:any)=>`<job><title>${cdata(j.title)}</title><date>${cdata(j.created)}</date><referencenumber>${cdata(j.id)}</referencenumber><url>${cdata(`${base}/job/${j.slug}`)}</url><company>${cdata(j.company)}</company><city>${cdata(j.city)}</city><state>${cdata(j.province)}</state><country>${cdata('South Africa')}</country><description>${cdata(j.description)}</description><category>${cdata(j.category)}</category><jobtype>${cdata(j.job_type)}</jobtype><expirationdate>${cdata(j.expires)}</expirationdate></job>`).join('')}</source>`;
  return new Response(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8', 'Cache-Control': 'public, max-age=3600' } });
};
