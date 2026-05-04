import type { APIRoute } from 'astro';
import { getPB } from '../../lib/pocketbase';

export const POST: APIRoute = async ({ request }) => {
  try {
    const data = await request.json();
    const { job, name, email, phone, cover_letter } = data;

    if (!job || !name || !email) {
      return new Response(JSON.stringify({ message: 'Name and email are required.' }), { status: 400 });
    }

    const pb = getPB();
    await pb.collection('applications').create({ job, name, email, phone, cover_letter });

    return new Response(JSON.stringify({ ok: true }), { status: 200 });
  } catch (err: any) {
    console.error('Apply error:', err);
    return new Response(JSON.stringify({ message: 'Failed to submit application.' }), { status: 500 });
  }
};
