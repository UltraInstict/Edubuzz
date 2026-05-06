import type { APIRoute } from 'astro';
import PocketBase from 'pocketbase';
import { validateToken } from '../../../lib/csrf';

export const POST: APIRoute = async ({ request }) => {
  const fd = await request.formData();
  if (!validateToken(fd.get('_csrf') as string))
    return json({ error: 'Invalid request.' }, 403);
  const email    = (fd.get('email') as string)?.trim().toLowerCase();
  const password = fd.get('password') as string;
  if (!email || !password)
    return json({ error: 'Email and password required.' }, 400);

  const pb = new PocketBase(import.meta.env.PB_URL ?? 'http://127.0.0.1:8090');
  try {
    const auth = await pb.collection('users').authWithPassword(email, password);
    return json({ success: true, role: auth.record.role }, 200, {
      'Set-Cookie': `pb_auth=${auth.token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=604800`
    });
  } catch {
    return json({ error: 'Invalid email or password.' }, 401);
  }
};

function json(body: object, status: number, extra: Record<string,string> = {}) {
  return new Response(JSON.stringify(body), {
    status, headers: { 'Content-Type': 'application/json', ...extra }
  });
}
