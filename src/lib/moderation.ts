/**
 * Moderation and abuse detection utilities for Edubuzz.
 * Provides spam detection, fake job detection, employer verification,
 * and abuse reporting capabilities.
 */

const SPAM_KEYWORDS = [
  'casino', 'poker', 'gambling', 'viagra', 'cialis',
  'cryptocurrency', 'bitcoin investment', 'forex trading',
  'work from home earn', 'make money fast', 'get rich',
  'multi-level marketing', 'pyramid scheme', 'data entry from home',
  '$ per day', 'earn daily', 'passive income guaranteed',
  'nude', 'escort', 'adult',
];

const SPAM_PATTERNS = [
  /(?:https?:\/\/)?(?:bit\.ly|tinyurl\.com|shorturl\.at|rb\.gy|t\.co)\/\S+/gi,
  /[A-Z]{2,}\s?(?:VISA|MasterCard|PayPal|Bitcoin|BTC|USDT|ETH)\s?(?:payment|transfer|required)/gi,
  /(?:WhatsApp|Telegram)\s?(?:\+?\d{10,15})/gi,
  /contact\s?(?:me|us)\s?(?:on|at|via)\s?(?:WhatsApp|Telegram|Signal)/gi,
];

export interface ModerationResult {
  flagged: boolean;
  reason?: string;
  score: number;
}

export function scanJobContent(title: string, description: string, company: string): ModerationResult {
  let score = 0;
  const reasons: string[] = [];
  const combined = `${title} ${description} ${company}`.toLowerCase();

  for (const keyword of SPAM_KEYWORDS) {
    if (combined.includes(keyword)) {
      score += 20;
      reasons.push(`suspicious keyword: ${keyword}`);
    }
  }

  for (const pattern of SPAM_PATTERNS) {
    if (pattern.test(combined)) {
      score += 15;
      reasons.push('suspicious contact pattern detected');
    }
  }

  // Fake job heuristics
  if (title.length < 10) {
    score += 5;
    reasons.push('title too short');
  }
  if (description.length < 50) {
    score += 10;
    reasons.push('description too short');
  }
  if (description.length > 8000) {
    score += 5;
    reasons.push('description unusually long');
  }
  if (combined.includes('no experience necessary') && combined.includes('high salary')) {
    score += 15;
    reasons.push('too-good-to-be-true pattern');
  }
  if (/salary.*(?:R\d{5,}|R[1-9]\d{2},?\d{3})/i.test(combined)) {
    // High salary for entry position is suspicious
    if (/entry.level|no experience|intern/i.test(combined)) {
      score += 15;
      reasons.push('high salary for entry-level position');
    }
  }

  // Duplicate detection (company name spam)
  if (/^[A-Z]{10,}$/.test(company)) {
    score += 10;
    reasons.push('company name appears auto-generated');
  }

  return {
    flagged: score >= 30,
    reason: reasons.join('; ') || undefined,
    score,
  };
}

export function scanApplication(name: string, email: string, coverLetter: string): ModerationResult {
  let score = 0;
  const reasons: string[] = [];

  if (email.includes('test@') || email.includes('spam@') || email.includes('noreply@')) {
    score += 20;
    reasons.push('suspicious email domain');
  }
  if (name.length < 3) {
    score += 15;
    reasons.push('name too short');
  }
  if (coverLetter.length > 10000) {
    score += 10;
    reasons.push('cover letter too long');
  }
  const combined = `${name} ${coverLetter}`.toLowerCase();
  for (const keyword of SPAM_KEYWORDS) {
    if (combined.includes(keyword)) {
      score += 15;
      reasons.push(`spam keyword: ${keyword}`);
    }
  }

  return {
    flagged: score >= 25,
    reason: reasons.join('; ') || undefined,
    score,
  };
}

export function verifyEmployerQuality(companyName: string, website?: string, description?: string): { score: number; flags: string[] } {
  const flags: string[] = [];
  let score = 0;

  if (companyName.length >= 3) score += 10;
  if (website) {
    if (/^https:\/\//.test(website)) score += 15;
    else flags.push('website not HTTPS');
  } else {
    flags.push('no website provided');
  }
  if (description && description.length > 50) score += 10;
  if (/^[A-Z]/.test(companyName)) score += 5;
  if (companyName.match(/[&<>"'()]/)) {
    flags.push('company name contains special characters');
    score -= 10;
  }

  return { score, flags };
}
