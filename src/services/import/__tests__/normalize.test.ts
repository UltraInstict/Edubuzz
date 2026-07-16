import { describe, it, expect } from 'vitest';
import {
  normalizeProvince,
  normalizeEmploymentType,
  detectRemote,
  normalizeLocation,
  parseSalary,
  toMonthly,
  slugify,
  cleanHtml,
  toPlainText,
  normalizeKey,
} from '../normalize';

describe('normalizeProvince', () => {
  it('maps canonical names through unchanged', () => {
    expect(normalizeProvince('Gauteng')).toBe('Gauteng');
    expect(normalizeProvince('KwaZulu-Natal')).toBe('KwaZulu-Natal');
  });

  it('maps abbreviations and cities to provinces', () => {
    expect(normalizeProvince('GP')).toBe('Gauteng');
    expect(normalizeProvince('Johannesburg')).toBe('Gauteng');
    expect(normalizeProvince('cape town')).toBe('Western Cape');
    expect(normalizeProvince('Durban')).toBe('KwaZulu-Natal');
    expect(normalizeProvince('kzn')).toBe('KwaZulu-Natal');
  });

  it('handles messy variants and embedded phrases', () => {
    expect(normalizeProvince('Kwa-Zulu Natal')).toBe('KwaZulu-Natal');
    expect(normalizeProvince('Sandton, Johannesburg')).toBe('Gauteng');
    expect(normalizeProvince('Centurion area')).toBe('Gauteng');
  });

  it('returns empty for unknown', () => {
    expect(normalizeProvince('Nairobi')).toBe('');
    expect(normalizeProvince('')).toBe('');
    expect(normalizeProvince(undefined)).toBe('');
  });
});

describe('normalizeEmploymentType', () => {
  it('maps common aliases', () => {
    expect(normalizeEmploymentType('full time')).toBe('Full-time');
    expect(normalizeEmploymentType('Permanent')).toBe('Full-time');
    expect(normalizeEmploymentType('PT')).toBe('Part-time');
    expect(normalizeEmploymentType('contractor')).toBe('Contract');
    expect(normalizeEmploymentType('Intern')).toBe('Internship');
    expect(normalizeEmploymentType('learnership programme')).toBe('Learnership');
    expect(normalizeEmploymentType('WFH')).toBe('Remote');
  });

  it('finds embedded hints', () => {
    expect(normalizeEmploymentType('Permanent, Full-time position')).toBe('Full-time');
  });

  it('defaults to Full-time', () => {
    expect(normalizeEmploymentType('')).toBe('Full-time');
    expect(normalizeEmploymentType(undefined)).toBe('Full-time');
    expect(normalizeEmploymentType('gibberish')).toBe('Full-time');
  });
});

describe('detectRemote', () => {
  it('detects remote hints across fragments', () => {
    expect(detectRemote('Remote')).toBe(true);
    expect(detectRemote('Cape Town', 'work from home')).toBe(true);
    expect(detectRemote(null, undefined, 'Fully remote role')).toBe(true);
  });
  it('is false for on-site', () => {
    expect(detectRemote('Johannesburg', 'Full-time')).toBe(false);
    expect(detectRemote()).toBe(false);
  });
});

describe('normalizeLocation', () => {
  it('resolves province from free-text location', () => {
    const loc = normalizeLocation({ location: 'Sandton, Gauteng' });
    expect(loc.province).toBe('Gauteng');
    expect(loc.country).toBe('South Africa');
    expect(loc.remote).toBe(false);
  });

  it('prefers explicit city and does not echo province as city', () => {
    const loc = normalizeLocation({ province: 'Gauteng', city: 'Pretoria' });
    expect(loc.province).toBe('Gauteng');
    expect(loc.city).toBe('Pretoria');
  });

  it('extracts city from leading location segment', () => {
    const loc = normalizeLocation({ location: 'Umhlanga, KwaZulu-Natal' });
    expect(loc.province).toBe('KwaZulu-Natal');
    expect(loc.city).toBe('Umhlanga');
  });

  it('flags remote', () => {
    const loc = normalizeLocation({ location: 'Remote', type: 'Full-time' });
    expect(loc.remote).toBe(true);
  });
});

describe('toMonthly', () => {
  it('converts periods to monthly', () => {
    expect(toMonthly(12000, 'monthly')).toBe(12000);
    expect(toMonthly(120000, 'annual')).toBe(10000);
    expect(toMonthly(1000, 'weekly')).toBe(Math.round((1000 * 52) / 12));
    expect(toMonthly(500, 'daily')).toBe(500 * 21);
    expect(toMonthly(100, 'hourly')).toBe(100 * 160);
  });
});

describe('parseSalary', () => {
  it('parses a ZAR monthly range', () => {
    const s = parseSalary('R25 000 - R35 000 per month');
    expect(s.disclosed).toBe(true);
    expect(s.currency).toBe('ZAR');
    expect(s.period).toBe('monthly');
    expect(s.min).toBe(25000);
    expect(s.max).toBe(35000);
    expect(s.monthlyMin).toBe(25000);
    expect(s.monthlyMax).toBe(35000);
  });

  it('parses annual with k suffix and converts to monthly', () => {
    const s = parseSalary('R450k p.a.');
    expect(s.period).toBe('annual');
    expect(s.min).toBe(450000);
    expect(s.monthlyMin).toBe(37500);
  });

  it('parses USD hourly', () => {
    const s = parseSalary('$50/hour');
    expect(s.currency).toBe('USD');
    expect(s.period).toBe('hourly');
    expect(s.min).toBe(50);
    expect(s.monthlyMin).toBe(50 * 160);
  });

  it('handles "up to" and "from"', () => {
    expect(parseSalary('Up to R40 000').max).toBe(40000);
    expect(parseSalary('From R20 000').min).toBe(20000);
  });

  it('treats non-numeric as undisclosed', () => {
    expect(parseSalary('Market related').disclosed).toBe(false);
    expect(parseSalary('Negotiable').disclosed).toBe(false);
    expect(parseSalary('').disclosed).toBe(false);
    expect(parseSalary(undefined).disclosed).toBe(false);
  });

  it('parses bare number range', () => {
    const s = parseSalary('25000-35000');
    expect(s.min).toBe(25000);
    expect(s.max).toBe(35000);
  });
});

describe('slugify', () => {
  it('produces url-safe slugs', () => {
    expect(slugify('Senior Software Engineer')).toBe('senior-software-engineer');
    expect(slugify('R&D Lead')).toBe('randd-lead');
    expect(slugify('  Trailing  ')).toBe('trailing');
  });
});

describe('cleanHtml', () => {
  it('strips scripts and disallowed tags but keeps whitelist', () => {
    const out = cleanHtml('<p>Hi</p><script>alert(1)</script><img src=x><strong>bold</strong>');
    expect(out).toContain('<p>');
    expect(out).toContain('<strong>');
    expect(out).not.toContain('script');
    expect(out).not.toContain('<img');
  });

  it('keeps only href on anchors', () => {
    const out = cleanHtml('<a href="https://x.com" onclick="evil()">link</a>');
    expect(out).toBe('<a href="https://x.com">link</a>');
  });

  it('returns empty for nullish', () => {
    expect(cleanHtml(undefined)).toBe('');
    expect(cleanHtml('')).toBe('');
  });
});

describe('toPlainText', () => {
  it('strips tags and decodes entities', () => {
    expect(toPlainText('<p>Hello&nbsp;&amp; welcome</p>')).toBe('Hello & welcome');
  });
  it('truncates when maxLength given', () => {
    expect(toPlainText('<p>abcdef</p>', 3)).toBe('abc');
  });
});

describe('normalizeKey', () => {
  it('lowercases, strips punctuation and diacritics', () => {
    expect(normalizeKey('Développeur, Sénior!')).toBe('developpeur senior');
  });
});
