import { describe, it, expect } from 'vitest';
import { parseCsv, mapCsvRows } from '../adapters/csv';

describe('parseCsv', () => {
  it('parses simple rows', () => {
    expect(parseCsv('a,b,c\n1,2,3')).toEqual([
      ['a', 'b', 'c'],
      ['1', '2', '3'],
    ]);
  });

  it('handles quoted fields with embedded commas and newlines', () => {
    const csv = 'title,desc\n"Engineer, Senior","Line1\nLine2"';
    expect(parseCsv(csv)).toEqual([
      ['title', 'desc'],
      ['Engineer, Senior', 'Line1\nLine2'],
    ]);
  });

  it('handles escaped double quotes', () => {
    const csv = 'a\n"She said ""hi"""';
    expect(parseCsv(csv)).toEqual([['a'], ['She said "hi"']]);
  });

  it('handles CRLF line endings', () => {
    expect(parseCsv('a,b\r\n1,2\r\n')).toEqual([
      ['a', 'b'],
      ['1', '2'],
    ]);
  });

  it('supports custom delimiter', () => {
    expect(parseCsv('a;b\n1;2', ';')).toEqual([
      ['a', 'b'],
      ['1', '2'],
    ]);
  });
});

describe('mapCsvRows', () => {
  const csv = [
    'ref,job_title,employer,city,salary_min,salary_max,url,jtype',
    'A1,Welder,Acme Steel,Vereeniging,12000,18000,https://acme/1,Contract',
    'A2,Fitter,Acme Steel,Vereeniging,,,https://acme/2,',
  ].join('\n');

  const fieldMap = {
    externalId: 'ref',
    title: 'job_title',
    company: 'employer',
    city: 'city',
    salaryMin: 'salary_min',
    salaryMax: 'salary_max',
    applyUrl: 'url',
    employmentType: 'jtype',
  };

  it('maps rows using the header→field map', () => {
    const rows = parseCsv(csv);
    const jobs = mapCsvRows(rows, { fieldMap });
    expect(jobs).toHaveLength(2);
    expect(jobs[0]).toMatchObject({
      externalId: 'A1',
      title: 'Welder',
      company: 'Acme Steel',
      city: 'Vereeniging',
      salaryMin: 12000,
      salaryMax: 18000,
      applyUrl: 'https://acme/1',
      employmentType: 'Contract',
    });
  });

  it('leaves blank numeric/text cells undefined', () => {
    const rows = parseCsv(csv);
    const jobs = mapCsvRows(rows, { fieldMap });
    expect(jobs[1].salaryMin).toBeUndefined();
    expect(jobs[1].salaryMax).toBeUndefined();
    expect(jobs[1].employmentType).toBeUndefined();
  });

  it('returns [] when only a header row is present', () => {
    expect(mapCsvRows(parseCsv('a,b,c'), { fieldMap })).toEqual([]);
  });
});
