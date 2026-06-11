import type { APIRoute } from 'astro';
import { getEmployerSession } from '../../../lib/auth';

async function md5(value: string) {
  const crypto = await import('node:crypto');
  return crypto.createHash('md5').update(value).digest('hex');
}

export const POST: APIRoute = async ({ request }) => {
  const session = await getEmployerSession(request);
  if (!session) return new Response(null, { status: 302, headers: { Location: '/login?next=/employer/upgrade' } });
  const form = await request.formData();
  const jobId = String(form.get('jobId') || '');
  const site = import.meta.env.SITE_URL || 'https://edubuzz.co.za';
  const params: Record<string, string> = {
    merchant_id: import.meta.env.PAYFAST_MERCHANT_ID || '',
    merchant_key: import.meta.env.PAYFAST_MERCHANT_KEY || '',
    return_url: `${site}/employer/dashboard?payment=success`,
    cancel_url: `${site}/employer/upgrade?payment=cancelled`,
    notify_url: `${site}/api/payments/notify`,
    amount: '299.00',
    item_name: 'Edubuzz Featured Listing',
    email_address: session.user.email,
    custom_str1: jobId,
    custom_str2: session.user.id,
  };
  const query = new URLSearchParams(params);
  params.signature = await md5(query.toString().replace(/%20/g, '+'));
  const url = `https://www.payfast.co.za/eng/process?${new URLSearchParams(params).toString()}`;
  return Response.redirect(url, 302);
};
