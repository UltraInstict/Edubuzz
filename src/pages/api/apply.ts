import type { APIRoute } from 'astro';
import PocketBase from 'pocketbase';
import { validateToken } from '../../lib/csrf';

export const POST: APIRoute = async ({ request }) => {
  let fd: FormData;
  try { fd = await request.formData(); }
  catch { return json({ error: 'Invalid form data.' }, 400); }

  if (!validateToken(fd.get('_csrf') as string))
    return json({ error: 'Invalid request.' }, 403);

  const jobId  = (fd.get('job_id') as string)?.trim();
  const name   = (fd.get('name') as string)?.trim();
  const email  = (fd.get('email') as string)?.trim().toLowerCase();
  const phone  = (fd.get('phone') as string)?.trim() ?? '';
  const letter = (fd.get('cover_letter') as string)?.trim() ?? '';
  const cv     = fd.get('cv_file');

  if (!jobId) return json({ error: 'Job ID missing.' }, 400);
  if (!name)  return json({ error: 'Name is required.' }, 400);
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    return json({ error: 'Valid email is required.' }, 400);

  if (cv instanceof File && cv.size > 0) {
    if (!cv.name.toLowerCase().endsWith('.pdf'))
      return json({ error: 'CV must be a PDF.' }, 400);
    if (cv.size > 5 * 1024 * 1024)
      return json({ error: 'CV must be under 5MB.' }, 400);
  }

  const pb = new PocketBase(import.meta.env.PB_URL ?? 'http://127.0.0.1:8090');
  try {
    const data = new FormData();
    data.append('job_id', jobId);
    data.append('applicant_name', name);
    data.append('applicant_email', email);
    data.append('applicant_phone', phone);
    data.append('cover_letter', letter);
    data.append('status', 'pending');
    if (cv instanceof File && cv.size > 0) data.append('cv_file', cv);
    await pb.collection('applications').create(data);
    return json({ success: true }, 200);
  } catch (err: any) {
    console.error('apply:', err);
    return json({ error: 'Failed to submit application.' }, 500);
  }
};

function json(body: object, status: number) {
  return new Response(JSON.stringify(body), {
    status, headers: { 'Content-Type': 'application/json' }
  });
}
