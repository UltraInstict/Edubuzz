/**
 * South-Africa location resolver — the single, reusable gate that decides
 * whether a job belongs on Edubuzz (SA-only). Deterministic, no hardcoded
 * per-employer rules; works for every importer/ATS.
 *
 * Matching uses WORD-BOUNDARY comparison (not naive substring) so tokens like
 * "george" match "George Town" but not "Georgetown", and "london" matches
 * "East London" only as a whole word (handled by ordering, see below).
 *
 * Resolution order (first match wins):
 *   1. Explicit non-SA country            → NOT SA
 *   2. Canonical SA province              → SA
 *   3. Unambiguous SA city               → SA   (e.g. Cape Town, East London)
 *   4. Non-SA city / region token         → NOT SA
 *   5. Ambiguous SA city                 → SA   (george/kimberley — only after
 *                                                 the foreign-city check, so
 *                                                 "George Town, Malaysia" is
 *                                                 caught as foreign first)
 *   6. Explicit SA country                → SA   (country=ZA with no city)
 *   7. Otherwise UNCERTAIN                → NOT SA (policy: never import intl)
 */

const SA_PROVINCES = new Set([
  'gauteng', 'western cape', 'kwazulu-natal', 'kwazulu natal', 'eastern cape',
  'limpopo', 'mpumalanga', 'north west', 'free state', 'northern cape',
]);

const SA_COUNTRY = new Set(['za', 'zaf', 'south africa', 'rsa', 'republic of south africa']);

// Non-SA country codes/names seen across pan-African/global ATS tenants.
const NON_SA_COUNTRY = new Set([
  // African neighbours / pan-African tenants
  'ng', 'gh', 'ke', 'ug', 'tz', 'ao', 'bw', 'na', 'mw', 'zm', 'zw', 'mu', 'gm',
  'ci', 'cv', 'sn', 'cm', 'et', 'rw', 'mz', 'ls', 'sz', 'ma', 'eg', 'tn', 'dz',
  'nigeria', 'ghana', 'kenya', 'uganda', 'tanzania', 'angola', 'botswana',
  'namibia', 'malawi', 'zambia', 'zimbabwe', 'mauritius', 'gambia',
  'ivory coast', "cote d'ivoire", 'cape verde', 'senegal', 'cameroon',
  'ethiopia', 'rwanda', 'mozambique', 'lesotho', 'eswatini', 'swaziland',
  'morocco', 'egypt', 'tunisia', 'algeria',
  // Rest of world
  'im', 'je', 'gg', 'au', 'us', 'usa', 'gb', 'uk', 'es', 'id', 'my', 'in',
  'ae', 'nl', 'de', 'fr', 'pt', 'pl', 'br', 'tr', 'il', 'cn', 'hk', 'sg',
  'qa', 'ph', 'ca', 'it', 'be', 'se', 'no', 'dk', 'fi', 'ch', 'at', 'ie',
  'nz', 'th', 'vn', 'pk', 'bd', 'sa', // 'sa' = Saudi Arabia code; note below
  'isle of man', 'jersey', 'guernsey', 'australia', 'united kingdom',
  'united states', 'united states of america', 'spain', 'indonesia',
  'malaysia', 'india', 'netherlands', 'germany', 'france', 'portugal',
  'poland', 'brazil', 'turkey', 'israel', 'china', 'hong kong', 'singapore',
  'qatar', 'philippines', 'canada', 'italy', 'belgium', 'sweden', 'norway',
  'denmark', 'finland', 'switzerland', 'austria', 'ireland', 'new zealand',
  'thailand', 'vietnam', 'pakistan', 'bangladesh', 'saudi arabia',
  'united arab emirates', 'uae',
]);
// NOTE: 'sa' as a bare country token is Saudi Arabia's ISO code. South Africa's
// code is 'za'/'zaf'. Some sloppy feeds use 'sa' for South Africa — but our SA
// signals are province/city/'za', so we accept the small risk that a genuine
// Saudi 'sa' code is the intended meaning. Country match is exact (not
// substring), so this never affects SA city/province matches.

// Non-SA cities/regions. Matched with word boundaries. SA cities are checked
// first (steps 2–3) so SA names that contain a foreign word — e.g. "East
// London" (contains "London") — are correctly kept South African.
const NON_SA_CITY_TOKENS = [
  // Africa
  'abuja', 'lagos', 'ibadan', 'accra', 'kumasi', 'luanda', 'gaborone',
  'windhoek', 'nairobi', 'mombasa', 'kampala', 'dar es salaam', 'dodoma',
  'banjul', 'blantyre', 'lilongwe', 'lusaka', 'harare', 'bulawayo', 'maputo',
  'kigali', 'addis ababa', 'dakar', 'douala', 'yaounde', 'abidjan', 'casablanca',
  'rabat', 'cairo', 'tunis', 'algiers', 'port louis',
  'nigeria', 'ghana', 'kenya', 'uganda', 'tanzania', 'angola', 'botswana',
  'namibia', 'malawi', 'zambia', 'zimbabwe', 'mauritius', 'gambia',
  'mozambique', 'rwanda', 'ethiopia', 'senegal', 'cameroon', 'morocco',
  // UK & Ireland
  'london', 'manchester', 'birmingham', 'leeds', 'glasgow', 'edinburgh',
  'bristol', 'liverpool', 'sheffield', 'cardiff', 'belfast', 'dublin', 'cork',
  'saint-helier', 'jersey', 'guernsey', 'isle of man', 'douglas',
  // Europe
  'utrecht', 'amsterdam', 'rotterdam', 'the hague', 'eindhoven', 'berlin',
  'munich', 'frankfurt', 'hamburg', 'cologne', 'paris', 'lyon', 'madrid',
  'barcelona', 'lisbon', 'porto', 'warsaw', 'krakow', 'prague', 'vienna',
  'zurich', 'geneva', 'milan', 'rome', 'brussels', 'stockholm', 'copenhagen',
  'oslo', 'helsinki', 'athens', 'budapest', 'bucharest',
  // Middle East
  'dubai', 'abu dhabi', 'doha', 'riyadh', 'jeddah', 'kuwait', 'tel aviv',
  'istanbul', 'ankara',
  // Asia-Pacific
  'jakarta', 'kuala lumpur', 'malaysia', 'singapore', 'hong kong', 'shanghai',
  'beijing', 'shenzhen', 'guangzhou', 'mumbai', 'bengaluru', 'bangalore',
  'new delhi', 'delhi', 'hyderabad', 'pune', 'chennai', 'kolkata', 'gurgaon',
  'gurugram', 'noida', 'karachi', 'lahore', 'dhaka', 'colombo', 'manila',
  'bangkok', 'ho chi minh', 'hanoi', 'tokyo', 'osaka', 'seoul', 'sydney',
  'melbourne', 'brisbane', 'canberra', 'perth', 'adelaide', 'auckland',
  'wellington nz',
  // Americas
  'new york', 'san francisco', 'los angeles', 'chicago', 'boston', 'austin',
  'seattle', 'denver', 'atlanta', 'dallas', 'houston', 'miami', 'philadelphia',
  'phoenix', 'san diego', 'san jose', 'washington', 'toronto', 'vancouver',
  'montreal', 'calgary', 'ottawa', 'mexico city', 'sao paulo', 'são paulo',
  'rio de janeiro', 'buenos aires', 'santiago', 'lima', 'bogota',
];

// Unambiguous SA cities/towns — distinctive names unlikely to collide with a
// major foreign city. Checked BEFORE the foreign-city list.
const SA_CITY_UNAMBIGUOUS = [
  'johannesburg', 'joburg', 'jhb', 'cape town', 'kaapstad', 'durban', 'pretoria',
  'tshwane', 'gqeberha', 'port elizabeth', 'east london', 'bloemfontein',
  'polokwane', 'nelspruit', 'mbombela', 'rustenburg', 'mahikeng', 'sandton',
  'centurion', 'midrand', 'soweto', 'stellenbosch', 'pietermaritzburg', 'paarl',
  'somerset west', 'randburg', 'roodepoort', 'khayelitsha', 'umhlanga',
  'ballito', 'vereeniging', 'vanderbijlpark', 'emalahleni', 'secunda', 'welkom',
  'bhisho', 'thohoyandou', 'giyani', 'tzaneen', 'upington', 'kroonstad',
  'klerksdorp', 'potchefstroom', 'benoni', 'boksburg', 'germiston', 'kempton park',
  'krugersdorp', 'vredenburg', 'saldanha', 'mossel bay', 'knysna', 'oudtshoorn',
  'south africa', 'south-africa',
];

// Ambiguous SA cities — famous SA names that ALSO exist abroad (George Town MY,
// Kimberley AU). Checked AFTER the foreign-city list so a foreign qualifier
// wins, but still treated as SA when standing alone.
const SA_CITY_AMBIGUOUS = ['george', 'kimberley', 'worcester', 'wellington'];

function norm(v?: string | null): string {
  return (v || '').toLowerCase().trim();
}

/** Word-boundary token match (token may contain spaces/hyphens). */
function hasToken(haystack: string, token: string): boolean {
  if (!haystack || !token) return false;
  const escaped = token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`(?:^|[^a-z0-9])${escaped}(?:[^a-z0-9]|$)`).test(haystack);
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

  // 1. Explicit non-SA country wins (strongest signal; exact match, not substring).
  if (country && NON_SA_COUNTRY.has(country)) return { isSA: false, reason: `country=${country}` };

  // 2. Canonical SA province.
  if (SA_PROVINCES.has(province)) return { isSA: true, reason: `province=${province}` };

  // 3. Unambiguous SA city (checked before foreign cities to protect names like
  //    "East London" that contain a foreign word).
  for (const t of SA_CITY_UNAMBIGUOUS) {
    if (t === 'south africa' || t === 'south-africa') {
      if (cityLoc.includes(t)) return { isSA: true, reason: `sa~${t}` };
      continue;
    }
    if (hasToken(cityLoc, t)) return { isSA: true, reason: `city~${t}` };
  }

  // 4. Explicit non-SA city/region token.
  for (const t of NON_SA_CITY_TOKENS) {
    if (hasToken(cityLoc, t)) return { isSA: false, reason: `city~${t}` };
  }

  // 5. Ambiguous SA city (only reached if no foreign city matched above).
  for (const t of SA_CITY_AMBIGUOUS) {
    if (hasToken(cityLoc, t)) return { isSA: true, reason: `city~${t}` };
  }

  // 6. Explicit SA country (e.g. country=ZA with no usable city/province).
  if (country && SA_COUNTRY.has(country)) return { isSA: true, reason: 'country=za' };

  // 7. Uncertain → reject (never import international).
  return { isSA: false, reason: 'uncertain' };
}
