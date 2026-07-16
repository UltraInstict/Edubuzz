import type { APIRoute } from 'astro';
import { getPB } from '../../lib/pocketbase';
import { checkRateLimit, cleanString, isEmail, ok, fail } from '../../lib/api';
import { validateToken } from '../../lib/csrf';

export const POST: APIRoute = async ({ request }) => {
  if (!checkRateLimit(request)) {
    return fail('Too many submissions. Please try again later.', 429);
  }

  try {
    const data = await request.json();
    if (!validateToken(data._csrf as string)) return fail('Invalid request.', 403);
    const email = cleanString(data.email, 120).toLowerCase();
    const keyword = cleanString(data.keyword, 120);
    const province = cleanString(data.province, 80);
    const category = cleanString(data.category, 80);

    if (!email) return fail('Email is required.', 400);
    if (!isEmail(email)) return fail('Enter a valid email address.', 400);

    const pb = getPB();
    await pb.collection('job_alerts').create({ email, keyword, province, category });
    return ok();
  } catch {
    return fail('Could not create your alert. Please try again.', 500);
  }
};
