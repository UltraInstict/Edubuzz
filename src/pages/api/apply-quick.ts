import type { APIRoute } from 'astro';
import PocketBase from 'pocketbase';
import { validateToken } from '../../lib/csrf';
import { checkRateLimit, ok, fail } from '../../lib/api';

export const POST: APIRoute = async ({ request }) => {
  if (!checkRateLimit(request)) return fail('Too many submissions. Please try again later.', 429);

  let fd: FormData;
  try {
    fd = await request.formData();
  } catch {
    return fail('Invalid form data.', 400);
  }

  if (!validateToken(fd.get('_csrf') as string)) return fail('Invalid request.', 403);

  const jobId = (fd.get('job_id') as string)?.trim();
  const name = (fd.get('name') as string)?.trim();
  const email = (fd.get('email') as string)?.trim().toLowerCase();

  if (!jobId) return fail('Job ID missing.', 400);
  if (!name) return fail('Name is required.', 400);
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return fail('Valid email is required.', 400);
  if (/[<>]/.test(name)) return fail('Name contains invalid characters.', 400);

  const safeName = name.slice(0, 80);
  const safeEmail = email.slice(0, 120);

  const pb = new PocketBase(import.meta.env.PB_URL ?? 'http://127.0.0.1:8090');
  try {
    const data = new FormData();
    data.append('job', jobId);
    data.append('name', safeName);
    data.append('email', safeEmail);
    data.append('phone', '');
    data.append('text', 'Quick apply - info captured before redirect');
    data.append('status', 'quick');
    await pb.collection('applications').create(data);
    return ok();
  } catch {
    return fail('Failed to capture information.', 500);
  }
};
