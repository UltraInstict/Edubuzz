export const ADSENSE_PUBLISHER_ID = 'pub-4848750388169101';
export const ADSENSE_CLIENT = `ca-${ADSENSE_PUBLISHER_ID}`;
export const ADS_TXT_RECORD = `google.com, ${ADSENSE_PUBLISHER_ID}, DIRECT, f08c47fec0942fa0`;

/** Public account identifier, not a secret. Reject a conflicting env value. */
export function getAdSenseClient(configured?: string): string {
  const value = (configured || '').trim();
  return !value || value === ADSENSE_CLIENT ? ADSENSE_CLIENT : '';
}

export function isPrivateAdRoute(pathname: string): boolean {
  return /^\/(admin|employer)(\/|$)/.test(pathname)
    || ['/login', '/register', '/logout'].includes(pathname);
}

export function shouldLoadAdSense(options: {
  enabled: boolean; eligible: boolean; noindex: boolean; pathname: string; client: string;
}): boolean {
  return options.enabled && options.eligible && !options.noindex
    && !isPrivateAdRoute(options.pathname) && options.client === ADSENSE_CLIENT;
}
