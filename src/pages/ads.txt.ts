import { ADS_ENABLED } from '../lib/featureFlags';

export async function GET() {
  // AdSense phase: ads.txt intentionally empty (no ad systems live).
  // ADS_ENABLED restores the publisher entry when advertising returns.
  const client = ADS_ENABLED ? (import.meta.env.PUBLIC_ADSENSE_CLIENT || process.env.PUBLIC_ADSENSE_CLIENT || '') : '';
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
