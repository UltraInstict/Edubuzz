#!/usr/bin/env node
/**
 * M3 schema migration — idempotent, reversible, logged.
 *
 * Targets the PocketBase instance at env PB_URL (so it can run against a
 * restored copy on :8091 first, then production :8090). Auths as superuser
 * (migrations are an approved superuser use). Every step logs timing + status.
 *
 * Safe/idempotent: fields/indexes/collections/records are only created when
 * absent; re-running is a no-op. No records are ever deleted.
 *
 * Env:
 *   PB_URL, PB_ADMIN_EMAIL, PB_ADMIN_PASSWORD  (superuser)
 *   SERVICE_EMAIL, SERVICE_PASSWORD            (service account to ensure)
 */
import { readFileSync } from 'node:fs';

// ---------------------------------------------------------------------------
// env
// ---------------------------------------------------------------------------
function loadEnv(path) {
  const env = {};
  try {
    for (const line of readFileSync(path, 'utf8').split('\n')) {
      const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
      if (m) env[m[1]] = m[2].trim();
    }
  } catch {}
  return env;
}
const fileEnv = loadEnv(process.env.ENV_PATH || '/home/edubuzz/app/.env');
const cfg = { ...fileEnv, ...process.env };
const BASE = cfg.PB_URL || 'http://127.0.0.1:8090';
const EMAIL = cfg.PB_ADMIN_EMAIL;
const PASS = cfg.PB_ADMIN_PASSWORD;
const SERVICE_EMAIL = cfg.SERVICE_EMAIL || 'import-service@edubuzz.local';
const SERVICE_PASSWORD = cfg.SERVICE_PASSWORD;

let TOKEN = '';
const H = () => ({ 'Content-Type': 'application/json', Authorization: TOKEN });

// ---------------------------------------------------------------------------
// logging
// ---------------------------------------------------------------------------
async function step(name, fn) {
  const t0 = Date.now();
  try {
    const info = await fn();
    console.log(JSON.stringify({ step: name, ms: Date.now() - t0, status: 'ok', info: info ?? null }));
    return info;
  } catch (e) {
    console.log(JSON.stringify({ step: name, ms: Date.now() - t0, status: 'FAIL', error: e.message }));
    throw e;
  }
}

async function api(path, opts = {}) {
  const res = await fetch(BASE + path, opts);
  const text = await res.text();
  let body;
  try { body = text ? JSON.parse(text) : {}; } catch { body = { raw: text }; }
  if (!res.ok) {
    const err = new Error(`${res.status} ${path}: ${JSON.stringify(body).slice(0, 400)}`);
    err.status = res.status;
    err.body = body;
    throw err;
  }
  return body;
}

// ---------------------------------------------------------------------------
// pure algorithms — REPLICATED verbatim from src/services/import to guarantee
// backfilled fingerprint/content_hash match values produced at import time.
// ---------------------------------------------------------------------------
function stableHash(input) {
  let h = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = (h + ((h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24))) >>> 0;
  }
  return h.toString(16).padStart(8, '0');
}
function normalizeKey(v) {
  if (!v) return '';
  return String(v).toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();
}
function slugify(v) {
  return String(v || '').toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}
const NOISE = new Set(['a','an','the','and','or','of','for','to','in','at','x2','x3','urgent','new','vacancy','position','wanted','needed','permanent','temp','temporary','fulltime','parttime']);
function canonicalTitle(title) {
  const expanded = normalizeKey(title).replace(/\bsnr\b/g, 'senior').replace(/\bjnr\b/g, 'junior')
    .replace(/\bmgr\b/g, 'manager').replace(/\bdev\b/g, 'developer').replace(/\beng\b/g, 'engineer');
  return expanded.split(' ').filter((w) => w && !NOISE.has(w) && !/^\d+$/.test(w)).join(' ').trim();
}
function fingerprintOf(job) {
  const titleKey = canonicalTitle(job.title || '');
  const employerKey = normalizeKey(job.company || '');
  const locationKey = normalizeKey([job.city, job.province].filter(Boolean).join(' '));
  return stableHash(`${employerKey}|${titleKey}|${locationKey}`);
}
function contentHashOf(j) {
  return stableHash([
    j.title || '', j.company || '', j.description || '', j.province || '', j.city || '',
    j.job_type || '', j.salary_min ?? '', j.salary_max ?? '', j.apply_url || '', j.apply_email || '', j.expires || '',
  ].join('|'));
}
const COMPANY_NOISE = /\b(pty|ltd|limited|inc|incorporated|llc|cc|proprietary|group|holdings|sa|rsa|international|intl)\b/g;
function employerMatchKey(name) {
  return normalizeKey(name).replace(COMPANY_NOISE, '').replace(/\s+/g, ' ').trim();
}

// ---------------------------------------------------------------------------
// field / index / rule helpers
// ---------------------------------------------------------------------------
const EMPLOYERS_ID = 'pbc_3677004046';

const JOBS_NEW_FIELDS = [
  { name: 'source_ref', type: 'text' },
  { name: 'employer_id', type: 'relation', collectionId: EMPLOYERS_ID, maxSelect: 1, minSelect: 0, cascadeDelete: false },
  { name: 'fingerprint', type: 'text' },
  { name: 'content_hash', type: 'text' },
  { name: 'salary_currency', type: 'text' },
  { name: 'salary_period', type: 'text' },
  { name: 'closing_date', type: 'date' },
  { name: 'responsibilities', type: 'editor' },
  { name: 'requirements', type: 'editor' },
  { name: 'benefits', type: 'editor' },
  { name: 'skills', type: 'json', maxSize: 200000 },
  { name: 'experience_level', type: 'text' },
  { name: 'education_required', type: 'text' },
  { name: 'company_website', type: 'url' },
  { name: 'ai_summary', type: 'editor' },
  { name: 'ai_confidence', type: 'number' },
  { name: 'remote', type: 'bool' },
  { name: 'country', type: 'text' },
];

const EMPLOYERS_NEW_FIELDS = [
  { name: 'website', type: 'url' },
  { name: 'province', type: 'text' },
  { name: 'city', type: 'text' },
];

async function getCollection(nameOrId) {
  return api(`/api/collections/${nameOrId}`, { headers: H() });
}

async function addMissingFields(colName, newFields) {
  const col = await getCollection(colName);
  const existing = new Set((col.fields || []).map((f) => f.name));
  const toAdd = newFields.filter((f) => !existing.has(f.name));
  if (!toAdd.length) return { added: [], already: [...existing].length };
  const fields = [...col.fields, ...toAdd];
  await api(`/api/collections/${col.id}`, { method: 'PATCH', headers: H(), body: JSON.stringify({ fields }) });
  return { added: toAdd.map((f) => f.name) };
}

async function setFieldRequired(colName, fieldName, required) {
  const col = await getCollection(colName);
  const fields = col.fields.map((f) => (f.name === fieldName ? { ...f, required } : f));
  const cur = col.fields.find((f) => f.name === fieldName);
  if (!cur || cur.required === required) return { changed: false };
  await api(`/api/collections/${col.id}`, { method: 'PATCH', headers: H(), body: JSON.stringify({ fields }) });
  return { changed: true };
}

async function ensureIndexes(colName, wanted) {
  const col = await getCollection(colName);
  const have = new Set((col.indexes || []).map((s) => s.toLowerCase()));
  const haveNames = (col.indexes || []).map((s) => (s.match(/index\s+`?([a-z0-9_]+)`?/i) || [])[1]).filter(Boolean);
  const add = wanted.filter((w) => !haveNames.includes(w.name));
  if (!add.length) return { added: [] };
  const indexes = [...(col.indexes || []), ...add.map((w) => w.sql)];
  await api(`/api/collections/${col.id}`, { method: 'PATCH', headers: H(), body: JSON.stringify({ indexes }) });
  return { added: add.map((w) => w.name) };
}

async function renameField(colName, from, to) {
  const col = await getCollection(colName);
  const has = col.fields.find((f) => f.name === from);
  const already = col.fields.find((f) => f.name === to);
  if (!has || already) return { renamed: false };
  const fields = col.fields.map((f) => (f.name === from ? { ...f, name: to } : f));
  await api(`/api/collections/${col.id}`, { method: 'PATCH', headers: H(), body: JSON.stringify({ fields }) });
  return { renamed: true, from, to };
}

async function setRules(colName, rules) {
  const col = await getCollection(colName);
  await api(`/api/collections/${col.id}`, { method: 'PATCH', headers: H(), body: JSON.stringify(rules) });
  return rules;
}

// ---------------------------------------------------------------------------
// main
// ---------------------------------------------------------------------------
async function main() {
  console.log(JSON.stringify({ migration: 'M3', target: BASE, startedAt: new Date().toISOString() }));

  await step('auth-superuser', async () => {
    const j = await api('/api/collections/_superusers/auth-with-password', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identity: EMAIL, password: PASS }),
    });
    TOKEN = j.token;
    return { authed: true };
  });

  await step('jobs.addFields', () => addMissingFields('jobs', JOBS_NEW_FIELDS));
  await step('employers.addFields', () => addMissingFields('employers', EMPLOYERS_NEW_FIELDS));

  // service account collection + record
  await step('ensure.service_accounts.collection', async () => {
    try {
      await getCollection('service_accounts');
      return { existed: true };
    } catch (e) {
      if (e.status !== 404) throw e;
      await api('/api/collections', {
        method: 'POST', headers: H(),
        body: JSON.stringify({
          name: 'service_accounts', type: 'auth',
          fields: [{ name: 'label', type: 'text', required: false }],
          listRule: null, viewRule: null, createRule: null, updateRule: null, deleteRule: null,
        }),
      });
      return { created: true };
    }
  });

  await step('ensure.service_account.record', async () => {
    if (!SERVICE_PASSWORD) throw new Error('SERVICE_PASSWORD not provided');
    try {
      await api(`/api/collections/service_accounts/records?perPage=1&filter=${encodeURIComponent(`email="${SERVICE_EMAIL}"`)}`, { headers: H() })
        .then((r) => { if (r.totalItems > 0) throw { __exists: true }; });
    } catch (e) {
      if (e && e.__exists) return { existed: true };
    }
    // create
    try {
      await api('/api/collections/service_accounts/records', {
        method: 'POST', headers: H(),
        body: JSON.stringify({
          email: SERVICE_EMAIL, password: SERVICE_PASSWORD, passwordConfirm: SERVICE_PASSWORD,
          verified: true, label: 'import-automation',
        }),
      });
      return { created: true, email: SERVICE_EMAIL };
    } catch (e) {
      // if it already exists (unique email), treat as ok
      if (String(e.message).includes('email') && e.status === 400) return { existed: true };
      throw e;
    }
  });

  // ---- backfill -----------------------------------------------------------
  await step('backfill.jobs', async () => {
    const all = await api('/api/collections/jobs/records?perPage=1000', { headers: H() });
    const items = all.items || [];

    // preload employers → matchKey map
    const empRes = await api('/api/collections/employers/records?perPage=1000', { headers: H() });
    const empByKey = new Map();
    const usedSlugs = new Set();
    for (const e of empRes.items || []) {
      empByKey.set(employerMatchKey(e.company_name), e);
      usedSlugs.add(e.company_slug);
    }

    const collisionLog = [];
    let updated = 0, employersCreated = 0, linked = 0;

    for (const j of items) {
      const patch = {};

      // source_ref: ensure non-empty + unique-per-source (use id when missing)
      if (!j.source_ref) patch.source_ref = j.id;

      // fingerprint + content_hash
      const fp = fingerprintOf(j);
      if (j.fingerprint !== fp) patch.fingerprint = fp;
      const ch = contentHashOf(j);
      if (j.content_hash !== ch) patch.content_hash = ch;

      // employer resolution + link
      if (!j.employer_id && j.company) {
        const key = employerMatchKey(j.company);
        let emp = empByKey.get(key);
        if (!emp) {
          let slug = slugify(j.company);
          let n = 2;
          while (usedSlugs.has(slug)) { slug = `${slugify(j.company)}-${n++}`; if (slug !== slugify(j.company)) collisionLog.push({ company: j.company, slug }); }
          emp = await api('/api/collections/employers/records', {
            method: 'POST', headers: H(),
            body: JSON.stringify({
              company_name: j.company, company_slug: slug,
              contact_email: 'no-reply@edubuzz.local', // required system field for auto-created stubs
              province: j.province || '', city: j.city || '',
            }),
          });
          empByKey.set(key, emp);
          usedSlugs.add(slug);
          employersCreated++;
        }
        patch.employer_id = emp.id;
        linked++;
      }

      if (Object.keys(patch).length) {
        await api(`/api/collections/jobs/records/${j.id}`, { method: 'PATCH', headers: H(), body: JSON.stringify(patch) });
        updated++;
      }
    }
    return { jobs: items.length, updated, employersCreated, linked, slugCollisions: collisionLog };
  });

  // ---- slug required + indexes (AFTER backfill) ---------------------------
  await step('jobs.slug.required', () => setFieldRequired('jobs', 'slug', true));

  await step('jobs.indexes', () =>
    ensureIndexes('jobs', [
      { name: 'idx_jobs_slug', sql: 'CREATE UNIQUE INDEX `idx_jobs_slug` ON `jobs` (`slug`)' },
      { name: 'idx_jobs_source_ref', sql: 'CREATE INDEX `idx_jobs_source_ref` ON `jobs` (`source`,`source_ref`)' },
      { name: 'idx_jobs_fingerprint', sql: 'CREATE INDEX `idx_jobs_fingerprint` ON `jobs` (`fingerprint`)' },
      { name: 'idx_jobs_active_expires', sql: 'CREATE INDEX `idx_jobs_active_expires` ON `jobs` (`active`,`expires`)' },
      { name: 'idx_jobs_category', sql: 'CREATE INDEX `idx_jobs_category` ON `jobs` (`category`)' },
      { name: 'idx_jobs_province', sql: 'CREATE INDEX `idx_jobs_province` ON `jobs` (`province`)' },
      { name: 'idx_jobs_employer', sql: 'CREATE INDEX `idx_jobs_employer` ON `jobs` (`employer_id`)' },
    ])
  );

  await step('employers.indexes', () =>
    ensureIndexes('employers', [
      { name: 'idx_employers_slug', sql: 'CREATE UNIQUE INDEX `idx_employers_slug` ON `employers` (`company_slug`)' },
    ])
  );

  // ---- pending_jobs field name fix ---------------------------------------
  await step('pending_jobs.renameSalary', async () => {
    const a = await renameField('pending_jobs', 'Salary_min', 'salary_min');
    const b = await renameField('pending_jobs', 'Salary_max', 'salary_max');
    return { a, b };
  });

  // ---- admin_settings unique key -----------------------------------------
  await step('admin_settings.keyIndex', async () => {
    const col = await getCollection('admin_settings');
    const hasKey = (col.fields || []).some((f) => f.name === 'key');
    if (!hasKey) return { skipped: 'no key field' };
    return ensureIndexes('admin_settings', [
      { name: 'idx_admin_settings_key', sql: 'CREATE UNIQUE INDEX `idx_admin_settings_key` ON `admin_settings` (`key`)' },
    ]);
  });

  // ---- tighten write rules (superusers always bypass) --------------------
  const SVC = '@request.auth.collectionName = "service_accounts"';
  await step('jobs.rules', () => setRules('jobs', { createRule: SVC, updateRule: SVC, deleteRule: SVC }));
  await step('employers.rules', () => setRules('employers', { createRule: SVC, updateRule: SVC }));
  await step('audit_logs.rules', async () => {
    try { return await setRules('audit_logs', { createRule: SVC }); }
    catch (e) { if (e.status === 404) return { skipped: 'no audit_logs' }; throw e; }
  });

  console.log(JSON.stringify({ migration: 'M3', status: 'COMPLETE', finishedAt: new Date().toISOString() }));
}

main().catch((e) => { console.error('MIGRATION_ABORTED', e.message); process.exit(1); });
