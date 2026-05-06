import PocketBase from 'pocketbase';

export function getPb() {
  return new PocketBase(import.meta.env.PB_URL ?? 'http://127.0.0.1:8090');
}

export function getUser(request: Request) {
  const token = request.headers.get('cookie')?.match(/pb_auth=([^;]+)/)?.[1];
  if (!token) return null;
  try {
    const pb = getPb();
    pb.authStore.save(token, null);
    return pb.authStore.isValid ? pb.authStore.model : null;
  } catch { return null; }
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
    filter: \`user_id="\${user.id}"\`,
  });
  const employer = result.items[0] as any;
  if (!employer) return null;
  return { user, employer };
}

export function requireAdmin(request: Request) {
  const user = getUser(request);
  if (!user || user.role !== 'admin') {
    return { redirect: new Response(null, { status: 302, headers: { Location: '/login' } }) };
  }
  return { redirect: null };
}
