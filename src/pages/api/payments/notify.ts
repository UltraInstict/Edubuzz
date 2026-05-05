import type { APIRoute } from 'astro';
import { getAdminPB } from '../../../lib/auth';

export const POST: APIRoute = async ({ request }) => {
  try {
    const form = await request.formData();
    const jobId = String(form.get('custom_str1') || '');
    if (jobId) {
      const expires = new Date(Date.now() + 60 * 86400000).toISOString();
      await (await getAdminPB()).collection('jobs').update(jobId, {
        featured: true,
        featured_expires: expires,
      });
    }
  } catch {
    // PayFast expects a 200 response even when we ignore malformed ITNs.
  }
  return new Response(null, { status: 200 });
};
