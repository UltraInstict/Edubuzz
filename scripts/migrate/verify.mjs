#!/usr/bin/env node
/**
 * M3 post-migration verification (read-only). Targets env PB_URL.
 * Exits non-zero if any assertion fails.
 */
import { readFileSync } from 'node:fs';

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
const cfg = { ...loadEnv(process.env.ENV_PATH || '/home/edubuzz/app/.env'), ...process.env };
const BASE = cfg.PB_URL || 'http://127.0.0.1:8090';
let TOKEN = '';
const H = () => ({ 'Content-Type': 'application/json', Authorization: TOKEN });

async function api(path, opts = {}) {
  const res = await fetch(BASE + path, opts);
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(`${res.status} ${path}: ${JSON.stringify(body).slice(0, 300)}`);
  return body;
}

const results = [];
function check(name, cond, detail) {
  results.push({ name, pass: !!cond, detail });
}

async function main() {
  const auth = await api('/api/collections/_superusers/auth-with-password', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identity: cfg.PB_ADMIN_EMAIL, password: cfg.PB_ADMIN_PASSWORD }),
  });
  TOKEN = auth.token;

  const jobs = await api('/api/collections/jobs', { headers: H() });
  const fieldNames = new Set(jobs.fields.map((f) => f.name));
  for (const f of ['source_ref', 'employer_id', 'fingerprint', 'content_hash', 'salary_currency',
    'salary_period', 'closing_date', 'responsibilities', 'requirements', 'benefits', 'skills',
    'experience_level', 'education_required', 'company_website', 'ai_summary', 'ai_confidence', 'remote', 'country']) {
    check(`jobs.field.${f}`, fieldNames.has(f));
  }
  const idxNames = (jobs.indexes || []).join(' ');
  for (const idx of ['idx_jobs_slug', 'idx_jobs_source_ref', 'idx_jobs_fingerprint',
    'idx_jobs_active_expires', 'idx_jobs_category', 'idx_jobs_province', 'idx_jobs_employer']) {
    check(`jobs.index.${idx}`, idxNames.includes(idx));
  }
  check('jobs.slug.unique', /unique index `idx_jobs_slug`/i.test(idxNames));
  check('jobs.slug.required', jobs.fields.find((f) => f.name === 'slug')?.required === true);
  check('jobs.rules.tightened', jobs.createRule && jobs.createRule.includes('service_accounts'));

  // records backfilled
  const recs = await api('/api/collections/jobs/records?perPage=1000&fields=id,slug,fingerprint,content_hash,source_ref,employer_id', { headers: H() });
  const items = recs.items || [];
  check('jobs.count.preserved', items.length >= 25, { count: items.length });
  check('jobs.all.fingerprint', items.every((j) => !!j.fingerprint));
  check('jobs.all.content_hash', items.every((j) => !!j.content_hash));
  check('jobs.all.source_ref', items.every((j) => !!j.source_ref));
  const linked = items.filter((j) => !!j.employer_id).length;
  check('jobs.employer.linked', linked === items.length, { linked, total: items.length });

  // employers grew
  const emp = await api('/api/collections/employers/records?perPage=1', { headers: H() });
  check('employers.created', emp.totalItems >= 1, { count: emp.totalItems });
  const empCol = await api('/api/collections/employers', { headers: H() });
  check('employers.slug.unique', (empCol.indexes || []).join(' ').includes('idx_employers_slug'));

  // service account
  const svcCol = await api('/api/collections/service_accounts', { headers: H() }).catch(() => null);
  check('service_accounts.collection', !!svcCol);
  if (svcCol) {
    const svcRecs = await api('/api/collections/service_accounts/records?perPage=1', { headers: H() });
    check('service_accounts.record', svcRecs.totalItems >= 1, { count: svcRecs.totalItems });
  }

  // searchability (filtered query returns without error; exercises indexes)
  const search = await api(`/api/collections/jobs/records?perPage=5&filter=${encodeURIComponent('active=true')}&sort=-created`, { headers: H() });
  check('jobs.searchable', Array.isArray(search.items));

  const failed = results.filter((r) => !r.pass);
  console.log(JSON.stringify({ total: results.length, passed: results.length - failed.length, failed: failed.length, checks: results }, null, 2));
  if (failed.length) { console.error('VERIFY_FAILED'); process.exit(1); }
  console.log('VERIFY_OK');
}
main().catch((e) => { console.error('VERIFY_ERROR', e.message); process.exit(1); });
