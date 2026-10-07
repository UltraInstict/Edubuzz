export async function GET() {
  // ads.txt authorizes a seller; it is independent of whether on-page ad
  // rendering is enabled. Keeping this explicit also prevents a missing
  // production environment variable from silently publishing an empty file.
  const body = 'google.com, pub-4848750388169101, DIRECT, f08c47fec0942fa0\n';

  return new Response(body, {
    headers: {
      'Content-Type': 'text/plain',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
