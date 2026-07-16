import { describe, it, expect } from 'vitest';
import {
  EmployerResolver,
  employerMatchKey,
  employerSlug,
} from '../pipeline/employerResolver';
import type { EmployerRef, EmployerStore } from '../pipeline/stores';
import { toCanonicalJob } from '../index';
import type { CanonicalJob } from '../types';

function job(company: string, extra: Partial<CanonicalJob['enrichment']> = {}): CanonicalJob {
  const j = toCanonicalJob(
    {
      title: 'Role',
      company,
      location: 'Cape Town, Western Cape',
      descriptionHtml: '<p>A sufficiently long description for the role here.</p>',
      applyUrl: 'https://x.co/apply/1',
      sourceUrl: 'https://x.co/jobs/1',
    },
    { source: 'test' }
  );
  j.enrichment = { ...j.enrichment, ...extra };
  return j;
}

class FakeEmployerStore implements EmployerStore {
  records: EmployerRef[] = [];
  createCalls = 0;
  updateCalls = 0;
  async findByNameOrSlug(name: string, slug: string): Promise<EmployerRef | null> {
    return (
      this.records.find(
        (r) => r.company_slug === slug || r.company_name === name
      ) || null
    );
  }
  async create(data: any): Promise<EmployerRef> {
    this.createCalls++;
    const ref: EmployerRef = { id: `emp${this.records.length + 1}`, ...data };
    this.records.push(ref);
    return ref;
  }
  async update(id: string, patch: any): Promise<void> {
    this.updateCalls++;
    const r = this.records.find((x) => x.id === id);
    if (r) Object.assign(r, patch);
  }
}

describe('employerMatchKey / employerSlug', () => {
  it('strips company suffixes and normalizes', () => {
    expect(employerMatchKey('Acme (Pty) Ltd')).toBe('acme');
    expect(employerMatchKey('ACME Pty Ltd')).toBe('acme');
    expect(employerMatchKey('Acme Holdings')).toBe('acme');
  });
  it('slugs company names', () => {
    expect(employerSlug('Acme Pty Ltd')).toBe('acme-pty-ltd');
  });
});

describe('EmployerResolver', () => {
  it('creates a new employer when none exists', async () => {
    const store = new FakeEmployerStore();
    const r = new EmployerResolver(store);
    const res = await r.resolve(job('Acme Pty Ltd'));
    expect(res?.created).toBe(true);
    expect(store.createCalls).toBe(1);
    expect(res?.employer.company_slug).toBe('acme-pty-ltd');
  });

  it('reuses an existing employer (name/slug match)', async () => {
    const store = new FakeEmployerStore();
    const r = new EmployerResolver(store);
    await r.resolve(job('Acme Pty Ltd'));
    const res2 = await r.resolve(job('Acme Pty Ltd'));
    expect(res2?.created).toBe(false);
    expect(store.createCalls).toBe(1);
  });

  it('caches within a run to avoid repeat store hits', async () => {
    const store = new FakeEmployerStore();
    let finds = 0;
    const orig = store.findByNameOrSlug.bind(store);
    store.findByNameOrSlug = async (n, s) => {
      finds++;
      return orig(n, s);
    };
    const r = new EmployerResolver(store);
    await r.resolve(job('Acme Pty Ltd'));
    await r.resolve(job('Acme Pty Ltd'));
    await r.resolve(job('Acme Pty Ltd'));
    expect(finds).toBe(1); // subsequent calls hit the in-run cache
  });

  it('backfills missing website/location on an existing employer', async () => {
    const store = new FakeEmployerStore();
    store.records.push({
      id: 'emp1',
      company_name: 'Acme Pty Ltd',
      company_slug: 'acme-pty-ltd',
    });
    const r = new EmployerResolver(store);
    const res = await r.resolve(job('Acme Pty Ltd', { company_website: 'https://acme.co' }));
    expect(res?.updated).toBe(true);
    expect(store.updateCalls).toBe(1);
    expect(store.records[0].website).toBe('https://acme.co');
  });

  it('returns null for a job with no company', async () => {
    const store = new FakeEmployerStore();
    const r = new EmployerResolver(store);
    const j = job('');
    j.core.company = '';
    expect(await r.resolve(j)).toBeNull();
  });
});
