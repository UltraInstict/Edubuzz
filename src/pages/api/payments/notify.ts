import type { APIRoute } from 'astro';
import PocketBase from 'pocketbase';
import { createHash } from 'crypto';

export const POST: APIRoute = async ({ request }) => {
  const fd = await request.formData();
  const params: Record<string, string> = {};
  fd.forEach((v, k) => { if (k !== 'signature') params[k] = v as string; });

  const str = Object.keys(params).sort()
    .map(k => `${k}=${encodeURIComponent(params[k]).replace(/%20/g, '+')}`)
    .join('&');

  const passphrase = import.meta.env.PAYFAST_PASSPHRASE ?? '';
  const toHash = passphrase ? `${str}&passphrase=${encodeURIComponent(passphrase)}` : str;
  const expected = createHash('md5').update(toHash).digest('hex');
  const received = fd.get('signature') as string;

  if (expected !== received) {
    console.error('PayFast ITN signature mismatch');
    return new Response('Invalid signature', { status: 400 });
  }

  const jobId  = fd.get('custom_str1') as string;
  const userId = fd.get('custom_str2') as string;
  const status = fd.get('payment_status') as string;

  if (status === 'COMPLETE' && jobId) {
    const pb = new PocketBase(import.meta.env.PB_URL ?? 'http://127.0.0.1:8090');
    const expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
    await pb.collection('jobs').update(jobId, { featured: true, featured_expires: expires });

    // Save payment record
    await pb.collection('payments').create({
      amount: Number(fd.get('amount_gross') || 299),
      status: 'complete',
      job_id: jobId,
      employer_id: userId,
    }).catch(() => {});
  }

  return new Response('OK', { status: 200 });
};
