import type { APIRoute } from 'astro';
import { getAdminPB } from '../../lib/auth';
import { cleanString, isEmail, json } from '../../lib/api';
import { sendMail } from '../../lib/mailer';
import { trackEvent } from '../../lib/analytics';

const applicationBuckets = new Map<string, number[]>();

function applicationLimit(request: Request) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  const now = Date.now();
  const recent = (applicationBuckets.get(ip) || []).filter((ts) => now - ts < 3600000);
  if (recent.length >= 3) {
    applicationBuckets.set(ip, recent);
    return false;
  }
  recent.push(now);
  applicationBuckets.set(ip, recent);
  return true;
}

export const POST: APIRoute = async ({ request }) => {
  if (!applicationLimit(request)) {
    return json({ message: 'Too many applications. Please try again later.' }, { status: 429 });
  }

  try {
    const contentType = request.headers.get('content-type') || '';
    const incoming = contentType.includes('multipart/form-data')
      ? await request.formData()
      : new Map(Object.entries(await request.json())) as unknown as FormData;

    const jobId = cleanString(incoming.get('job') || incoming.get('job_id'), 80);
    const name = cleanString(incoming.get('name') || incoming.get('applicant_name'), 80);
    const email = cleanString(incoming.get('email') || incoming.get('applicant_email'), 120).toLowerCase();
    const phone = cleanString(incoming.get('phone') || incoming.get('applicant_phone'), 40);
    const cover = cleanString(incoming.get('cover_letter'), 10000);
    const cv = incoming.get('cv_file');

    if (!jobId || !name || !email) return json({ message: 'Name and email are required.' }, { status: 400 });
    if (!isEmail(email)) return json({ message: 'Enter a valid email address.' }, { status: 400 });
    if (cv instanceof File && cv.size > 0) {
      if (cv.type !== 'application/pdf') return json({ message: 'CV must be a PDF.' }, { status: 400 });
      if (cv.size > 5 * 1024 * 1024) return json({ message: 'CV must be smaller than 5MB.' }, { status: 400 });
    }

    const pb = await getAdminPB();
    const job: any = await pb.collection('jobs').getOne(jobId, { fields: 'id,title,company,apply_email' });
    const payload = new FormData();
    payload.set('job_id', jobId);
    payload.set('job', jobId);
    payload.set('applicant_name', name);
    payload.set('name', name);
    payload.set('applicant_email', email);
    payload.set('email', email);
    payload.set('applicant_phone', phone);
    payload.set('phone', phone);
    payload.set('cover_letter', cover);
    payload.set('status', 'pending');
    payload.set('ip_address', request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown');
    if (cv instanceof File && cv.size > 0) payload.set('cv_file', cv);
    await pb.collection('applications').create(payload);

    sendMail(email, `Application received - ${job.title} at ${job.company}`, `<p>Hi ${name}, we've received your application for ${job.title} at ${job.company}.</p><p>Good luck! - The Edubuzz team</p>`).catch(() => {});
    if (job.apply_email) {
      sendMail(job.apply_email, `New application for ${job.title}`, `<p>You have a new application from ${name} (${email}).</p><p>Log in to view it: https://edubuzz.co.za/employer/applications/${jobId}</p>`).catch(() => {});
    }
    trackEvent(jobId, 'apply_click', request).catch(() => {});
    return json({ success: true });
  } catch {
    return json({ message: 'Failed to submit application.' }, { status: 500 });
  }
};
