import { describe, expect, it } from 'vitest';
import { ADSENSE_CLIENT, ADS_TXT_RECORD, getAdSenseClient, shouldLoadAdSense } from '../adsense';
import { ADS_ENABLED, OTHER_MONETIZATION_ENABLED, JOBS_PUBLIC } from '../featureFlags';
import { GET } from '../../pages/ads.txt';

describe('AdSense activation', () => {
  const base = { enabled: true, eligible: true, noindex: false, pathname: '/', client: ADSENSE_CLIENT };
  it('enables AdSense without unrelated campaigns or jobs', () => {
    expect(ADS_ENABLED).toBe(true);
    expect(OTHER_MONETIZATION_ENABLED).toBe(false);
    expect(JOBS_PUBLIC).toBe(false);
  });
  it('uses the same approved publisher identity and rejects conflicting configuration', () => {
    expect(getAdSenseClient()).toBe(ADSENSE_CLIENT);
    expect(getAdSenseClient(` ${ADSENSE_CLIENT} `)).toBe(ADSENSE_CLIENT);
    expect(getAdSenseClient('ca-pub-0000000000000000')).toBe('');
    expect(getAdSenseClient('invalid')).toBe('');
  });
  it('loads on eligible content only', () => {
    expect(shouldLoadAdSense(base)).toBe(true);
    for (const option of [{ enabled: false }, { eligible: false }, { noindex: true }, { client: '' }]) {
      expect(shouldLoadAdSense({ ...base, ...option })).toBe(false);
    }
  });
  for (const pathname of ['/admin', '/admin/settings', '/employer', '/employer/dashboard', '/login', '/register', '/logout']) {
    it(`excludes ${pathname}`, () => expect(shouldLoadAdSense({ ...base, pathname })).toBe(false));
  }
  it('always serves the exact seller record as plain text', async () => {
    const response = await GET();
    expect(response.status).toBe(200);
    expect(response.headers.get('Content-Type')).toBe('text/plain');
    expect(await response.text()).toBe(ADS_TXT_RECORD + '\n');
  });
});
