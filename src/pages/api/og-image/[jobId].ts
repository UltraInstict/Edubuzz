import type { APIRoute } from 'astro';
import { getPB, formatSalary } from '../../../lib/pocketbase';

function esc(value: unknown) {
  return String(value ?? '').replace(/[<>&'"]/g, (char) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' }[char]!));
}

export const GET: APIRoute = async ({ params }) => {
  const job: any = await getPB().collection('jobs').getOne(params.jobId || '', {
    fields: 'title,company,city,category,salary_min,salary_max',
  }).catch(() => null);
  if (!job) return new Response('Not found', { status: 404 });
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
    <rect width="1200" height="630" fill="#ffffff"/>
    <rect width="80" height="630" fill="#2d6a4f"/>
    <text x="130" y="90" font-family="Inter, Arial" font-size="34" font-weight="700"><tspan fill="#1a1a1a">Edu</tspan><tspan fill="#2d6a4f">buzz</tspan></text>
    <text x="130" y="230" font-family="Inter, Arial" font-size="56" font-weight="600" fill="#1a1a1a">${esc(job.title).slice(0, 55)}</text>
    <text x="130" y="305" font-family="Inter, Arial" font-size="30" fill="#444444">${esc(job.company)} · ${esc(job.city)}</text>
    <rect x="130" y="350" width="230" height="48" rx="6" fill="#e8f4f0" stroke="#2d6a4f"/>
    <text x="150" y="382" font-family="Inter, Arial" font-size="22" font-weight="500" fill="#2d6a4f">${esc(job.category)}</text>
    <text x="130" y="465" font-family="Inter, Arial" font-size="30" fill="#666666">${esc(formatSalary(job.salary_min, job.salary_max))}</text>
    <text x="900" y="570" font-family="Inter, Arial" font-size="24" fill="#888888">edubuzz.co.za</text>
  </svg>`;
  return new Response(svg, { headers: { 'Content-Type': 'image/svg+xml', 'Cache-Control': 'public, max-age=86400' } });
};
