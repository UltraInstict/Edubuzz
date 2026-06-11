export async function GET() {
  return new Response(
    `User-agent: *
Allow: /
Disallow: /api/
Disallow: /admin/
Disallow: /employer/
Disallow: /logout
Disallow: /?*
Disallow: /jobs?*

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

Sitemap: https://edubuzz.co.za/sitemap.xml

# AI crawler discovery
LLMs: https://edubuzz.co.za/llms.txt`,
    {
      headers: {
        'Content-Type': 'text/plain',
        'Cache-Control': 'public, max-age=3600',
      },
    },
  );
}
