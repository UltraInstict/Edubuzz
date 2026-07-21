/**
 * Category mapping layer — maps a job's raw category (often an ATS department
 * like "Deloitte Human Capital - West Africa" or "Takealot Engineering") plus
 * its title onto ONE of Edubuzz's 15 canonical categories.
 *
 * Deterministic + rule-based (NOT random, NOT AI). Rules are ordered by
 * specificity; the first canonical whose keyword matches the combined
 * "category + title" text wins. Returns '' when nothing matches (caller
 * decides how to treat the residual — we never fabricate a mapping).
 *
 * This is the SINGLE source of truth for job→canonical-category classification.
 */

export const CANONICAL_CATEGORIES = [
  'Government',
  'Health & Medical',
  'IT & Technology',
  'Engineering',
  'Finance & Accounting',
  'Education & Teaching',
  'Retail & Sales',
  'Logistics & Transport',
  'Human Resources',
  'Administration',
  'Marketing & Media',
  'Hospitality & Tourism',
  'Cleaning & Facilities',
  'Security',
  'Legal',
] as const;

export type CanonicalCategory = (typeof CANONICAL_CATEGORIES)[number];

/**
 * Ordered rules. Order matters: more specific / higher-signal categories are
 * checked before generic ones (e.g. IT before Engineering so a "Software
 * Engineer" in a "…Engineering" department maps to IT & Technology, and Legal
 * before Finance so "legal counsel" isn't captured by "counsel/compliance").
 */
const RULES: Array<[CanonicalCategory, RegExp]> = [
  ['Legal', /\b(legal|attorney|advocate|litigation|paralegal|conveyanc|counsel|law\b|compliance officer|company secretar)/i],
  ['Health & Medical', /\b(nurs|medical|clinical|health|pharmac|doctor|physio|radiograph|patient|hospital|dental|paramedic|midwife|therapist|psycholog|surgeon|medicine)/i],
  ['Education & Teaching', /\b(teacher|teaching|lectur|education|tutor|academic|curriculum|professor|faculty|trainer|learnership|school)/i],
  ['Human Resources', /\b(human capital|human resources|\bhr\b|recruit|talent acquisition|talent|people (team|advisor|partner)|remuneration|reward|payroll officer|learning & development|\bl&d\b|organisational development)/i],
  ['IT & Technology', /\b(software|developer|programmer|\bit\b|information technology|technolog|\bdata\b|data (engineer|scientist|analyst)|cloud|devops|\bqa\b|cyber|network engineer|systems (engineer|analyst|admin)|\bsql\b|java|python|full[- ]?stack|front[- ]?end|back[- ]?end|web developer|product manager|digital|machine learning|\bai\b|architect (solutions|software|cloud|data))/i],
  ['Engineering', /\b(mechanical|electrical|civil|chemical|industrial|mining engineer|structural|process engineer|maintenance (technician|engineer)|artisan|fitter|boilermaker|millwright|technician|engineer(ing)?|geolog|metallurg|surveyor)/i],
  ['Finance & Accounting', /\b(financ|account|\btax\b|audit|treasury|bank|investment|actuar|credit|bookkeep|ifrs|payroll|risk (analyst|manager|officer)|underwrit|broker|teller|cashbook|debtors|creditors|analyst)/i],
  ['Marketing & Media', /\b(marketing|\bbrand\b|advertis|\bmedia\b|content|communications|public relations|\bpr\b|social media|\bseo\b|copywrit|creative|graphic design|designer|journalis|editor|videograph|photograph)/i],
  ['Logistics & Transport', /\b(logistic|supply chain|warehouse|\bdriver\b|transport|fleet|distribution|procurement|freight|courier|dispatch|forklift|inventory|stock controller)/i],
  ['Retail & Sales', /\b(sales|retail|merchandis|cashier|store (manager|assistant|associate)|commercial|business development|marketplace|\bbuyer\b|buying|account (manager|executive)|teller|shop|customer (service|success|experience|care)|call cent|telesales|agent)/i],
  ['Hospitality & Tourism', /\b(hospitality|tourism|\bchef\b|hotel|restaurant|catering|barista|waiter|waitron|travel|lodge|guesthouse|concierge|housekeeping)/i],
  ['Security', /\b(security|guard|patrol|surveillance|safety officer|access control)/i],
  ['Cleaning & Facilities', /\b(cleaner|cleaning|facilit|janitor|housekeep|groundsman|gardener|maintenance)/i],
  ['Government', /\b(government|municipal|public service|department of|provincial|dpsa|sassa|home affairs|correctional|defence|police)/i],
  ['Administration', /\b(admin|administrat|clerk|receptionist|secretar|office (manager|assistant|coordinator)|data captur|coordinator|personal assistant|\bpa\b|filing|records|typist)/i],
];

/** Map (rawCategory + title) → canonical category, or '' if no rule matches. */
export function mapCategory(rawCategory?: string | null, title?: string | null): CanonicalCategory | '' {
  const raw = (rawCategory || '').trim();
  // If the raw value is ALREADY a canonical category, keep it as-is.
  if ((CANONICAL_CATEGORIES as readonly string[]).includes(raw)) return raw as CanonicalCategory;
  const hay = `${raw} ${title || ''}`.toLowerCase();
  if (!hay.trim()) return '';
  for (const [cat, re] of RULES) {
    if (re.test(hay)) return cat;
  }
  return '';
}
