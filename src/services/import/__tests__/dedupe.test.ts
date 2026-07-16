import { describe, it, expect } from 'vitest';
import {
  stableHash,
  buildDedupeSignals,
  duplicateMatch,
  normalizeUrl,
  titleSimilarity,
} from '../dedupe';
import { toCanonicalJob } from '../index';
import type { CanonicalJob, RawJob } from '../types';

function canon(raw: RawJob): CanonicalJob {
  return toCanonicalJob(raw, { source: 'rss:test' });
}

const base: RawJob = {
  title: 'Senior Software Engineer',
  company: 'Acme Corp',
  location: 'Johannesburg, Gauteng',
  descriptionHtml: '<p>Great role building things for a long enough description here.</p>',
  applyUrl: 'https://acme.com/apply/123',
  sourceUrl: 'https://acme.com/jobs/123',
  externalId: 'JOB-123',
};

describe('stableHash', () => {
  it('is deterministic', () => {
    expect(stableHash('hello')).toBe(stableHash('hello'));
  });
  it('differs for different input', () => {
    expect(stableHash('a')).not.toBe(stableHash('b'));
  });
});

describe('buildDedupeSignals', () => {
  it('builds normalized keys and a fingerprint', () => {
    const sig = buildDedupeSignals(canon(base));
    expect(sig.employerKey).toBe('acme corp');
    expect(sig.titleKey).toContain('senior');
    expect(sig.fingerprint).toMatch(/^[0-9a-f]{8}$/);
    expect(sig.externalId).toBe('JOB-123');
  });

  it('produces identical fingerprints for equivalent jobs', () => {
    const a = buildDedupeSignals(canon(base));
    const b = buildDedupeSignals(
      canon({ ...base, title: 'Snr Software Engineer', externalId: 'DIFF', sourceUrl: 'https://x/y' })
    );
    expect(a.fingerprint).toBe(b.fingerprint);
  });
});

describe('normalizeUrl', () => {
  it('strips protocol, www, query, trailing slash', () => {
    expect(normalizeUrl('https://www.Acme.com/jobs/1/?ref=x#top')).toBe('acme.com/jobs/1');
  });
});

describe('titleSimilarity', () => {
  it('is 1 for identical, 0 for empty', () => {
    expect(titleSimilarity('a b c', 'a b c')).toBe(1);
    expect(titleSimilarity('', 'x')).toBe(0);
  });
  it('scores partial overlap between 0 and 1', () => {
    const s = titleSimilarity('senior software engineer', 'software engineer');
    expect(s).toBeGreaterThan(0.5);
    expect(s).toBeLessThan(1);
  });
});

describe('duplicateMatch', () => {
  it('matches on external id first', () => {
    const a = buildDedupeSignals(canon(base));
    const b = buildDedupeSignals(canon({ ...base, sourceUrl: 'https://other/z' }));
    expect(duplicateMatch(a, b)).toBe('external_id');
  });

  it('matches on source url when ids differ', () => {
    const a = buildDedupeSignals(canon({ ...base, externalId: 'A' }));
    const b = buildDedupeSignals(canon({ ...base, externalId: 'B' }));
    // same sourceUrl → still a dup via url (external ids differ)
    expect(duplicateMatch(a, b)).toBe('source_url');
  });

  it('matches on fingerprint when urls and ids differ', () => {
    const a = buildDedupeSignals(canon({ ...base, externalId: 'A', sourceUrl: 'https://a/1' }));
    const b = buildDedupeSignals(canon({ ...base, externalId: 'B', sourceUrl: 'https://b/2', title: 'Snr Software Engineer' }));
    expect(duplicateMatch(a, b)).toBe('fingerprint');
  });

  it('returns null for genuinely different jobs', () => {
    const a = buildDedupeSignals(canon(base));
    const b = buildDedupeSignals(
      canon({
        title: 'Registered Nurse',
        company: 'Netcare',
        location: 'Cape Town, Western Cape',
        descriptionHtml: '<p>A completely different role in healthcare with enough text.</p>',
        applyUrl: 'https://netcare.com/apply/9',
        sourceUrl: 'https://netcare.com/jobs/9',
        externalId: 'NUR-9',
      })
    );
    expect(duplicateMatch(a, b)).toBeNull();
  });

  it('matches near-duplicate via similarity when title word-order differs', () => {
    // Same employer + location; titles are token-identical but re-ordered, so
    // the ordered fingerprint differs while set-based similarity is 1.0.
    const a = buildDedupeSignals(
      canon({ ...base, title: 'Registered Nurse ICU', externalId: 'A', sourceUrl: 'https://a/1' })
    );
    const b = buildDedupeSignals(
      canon({ ...base, title: 'ICU Registered Nurse', externalId: 'B', sourceUrl: 'https://b/2' })
    );
    expect(a.fingerprint).not.toBe(b.fingerprint);
    expect(duplicateMatch(a, b)).toBe('similarity');
  });
});
