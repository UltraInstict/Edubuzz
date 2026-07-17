import PocketBase from 'pocketbase';
import { config } from 'dotenv';
config({ override: true });

const PB_URL = import.meta.env.PB_URL ?? 'http://127.0.0.1:8090';

const SESSION_MAX_AGE = 28800; // 8 hours for admin sessions
const SESSION_MAX_AGE_EMPLOYER = 259200; // 3 days for employer sessions
const SESSION_MAX_AGE_CANDIDATE = 604800; // 7 days for candidate sessions

const LOGIN_ATTEMPTS = new Map<string, { count: number; resetAt: number }>();
const LOCKOUT_THRESHOLD = 5;
const LOCKOUT_WINDOW = 900; // 15 minutes

export function trackLoginAttempt(email: string): boolean {
  const now = Math.floor(Date.now() / 1000);
  const entry = LOGIN_ATTEMPTS.get(email);
  if (!entry || now > entry.resetAt) {
    LOGIN_ATTEMPTS.set(email, { count: 1, resetAt: now + LOCKOUT_WINDOW });
    return true;
  }
  entry.count++;
  if (entry.count >= LOCKOUT_THRESHOLD) return false;
  return true;
}

export function clearLoginAttempts(email: string): void {
  LOGIN_ATTEMPTS.delete(email);
}

export function getPb() {
  return new PocketBase(PB_URL);
}

export function getAuthPb(request: Request) {
  const pb = getPb();
  const token = request.headers.get('cookie')?.match(/pb_auth=([^;]+)/)?.[1];
  if (token) pb.authStore.save(token, null);
  return pb;
}

function decodeJwt(token: string): any {
  try {
    const payload = token.split('.')[1];
    if (!payload) return null;
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const pad = base64.length % 4;
    const padded = pad ? base64 + '='.repeat(4 - pad) : base64;
    const data = JSON.parse(atob(padded));
    if (data.exp && data.exp * 1000 < Date.now()) return null;
    return data;
  } catch { return null; }
}

export async function getUser(request: Request): Promise<any> {
  const cookie = request.headers.get('cookie') || '';
  const match = cookie.match(/pb_auth=([^;]+)/);
  if (!match) return null;

  const token = match[1];
  const claims = decodeJwt(token);
  if (!claims?.id) return null;

  // Try authRefresh first (validates against PocketBase and returns full record with role)
  try {
    const pb = getPb();
    pb.authStore.save(token, null);
    const record = await pb.collection('users').authRefresh();
    return record.record;
  } catch {
    // authRefresh failed — token may be stale or PB unreachable.
    // Fall back to fetching the user record directly via admin client so we still get the role.
    try {
      const adminPb = await getAdminPB();
      const record = await adminPb.collection('users').getOne(claims.id);
      return record;
    } catch {
      // As a last resort, return the JWT claims so logged-in checks still work.
      // Note: claims do NOT include role, so role-guarded routes will reject.
      return claims;
    }
  }
}

export function getUserSync(request: Request): any {
  const cookie = request.headers.get('cookie') || '';
  const match = cookie.match(/pb_auth=([^;]+)/);
  if (!match) return null;
  return decodeJwt(match[1]);
}

export async function getAdminPB() {
  const email = process.env.PB_ADMIN_EMAIL;
  const password = process.env.PB_ADMIN_PASSWORD;
  if (!email || !password) {
    throw new Error('PB_ADMIN_EMAIL and PB_ADMIN_PASSWORD environment variables must be set');
  }
  const pb = getPb();
  await pb.collection('_superusers').authWithPassword(email, password);
  return pb;
}

/**
 * Service-account PocketBase client for automated backend operations (imports,
 * feed automation). Runs with the least-privilege `service_accounts` identity
 * rather than the superuser — the superuser is reserved for maintenance.
 */
export async function getServicePB() {
  const email = process.env.SERVICE_EMAIL;
  const password = process.env.SERVICE_PASSWORD;
  if (!email || !password) {
    throw new Error('SERVICE_EMAIL and SERVICE_PASSWORD environment variables must be set');
  }
  const pb = getPb();
  await pb.collection('service_accounts').authWithPassword(email, password);
  return pb;
}

export async function getEmployerSession(request: Request) {
  const user = await getUser(request);
  if (!user) return null;
  const pb = await getAdminPB();
  try {
    const result = await pb.collection('employers').getList(1, 1, {
      filter: `user_id="${user.id}"`,
    });
    const employer = result.items[0] as any;
    if (!employer) return null;
    if (employer.blocked || employer.suspended) return null;
    return { user, employer };
  } catch {
    return null;
  }
}

export function setAuthCookie(token: string, role?: string, rememberMe = false): string {
  let maxAge: number;
  switch (role) {
    case 'admin':
    case 'superadmin':
    case 'moderator':
      maxAge = SESSION_MAX_AGE;
      break;
    case 'employer':
      maxAge = SESSION_MAX_AGE_EMPLOYER;
      break;
    default:
      maxAge = SESSION_MAX_AGE_CANDIDATE;
  }

  // Only mark cookie as Secure when the site URL is HTTPS.
  // On localhost (http://) browsers refuse to store Secure cookies, which would
  // cause an immediate redirect-loop on /admin after a successful login.
  const siteUrl = import.meta.env.SITE_URL || process.env.SITE_URL || '';
  const isHttps = siteUrl.startsWith('https://');

  const parts = [
    `pb_auth=${token}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    `Max-Age=${maxAge}`,
  ];
  if (isHttps) parts.push('Secure');
  return parts.join('; ');
}

export function clearAuthCookie(): string {
  const siteUrl = import.meta.env.SITE_URL || process.env.SITE_URL || '';
  const isHttps = siteUrl.startsWith('https://');
  const parts = [
    'pb_auth=',
    'Path=/',
    'Expires=Thu, 01 Jan 1970 00:00:00 GMT',
    'HttpOnly',
    'SameSite=Lax',
  ];
  if (isHttps) parts.push('Secure');
  return parts.join('; ');
}

type Role = 'candidate' | 'employer' | 'moderator' | 'admin' | 'superadmin';

const ROLE_HIERARCHY: Record<Role, number> = {
  candidate: 0,
  employer: 1,
  moderator: 2,
  admin: 3,
  superadmin: 4,
};

export function hasRole(user: any, requiredRole: Role): boolean {
  if (!user?.role) return false;
  const userLevel = ROLE_HIERARCHY[user.role as Role] ?? -1;
  const requiredLevel = ROLE_HIERARCHY[requiredRole];
  return userLevel >= requiredLevel;
}

export async function requireRole(request: Request, requiredRole: Role) {
  const user = await getUser(request);
  if (!user || !hasRole(user, requiredRole)) {
    return { redirect: new Response(null, { status: 302, headers: { Location: '/login' } }), user: null };
  }
  return { redirect: null, user };
}

export async function requireAdmin(request: Request) {
  return requireRole(request, 'admin');
}

/**
 * API-route variant. Returns a 401 JSON Response on auth failure
 * instead of an Astro 302 redirect (which breaks fetch() callers).
 */
export async function requireRoleApi(request: Request, requiredRole: Role) {
  const { redirect, user } = await requireRole(request, requiredRole);
  if (redirect) {
    return {
      error: new Response(
        JSON.stringify({ success: false, error: 'Authentication required. Please log in again.' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } },
      ),
      user: null,
    };
  }
  return { error: null, user };
}

export async function requireAdminApi(request: Request) {
  return requireRoleApi(request, 'admin');
}

export async function requireEmployer(request: Request) {
  return requireRole(request, 'employer');
}

export function auditLog(event: string, details: Record<string, unknown> = {}) {
  try {
    const log = JSON.stringify({
      ts: new Date().toISOString(),
      event,
      ...details,
    });
    console.log(`[AUDIT] ${log}`);
    const pb = getPb();
    pb.collection('audit_logs').create({
      event,
      details: log,
    }).catch(() => {});
  } catch {}
}
