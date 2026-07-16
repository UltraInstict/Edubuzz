import { describe, it, expect } from 'vitest';
import { runImport, runImports, contentHash } from '../pipeline/orchestrator';
import type { JobStore, ExistingJobRef } from '../pipeline/stores';
import type { DedupeSignals, RawJob, SourceAdapter } from '../types';
import { toCanonicalJob } from '../index';

// ---- Fakes -----------------------------------------------------------------

class FakeAdapter implements SourceAdapter {
  readonly strategy = 'json' as const;
  constructor(readonly key: string, private readonly raw: RawJob[]) {}
  async acquire(): Promise<RawJob[]> {
    return this.raw;
  }
}

class ThrowingAdapter implements SourceAdapter {
  readonly strategy = 'json' as const;
  readonly key = 'boom';
  async acquire(): Promise<RawJob[]> {
    throw new Error('network down');
  }
}

interface StoredRow {
  id: string;
  source: string;
  source_ref?: string;
  fingerprint?: string;
  content_hash?: string;
  data: Record<string, unknown>;
}

class FakeJobStore implements JobStore {
  rows: StoredRow[] = [];
  private seq = 0;
  createCalls = 0;
  updateCalls = 0;

  async findExisting(signals: DedupeSignals & { source: string }): Promise<ExistingJobRef | null> {
    const row = this.rows.find(
      (r) =>
        (signals.externalId && r.source === signals.source && r.source_ref === signals.externalId) ||
        (signals.fingerprint && r.fingerprint === signals.fingerprint)
    );
    if (!row) return null;
    return {
      id: row.id,
      source: row.source,
      source_ref: row.source_ref,
      fingerprint: row.fingerprint,
      contentHash: row.content_hash,
    };
  }
  async create(core: any): Promise<{ id: string }> {
    this.createCalls++;
    const id = `job${++this.seq}`;
    this.rows.push({
      id,
      source: core.source,
      source_ref: core.source_ref,
      fingerprint: core.fingerprint,
      content_hash: core.content_hash,
      data: { ...core },
    });
    return { id };
  }
  async update(id: string, core: any): Promise<void> {
    this.updateCalls++;
    const row = this.rows.find((r) => r.id === id);
    if (row) {
      row.content_hash = core.content_hash;
      row.fingerprint = core.fingerprint;
      Object.assign(row.data, core);
    }
  }
}

const goodRaw = (over: Partial<RawJob> = {}): RawJob => ({
  title: 'Software Engineer',
  company: 'Acme',
  location: 'Cape Town, Western Cape',
  descriptionHtml: '<p>A nice long description of the engineering role, well over the threshold.</p>',
  applyUrl: 'https://acme.co/apply/1',
  sourceUrl: 'https://acme.co/jobs/1',
  externalId: 'J1',
  ...over,
});

// ---- Tests -----------------------------------------------------------------

describe('runImport', () => {
  it('imports valid new jobs', async () => {
    const store = new FakeJobStore();
    const res = await runImport(new FakeAdapter('src', [goodRaw()]), { jobStore: store });
    expect(res.acquired).toBe(1);
    expect(res.imported).toBe(1);
    expect(res.updated).toBe(0);
    expect(store.rows).toHaveLength(1);
  });

  it('rejects invalid jobs and records reasons', async () => {
    const store = new FakeJobStore();
    const res = await runImport(
      new FakeAdapter('src', [
        goodRaw({ title: '', externalId: 'BAD1' }), // missing title
        goodRaw({ applyUrl: '', sourceUrl: '', externalId: 'BAD2' }), // no apply method
      ]),
      { jobStore: store }
    );
    expect(res.imported).toBe(0);
    expect(res.rejected).toBe(2);
    expect(res.rejectionBreakdown.missing_title).toBe(1);
    expect(res.rejectionBreakdown.missing_apply_method).toBe(1);
  });

  it('skips in-batch duplicates (same externalId)', async () => {
    const store = new FakeJobStore();
    const res = await runImport(
      new FakeAdapter('src', [goodRaw(), goodRaw({ title: 'Software Engineer II' })]),
      { jobStore: store }
    );
    // Same externalId J1 → second is a dup regardless of title
    expect(res.imported).toBe(1);
    expect(res.duplicates).toBe(1);
  });

  it('updates an existing job when content changed', async () => {
    const store = new FakeJobStore();
    await runImport(new FakeAdapter('src', [goodRaw()]), { jobStore: store });
    const res = await runImport(
      new FakeAdapter('src', [goodRaw({ descriptionHtml: '<p>Updated and still a sufficiently long description here.</p>' })]),
      { jobStore: store }
    );
    expect(res.updated).toBe(1);
    expect(res.imported).toBe(0);
    expect(store.updateCalls).toBe(1);
  });

  it('skips update when content is unchanged', async () => {
    const store = new FakeJobStore();
    await runImport(new FakeAdapter('src', [goodRaw()]), { jobStore: store });
    const res = await runImport(new FakeAdapter('src', [goodRaw()]), { jobStore: store });
    expect(res.updated).toBe(0);
    expect(res.duplicates).toBe(1); // unchanged → counted as duplicate/no-op
    expect(store.updateCalls).toBe(0);
  });

  it('handles adapter acquire failure gracefully', async () => {
    const store = new FakeJobStore();
    const res = await runImport(new ThrowingAdapter(), { jobStore: store });
    expect(res.acquired).toBe(0);
    expect(res.errors.length).toBe(1);
    expect(res.errors[0]).toContain('acquire failed');
  });

  it('tracks warnings for thin descriptions', async () => {
    const store = new FakeJobStore();
    const res = await runImport(
      new FakeAdapter('src', [goodRaw({ descriptionHtml: '<p>Too short</p>' })]),
      { jobStore: store }
    );
    expect(res.imported).toBe(1);
    expect(res.warnings).toBe(1);
  });
});

describe('runImports', () => {
  it('runs multiple adapters and returns one result each', async () => {
    const store = new FakeJobStore();
    const results = await runImports(
      [
        new FakeAdapter('a', [goodRaw({ externalId: 'A1' })]),
        new FakeAdapter('b', [
          goodRaw({
            externalId: 'B1',
            title: 'Registered Nurse',
            company: 'Netcare',
            location: 'Durban, KwaZulu-Natal',
            sourceUrl: 'https://b.co/1',
            applyUrl: 'https://b.co/1',
          }),
        ]),
      ],
      { jobStore: store }
    );
    expect(results).toHaveLength(2);
    expect(results[0].source).toBe('a');
    expect(results[1].source).toBe('b');
    expect(store.rows).toHaveLength(2);
  });
});

describe('contentHash', () => {
  it('is stable and changes with content', () => {
    const a = toCanonicalJob(goodRaw(), { source: 'src' });
    const b = toCanonicalJob(goodRaw(), { source: 'src' });
    const c = toCanonicalJob(goodRaw({ title: 'Different' }), { source: 'src' });
    expect(contentHash(a)).toBe(contentHash(b));
    expect(contentHash(a)).not.toBe(contentHash(c));
  });
});
