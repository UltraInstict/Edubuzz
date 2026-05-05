import type { APIRoute } from 'astro';
import PocketBase from 'pocketbase';

export const POST: APIRoute = async ({ request }) => {
  const form = await request.formData();
  const name = (form.get('name') as string)?.trim();
  const email = (form.get('email') as string)?.trim().toLowerCase();
  const password = form.get('password') as string;
  const company = (form.get('company') as string)?.trim();

  if (!name || !email || !password || !company) {
    return new Response(JSON.stringify({ error: 'All fields are required.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return new Response(JSON.stringify({ error: 'Enter a valid email address.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }
  if (password.length < 8) {
    return new Response(JSON.stringify({ error: 'Password must be at least 8 characters.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const client = new PocketBase(import.meta.env.PB_URL ?? 'http://127.0.0.1:8090');

  try {
    const userData = await client.collection('users').create({
      name,
      email,
      password,
      passwordConfirm: password,
      role: 'employer',
    });

    const authData = await client.collection('users').authWithPassword(email, password);

    const slug = company.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    await client.collection('employers').create({
      user_id: userData.id,
      company_name: company,
      company_slug: slug,
      contact_email: email,
      plan: 'free',
      verified: false,
    });

    const cookie = `pb_auth=${authData.token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${60 * 60 * 24 * 7}`;

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Set-Cookie': cookie,
      },
    });
  } catch (err: any) {
    console.error('Registration error:', err);
    const msg = err?.data?.data?.email?.message;
    if (msg?.toLowerCase().includes('already')) {
      return new Response(JSON.stringify({ error: 'An account with this email already exists.' }), {
        status: 409,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({
      error: 'Could not create your account. Please try again.',
      detail: import.meta.env.DEV ? String(err?.message) : undefined,
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
