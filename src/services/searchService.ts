/**
 * Search Intelligence — autocomplete, typo tolerance, query understanding,
 * faceted filtering, and search quality analytics.
 *
 * Phase 1: Pure code approach (no external search engine)
 * Phase 2: Meilisearch/Typesense integration ready
 */

import PocketBase from 'pocketbase';

const PB_URL = import.meta.env.PB_URL ?? 'http://127.0.0.1:8090';

function pb(): PocketBase {
  return new PocketBase(PB_URL);
}

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

// ─── AUTOCOMPLETE ──────────────────────────────────────────────────────────

let autocompleteCache: { tokens: string[]; updatedAt: number } | null = null;
const AUTOCOMPLETE_CACHE_TTL = 300000; // 5 minutes

export async function getAutocompleteSuggestions(
  query: string,
  limit = 8,
): Promise<string[]> {
  const q = query.trim().toLowerCase();
  if (q.length < 2) return [];

  // Build token index from recent job titles
  const tokens = await getSearchTokens();
  if (!tokens) return [];

  // Fuzzy prefix matching
  const scored = tokens
    .filter((t) => t.startsWith(q) || levenshteinDistance(t.slice(0, q.length), q) <= 1)
    .map((t) => ({ token: t, score: t.startsWith(q) ? 10 : 5 }));

  // Deduplicate and sort by score
  const seen = new Set<string>();
  return scored
    .filter((s) => { const dup = seen.has(s.token); seen.add(s.token); return !dup; })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((s) => s.token);
}

async function getSearchTokens(): Promise<string[] | null> {
  if (autocompleteCache && Date.now() - autocompleteCache.updatedAt < AUTOCOMPLETE_CACHE_TTL) {
    return autocompleteCache.tokens;
  }

  const today = todayIso();
  const jobs = await pb().collection('jobs').getFullList({
    filter: `active=true&&expires>"${today}"`,
    fields: 'title,company,category',
    sort: '-created',
    perPage: 200,
  }).catch(() => []);

  const tokens: string[] = [];
  for (const job of jobs) {
    const j = job as any;
    const text = `${j.title} ${j.company} ${j.category}`;
    text.split(/[\s,()-]+/)
      .filter((w: string) => w.length > 2 && !/^\d+$/.test(w))
      .forEach((w: string) => tokens.push(w.toLowerCase()));
  }

  const result = [...new Set(tokens)];
  autocompleteCache = { tokens: result, updatedAt: Date.now() };
  return result;
}

// ─── TYPO TOLERANCE ───────────────────────────────────────────────────────

/** Common SA job search misspellings → corrections */
const COMMON_CORRECTIONS: Record<string, string> = {
  'nusing': 'nursing', 'nusring': 'nursing', 'nursng': 'nursing',
  'acounting': 'accounting', 'accountng': 'accounting', 'acoounting': 'accounting',
  'engeneering': 'engineering', 'enginering': 'engineering',
  'adminstration': 'administration', 'administation': 'administration',
  'managment': 'management', 'managemnt': 'management',
  'goverment': 'government', 'govenment': 'government', 'govermnent': 'government',
  'receptionist': 'receptionist', 'recptionist': 'receptionist',
  'secratary': 'secretary', 'secretery': 'secretary',
  'electrican': 'electrician', 'electritian': 'electrician',
  'plumer': 'plumber', 'plumbing': 'plumbing',
  'techer': 'teacher', 'teachr': 'teacher',
  'sofware': 'software', 'softwre': 'software',
  'developr': 'developer', 'devloper': 'developer',
  'lernerships': 'learnerships', 'learnaships': 'learnerships',
  'bursarys': 'bursaries', 'bursareis': 'bursaries',
};

export function correctCommonTypos(query: string): string {
  const words = query.toLowerCase().split(/\s+/);
  const corrected = words.map((w) => COMMON_CORRECTIONS[w] || w);
  return corrected.join(' ');
}

export function levenshteinDistance(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;

  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (a[i - 1] === b[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
      }
    }
  }
  return dp[m][n];
}

export function suggestCorrection(
  query: string,
  dictionary: string[],
  maxDistance = 2,
): string | null {
  const q = query.toLowerCase();
  let best: string | null = null;
  let bestDist = maxDistance + 1;

  for (const word of dictionary) {
    const dist = levenshteinDistance(q, word.toLowerCase());
    if (dist < bestDist) {
      bestDist = dist;
      best = word;
    }
  }

  return bestDist <= maxDistance ? best : null;
}

// ─── PROVINCE + CATEGORY CORRECTION ───────────────────────────────────────

const PROVINCE_NAMES = [
  'Gauteng', 'Western Cape', 'KwaZulu-Natal', 'Eastern Cape',
  'Limpopo', 'Mpumalanga', 'North West', 'Free State', 'Northern Cape',
];

const PROVINCE_ALIASES: Record<string, string> = {
  // Gauteng
  'jhb': 'Gauteng', 'joburg': 'Gauteng', 'johannesburg': 'Gauteng',
  'jozi': 'Gauteng', 'pta': 'Gauteng', 'pretoria': 'Gauteng',
  'tshwane': 'Gauteng', 'sandton': 'Gauteng', 'midrand': 'Gauteng',
  'centurion': 'Gauteng', 'soweto': 'Gauteng', 'randburg': 'Gauteng',
  'roodepoort': 'Gauteng', 'benoni': 'Gauteng', 'boksburg': 'Gauteng',
  'germiston': 'Gauteng', 'kempton park': 'Gauteng', 'alberton': 'Gauteng',
  // Western Cape
  'cape town': 'Western Cape', 'ct': 'Western Cape', 'cpt': 'Western Cape',
  'stellenbosch': 'Western Cape', 'paarl': 'Western Cape',
  'bellville': 'Western Cape', 'george': 'Western Cape',
  'somerset west': 'Western Cape',
  // KwaZulu-Natal
  'durban': 'KwaZulu-Natal', 'dbn': 'KwaZulu-Natal', 'kzn': 'KwaZulu-Natal',
  'pietermaritzburg': 'KwaZulu-Natal', 'pmb': 'KwaZulu-Natal',
  'umhlanga': 'KwaZulu-Natal', 'ballito': 'KwaZulu-Natal',
  'richards bay': 'KwaZulu-Natal', 'newcastle': 'KwaZulu-Natal',
  // Eastern Cape
  'pe': 'Eastern Cape', 'port elizabeth': 'Eastern Cape',
  'gqeberha': 'Eastern Cape', 'east london': 'Eastern Cape',
  'el': 'Eastern Cape', 'mthatha': 'Eastern Cape', 'uitenhage': 'Eastern Cape',
  // Limpopo
  'polokwane': 'Limpopo', 'pietersburg': 'Limpopo',
  'tzaneen': 'Limpopo', 'mokopane': 'Limpopo', 'thohoyandou': 'Limpopo',
  // Mpumalanga
  'nelspruit': 'Mpumalanga', 'mbombela': 'Mpumalanga',
  'witbank': 'Mpumalanga', 'emalahleni': 'Mpumalanga',
  'secunda': 'Mpumalanga', 'middelburg': 'Mpumalanga',
  // North West
  'klerksdorp': 'North West', 'rustenburg': 'North West',
  'potchefstroom': 'North West', 'mahikeng': 'North West',
  'mafikeng': 'North West', 'brits': 'North West',
  // Free State
  'bloem': 'Free State', 'bloemfontein': 'Free State',
  'welkom': 'Free State', 'kroonstad': 'Free State',
  // Northern Cape
  'kimberley': 'Northern Cape', 'upington': 'Northern Cape',
  'springbok': 'Northern Cape',
};

export function normaliseProvince(input: string): string | null {
  const lower = input.trim().toLowerCase();

  // Direct alias match
  if (PROVINCE_ALIASES[lower]) return PROVINCE_ALIASES[lower];

  // Exact province match
  for (const p of PROVINCE_NAMES) {
    if (p.toLowerCase() === lower) return p;
  }

  // Typo-tolerant match
  const corrected = suggestCorrection(input, PROVINCE_NAMES, 2);
  if (corrected) return corrected;

  // Alias typo-tolerant
  const aliasKeys = Object.keys(PROVINCE_ALIASES);
  const aliasCorrected = suggestCorrection(input, aliasKeys, 2);
  if (aliasCorrected) return PROVINCE_ALIASES[aliasCorrected];

  return null;
}

// ─── QUERY UNDERSTANDING ──────────────────────────────────────────────────

export interface ParsedQuery {
  keywords: string;
  province: string | null;
  jobType: string | null;
  salaryMin: number | null;
  remote: boolean;
  hasLocation: boolean;
}

const JOB_TYPE_ALIASES: Record<string, string> = {
  'full time': 'Full-time', 'fulltime': 'Full-time', 'permanent': 'Full-time',
  'part time': 'Part-time', 'parttime': 'Part-time',
  'contract': 'Contract', 'temp': 'Temporary', 'temporary': 'Temporary',
  'intern': 'Internship', 'internship': 'Internship',
  'learnership': 'Learnership', 'learnerships': 'Learnership',
  'graduate': 'Graduate Programme', 'graduate programme': 'Graduate Programme',
  'grad programme': 'Graduate Programme', 'bursary': 'Bursary',
  'remote': 'Remote', 'wfh': 'Remote', 'work from home': 'Remote',
};

export function parseSearchQuery(rawQuery: string, rawProvince?: string): ParsedQuery {
  let q = rawQuery.trim();
  let province: string | null = rawProvince || null;
  let jobType: string | null = null;
  let remote = false;

  // Extract job type from query
  for (const [alias, type] of Object.entries(JOB_TYPE_ALIASES)) {
    if (q.toLowerCase().includes(alias)) {
      jobType = type;
      if (type === 'Remote') remote = true;
      q = q.replace(new RegExp(alias, 'i'), '').trim();
      break;
    }
  }

  // Extract province from query if not already set
  if (!province) {
    for (const p of PROVINCE_NAMES) {
      if (q.toLowerCase().includes(p.toLowerCase())) {
        province = p;
        q = q.replace(new RegExp(p, 'i'), '').trim();
        break;
      }
    }
    // Check aliases
    if (!province) {
      for (const [alias, p] of Object.entries(PROVINCE_ALIASES)) {
        if (q.toLowerCase().includes(alias)) {
          province = p;
          q = q.replace(new RegExp(alias.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'), '').trim();
          break;
        }
      }
    }
  }

  // Extract salary
  let salaryMin: number | null = null;
  const salaryMatch = q.match(/R\s?(\d[\d\s,]*[kK]?)/);
  if (salaryMatch) {
    let val = salaryMatch[1].replace(/[\s,]/g, '');
    if (val.toLowerCase().endsWith('k')) val = String(Number(val.slice(0, -1)) * 1000);
    salaryMin = Number(val);
    q = q.replace(salaryMatch[0], '').trim();
  }

  return {
    keywords: q.replace(/\s+/g, ' ').trim(),
    province,
    jobType,
    salaryMin,
    remote: remote || /remote|wfh|work from home/i.test(q),
    hasLocation: Boolean(province),
  };
}

// ─── SEARCH QUALITY ANALYTICS ─────────────────────────────────────────────

export interface SearchQuality {
  query: string;
  resultCount: number;
  hasCorrection: boolean;
  correction?: string;
  avgRelevance: number;
}

export function computeSearchQuality(
  query: string,
  results: any[],
  dictionary: string[],
): SearchQuality {
  const correction = suggestCorrection(query, dictionary, 2);
  const quality: SearchQuality = {
    query,
    resultCount: results.length,
    hasCorrection: false,
    avgRelevance: 0,
  };

  if (correction && correction.toLowerCase() !== query.toLowerCase()) {
    quality.hasCorrection = true;
    quality.correction = correction;
  }

  // Basic relevance estimation
  if (results.length > 0) {
    quality.avgRelevance = results.length > 10 ? 70 : results.length > 3 ? 50 : 30;
  }

  return quality;
}
