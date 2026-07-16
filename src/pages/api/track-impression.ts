import type { APIRoute } from 'astro';
import { trackCampaignImpression } from '../../services/monetizationService';

export const POST: APIRoute = async ({ request }) => {
  try {
    const contentType = request.headers.get('content-type') || '';
    let body: any;

    if (contentType.includes('application/json')) {
      body = await request.json();
    } else {
      const text = await request.text();
      try { body = JSON.parse(text); } catch { body = {}; }
    }

    if (body.campaignId) {
      await trackCampaignImpression(String(body.campaignId));
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch {
    return new Response(JSON.stringify({ success: false }), {
      status: 200, // Always 200 for beacons to prevent noise
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
