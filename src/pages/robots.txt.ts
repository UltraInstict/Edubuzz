import { SITE_URL } from '../lib/constants';

export async function GET() {
  const base = (import.meta.env.SITE_URL || process.env.SITE_URL || SITE_URL).replace(/\/$/, '');
  return new Response(
    `User-agent: *
Allow: /
Disallow: /api/
Disallow: /admin/
Disallow: /employer/
Disallow: /logout
Disallow: /?*
Disallow: /jobs*
Disallow: /job/
Disallow: /category/
Disallow: /province/
Disallow: /learnerships*
Disallow: /internships*
Disallow: /graduate-jobs*
Disallow: /remote-jobs*
Disallow: /bursaries*
Disallow: /cv-tips-*
Disallow: /interview-tips-*
Disallow: /how-to-get-into-*
Disallow: /post-job
Disallow: /pricing
Disallow: /advertise
Disallow: /feeds/

User-agent: GPTBot
Allow: /
Disallow: /api/
Disallow: /admin/
Disallow: /employer/

User-agent: ChatGPT-User
Allow: /
Disallow: /api/
Disallow: /admin/
Disallow: /employer/

User-agent: Google-Extended
Allow: /
Disallow: /api/

User-agent: anthropic-ai
Allow: /
Disallow: /api/

User-agent: PerplexityBot
Allow: /

User-agent: CCBot
Allow: /
Disallow: /api/

Sitemap: ${base}/sitemap.xml

# AI crawler discovery
LLMs: ${base}/llms.txt`,
    {
      headers: {
        'Content-Type': 'text/plain',
        'Cache-Control': 'public, max-age=3600',
      },
    },
  );
}
