import PocketBase from 'pocketbase';

export function getPb() {
  return new PocketBase(import.meta.env.PB_URL ?? 'http://127.0.0.1:8090');
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
    // base64url -> base64 with proper padding
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const pad = base64.length % 4;
    const padded = pad ? base64 + '='.repeat(4 - pad) : base64;
    const json = atob(padded);
    const data = JSON.parse(json);
    // check expiration ourselves (PocketBase uses seconds)
    if (data.exp && data.exp * 1000 < Date.now()) return null;
    return data;
  } catch { return null; }
}

export function getUser(request: Request) {
  const cookie = request.headers.get('cookie') || '';
  const match = cookie.match(/pb_auth=([^;]+)/);
  if (!match) return null;
  return decodeJwt(match[1]);
}

export async function getAdminPB() {
  const pb = getPb();
  await pb.admins.authWithPassword(
    import.meta.env.PB_ADMIN_EMAIL ?? 'admin@edubuzz.co.za',
    import.meta.env.PB_ADMIN_PASSWORD ?? ''
  );
  return pb;
}

export async function getEmployerSession(request: Request) {
  const user = getUser(request);
  if (!user) return null;
  const pb = getPb();
  const token = request.headers.get('cookie')?.match(/pb_auth=([^;]+)/)?.[1];
  if (!token) return null;
  pb.authStore.save(token, null);
  const result = await pb.collection('employers').getList(1, 1, {
    filter: `user_id="${user.id}"`,
  });
  const employer = result.items[0] as any;
  if (!employer) return null;
  return { user, employer };
}

export function clearAuthCookie(): string {
  return 'pb_auth=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; SameSite=Lax';
}

export function requireAdmin(request: Request) {
  const user = getUser(request);
  if (!user || user.role !== 'admin') {
    return { redirect: new Response(null, { status: 302, headers: { Location: '/login' } }) };
  }
  return { redirect: null };
}
