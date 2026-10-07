import { ADS_TXT_RECORD } from '../lib/adsense';

export async function GET() {
  // ads.txt authorizes a seller; it is independent of whether on-page ad
  // rendering is enabled. Keeping this explicit also prevents a missing
  // production environment variable from silently publishing an empty file.
  const body = `${ADS_TXT_RECORD}\n`;

  return new Response(body, {
    headers: {
      'Content-Type': 'text/plain',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
