/**
 * ATS detection + apply-URL policy (official-sources mission).
 *
 * Edubuzz sends every applicant to the EMPLOYER's official application page.
 * These pure helpers classify an apply/careers URL:
 *   - which ATS platform hosts it (Workday, Greenhouse, Lever, …)
 *   - the source domain
 *   - a coarse source type (government / university / company / job_board …)
 *   - whether it points at a competing job board (which the policy forbids)
 *
 * All functions are dependency-free and unit-testable.
 */

export type AtsType =
  | 'workday'
  | 'greenhouse'
  | 'lever'
  | 'smartrecruiters'
  | 'icims'
  | 'taleo'
  | 'successfactors'
  | 'cornerstone'
  | 'peoplesoft'
  | 'oracle_cloud'
  | 'ashby'
  | 'workable'
  | 'recruitee'
  | 'bamboohr'
  | 'jazzhr'
  | 'breezy'
  | 'custom'
  | 'unknown';

export type SourceType =
  | 'government'
  | 'university'
  | 'municipality'
  | 'soe'
  | 'hospital'
  | 'bank'
  | 'company'
  | 'agency'
  | 'job_board'
  | 'unknown';

/** Known ATS host/path signatures → ATS type. Checked against lowercased URL. */
const ATS_SIGNATURES: Array<[RegExp, AtsType]> = [
  [/myworkdayjobs\.com|myworkday\.com|\.wd\d+\.|workday/i, 'workday'],
  [/greenhouse\.io|grnh\.se/i, 'greenhouse'],
  [/jobs\.lever\.co|lever\.co\/jobs/i, 'lever'],
  [/smartrecruiters\.com/i, 'smartrecruiters'],
  [/\.icims\.com/i, 'icims'],
  [/\.taleo\.net|taleo/i, 'taleo'],
  [/successfactors\.(com|eu)|sapsf\.(com|eu)|jobs\.sap\.com/i, 'successfactors'],
  [/\.csod\.com|cornerstoneondemand/i, 'cornerstone'],
  [/oraclecloud\.com\/hcmui|\/hcmui\/candidateexperience|fa-\w+-saasfaprod/i, 'oracle_cloud'],
  [/psc\/|peoplesoft|\/psp\//i, 'peoplesoft'],
  [/jobs\.ashbyhq\.com|ashbyhq\.com/i, 'ashby'],
  [/\.workable\.com|apply\.workable\.com/i, 'workable'],
  [/\.recruitee\.com/i, 'recruitee'],
  [/\.bamboohr\.com/i, 'bamboohr'],
  [/\.applytojob\.com|jazzhr/i, 'jazzhr'],
  [/\.breezy\.hr/i, 'breezy'],
];

/** Competing job boards — apply links here VIOLATE the official-source policy. */
export const JOB_BOARD_DOMAINS = [
  'adzuna.com', 'adzuna.co.za',
  'indeed.com', 'indeed.co.za',
  'jooble.org',
  'careerjet.com', 'careerjet.co.za',
  'careers24.com',
  'pnet.co.za',
  'jobmail.co.za',
  'careerjunction.co.za',
  'glassdoor.com',
  'linkedin.com/jobs',
  'simplyhired.com',
  'ziprecruiter.com',
  'bestjobs.co.za',
  'joblife.co.za',
  'jobvine.co.za',
  'gumtree.co.za',
];

function hostname(url: string): string {
  if (!url) return '';
  try {
    const u = new URL(url.includes('://') ? url : `https://${url}`);
    return u.hostname.toLowerCase().replace(/^www\./, '');
  } catch {
    return '';
  }
}

/** The source domain (registrable-ish host) of a URL. */
export function sourceDomain(url: string): string {
  return hostname(url);
}

/** Detect the ATS platform behind an apply/careers URL. */
export function detectAts(url: string | undefined | null): AtsType {
  if (!url) return 'unknown';
  const lower = url.toLowerCase();
  for (const [re, ats] of ATS_SIGNATURES) {
    if (re.test(lower)) return ats;
  }
  return 'unknown';
}

/** True if the URL points at a known competing job board. */
export function isJobBoardUrl(url: string | undefined | null): boolean {
  if (!url) return false;
  const lower = url.toLowerCase();
  const host = hostname(url);
  return JOB_BOARD_DOMAINS.some((d) => {
    if (d.includes('/')) return lower.includes(d); // path-qualified (e.g. linkedin.com/jobs)
    return host === d || host.endsWith(`.${d}`);
  });
}

/** Coarse source-type classification from a URL's domain. */
export function classifySource(url: string | undefined | null): SourceType {
  const host = hostname(url);
  if (!host) return 'unknown';
  if (isJobBoardUrl(url)) return 'job_board';
  if (/\.gov\.za$/.test(host) || host.includes('dpsa') || /gov\./.test(host)) return 'government';
  if (/\.ac\.za$/.test(host) || host.includes('university') || host.includes('univ')) return 'university';
  if (host.includes('municipality') || host.includes('metro') || /\.gov\.za$/.test(host)) return 'municipality';
  return 'company';
}

export interface ApplyUrlPolicy {
  applyUrl: string;
  domain: string;
  ats: AtsType;
  sourceType: SourceType;
  /** True when the apply link is a competing job board → policy violation. */
  isJobBoard: boolean;
  /** True when the apply link is a usable official application method. */
  official: boolean;
}

/** Evaluate an apply URL against the official-source apply policy. */
export function evaluateApplyUrl(url: string | undefined | null): ApplyUrlPolicy {
  const applyUrl = (url || '').trim();
  const domain = sourceDomain(applyUrl);
  const ats = detectAts(applyUrl);
  const jobBoard = isJobBoardUrl(applyUrl);
  const sourceType = classifySource(applyUrl);
  const validHttp = /^https?:\/\/.+/i.test(applyUrl);
  return {
    applyUrl,
    domain,
    ats,
    sourceType,
    isJobBoard: jobBoard,
    official: validHttp && !jobBoard,
  };
}
