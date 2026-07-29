import { describe, it, expect } from 'vitest';
import {
  probeCareersPage,
  candidateFromProbe,
  buildImportQueue,
  verifiedAdapters,
  libraryStats,
} from '../discovery';
import { SOURCE_LIBRARY_SEED } from '../sourceLibrary.seed';
import { defineSource } from '../sourceLibrary';

const SA_CAREERS_HTML = `
<html><body>
  <h1>Careers at Acme South Africa</h1>
  <ul>
    <li><a href="/jobs/engineer">Software Engineer vacancy</a></li>
    <li><a href="/jobs/analyst">Data Analyst position</a></li>
    <li><a href="/about">About us</a></li>
  </ul>
  <p>Head office: Johannesburg, Gauteng, South Africa</p>
</body></html>`;

describe('probeCareersPage', () => {
  it('detects ATS, counts vacancy links and SA signals', () => {
    const probe = probeCareersPage('https://boards.greenhouse.io/acme', SA_CAREERS_HTML);
    expect(probe.ats_type).toBe('greenhouse');
    expect(probe.likelyJobLinks).toBeGreaterThanOrEqual(2);
    expect(probe.hasVacancies).toBe(true);
    expect(probe.looksSouthAfrican).toBe(true);
    expect(probe.saSignals).toContain('south africa');
  });

  it('flags a competing job board URL', () => {
    const probe = probeCareersPage('https://www.pnet.co.za/jobs', SA_CAREERS_HTML);
    expect(probe.isJobBoard).toBe(true);
  });

  it('recognises a .co.za TLD as an SA signal even without body text', () => {
    const probe = probeCareersPage('https://acme.co.za/careers', '<html></html>');
    expect(probe.saSignals).toContain('tld:.za');
    expect(probe.looksSouthAfrican).toBe(true);
  });
});

describe('candidateFromProbe', () => {
  it('proposes pending (never verified) for a valid SA careers page', () => {
    const probe = probeCareersPage('https://acme.co.za/careers', SA_CAREERS_HTML);
    const c = candidateFromProbe(probe, { company_name: 'Acme', industry: 'technology', province: 'Gauteng' });
    expect(c.decision).toBe('pending');
    expect(c.entry.verification_status).toBe('pending');
    expect(c.entry.last_checked_at).toBeTruthy();
  });

  it('rejects a job-board URL', () => {
    const probe = probeCareersPage('https://www.indeed.co.za/jobs', SA_CAREERS_HTML);
    const c = candidateFromProbe(probe, { company_name: 'Whoever' });
    expect(c.decision).toBe('rejected');
    expect(c.reason).toBe('job_board_url');
  });

  it('rejects a page with no SA signals', () => {
    const probe = probeCareersPage('https://acme.com/careers', '<html><body>London office hiring</body></html>');
    const c = candidateFromProbe(probe, { company_name: 'Acme' });
    expect(c.decision).toBe('rejected');
    expect(c.reason).toBe('not_south_african');
  });
});

describe('import queue over the seed library', () => {
  it('marks verified+connector entries runnable and holds everything else', () => {
    const queue = buildImportQueue(SOURCE_LIBRARY_SEED);
    const runnable = queue.filter((q) => q.runnable);
    // Only 'verified' seed rows are runnable.
    const verifiedCount = SOURCE_LIBRARY_SEED.filter((s) => s.verification_status === 'verified').length;
    expect(runnable.length).toBe(verifiedCount);
    expect(runnable.every((q) => q.entry.verification_status === 'verified')).toBe(true);
    // Runnable entries sort first.
    expect(queue[0].runnable).toBe(true);
  });

  it('never runs a pending entry', () => {
    const queue = buildImportQueue(SOURCE_LIBRARY_SEED);
    const pendingRun = queue.find((q) => q.entry.verification_status === 'pending' && q.runnable);
    expect(pendingRun).toBeUndefined();
  });

  it('builds real adapters for verified entries', () => {
    const adapters = verifiedAdapters(SOURCE_LIBRARY_SEED);
    expect(adapters.length).toBeGreaterThan(0);
    expect(adapters.every((a) => typeof a.acquire === 'function')).toBe(true);
  });

  it('wires an html-connector entry to the HTML adapter', () => {
    const lib = [
      defineSource({
        id: 'demo',
        company_name: 'Demo Co',
        website: 'https://demo.co.za',
        careers_url: 'https://demo.co.za/careers',
        industry: 'technology',
        province: 'Gauteng',
        verification_status: 'verified',
        connector: 'html',
        selectors: { list: '.job', title: '.t', applyUrl: 'a' },
      }),
    ];
    const adapters = verifiedAdapters(lib);
    expect(adapters).toHaveLength(1);
    expect(adapters[0].key).toBe('html:demo');
  });
});

describe('libraryStats', () => {
  it('aggregates the seed library by status/industry/ats/province', () => {
    const stats = libraryStats(SOURCE_LIBRARY_SEED);
    expect(stats.total).toBe(SOURCE_LIBRARY_SEED.length);
    expect(stats.byStatus.verified).toBeGreaterThan(0);
    expect(stats.byStatus.pending).toBeGreaterThan(0);
    expect(stats.verifiedRunnable).toBe(stats.byStatus.verified);
    expect(Object.keys(stats.byIndustry).length).toBeGreaterThan(5);
  });
});
