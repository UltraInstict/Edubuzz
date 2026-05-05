import type { APIRoute } from 'astro';
import { getPB } from '../../lib/pocketbase';
import { checkRateLimit, cleanString, isEmail, json } from '../../lib/api';

function escapeFilter(value: string) {
  return value.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
}

export const POST: APIRoute = async ({ request }) => {
  if (!checkRateLimit(request)) {
    return json({ message: 'Too many submissions. Please try again later.' }, { status: 429 });
  }

  try {
    const data = await request.json();
    const email = cleanString(data.email, 120).toLowerCase();
    const keyword = cleanString(data.keyword, 120);
    const province = cleanString(data.province, 80);
    const category = cleanString(data.category, 80);

    if (!email) {
      return json({ message: 'Email is required.' }, { status: 400 });
    }
    if (!isEmail(email)) {
      return json({ message: 'Enter a valid email address.' }, { status: 400 });
    }

    const pb = getPB();
    try {
      await pb.collection('job_alerts').getFirstListItem(`email="${escapeFilter(email)}"&&keyword="${escapeFilter(keyword)}"`);
      return json({ message: 'Alert already exists for this email and keyword.' }, { status: 409 });
    } catch {
      await pb.collection('job_alerts').create({ email, keyword, province, category });
      return json({ ok: true });
    }
  } catch {
    return json({ message: 'Failed to create alert.' }, { status: 500 });
  }
};
