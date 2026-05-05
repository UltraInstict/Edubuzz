export async function GET() {
  return new Response(
    `User-agent: *\nAllow: /\nDisallow: /api/\nSitemap: https://edubuzz.co.za/sitemap.xml`,
    {
      headers: {
        'Content-Type': 'text/plain',
      },
    },
  );
}
