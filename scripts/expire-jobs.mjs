#!/usr/bin/env node
/**
 * expire-jobs.mjs — deactivate jobs whose `expires` date has passed.
 *
 * Self-contained (no app server needed): authenticates to PocketBase as a
 * superuser and sets active=false on every active job with expires < now.
 * Intended to run from cron. Safe to run repeatedly (idempotent).
 *
 * Env (from /home/edubuzz/app/.env):
 *   PB_URL, PB_ADMIN_EMAIL, PB_ADMIN_PASSWORD
 *
 * Usage:
 *   cd /home/edubuzz/app && set -a && . ./.env && set +a && node scripts/expire-jobs.mjs
 */

const PB_URL = process.env.PB_URL || 'http://127.0.0.1:8090';
const EMAIL = process.env.PB_ADMIN_EMAIL;
const PASSWORD = process.env.PB_ADMIN_PASSWORD;

function log(msg) {
  console.log(`[expire-jobs ${new Date().toISOString()}] ${msg}`);
}

async function main() {
  if (!EMAIL || !PASSWORD) {
    console.error('[expire-jobs] Missing PB_ADMIN_EMAIL / PB_ADMIN_PASSWORD in env.');
    process.exit(1);
  }

  // 1. Authenticate as superuser (PocketBase v0.23+ / v0.37 endpoint).
  const authRes = await fetch(`${PB_URL}/api/collections/_superusers/auth-with-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identity: EMAIL, password: PASSWORD }),
  });
  if (!authRes.ok) {
    console.error(`[expire-jobs] Auth failed: HTTP ${authRes.status}`);
    process.exit(1);
  }
  const { token } = await authRes.json();
  const authHeaders = { Authorization: token, 'Content-Type': 'application/json' };

  // 2. Fetch all active, expired jobs (paginated).
  const nowIso = new Date().toISOString();
  const filter = encodeURIComponent(`active=true && expires<"${nowIso}"`);
  let page = 1;
  const expired = [];
  for (;;) {
    const res = await fetch(
      `${PB_URL}/api/collections/jobs/records?perPage=200&page=${page}&filter=${filter}&fields=id,slug`,
      { headers: authHeaders },
    );
    if (!res.ok) {
      console.error(`[expire-jobs] List failed: HTTP ${res.status}`);
      process.exit(1);
    }
    const data = await res.json();
    expired.push(...(data.items || []));
    if (page >= (data.totalPages || 1)) break;
    page++;
  }

  if (expired.length === 0) {
    log('No expired jobs to deactivate. Done.');
    return;
  }

  // 3. Deactivate each.
  let count = 0;
  for (const job of expired) {
    const res = await fetch(`${PB_URL}/api/collections/jobs/records/${job.id}`, {
      method: 'PATCH',
      headers: authHeaders,
      body: JSON.stringify({ active: false }),
    });
    if (res.ok) count++;
    else console.error(`[expire-jobs] Failed to deactivate ${job.id}: HTTP ${res.status}`);
  }

  log(`Deactivated ${count}/${expired.length} expired jobs.`);
}

main().catch((err) => {
  console.error('[expire-jobs] Fatal:', err?.message || err);
  process.exit(1);
});
