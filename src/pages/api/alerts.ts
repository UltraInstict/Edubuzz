import type { APIRoute } from 'astro';
import { getPB } from '../../lib/pocketbase';

export const POST: APIRoute = async ({ request }) => {
  try {
    const data = await request.json();
    const { email, keyword, province, category } = data;

    if (!email) {
      return new Response(JSON.stringify({ message: 'Email is required.' }), { status: 400 });
    }

    const pb = getPB();

    // Check for duplicate alert
    try {
      await pb.collection('job_alerts').getFirstListItem(`email = "${email}" && keyword = "${keyword || ''}"`);
      return new Response(JSON.stringify({ message: 'Alert already exists for this email and keyword.' }), { status: 409 });
    } catch {
      // No duplicate — proceed
    }

    await pb.collection('job_alerts').create({ email, keyword: keyword || '', province: province || '', category: category || '' });
    return new Response(JSON.stringify({ ok: true }), { status: 200 });
  } catch (err: any) {
    console.error('Alert error:', err);
    return new Response(JSON.stringify({ message: 'Failed to create alert.' }), { status: 500 });
  }
};
