/**
 * AI-Moderation Service — fake job detection, scam detection,
 * duplicate detection, content quality scoring, and suspicious behavior analysis.
 */

// ─── FAKE JOB DETECTION ────────────────────────────────────────────────────

interface FakeJobSignals {
  score: number;
  maxScore: number;
  reasons: string[];
  isFake: boolean;
}

const RED_FLAG_SALARY_PATTERNS = [
  /R\d{3,4}\s?k?\s*(?:to|-)\s*R\d{3,4}\s?k?\s*(?:daily|per day|weekly|per week)/i,
  /earn\s*(?:up to|over)\s*R\d{2,3},?\d{3}/i,
  /(?:daily|weekly)\s*(?:payment|pay|income)/i,
];

const SCAM_CONTACT_PATTERNS = [
  /(?:telegram|whatsapp|signal)\s*(?:\+?\d{10,15}|@\w+)/gi,
  /contact\s*(?:me|us|hr)\s*(?:on|at|via)\s*(?:telegram|whatsapp|signal)/gi,
  /send\s*(?:your|a)\s*(?:deposit|fee|payment|advance)/gi,
  /registration\s*fee/gi,
];

const SUSPICIOUS_COMPANY_PATTERNS = [
  /^[A-Z\s]{5,30}$/, // ALL CAPS company name
  /^(?:the\s+)?(?:best|top|leading|premier)\s+(?:company|agency|recruiter)/i,
  /ltd|pty|ltd|inc|corp/i, // Not necessarily fake but should have proper registration
];

export function detectFakeJob(job: {
  title?: string;
  description?: string;
  company?: string;
  category?: string;
  salary_min?: number;
  salary_max?: number;
  apply_email?: string;
  apply_url?: string;
}): FakeJobSignals {
  let score = 0;
  const reasons: string[] = [];
  const combined = `${job.title || ''} ${job.description || ''}`.toLowerCase();

  // 1. Salary red flags (too good to be true)
  for (const pattern of RED_FLAG_SALARY_PATTERNS) {
    if (pattern.test(combined)) {
      score += 30;
      reasons.push('Suspicious salary claims');
      break;
    }
  }

  // 2. Scam contact patterns
  for (const pattern of SCAM_CONTACT_PATTERNS) {
    if (pattern.test(combined)) {
      score += 35;
      reasons.push('Suspicious contact method (Telegram/WhatsApp/Signal)');
      break;
    }
  }

  // 3. No real application method
  if (!job.apply_url && !job.apply_email) {
    score += 10;
    reasons.push('No application method provided');
  }

  // 4. Suspicious company name
  if (job.company) {
    for (const pattern of SUSPICIOUS_COMPANY_PATTERNS) {
      if (pattern.test(job.company)) {
        score += 15;
        reasons.push('Suspicious company name pattern');
        break;
      }
    }
  }

  // 5. Category mismatch
  if (job.category && combined.includes('earn money')) {
    score += 20;
    reasons.push('Category mismatch with money-making scheme');
  }

  // 6. No salary + entry level + remote = potential bait
  if (!job.salary_min && !job.salary_max &&
    /entry.level|no experience|intern/i.test(combined) &&
    /remote|work from home/i.test(combined)) {
    score += 10;
    reasons.push('Suspicious combination: remote + entry + no salary');
  }

  // 7. Description too short with high salary
  const descLen = (job.description || '').length;
  if (descLen < 100 && (job.salary_min && job.salary_min > 40000)) {
    score += 15;
    reasons.push('Short description with high salary');
  }

  return {
    score,
    maxScore: 100,
    reasons,
    isFake: score >= 40,
  };
}

// ─── DUPLICATE DETECTION ──────────────────────────────────────────────────

export interface DuplicateCheck {
  isDuplicate: boolean;
  similarity: number;
  existingJobId?: string;
}

export async function detectDuplicate(
  job: { title?: string; company?: string; description?: string },
  existingJobs: Array<{ id: string; title: string; company: string; description?: string }>,
): Promise<DuplicateCheck> {
  const title = (job.title || '').toLowerCase().trim();
  const company = (job.company || '').toLowerCase().trim();

  for (const existing of existingJobs) {
    const exTitle = (existing.title || '').toLowerCase().trim();
    const exCompany = (existing.company || '').toLowerCase().trim();

    // Exact title + company match
    if (title === exTitle && company === exCompany) {
      return { isDuplicate: true, similarity: 100, existingJobId: existing.id };
    }

    // High similarity check
    const titleSimilarity = stringSimilarity(title, exTitle);
    const companySimilarity = stringSimilarity(company, exCompany);

    if (titleSimilarity > 0.85 && companySimilarity > 0.85) {
      return { isDuplicate: true, similarity: Math.round((titleSimilarity + companySimilarity) / 2 * 100), existingJobId: existing.id };
    }
  }

  return { isDuplicate: false, similarity: 0 };
}

function stringSimilarity(a: string, b: string): number {
  if (a === b) return 1;
  if (!a.length || !b.length) return 0;

  const bigrams = new Map<string, number>();
  for (let i = 0; i < a.length - 1; i++) {
    const bigram = a.substring(i, i + 2);
    bigrams.set(bigram, (bigrams.get(bigram) || 0) + 1);
  }

  let common = 0;
  for (let i = 0; i < b.length - 1; i++) {
    const bigram = b.substring(i, i + 2);
    const count = bigrams.get(bigram) || 0;
    if (count > 0) {
      bigrams.set(bigram, count - 1);
      common++;
    }
  }

  return (2.0 * common) / (a.length + b.length - 2);
}

// ─── CONTENT QUALITY SCORING ──────────────────────────────────────────────

export interface ContentQuality {
  score: number;
  maxScore: number;
  flags: string[];
  suggestions: string[];
}

export function assessContentQuality(job: {
  title?: string;
  description?: string;
  company?: string;
  category?: string;
  salary_min?: number;
  salary_max?: number;
}): ContentQuality {
  const flags: string[] = [];
  const suggestions: string[] = [];
  let score = 50;

  // Title checks
  if ((job.title || '').length < 10) { score -= 15; flags.push('title too short'); suggestions.push('Add a more descriptive job title (at least 10 characters)'); }
  if ((job.title || '').length > 120) { score -= 5; flags.push('title too long'); }
  if (/^[a-z]/.test(job.title || '')) { score -= 5; flags.push('title not capitalized'); suggestions.push('Capitalize the first letter of the job title'); }
  if (/!{2,}|\?{2,}|ALL CAPS/.test(job.title || '')) { score -= 10; flags.push('title has excessive punctuation/caps'); }

  // Description checks
  const desc = job.description || '';
  if (desc.length < 100) { score -= 20; flags.push('description too short'); suggestions.push('Write at least 100 characters describing the role'); }
  if (desc.length >= 500) { score += 15; }
  if (desc.length >= 1000) { score += 5; }
  if (/<script/i.test(desc)) { score -= 30; flags.push('script tag in description'); }

  // Salary disclosure
  if (job.salary_min || job.salary_max) { score += 10; } else { suggestions.push('Add a salary range — jobs with salary get 30% more applications'); }

  // Company name
  if ((job.company || '').length < 3) { score -= 10; flags.push('company name too short'); }

  return { score: Math.max(0, Math.min(100, score)), maxScore: 100, flags, suggestions };
}

// ─── EMPLOYER BEHAVIOR ANALYSIS ───────────────────────────────────────────

export interface EmployerBehavior {
  trustScore: number;
  flags: string[];
  isSuspicious: boolean;
}

export function analyzeEmployerBehavior(employer: {
  verified?: boolean;
  totalJobs?: number;
  jobsInLastDay?: number;
  averageDescriptionLength?: number;
  hasWebsite?: boolean;
  responseRate?: number;
}): EmployerBehavior {
  const flags: string[] = [];
  let score = 50;

  if (employer.verified) score += 20;
  if (employer.hasWebsite) score += 10;
  if (employer.responseRate && employer.responseRate > 50) score += 10;
  if (employer.averageDescriptionLength && employer.averageDescriptionLength > 200) score += 5;

  // Bulk posting detection
  if (employer.jobsInLastDay && employer.jobsInLastDay > 10) {
    score -= 25;
    flags.push('Bulk job posting detected (>10 jobs in 24h)');
  }

  // Low effort posts
  if (employer.averageDescriptionLength && employer.averageDescriptionLength < 50 && employer.totalJobs && employer.totalJobs > 3) {
    score -= 15;
    flags.push('Multiple jobs with very short descriptions');
  }

  // No response to applicants
  if (employer.responseRate !== undefined && employer.responseRate < 20 && employer.totalJobs && employer.totalJobs > 5) {
    score -= 10;
    flags.push('Low response rate to applicants');
  }

  return { trustScore: Math.max(0, Math.min(100, score)), flags, isSuspicious: score < 30 };
}
