import type { APIRoute } from 'astro';
import { getPB } from '../../lib/pocketbase';

function esc(value: unknown) {
  return String(value ?? '').replace(/[<>&'"]/g, (char) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' }[char]!));
}

export const GET: APIRoute = async () => {
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
    <link>https://edubuzz.co.za</link>
    <description>Latest job listings across South Africa</description>
    <language>en-za</language>
    <atom:link href="https://edubuzz.co.za/feeds/rss.xml" rel="self" type="application/rss+xml"/>
    ${(jobs as any[]).map((job) => `<item>
      <title>${esc(job.title)} at ${esc(job.company)}</title>
      <link>https://edubuzz.co.za/job/${esc(job.slug)}</link>
      <guid isPermaLink="true">https://edubuzz.co.za/job/${esc(job.slug)}</guid>
      <description>${esc(job.description)}</description>
      <category domain="https://edubuzz.co.za/category/${esc((job.category || '').toLowerCase().replace(/\s+/g, '-'))}">${esc(job.category)}</category>
      <category domain="https://edubuzz.co.za/province/${esc((job.province || '').toLowerCase().replace(/\s+/g, '-'))}">${esc(job.province)}</category>
      <pubDate>${new Date(job.created).toUTCString()}</pubDate>
      <source url="https://edubuzz.co.za/feeds/rss.xml">Edubuzz</source>
    </item>`).join('')}
  </channel>
</rss>`;
  return new Response(xml, { headers: { 'Content-Type': 'application/rss+xml; charset=utf-8', 'Cache-Control': 'public, max-age=3600' } });
};
