/**
 * South-Africa location resolver — the single, reusable gate that decides
 * whether a job belongs on Edubuzz (SA-only). Deterministic, no hardcoded
 * per-employer rules; works for every importer/ATS.
 *
 * Signals (in priority order):
 *   1. Explicit non-SA country code / name  → NOT SA
 *   2. Explicit non-SA city / location token → NOT SA
 *   3. Canonical SA province                 → SA
 *   4. Known SA city, or "south africa" text  → SA
 *   5. Otherwise UNCERTAIN → treated as NOT SA (policy: never import intl)
 */

const SA_PROVINCES = new Set([
  'gauteng', 'western cape', 'kwazulu-natal', 'eastern cape', 'limpopo',
  'mpumalanga', 'north west', 'free state', 'northern cape',
]);

const SA_COUNTRY = new Set(['za', 'zaf', 'south africa', 'rsa', 'republic of south africa']);

// Non-SA country codes/names seen across the pan-African/global ATS tenants.
const NON_SA_COUNTRY = new Set([
  'ng', 'gh', 'ke', 'ug', 'tz', 'ao', 'bw', 'na', 'mw', 'zm', 'zw', 'mu', 'gm',
  'ci', 'cv', 'sn', 'cm', 'et', 'rw', 'mz', 'ls', 'sz', 'im', 'je', 'gg',
  'au', 'us', 'gb', 'uk', 'es', 'id', 'my', 'in', 'ae', 'nl', 'de', 'fr',
  'nigeria', 'ghana', 'kenya', 'uganda', 'tanzania', 'angola', 'botswana',
  'namibia', 'malawi', 'zambia', 'zimbabwe', 'mauritius', 'gambia',
  'ivory coast', "cote d'ivoire", 'cape verde', 'senegal', 'cameroon',
  'ethiopia', 'rwanda', 'mozambique', 'lesotho', 'eswatini', 'swaziland',
  'isle of man', 'jersey', 'guernsey', 'australia', 'united kingdom',
  'united states', 'spain', 'indonesia', 'malaysia', 'india', 'netherlands',
]);

// Non-SA cities/regions observed in the data (fast-path rejection).
const NON_SA_CITY_TOKENS = [
  'abuja', 'lagos', 'imo', 'ibadan', 'fct', 'accra', 'luanda', 'gaborone',
  'windhoek', 'nairobi', 'kampala', 'dar es salaam', 'jakarta', 'kuala lumpur',
  'banjul', 'blantyre', 'lilongwe', 'saint-helier', 'douglas', 'ekajuk',
  'nigeria', 'ghana', 'kenya', 'uganda', 'tanzania', 'angola', 'botswana',
  'namibia', 'malawi', 'zambia', 'mauritius', 'gambia', 'spain', 'jersey',
  'isle of man',
];

// Known SA cities (positive signal when province didn't parse).
const SA_CITY_TOKENS = [
  'johannesburg', 'joburg', 'jhb', 'cape town', 'kaapstad', 'durban', 'pretoria',
  'tshwane', 'gqeberha', 'port elizabeth', 'east london', 'bloemfontein',
  'polokwane', 'nelspruit', 'mbombela', 'kimberley', 'rustenburg', 'mahikeng',
  'sandton', 'centurion', 'midrand', 'soweto', 'stellenbosch', 'pietermaritzburg',
  'george', 'paarl', 'somerset west', 'sandton city', 'randburg', 'roodepoort',
  'south africa', 'south-africa',
];

function norm(v?: string | null): string {
  return (v || '').toLowerCase().trim();
}

export interface SAInput {
  country?: string | null;
  province?: string | null;
  city?: string | null;
  location?: string | null;
}

export interface SAResult {
  isSA: boolean;
  reason: string;
}

/** Decide whether a location is South African. Policy: uncertain → NOT SA. */
export function resolveSA(input: SAInput): SAResult {
  const country = norm(input.country);
  const province = norm(input.province);
  const cityLoc = `${norm(input.city)} ${norm(input.location)}`.trim();

  // 1. Explicit non-SA country wins (strongest signal; e.g. SmartRecruiters 'ng').
  if (country && NON_SA_COUNTRY.has(country)) return { isSA: false, reason: `country=${country}` };

  // 2. Explicit non-SA city/region token.
  for (const t of NON_SA_CITY_TOKENS) {
    if (t === 'south africa') continue;
    if (cityLoc.includes(t)) return { isSA: false, reason: `city~${t}` };
  }

  // 3. Canonical SA province.
  if (SA_PROVINCES.has(province)) return { isSA: true, reason: `province=${province}` };

  // 4. Explicit SA country.
  if (country && SA_COUNTRY.has(country)) return { isSA: true, reason: 'country=za' };

  // 5. Known SA city / "south africa" text.
  for (const t of SA_CITY_TOKENS) {
    if (cityLoc.includes(t)) return { isSA: true, reason: `city~${t}` };
  }

  // 6. Uncertain → reject (never import international).
  return { isSA: false, reason: 'uncertain' };
}
