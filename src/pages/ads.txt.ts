export async function GET() {
  const client = import.meta.env.PUBLIC_ADSENSE_CLIENT || process.env.PUBLIC_ADSENSE_CLIENT || '';
  const pubId = client.replace(/^ca-/i, '');
  const body = pubId
    ? `google.com, ${pubId}, DIRECT, f08c47fec0942fa0\n`
    : '';

  return new Response(body, {
    headers: {
      'Content-Type': 'text/plain',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
