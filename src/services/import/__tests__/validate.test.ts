import { describe, it, expect } from 'vitest';
import { validateJob, describeReason, MIN_DESCRIPTION_CHARS } from '../validate';
import type { CanonicalJob } from '../types';

const longDesc = 'a'.repeat(MIN_DESCRIPTION_CHARS + 20);

function makeJob(overrides: Partial<CanonicalJob['core']> = {}, extra: Partial<CanonicalJob> = {}): CanonicalJob {
  return {
    core: {
      title: 'Software Engineer',
      company: 'Acme Corp',
      slug: 'software-engineer-acme-corp',
      category: 'IT',
      province: 'Gauteng',
      city: 'Johannesburg',
      description: `<p>${longDesc}</p>`,
      job_type: 'Full-time',
      apply_url: 'https://acme.com/apply',
      apply_email: '',
      source: 'rss:test',
      source_ref: 'abc-123',
      ...overrides,
    },
    enrichment: { remote: false },
    dedupe: {
      fingerprint: 'x',
      titleKey: 'software engineer',
      employerKey: 'acme corp',
      locationKey: 'johannesburg gauteng',
    },
    confidence: 90,
    ...extra,
  };
}

describe('validateJob', () => {
  it('accepts a complete job', () => {
    const r = validateJob(makeJob());
    expect(r.ok).toBe(true);
    expect(r.rejections).toEqual([]);
  });

  it('rejects missing title', () => {
    const r = validateJob(makeJob({ title: '' }));
    expect(r.ok).toBe(false);
    expect(r.rejections).toContain('missing_title');
  });

  it('rejects missing employer', () => {
    const r = validateJob(makeJob({ company: '  ' }));
    expect(r.rejections).toContain('missing_employer');
  });

  it('rejects missing location unless remote', () => {
    const r1 = validateJob(makeJob({ province: '', city: '' }));
    expect(r1.rejections).toContain('missing_location');

    const r2 = validateJob(makeJob({ province: '', city: '' }, { enrichment: { remote: true } }));
    expect(r2.rejections).not.toContain('missing_location');
  });

  it('rejects when no valid apply method', () => {
    const r = validateJob(makeJob({ apply_url: 'not-a-url', apply_email: '' }));
    expect(r.rejections).toContain('missing_apply_method');
  });

  it('accepts a valid apply email when no url', () => {
    const r = validateJob(makeJob({ apply_url: '', apply_email: 'jobs@acme.com' }));
    expect(r.rejections).not.toContain('missing_apply_method');
  });

  it('rejects empty description, warns on thin description', () => {
    const empty = validateJob(makeJob({ description: '' }));
    expect(empty.rejections).toContain('missing_description');

    const thin = validateJob(makeJob({ description: '<p>Too short</p>' }));
    expect(thin.ok).toBe(true);
    expect(thin.warnings).toContain('thin_description');
  });

  it('rejects missing source', () => {
    const r = validateJob(makeJob({ source: '' }));
    expect(r.rejections).toContain('missing_source');
  });

  it('rejects low confidence, warns on borderline', () => {
    const low = validateJob(makeJob({}, { confidence: 20 }));
    expect(low.rejections).toContain('low_confidence');

    const border = validateJob(makeJob({}, { confidence: 50 }));
    expect(border.ok).toBe(true);
    expect(border.warnings).toContain('low_confidence');
  });

  it('rejects expired jobs', () => {
    const r = validateJob(makeJob({ expires: '2000-01-01' }));
    expect(r.rejections).toContain('expired');
  });

  it('rejects apply URLs that point to competing job boards (official-source policy)', () => {
    const r = validateJob(makeJob({ apply_url: 'https://za.indeed.com/viewjob?jk=abc' }));
    expect(r.ok).toBe(false);
    expect(r.rejections).toContain('job_board_apply');
  });

  it('does not reject future closing dates', () => {
    const r = validateJob(makeJob({ expires: '2999-01-01' }));
    expect(r.rejections).not.toContain('expired');
  });
});

describe('describeReason', () => {
  it('returns human-readable labels', () => {
    expect(describeReason('missing_title')).toMatch(/title/i);
    expect(describeReason('low_confidence')).toMatch(/confidence/i);
  });
});
