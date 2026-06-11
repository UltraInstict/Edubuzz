import type { APIRoute } from 'astro';
import PocketBase from 'pocketbase';
import { validateToken } from '../../../lib/csrf';
import { setAuthCookie, trackLoginAttempt, clearLoginAttempts, auditLog } from '../../../lib/auth';

const PB_URL = import.meta.env.PB_URL ?? 'http://127.0.0.1:8090';

export const POST: APIRoute = async ({ request }) => {
  const fd = await request.formData();
  const isAjax = request.headers.get('accept')?.includes('application/json');
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || request.headers.get('x-real-ip') || 'unknown';

  if (!validateToken(fd.get('_csrf') as string)) {
    return respond(isAjax, { error: 'Invalid request.' }, 403);
  }

  const email = (fd.get('email') as string)?.trim().toLowerCase();
  const password = fd.get('password') as string;
  if (!email || !password) {
    return respond(isAjax, { error: 'Email and password required.' }, 400);
  }

  const allow = trackLoginAttempt(email);
  if (!allow) {
    auditLog('login_lockout', { email, ip });
    return respond(isAjax, { error: 'Too many attempts. Try again later.' }, 429);
  }

  const pb = new PocketBase(PB_URL);
  try {
    const auth = await pb.collection('users').authWithPassword(email, password);
    clearLoginAttempts(email);

    const role = auth.record.role;
    if (auth.record.blocked || auth.record.suspended) {
      return respond(isAjax, { error: 'Account is suspended.' }, 403);
    }

    auditLog('login_success', { userId: auth.record.id, role, ip, email });

    const rememberMe = fd.get('remember') === '1' || fd.get('remember') === 'true';
    const next = (fd.get('next') as string) || '/';
    const isAdminRole = role === 'admin' || role === 'superadmin' || role === 'moderator';
    const dest = isAdminRole ? '/admin' : role === 'employer' ? '/employer/dashboard' : next;

    if (isAjax) {
      return json({ success: true, role }, 200, {
        'Set-Cookie': setAuthCookie(auth.token, role, rememberMe),
      });
    }
    return new Response(null, {
      status: 302,
      headers: {
        Location: dest,
        'Set-Cookie': setAuthCookie(auth.token, role, rememberMe),
      },
    });
  } catch {
    auditLog('login_failed', { email, ip });
    if (isAjax) return json({ error: 'Invalid email or password.' }, 401);
    return new Response(null, {
      status: 302,
      headers: { Location: '/login?error=Invalid+email+or+password' },
    });
  }
};

function respond(isAjax: boolean | undefined, body: Record<string, unknown>, status: number) {
  if (isAjax) return json(body, status);
  const msg = String(body.error || '');
  const path = msg.includes('csrf') || msg.includes('Invalid request') ? '/403' : '/login';
  return new Response(null, {
    status: 302,
    headers: { Location: `${path}?error=${encodeURIComponent(msg)}` },
  });
}

function json(body: object, status: number, extra: Record<string, string> = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...extra },
  });
}
