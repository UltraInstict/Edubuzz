import { pb, getPB, getEmployerForUser } from './pocketbase';

function absoluteUrl(path: string): string {
  const base = import.meta.env.SITE_URL ?? 'http://localhost:4321';
  return `${base}${path}`;
}

export function getUser(request: Request) {
  const cookie = request.headers.get('cookie') ?? '';
  const token = cookie.match(/pb_auth=([^;]+)/)?.[1];
  if (!token) return null;
  try {
    pb.authStore.save(decodeURIComponent(token), null);
    if (!pb.authStore.isValid) return null;
    return pb.authStore.model;
  } catch {
    return null;
  }
}

export function requireUser(request: Request, redirectTo = '/login') {
  const user = getUser(request);
  if (!user) {
    return { redirect: Response.redirect(absoluteUrl(redirectTo), 302), user: null };
  }
  return { redirect: null, user };
}

export function requireAdmin(request: Request) {
  const user = getUser(request) as any;
  if (!user || user.role !== 'admin') {
    return { redirect: Response.redirect(absoluteUrl('/login'), 302), user: null };
  }
  return { redirect: null, user };
}

export async function getEmployerSession(request: Request) {
  const { redirect, user } = requireUser(request, '/login?next=/employer/dashboard');
  if (redirect || !user) return null;
  const employer = await getEmployerForUser((user as any).id);
  return employer ? { user: user as any, employer } : null;
}

export function authCookie(token: string) {
  const maxAge = 60 * 60 * 24 * 7;
  return `pb_auth=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}`;
}

export function clearAuthCookie() {
  return 'pb_auth=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0';
}

export async function getAdminPB() {
  const client = getPB();
  const email = import.meta.env.PB_ADMIN_EMAIL;
  const password = import.meta.env.PB_ADMIN_PASSWORD;
  if (email && password) {
    await client.admins.authWithPassword(email, password);
  }
  return client;
}
