import type { APIRoute } from 'astro';
import PocketBase from 'pocketbase';
import { validateToken } from '../../../lib/csrf';
import { getAdminPB, setAuthCookie, auditLog } from '../../../lib/auth';
import { checkRateLimit } from '../../../lib/api';

const PB_URL = import.meta.env.PB_URL ?? 'http://127.0.0.1:8090';

function validatePassword(password: string): string | null {
  if (password.length < 10) return 'Password must be at least 10 characters.';
  if (!/[A-Z]/.test(password)) return 'Password must contain at least one uppercase letter.';
  if (!/[a-z]/.test(password)) return 'Password must contain at least one lowercase letter.';
  if (!/[0-9]/.test(password)) return 'Password must contain at least one number.';
  if (!/[^A-Za-z0-9]/.test(password)) return 'Password must contain at least one special character.';
  if (isCommonPassword(password)) return 'This password is too common. Choose something more unique.';
  return null;
}

const COMMON_PASSWORDS = new Set([
  'password', '123456', '12345678', 'qwerty', 'abc123', 'monkey', 'master',
  'dragon', '111111', 'baseball', 'iloveyou', 'trustno1', 'sunshine',
  'ashley', 'michael', 'shadow', '123123', '654321', 'superman', 'qazwsx',
  'football', 'password1', 'password123', 'letmein', 'welcome', 'admin',
  'princess', 'login', 'starwars', 'solo', 'passw0rd', 'master', 'hello',
  'charlie', 'donald', 'loveme', 'zaq1zaq1', 'qwerty123', 'access',
  'flower', 'hottie', 'mustang', 'thunder', 'bailey', 'dallas', 'yankees',
  'michael1', 'jordan23', 'hunter', 'ranger', 'buster', 'thomas', 'robert',
  'soccer', 'hockey', 'killer', 'george', 'andrew', 'andrea', 'joshua',
  'jessica', 'jennifer', 'michelle', 'daniel', 'nicole', 'jordan', 'pepper',
  'summer', 'diamond', 'freedom', 'whatever', 'ginger', 'matrix', 'samsung',
  'qwerty1', 'liverpool', 'arsenal', 'chelsea', 'batman', 'test', 'pass',
  'killer', 'harley', 'corvette', 'austin', 'merlin', 'cookie', 'eagle1',
  'steelers', 'joseph', 'mercedes', 'dakota', 'maverick', 'fender',
  'sparky', 'chester', 'anthony', 'brandon', 'jackass', 'compaq', 'bigdog',
  'heather', 'hammer', 'yankee', 'falcon', 'taylor', 'austin', 'tennis',
  'midnight', 'chicken', 'maverick', 'camaro', 'winter', 'abcdef',
  'aaaaaa', 'password2', 'trustno1', 'joshua', 'matthew', 'william',
]);

function isCommonPassword(password: string): boolean {
  const lower = password.toLowerCase().replace(/[0-9!@#$%^&*]/g, '');
  return COMMON_PASSWORDS.has(lower) || COMMON_PASSWORDS.has(password.toLowerCase());
}

export const POST: APIRoute = async ({ request }) => {
  if (!checkRateLimit(request)) {
    return new Response(null, { status: 302, headers: { Location: '/register?error=Too+many+attempts' } });
  }

  const fd = await request.formData();
  const isAjax = request.headers.get('accept')?.includes('application/json');
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || request.headers.get('x-real-ip') || 'unknown';

  if (!validateToken(fd.get('_csrf') as string)) {
    return respond(isAjax, { error: 'Invalid request.' }, 403);
  }

  const name = (fd.get('name') as string)?.trim();
  const email = (fd.get('email') as string)?.trim().toLowerCase();
  const password = fd.get('password') as string;
  const company = (fd.get('company') as string)?.trim();
  const agreed = fd.get('terms') === '1' || fd.get('terms') === 'true' || fd.get('agreed') === 'true';

  if (!name || !email || !password || !company) {
    return respond(isAjax, { error: 'All fields are required.' }, 400);
  }
  if (!agreed) {
    return respond(isAjax, { error: 'You must agree to the terms of service.' }, 400);
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return respond(isAjax, { error: 'Invalid email address.' }, 400);
  }
  if (/[<>&"'()]/.test(name)) {
    return respond(isAjax, { error: 'Name contains invalid characters.' }, 400);
  }
  const pwError = validatePassword(password);
  if (pwError) {
    return respond(isAjax, { error: pwError }, 400);
  }

  const pb = new PocketBase(PB_URL);
  try {
    try {
      await pb.collection('users').create({
        name,
        email,
        password,
        passwordConfirm: password,
        role: 'employer',
      });
    } catch (err: any) {
      const isDuplicate = err?.data?.data?.email?.code === 'validation_not_unique';
      if (!isDuplicate) throw err;
    }

    const auth = await pb.collection('users').authWithPassword(email, password);
    const adminPb = await getAdminPB();

    const existing = await adminPb.collection('employers').getList(1, 1, {
      filter: `user_id="${auth.record.id}"`,
    }).catch(() => ({ items: [] }));

    if (!existing.items.length) {
      const slug = company
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')
        .slice(0, 60);
      await adminPb.collection('employers').create({
        user_id: auth.record.id,
        company_name: company,
        company_slug: slug,
        contact_email: email,
        plan: 'free',
        verified: false,
        blocked: false,
        suspended: false,
      });
    }

    auditLog('register_success', { userId: auth.record.id, email, role: 'employer', ip });
    if (isAjax) {
      return json({ success: true }, 200, {
        'Set-Cookie': setAuthCookie(auth.token, 'employer'),
      });
    }
    return new Response(null, {
      status: 302,
      headers: {
        Location: '/employer/dashboard',
        'Set-Cookie': setAuthCookie(auth.token, 'employer'),
      },
    });
  } catch {
    auditLog('register_failed', { email, ip });
    if (isAjax) return json({ error: 'Could not create account.' }, 500);
    return new Response(null, {
      status: 302,
      headers: { Location: '/register?error=Could+not+create+account' },
    });
  }
};

function respond(isAjax: boolean | undefined, body: Record<string, unknown>, status: number) {
  if (isAjax) return json(body, status);
  const msg = String(body.error || '');
  return new Response(null, {
    status: 302,
    headers: { Location: `/register?error=${encodeURIComponent(msg)}` },
  });
}

function json(body: object, status: number, extra: Record<string, string> = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...extra },
  });
}
