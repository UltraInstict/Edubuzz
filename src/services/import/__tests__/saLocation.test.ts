import { describe, it, expect } from 'vitest';
import { resolveSA } from '../../../lib/saLocation';

describe('resolveSA — South African locations accepted', () => {
  it('accepts canonical SA provinces', () => {
    for (const p of ['Gauteng', 'Western Cape', 'KwaZulu-Natal', 'Eastern Cape', 'Limpopo', 'Mpumalanga', 'North West', 'Free State', 'Northern Cape']) {
      expect(resolveSA({ province: p }).isSA).toBe(true);
    }
  });

  it('accepts unambiguous SA cities without a province', () => {
    for (const c of ['Cape Town', 'Johannesburg', 'Durban', 'Pretoria', 'Gqeberha', 'Bloemfontein', 'Stellenbosch', 'Polokwane']) {
      expect(resolveSA({ city: c }).isSA).toBe(true);
    }
  });

  it('accepts East London (SA) even though it contains "London"', () => {
    expect(resolveSA({ city: 'East London' }).isSA).toBe(true);
    expect(resolveSA({ city: 'East London', location: 'Eastern Cape' }).isSA).toBe(true);
  });

  it('accepts country=ZA with no city/province (metadata-only signal)', () => {
    expect(resolveSA({ country: 'ZA' }).isSA).toBe(true);
    expect(resolveSA({ country: 'South Africa' }).isSA).toBe(true);
    expect(resolveSA({ country: 'zaf', city: '' }).isSA).toBe(true);
  });

  it('accepts ambiguous SA cities when standing alone', () => {
    expect(resolveSA({ city: 'George' }).isSA).toBe(true);
    expect(resolveSA({ city: 'Kimberley' }).isSA).toBe(true);
  });
});

describe('resolveSA — foreign locations rejected', () => {
  it('rejects explicit foreign countries', () => {
    for (const c of ['NG', 'KE', 'US', 'GB', 'IN', 'AU', 'Nigeria', 'United Kingdom', 'Germany']) {
      expect(resolveSA({ country: c }).isSA).toBe(false);
    }
  });

  it('rejects the foreign cities that leaked from S-RM last session', () => {
    for (const c of ['London', 'Manchester', 'Utrecht', 'Hong Kong', 'Malaysia']) {
      const r = resolveSA({ city: c });
      expect(r.isSA).toBe(false);
    }
  });

  it('rejects a broad set of major foreign cities', () => {
    for (const c of ['New York', 'San Francisco', 'Toronto', 'Dubai', 'Singapore', 'Mumbai', 'Lagos', 'Nairobi', 'Amsterdam', 'Sydney', 'Paris', 'Berlin']) {
      expect(resolveSA({ city: c }).isSA).toBe(false);
    }
  });

  it('rejects "George Town, Malaysia" (foreign qualifier beats ambiguous SA "george")', () => {
    expect(resolveSA({ city: 'George Town', location: 'Malaysia' }).isSA).toBe(false);
    expect(resolveSA({ city: 'George Town, Malaysia' }).isSA).toBe(false);
  });

  it('rejects "Georgetown" (one word — must NOT match SA "george")', () => {
    // No SA signal, no foreign token → uncertain → not SA (never leaks).
    expect(resolveSA({ city: 'Georgetown' }).isSA).toBe(false);
  });

  it('foreign country overrides an ambiguous SA city name', () => {
    expect(resolveSA({ country: 'AU', city: 'Kimberley' }).isSA).toBe(false);
  });
});

describe('resolveSA — uncertain cases (policy: reject, never leak)', () => {
  it('treats remote-with-no-province-no-country as NOT SA (uncertain)', () => {
    const r = resolveSA({ city: 'Fully Remote' });
    expect(r.isSA).toBe(false);
    expect(r.reason).toBe('uncertain');
  });

  it('treats empty input as uncertain', () => {
    const r = resolveSA({});
    expect(r.isSA).toBe(false);
    expect(r.reason).toBe('uncertain');
  });

  it('remote SA role IS accepted when country=ZA is present', () => {
    expect(resolveSA({ country: 'ZA', city: 'Remote', location: 'remote' }).isSA).toBe(true);
  });
});
