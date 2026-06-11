import type { APIRoute } from 'astro';
import { trackAffiliateClick } from '../../services/affiliateService';

export const POST: APIRoute = async ({ request }) => {
  try {
    const { linkId, jobId } = await request.json();
    if (!linkId) {
      return new Response(JSON.stringify({ success: false, error: 'Missing linkId' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    await trackAffiliateClick(linkId, request, jobId);
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch {
    return new Response(JSON.stringify({ success: false, error: 'Tracking failed' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
