import { describe, it, expect } from 'vitest';
import { runImport } from '../pipeline/orchestrator';
import type { JobStore, ExistingJobRef } from '../pipeline/stores';
import type { DedupeSignals, RawJob, SourceAdapter } from '../types';

class FakeAdapter implements SourceAdapter {
  readonly strategy = 'json' as const;
  constructor(readonly key: string, private readonly raw: RawJob[]) {}
  async acquire(): Promise<RawJob[]> {
    return this.raw;
  }
}

interface Row { id: string; source: string; source_ref?: string; active: boolean; content_hash?: string }

/** Fake store that supports expireMissing so we can test the sweep. */
class ExpiringStore implements JobStore {
  rows: Row[] = [];
  private seq = 0;
  async findExisting(signals: DedupeSignals & { source: string }): Promise<ExistingJobRef | null> {
    const r = this.rows.find(
      (x) => x.active && signals.externalId && x.source === signals.source && x.source_ref === signals.externalId
    );
    return r ? { id: r.id, source: r.source, source_ref: r.source_ref, contentHash: r.content_hash } : null;
  }
  async create(core: any): Promise<{ id: string }> {
    const id = `j${++this.seq}`;
    this.rows.push({ id, source: core.source, source_ref: core.source_ref, active: true, content_hash: core.content_hash });
    return { id };
  }
  async update(id: string, core: any): Promise<void> {
    const r = this.rows.find((x) => x.id === id);
    if (r) r.content_hash = core.content_hash;
  }
  async expireMissing(source: string, seenRefs: Set<string>): Promise<number> {
    let n = 0;
    for (const r of this.rows) {
      if (r.source !== source || !r.active) continue;
      if (r.source_ref && seenRefs.has(r.source_ref)) continue;
      r.active = false;
      n++;
    }
    return n;
  }
}

/** Two genuinely distinct jobs (different title/company/location) so neither is a dup. */
const jobA: RawJob = {
  title: 'Registered Nurse',
  company: 'Netcare',
  location: 'Durban, KwaZulu-Natal',
  descriptionHtml: '<p>A nice long description of the nursing role, well over the minimum threshold length.</p>',
  applyUrl: 'https://netcare.co.za/apply/A',
  sourceUrl: 'https://netcare.co.za/jobs/A',
  externalId: 'A',
};
const jobB: RawJob = {
  title: 'Software Developer',
  company: 'Takealot',
  location: 'Cape Town, Western Cape',
  descriptionHtml: '<p>A nice long description of the engineering role, well over the minimum threshold length.</p>',
  applyUrl: 'https://takealot.com/apply/B',
  sourceUrl: 'https://takealot.com/jobs/B',
  externalId: 'B',
};

describe('expireMissing', () => {
  it('deactivates listings that disappeared from the source', async () => {
    const store = new ExpiringStore();
    // Run 1: two distinct jobs present.
    await runImport(new FakeAdapter('src', [jobA, jobB]), { jobStore: store, expireMissing: true });
    expect(store.rows.filter((r) => r.active)).toHaveLength(2);

    // Run 2: only A remains → B must be expired (deactivated, not deleted).
    const res = await runImport(new FakeAdapter('src', [jobA]), { jobStore: store, expireMissing: true });
    expect(res.expired).toBe(1);
    const active = store.rows.filter((r) => r.active).map((r) => r.source_ref);
    expect(active).toEqual(['A']);
    expect(store.rows).toHaveLength(2); // nothing deleted
  });

  it('does NOT expire anything when the fetch returns zero jobs (safety guard)', async () => {
    const store = new ExpiringStore();
    await runImport(new FakeAdapter('src', [jobA]), { jobStore: store, expireMissing: true });
    const res = await runImport(new FakeAdapter('src', []), { jobStore: store, expireMissing: true });
    expect(res.expired).toBe(0);
    expect(store.rows.filter((r) => r.active)).toHaveLength(1);
  });

  it('is a no-op when expireMissing option is off', async () => {
    const store = new ExpiringStore();
    await runImport(new FakeAdapter('src', [jobA, jobB]), { jobStore: store });
    const res = await runImport(new FakeAdapter('src', [jobA]), { jobStore: store });
    expect(res.expired).toBe(0);
    expect(store.rows.filter((r) => r.active)).toHaveLength(2);
  });
});
