import type { APIRoute } from 'astro';
import PocketBase from 'pocketbase';

export const POST: APIRoute = async ({ request }) => {
  const form = await request.formData();
  const email = (form.get('email') as string)?.trim().toLowerCase();
  const password = form.get('password') as string;

  if (!email || !password) {
    return new Response(JSON.stringify({ error: 'Email and password are required.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const client = new PocketBase(import.meta.env.PB_URL ?? 'http://127.0.0.1:8090');

  try {
    const authData = await client.collection('users').authWithPassword(email, password);
    const cookie = `pb_auth=${authData.token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${60 * 60 * 24 * 7}`;

    return new Response(JSON.stringify({ success: true, role: authData.record.role }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Set-Cookie': cookie,
      },
    });
  } catch (err: any) {
    console.error('Login error:', err);
    return new Response(JSON.stringify({ error: 'Invalid email or password.' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
