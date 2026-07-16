import { describe, it, expect } from 'vitest';
import { getPath, mapJsonRecords, parseJsonFeed } from '../adapters/jsonFeed';

describe('getPath', () => {
  const obj = { a: { b: { c: 42 } }, list: [{ x: 1 }, { x: 2 }] };
  it('reads nested dot paths', () => {
    expect(getPath(obj, 'a.b.c')).toBe(42);
    expect(getPath(obj, 'list.1.x')).toBe(2);
  });
  it('returns undefined for missing paths', () => {
    expect(getPath(obj, 'a.z')).toBeUndefined();
    expect(getPath(obj, undefined)).toBeUndefined();
    expect(getPath(null, 'a')).toBeUndefined();
  });
});

describe('mapJsonRecords', () => {
  const records = [
    {
      id: 'J1',
      position: 'Accountant',
      org: { name: 'Finance Co', site: 'https://finance.co' },
      place: 'Cape Town',
      pay: 'R30 000 pm',
      apply: 'https://finance.co/apply/1',
      type: 'Permanent',
    },
    {
      id: 'J2',
      position: 'Bookkeeper',
      org: { name: 'Ledger Ltd' },
      place: 'Durban',
      apply: 'https://ledger.co/apply/2',
    },
  ];

  const fieldMap = {
    externalId: 'id',
    title: 'position',
    company: 'org.name',
    location: 'place',
    salaryText: 'pay',
    applyUrl: 'apply',
    employmentType: 'type',
  };

  it('maps records via dot-path field map', () => {
    const jobs = mapJsonRecords(records, { fieldMap });
    expect(jobs).toHaveLength(2);
    expect(jobs[0]).toMatchObject({
      externalId: 'J1',
      title: 'Accountant',
      company: 'Finance Co',
      location: 'Cape Town',
      salaryText: 'R30 000 pm',
      applyUrl: 'https://finance.co/apply/1',
      employmentType: 'Permanent',
    });
    // applyUrl also becomes sourceUrl/externalId fallback source
    expect(jobs[1].company).toBe('Ledger Ltd');
    expect(jobs[1].sourceUrl).toBe('https://ledger.co/apply/2');
  });

  it('applies defaultCompany when company path is missing', () => {
    const jobs = mapJsonRecords([{ position: 'Temp', apply: 'https://x/1' }], {
      fieldMap: { title: 'position', applyUrl: 'apply', company: 'org.name' },
      defaultCompany: 'Agency X',
    });
    expect(jobs[0].company).toBe('Agency X');
  });

  it('returns [] for non-arrays', () => {
    // @ts-expect-error testing runtime guard
    expect(mapJsonRecords(null, { fieldMap })).toEqual([]);
  });
});

describe('parseJsonFeed', () => {
  it('reads items from a nested path', () => {
    const payload = { data: { jobs: [{ t: 'Dev', u: 'https://x/1' }] } };
    const jobs = parseJsonFeed(payload, {
      key: 'k',
      url: 'u',
      itemsPath: 'data.jobs',
      fieldMap: { title: 't', applyUrl: 'u' },
    });
    expect(jobs).toHaveLength(1);
    expect(jobs[0].title).toBe('Dev');
  });

  it('reads a root-level array when no itemsPath', () => {
    const payload = [{ t: 'Dev', u: 'https://x/1' }];
    const jobs = parseJsonFeed(payload, {
      key: 'k',
      url: 'u',
      fieldMap: { title: 't', applyUrl: 'u' },
    });
    expect(jobs).toHaveLength(1);
  });
});
