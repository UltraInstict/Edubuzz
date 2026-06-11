import type { APIRoute } from 'astro';
import { getAdminPB } from '../../lib/auth';
import { cleanString, isEmail, isHttpsUrl } from '../../lib/api';
import { validateToken } from '../../lib/csrf';
import { scanJobContent } from '../../lib/moderation';

/** Rate limit: 3 submissions per IP per hour */
const postJobBuckets = new Map<string, number[]>();

function checkPostJobRateLimit(request: Request): boolean {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  const now = Date.now();
  const hourAgo = now - 3600000;
  const recent = (postJobBuckets.get(ip) ?? []).filter((ts) => ts > hourAgo);
  if (recent.length >= 3) {
    postJobBuckets.set(ip, recent);
    return false;
  }
  recent.push(now);
  postJobBuckets.set(ip, recent);
  return true;
}

export const POST: APIRoute = async ({ request }) => {
  if (!checkPostJobRateLimit(request)) {
    return json({ success: false, error: 'Too many submissions. Please try again later.' }, 429);
  }

  try {
    const data = await request.json();
    if (!validateToken(data._csrf as string)) {
      return json({ success: false, error: 'Invalid request.' }, 403);
    }

    const employer_name = cleanString(data.employer_name, 80);
    const employer_email = cleanString(data.employer_email, 120).toLowerCase();
    const company = cleanString(data.company, 120);
    const title = cleanString(data.title, 120);
    const category = cleanString(data.category, 80);
    const province = cleanString(data.province, 80);
    const city = cleanString(data.city, 80);
    const job_type = cleanString(data.job_type, 40);
    const description = cleanString(data.description, 10000);
    const apply_url = cleanString(data.apply_url, 300);
    const apply_email = cleanString(data.apply_email, 120).toLowerCase();

    if (!employer_name || !employer_email || !company || !title || !province || !job_type || !description) {
      return json({ success: false, error: 'Please complete all required fields.' }, 400);
    }
    if (!isEmail(employer_email)) {
      return json({ success: false, error: 'Enter a valid employer email address.' }, 400);
    }
    if (apply_email && !isEmail(apply_email)) {
      return json({ success: false, error: 'Enter a valid application email address.' }, 400);
    }
    if (apply_url && !isHttpsUrl(apply_url)) {
      return json({ success: false, error: 'Application URL must start with https://.' }, 400);
    }

    // Moderation scan
    const modResult = scanJobContent(title, description, company);
    if (modResult.flagged) {
      return json({
        success: false,
        error: 'Your job posting was flagged by our content moderation system.',
      }, 422);
    }

    const salary_min = data.salary_min ? Number.parseInt(String(data.salary_min), 10) : null;
    const salary_max = data.salary_max ? Number.parseInt(String(data.salary_max), 10) : null;

    const pb = await getAdminPB();
    await pb.collection('pending_jobs').create({
      employer_name,
      employer_email,
      company,
      title,
      category: category || 'General',
      description,
      province,
      city: city || '',
      job_type,
      salary_min: Number.isFinite(salary_min) ? salary_min : null,
      salary_max: Number.isFinite(salary_max) ? salary_max : null,
      apply_url: apply_url || '',
      apply_email: apply_email || '',
      status: 'pending',
    });

    return json({ success: true, data: { message: 'Job submitted for review.' } }, 200);
  } catch {
    return json({ success: false, error: 'Failed to submit job.' }, 500);
  }
};

function json(body: object, status: number) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
