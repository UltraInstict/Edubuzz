import type { APIRoute } from 'astro';
import { cleanString } from '../../lib/api';
import { trackEvent } from '../../lib/analytics';

const allowed = new Set(['view', 'click', 'apply_click', 'share', 'save', 'search', 'job_viewed', 'job_searched', 'job_applied', 'job_shared', 'job_saved']);

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const jobId = cleanString(body.jobId, 80);
    const event = cleanString(body.event, 20);
    if (!jobId || !allowed.has(event)) return new Response(null, { status: 400 });
    await trackEvent(jobId, event as any, request);
    return new Response(null, { status: 204 });
  } catch {
    return new Response(null, { status: 400 });
  }
};
