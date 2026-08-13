import type { APIRoute } from 'astro';
import { getPB } from '../../lib/pocketbase';
import { siteBase } from '../../lib/constants';
import { JOBS_PUBLIC } from '../../lib/featureFlags';

function esc(value: unknown) {
  return String(value ?? '').replace(/[<>&'"]/g, (char) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' }[char]!));
}

export const GET: APIRoute = async () => {
  // AdSense phase: no public job feeds. Empty channel (not an error).
  if (!JOBS_PUBLIC) {
    return new Response('', { status: 200, headers: { 'Content-Type': 'application/rss+xml', 'Cache-Control': 'public, max-age=3600' } });
  }
  const base = siteBase();
  const today = new Date().toISOString().slice(0, 10);
  const jobs = await getPB().collection('jobs').getFullList({
    filter: `active=true&&expires>"${today}"`,
    sort: '-created',
    fields: 'title,company,category,description,province,slug,created',
  }).catch(() => []);

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Edubuzz — Latest Jobs in South Africa</title>
    <link>${base}</link>
    <description>Latest job listings across South Africa</description>
    <language>en-za</language>
    <atom:link href="${base}/feeds/rss.xml" rel="self" type="application/rss+xml"/>
    ${(jobs as any[]).map((job) => `<item>
      <title>${esc(job.title)} at ${esc(job.company)}</title>
      <link>${base}/job/${esc(job.slug)}</link>
      <guid isPermaLink="true">${base}/job/${esc(job.slug)}</guid>
      <description>${esc(job.description)}</description>
      <category domain="${base}/category/${esc((job.category || '').toLowerCase().replace(/\s+/g, '-'))}">${esc(job.category)}</category>
      <category domain="${base}/province/${esc((job.province || '').toLowerCase().replace(/\s+/g, '-'))}">${esc(job.province)}</category>
      <pubDate>${new Date(job.created).toUTCString()}</pubDate>
      <source url="${base}/feeds/rss.xml">Edubuzz</source>
    </item>`).join('')}
  </channel>
</rss>`;
  return new Response(xml, { headers: { 'Content-Type': 'application/rss+xml; charset=utf-8', 'Cache-Control': 'public, max-age=3600' } });
};
