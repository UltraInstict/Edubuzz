import type { APIRoute } from 'astro';
import PocketBase from 'pocketbase';
import { validateToken } from '../../../lib/csrf';

export const POST: APIRoute = async ({ request }) => {
  const fd = await request.formData();
  if (!validateToken(fd.get('_csrf') as string))
    return json({ error: 'Invalid request.' }, 403);
  const name    = (fd.get('name') as string)?.trim();
  const email   = (fd.get('email') as string)?.trim().toLowerCase();
  const password = fd.get('password') as string;
  const company  = (fd.get('company') as string)?.trim();

  if (!name || !email || !password || !company)
    return json({ error: 'All fields are required.' }, 400);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    return json({ error: 'Invalid email address.' }, 400);
  if (password.length < 8)
    return json({ error: 'Password must be at least 8 characters.' }, 400);

  const pb = new PocketBase(import.meta.env.PB_URL ?? 'http://127.0.0.1:8090');
  try {
    const u = await pb.collection('users').create({
      name, email, password, passwordConfirm: password, role: 'employer',
    });
    const auth = await pb.collection('users').authWithPassword(email, password);
    const slug = company.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
    await pb.collection('employers').create({
      user_id: u.id, company_name: company, company_slug: slug,
      contact_email: email, plan: 'free', verified: false,
    });
    return json({ success: true }, 200, {
      'Set-Cookie': `pb_auth=${auth.token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=604800`
    });
  } catch (err: any) {
    console.error('register:', err);
    const dup = err?.data?.data?.email?.message?.toLowerCase().includes('already');
    return json({ error: dup ? 'Email already registered.' : 'Could not create account.' }, dup ? 409 : 500);
  }
};

function json(body: object, status: number, extra: Record<string,string> = {}) {
  return new Response(JSON.stringify(body), {
    status, headers: { 'Content-Type': 'application/json', ...extra }
  });
}
