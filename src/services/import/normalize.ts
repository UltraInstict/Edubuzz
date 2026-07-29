/**
 * Import pipeline — normalization core (Milestone 1).
 *
 * PURE functions only. This module MUST NOT import `lib/pocketbase.ts`
 * (which instantiates a PocketBase client at module load and would pollute
 * unit tests). The canonical logic here is self-contained; in M2 the existing
 * callers (`lib/pocketbase.ts` slugify/sanitizeHtml, `aiNormalizationService`
 * normalizeProvince/normalizeJobType) are rewired to delegate to these, so we
 * end up with ONE source of truth.
 */

import type {
  EmploymentType,
  NormalizedLocation,
  ParsedSalary,
  SalaryPeriod,
} from './types';

// ---------------------------------------------------------------------------
// Canonical reference data
// ---------------------------------------------------------------------------

export const CANONICAL_PROVINCES = [
  'Gauteng',
  'Western Cape',
  'KwaZulu-Natal',
  'Eastern Cape',
  'Limpopo',
  'Mpumalanga',
  'North West',
  'Free State',
  'Northern Cape',
] as const;

/** Alias → canonical province. Includes major cities that imply a province. */
const PROVINCE_ALIASES: Record<string, string> = {
  gauteng: 'Gauteng',
  gp: 'Gauteng',
  gt: 'Gauteng',
  johannesburg: 'Gauteng',
  joburg: 'Gauteng',
  jhb: 'Gauteng',
  jozi: 'Gauteng',
  pretoria: 'Gauteng',
  tshwane: 'Gauteng',
  centurion: 'Gauteng',
  sandton: 'Gauteng',
  midrand: 'Gauteng',
  soweto: 'Gauteng',
  bronkhorstspruit: 'Gauteng',
  benoni: 'Gauteng',
  boksburg: 'Gauteng',
  germiston: 'Gauteng',
  'kempton park': 'Gauteng',
  krugersdorp: 'Gauteng',
  roodepoort: 'Gauteng',
  randburg: 'Gauteng',
  vereeniging: 'Gauteng',
  'western cape': 'Western Cape',
  wc: 'Western Cape',
  'cape town': 'Western Cape',
  capetown: 'Western Cape',
  cpt: 'Western Cape',
  stellenbosch: 'Western Cape',
  'kwazulu-natal': 'KwaZulu-Natal',
  'kwazulu natal': 'KwaZulu-Natal',
  'kwa-zulu natal': 'KwaZulu-Natal',
  'kwa zulu natal': 'KwaZulu-Natal',
  kzn: 'KwaZulu-Natal',
  durban: 'KwaZulu-Natal',
  pietermaritzburg: 'KwaZulu-Natal',
  'eastern cape': 'Eastern Cape',
  ec: 'Eastern Cape',
  'port elizabeth': 'Eastern Cape',
  gqeberha: 'Eastern Cape',
  'east london': 'Eastern Cape',
  'free state': 'Free State',
  fs: 'Free State',
  bloemfontein: 'Free State',
  sasolburg: 'Free State',
  welkom: 'Free State',
  limpopo: 'Limpopo',
  lp: 'Limpopo',
  polokwane: 'Limpopo',
  mpumalanga: 'Mpumalanga',
  mp: 'Mpumalanga',
  nelspruit: 'Mpumalanga',
  mbombela: 'Mpumalanga',
  secunda: 'Mpumalanga',
  emalahleni: 'Mpumalanga',
  witbank: 'Mpumalanga',
  'north west': 'North West',
  'north-west': 'North West',
  nw: 'North West',
  rustenburg: 'North West',
  mahikeng: 'North West',
  klerksdorp: 'North West',
  potchefstroom: 'North West',
  'northern cape': 'Northern Cape',
  nc: 'Northern Cape',
  kimberley: 'Northern Cape',
};

/** Alias → canonical employment type. */
const EMPLOYMENT_TYPE_ALIASES: Record<string, EmploymentType> = {
  'full-time': 'Full-time',
  'full time': 'Full-time',
  fulltime: 'Full-time',
  ft: 'Full-time',
  permanent: 'Full-time',
  perm: 'Full-time',
  'part-time': 'Part-time',
  'part time': 'Part-time',
  parttime: 'Part-time',
  pt: 'Part-time',
  contract: 'Contract',
  contractor: 'Contract',
  'fixed-term': 'Contract',
  'fixed term': 'Contract',
  freelance: 'Contract',
  internship: 'Internship',
  intern: 'Internship',
  'in-service': 'Internship',
  learnership: 'Learnership',
  'learnership programme': 'Learnership',
  'learnership program': 'Learnership',
  'graduate programme': 'Graduate Programme',
  'graduate program': 'Graduate Programme',
  'grad programme': 'Graduate Programme',
  'grad program': 'Graduate Programme',
  graduate: 'Graduate Programme',
  bursary: 'Bursary',
  scholarship: 'Bursary',
  temporary: 'Temporary',
  temp: 'Temporary',
  seasonal: 'Temporary',
  remote: 'Remote',
  'work from home': 'Remote',
  'work-from-home': 'Remote',
  wfh: 'Remote',
};

const REMOTE_HINTS = [
  'remote',
  'work from home',
  'work-from-home',
  'wfh',
  'anywhere',
  'fully remote',
  'telecommute',
];

const CURRENCY_SYMBOLS: Record<string, string> = {
  R: 'ZAR',
  $: 'USD',
  '£': 'GBP',
  '€': 'EUR',
};

// ---------------------------------------------------------------------------
// Text helpers
// ---------------------------------------------------------------------------

/** Lowercase, collapse whitespace, strip surrounding punctuation. */
export function normalizeKey(value: string | undefined | null): string {
  if (!value) return '';
  return value
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '') // strip diacritics
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** URL-safe slug. Mirrors lib/pocketbase.ts slugify (M2 will delegate to this). */
export function slugify(value: string): string {
  return (value || '')
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Strip unsafe HTML. Allow only a whitelist of tags; drop all attributes
 * except href on <a>. Self-contained port of lib/pocketbase.ts sanitizeHtml.
 */
export function cleanHtml(raw: string | undefined | null): string {
  if (!raw) return '';
  const ALLOWED = /^(b|i|em|strong|p|br|ul|ol|li|a|h[1-6]|div|span)$/i;
  return raw
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<(\/?)(\w+)([^>]*)>/g, (_m: string, slash: string, tag: string, attrs: string) => {
      if (!ALLOWED.test(tag)) return '';
      const cleanTag = tag.toLowerCase();
      if (cleanTag === 'br') return '<br>';
      if (cleanTag === 'a' && !slash) {
        const href = attrs.match(/href\s*=\s*["']([^"']+)["']/i);
        const safe = href ? ` href="${href[1].replace(/"/g, '&quot;')}"` : '';
        return `<a${safe}>`;
      }
      return `<${slash}${cleanTag}>`;
    })
    .trim();
}

/** Convert HTML/entities to plain text. Self-contained port of utils.ts stripHtml. */
export function toPlainText(html: string | undefined | null, maxLength = 0): string {
  if (!html) return '';
  const text = html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&rsquo;|&lsquo;|&#8217;|&#8216;/g, "'")
    .replace(/&rdquo;|&ldquo;|&#8220;|&#8221;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/&nbsp;/g, ' ')
    .replace(/&gt;/g, '>')
    .replace(/&lt;/g, '<')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
  return maxLength > 0 ? text.slice(0, maxLength) : text;
}

// ---------------------------------------------------------------------------
// Field normalizers
// ---------------------------------------------------------------------------

/** Map any province/city string to a canonical SA province, or '' if unknown. */
export function normalizeProvince(input: string | undefined | null): string {
  if (!input) return '';
  const key = normalizeKey(input);
  if (!key) return '';
  // Exact canonical match first
  for (const p of CANONICAL_PROVINCES) {
    if (normalizeKey(p) === key) return p;
  }
  // Alias match (full string)
  if (PROVINCE_ALIASES[key]) return PROVINCE_ALIASES[key];
  // Token scan — pick the first token/phrase that maps
  const tokens = key.split(' ');
  for (let span = Math.min(3, tokens.length); span >= 1; span--) {
    for (let i = 0; i + span <= tokens.length; i++) {
      const phrase = tokens.slice(i, i + span).join(' ');
      if (PROVINCE_ALIASES[phrase]) return PROVINCE_ALIASES[phrase];
    }
  }
  return '';
}

/** Map any job-type string to a canonical EmploymentType. Defaults to Full-time. */
export function normalizeEmploymentType(input: string | undefined | null): EmploymentType {
  if (!input) return 'Full-time';
  const key = normalizeKey(input);
  if (!key) return 'Full-time';
  if (EMPLOYMENT_TYPE_ALIASES[key]) return EMPLOYMENT_TYPE_ALIASES[key];
  // Substring scan for embedded hints (e.g. "Permanent, Full-time position")
  for (const alias of Object.keys(EMPLOYMENT_TYPE_ALIASES)) {
    if (key.includes(alias)) return EMPLOYMENT_TYPE_ALIASES[alias];
  }
  return 'Full-time';
}

/** Detect whether a role is remote from location / type / description text. */
export function detectRemote(...fragments: (string | undefined | null)[]): boolean {
  const haystack = normalizeKey(fragments.filter(Boolean).join(' '));
  if (!haystack) return false;
  return REMOTE_HINTS.some((hint) => haystack.includes(hint));
}

/** Build a canonical location from any combination of free-text fields. */
export function normalizeLocation(input: {
  location?: string | null;
  province?: string | null;
  city?: string | null;
  country?: string | null;
  type?: string | null;
  description?: string | null;
}): NormalizedLocation {
  const remote = detectRemote(input.location, input.province, input.city, input.type, input.description);
  const province =
    normalizeProvince(input.province) ||
    normalizeProvince(input.location) ||
    normalizeProvince(input.city);

  // City: prefer explicit city, else the leading segment of a free-text location.
  let city = (input.city || '').trim();
  if (!city && input.location) {
    const seg = input.location.split(/[,|/-]/)[0]?.trim() || '';
    // Don't echo the province name back as a city
    if (seg && normalizeProvince(seg) !== seg && normalizeKey(seg) !== normalizeKey(province)) {
      city = seg;
    }
  }

  const country = (input.country || '').trim() || 'South Africa';
  return { province, city, country, remote };
}

// ---------------------------------------------------------------------------
// Salary parsing
// ---------------------------------------------------------------------------

const PERIOD_HINTS: Array<[RegExp, SalaryPeriod]> = [
  [/(per\s*annum|p\.?a\.?\b|annual|year|yr|annually)/i, 'annual'],
  [/(per\s*month|p\.?m\.?\b|month|mth|monthly)/i, 'monthly'],
  [/(per\s*week|weekly|week)/i, 'weekly'],
  [/(per\s*day|daily|day)/i, 'daily'],
  [/(per\s*hour|hourly|hour|hr|\/h)/i, 'hourly'],
];

/** Convert a figure in `period` units to a monthly ZAR-equivalent figure. */
export function toMonthly(amount: number, period: SalaryPeriod): number {
  switch (period) {
    case 'annual':
      return Math.round(amount / 12);
    case 'weekly':
      return Math.round((amount * 52) / 12);
    case 'daily':
      return Math.round((amount * 21)); // ~21 working days/month
    case 'hourly':
      return Math.round(amount * 160); // ~160 working hours/month
    case 'monthly':
    default:
      return Math.round(amount);
  }
}

function parseAmountToken(token: string): number | undefined {
  if (!token) return undefined;
  let t = token.trim().toLowerCase().replace(/[, ]/g, '');
  let multiplier = 1;
  if (/k$/.test(t)) {
    multiplier = 1000;
    t = t.replace(/k$/, '');
  } else if (/m$/.test(t)) {
    multiplier = 1_000_000;
    t = t.replace(/m$/, '');
  }
  const n = parseFloat(t);
  if (!isFinite(n) || n <= 0) return undefined;
  return Math.round(n * multiplier);
}

/**
 * Parse a free-text salary string into structured min/max/currency/period,
 * plus monthly-equivalent figures for consistent sorting/storage.
 *
 * Handles: "R25 000 - R35 000 per month", "R450k p.a.", "$50,000/year",
 * "25000-35000", "R120 per hour", "Market related" (→ undisclosed).
 */
export function parseSalary(input?: string | null): ParsedSalary {
  const raw = (input || '').trim();
  const fallback: ParsedSalary = { currency: 'ZAR', period: 'monthly', disclosed: false };
  if (!raw) return fallback;

  const lower = raw.toLowerCase();
  if (/(market related|negotiable|competitive|tbc|doe|not disclosed|undisclosed)/.test(lower)) {
    return fallback;
  }

  // Currency
  let currency = 'ZAR';
  for (const [sym, iso] of Object.entries(CURRENCY_SYMBOLS)) {
    if (raw.includes(sym)) {
      currency = iso;
      break;
    }
  }
  const isoMatch = raw.match(/\b(ZAR|USD|GBP|EUR)\b/i);
  if (isoMatch) currency = isoMatch[1].toUpperCase();

  // Period
  let period: SalaryPeriod = 'monthly';
  for (const [re, p] of PERIOD_HINTS) {
    if (re.test(raw)) {
      period = p;
      break;
    }
  }

  // Numbers (with optional k/m suffix). Strip currency symbols first.
  const cleaned = raw.replace(/[Rr](?=\d)|\$|£|€/g, ' ');
  const numMatches = cleaned.match(/\d[\d ,]*\.?\d*\s*[kKmM]?/g) || [];
  const amounts = numMatches
    .map((m) => parseAmountToken(m))
    .filter((n): n is number => typeof n === 'number');

  if (amounts.length === 0) return { ...fallback, currency, period };

  let min: number | undefined;
  let max: number | undefined;
  if (amounts.length === 1) {
    if (/^\s*(up to|max|maximum)/i.test(raw)) max = amounts[0];
    else if (/^\s*(from|min|minimum|starting)/i.test(raw)) min = amounts[0];
    else min = amounts[0];
  } else {
    const sorted = [...amounts].sort((a, b) => a - b);
    min = sorted[0];
    max = sorted[sorted.length - 1];
    if (min === max) max = undefined;
  }

  return {
    min,
    max,
    currency,
    period,
    monthlyMin: typeof min === 'number' ? toMonthly(min, period) : undefined,
    monthlyMax: typeof max === 'number' ? toMonthly(max, period) : undefined,
    disclosed: typeof min === 'number' || typeof max === 'number',
  };
}
