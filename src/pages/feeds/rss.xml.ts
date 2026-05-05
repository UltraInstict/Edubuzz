import type { APIRoute } from 'astro';
import { getPB } from '../../lib/pocketbase';

function esc(value: unknown) {
  return String(value ?? '').replace(/[<>&'"]/g, (char) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' }[char]!));
}

export const GET: APIRoute = async () => {
  const jobs = await getPB().collection('jobs').getList(1, 100, {
    filter: 'active=true',
    sort: '-created',
    fields: 'title,company,description,slug,created',
  }).catch(() => ({ items: [] }));
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Edubuzz - Latest Jobs in South Africa</title>
    <link>https://edubuzz.co.za</link>
    <description>Latest job listings across South Africa</description>
    <atom:link href="https://edubuzz.co.za/feeds/rss.xml" rel="self" type="application/rss+xml"/>
    ${jobs.items.map((job: any) => `<item><title>${esc(job.title)} at ${esc(job.company)}</title><link>https://edubuzz.co.za/job/${esc(job.slug)}</link><guid>https://edubuzz.co.za/job/${esc(job.slug)}</guid><description>${esc(job.description)}</description><pubDate>${new Date(job.created).toUTCString()}</pubDate></item>`).join('')}
  </channel>
</rss>`;
  return new Response(xml, { headers: { 'Content-Type': 'application/rss+xml; charset=utf-8', 'Cache-Control': 'public, max-age=3600' } });
};
