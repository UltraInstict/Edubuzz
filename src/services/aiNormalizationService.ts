/**
 * AI Normalization Service
 * 
 * Extracts structured job data from raw scraped content using LLM.
 * Never fabricates data - only extracts what exists in the source.
 */

import Anthropic from '@anthropic-ai/sdk';

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const AI_MODEL = process.env.AI_MODEL || 'claude-3-5-sonnet-20241022';

let anthropic: Anthropic | null = null;

function getClient(): Anthropic {
  if (!ANTHROPIC_API_KEY) {
    throw new Error('ANTHROPIC_API_KEY environment variable not set');
  }
  if (!anthropic) {
    anthropic = new Anthropic({ apiKey: ANTHROPIC_API_KEY });
  }
  return anthropic;
}

export interface NormalizedJob {
  // Core fields
  title: string;
  company: string;
  province: string;
  city: string;
  
  // Compensation
  salary_min?: number;
  salary_max?: number;
  salary_period?: 'monthly' | 'annual' | 'hourly';
  
  // Classification
  job_type: string;
  category?: string;
  experience_level?: 'entry' | 'mid' | 'senior' | 'executive';
  education_required?: string;
  
  // Structured content (HTML)
  responsibilities?: string;
  requirements?: string;
  benefits?: string;
  skills?: string[];
  
  // Metadata
  closing_date?: string;
  apply_url?: string;
  company_description?: string;
  company_website?: string;
  
  // AI data
  ai_summary: string;
  ai_confidence: number;
  enrichment_source: 'firecrawl' | 'xml_feed' | 'manual' | 'employer';
  
  // Quality flags
  is_complete: boolean;
  missing_fields: string[];
}

const SYSTEM_PROMPT = `You are a job posting data extractor. Your task is to extract structured information from raw job posting content.

CRITICAL RULES:
1. ONLY extract information that is explicitly present in the source content
2. NEVER fabricate, infer, or make up information
3. If a field is not present in the source, return null or omit it
4. Convert salary figures to monthly ZAR amounts when possible
5. Extract lists as arrays, not as comma-separated strings
6. For HTML content fields (responsibilities, requirements, benefits), return clean HTML with proper formatting
7. Provide a confidence score (0-100) based on how complete the extracted data is

EXTRACTION GUIDELINES:
- Title: The job title/position name
- Company: The employer/hiring organization
- Province/City: Location in South Africa (normalize to standard province names)
- Salary: Extract min/max and period (monthly/annual/hourly). Convert annual to monthly by dividing by 12
- Job Type: Full-time, Part-time, Contract, Internship, Learnership, Graduate Programme, Temporary, Remote
- Experience Level: entry (0-2 years), mid (3-5 years), senior (5-10 years), executive (10+ years)
- Education Required: Minimum qualification mentioned (e.g., "Bachelor's degree", "Matric", "Diploma")
- Responsibilities: Bullet points of job duties in HTML format
- Requirements: Bullet points of qualifications/skills needed in HTML format
- Benefits: Bullet points of perks/benefits in HTML format
- Skills: Array of technical and soft skills mentioned
- Closing Date: Application deadline in ISO format (YYYY-MM-DD)
- Apply URL: Link to apply for the job
- Company Description: 1-2 sentences about the company
- Company Website: Company's main website
- AI Summary: 2-3 sentence professional summary of the role (write this, it's the one exception)

CONFIDENCE SCORING:
- 100: All core fields present (title, company, location, salary, description)
- 80-99: Most fields present, minor gaps
- 60-79: Core fields present, several gaps
- 40-59: Missing salary or location
- 0-39: Missing title or company

Respond with valid JSON only. No markdown, no explanations.`;

const USER_PROMPT_TEMPLATE = `Extract structured job data from this job posting:

SOURCE URL: {{url}}

CONTENT:
{{content}}

Return JSON matching this exact schema:
{
  "title": "string or null",
  "company": "string or null",
  "province": "string or null",
  "city": "string or null",
  "salary_min": "number (monthly ZAR) or null",
  "salary_max": "number (monthly ZAR) or null",
  "salary_period": "monthly|annual|hourly or null",
  "job_type": "string or null",
  "category": "string or null",
  "experience_level": "entry|mid|senior|executive or null",
  "education_required": "string or null",
  "responsibilities": "HTML string or null",
  "requirements": "HTML string or null",
  "benefits": "HTML string or null",
  "skills": ["array", "of", "strings"] or null,
  "closing_date": "YYYY-MM-DD or null",
  "apply_url": "string or null",
  "company_description": "string or null",
  "company_website": "string or null",
  "ai_summary": "string (required - write 2-3 sentences)",
  "ai_confidence": "number 0-100"
}`;

/**
 * Normalize raw job content into structured data using AI
 */
export async function normalizeJobContent(
  rawContent: string,
  sourceUrl: string,
  enrichmentSource: 'firecrawl' | 'xml_feed' | 'manual' | 'employer' = 'firecrawl'
): Promise<NormalizedJob | null> {
  try {
    const client = getClient();
    
    console.log(`[ai-normalizer] Processing: ${sourceUrl}`);
    
    const userPrompt = USER_PROMPT_TEMPLATE
      .replace('{{url}}', sourceUrl)
      .replace('{{content}}', rawContent.slice(0, 15000)); // Limit to 15k chars
    
    const response = await client.messages.create({
      model: AI_MODEL,
      max_tokens: 4000,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: userPrompt,
        },
      ],
    });

    const content = response.content[0];
    if (content.type !== 'text') {
      throw new Error('Unexpected response type');
    }

    const parsed = JSON.parse(content.text);
    
    // Validate and normalize the result
    const normalized = validateAndNormalize(parsed, enrichmentSource);
    
    console.log(`[ai-normalizer] ✓ Extracted with confidence: ${normalized.ai_confidence}%`);
    
    return normalized;
  } catch (err: any) {
    console.error(`[ai-normalizer] Error:`, err.message);
    return null;
  }
}

/**
 * Validate and normalize the AI response
 */
function validateAndNormalize(
  parsed: any,
  enrichmentSource: 'firecrawl' | 'xml_feed' | 'manual' | 'employer'
): NormalizedJob {
  const missingFields: string[] = [];
  
  // Check required fields
  if (!parsed.title) missingFields.push('title');
  if (!parsed.company) missingFields.push('company');
  if (!parsed.province && !parsed.city) missingFields.push('location');
  
  // Normalize province
  const province = normalizeProvince(parsed.province);
  
  // Normalize job type
  const jobType = normalizeJobType(parsed.job_type);
  
  // Calculate completeness
  const isComplete = missingFields.length === 0 && 
                     !!parsed.title && 
                     !!parsed.company && 
                     !!parsed.ai_summary;
  
  return {
    title: parsed.title || '',
    company: parsed.company || '',
    province: province || '',
    city: parsed.city || '',
    
    salary_min: parsed.salary_min || undefined,
    salary_max: parsed.salary_max || undefined,
    salary_period: parsed.salary_period || undefined,
    
    job_type: jobType || 'Full-time',
    category: parsed.category || undefined,
    experience_level: parsed.experience_level || undefined,
    education_required: parsed.education_required || undefined,
    
    responsibilities: parsed.responsibilities || undefined,
    requirements: parsed.requirements || undefined,
    benefits: parsed.benefits || undefined,
    skills: Array.isArray(parsed.skills) ? parsed.skills : undefined,
    
    closing_date: parsed.closing_date || undefined,
    apply_url: parsed.apply_url || undefined,
    company_description: parsed.company_description || undefined,
    company_website: parsed.company_website || undefined,
    
    ai_summary: parsed.ai_summary || '',
    ai_confidence: parsed.ai_confidence || 50,
    enrichment_source: enrichmentSource,
    
    is_complete: isComplete,
    missing_fields: missingFields,
  };
}

/**
 * Normalize province to standard South African province names
 */
function normalizeProvince(province: string | null | undefined): string {
  if (!province) return '';
  
  const lower = province.toLowerCase().trim();
  const provinceMap: Record<string, string> = {
    'gauteng': 'Gauteng',
    'gp': 'Gauteng',
    'johannesburg': 'Gauteng',
    'pretoria': 'Gauteng',
    
    'western cape': 'Western Cape',
    'wc': 'Western Cape',
    'cape town': 'Western Cape',
    
    'kwazulu-natal': 'KwaZulu-Natal',
    'kwa-zulu natal': 'KwaZulu-Natal',
    'kzn': 'KwaZulu-Natal',
    'durban': 'KwaZulu-Natal',
    
    'eastern cape': 'Eastern Cape',
    'ec': 'Eastern Cape',
    
    'free state': 'Free State',
    'fs': 'Free State',
    
    'limpopo': 'Limpopo',
    'lp': 'Limpopo',
    
    'mpumalanga': 'Mpumalanga',
    'mp': 'Mpumalanga',
    
    'north west': 'North West',
    'nw': 'North West',
    
    'northern cape': 'Northern Cape',
    'nc': 'Northern Cape',
  };
  
  return provinceMap[lower] || province;
}

/**
 * Normalize job type to standard values
 */
function normalizeJobType(jobType: string | null | undefined): string {
  if (!jobType) return 'Full-time';
  
  const lower = jobType.toLowerCase().trim();
  const typeMap: Record<string, string> = {
    'full-time': 'Full-time',
    'full time': 'Full-time',
    'ft': 'Full-time',
    'permanent': 'Full-time',
    
    'part-time': 'Part-time',
    'part time': 'Part-time',
    'pt': 'Part-time',
    
    'contract': 'Contract',
    'contractor': 'Contract',
    'fixed-term': 'Contract',
    
    'internship': 'Internship',
    'intern': 'Internship',
    
    'learnership': 'Learnership',
    'learnership programme': 'Learnership',
    
    'graduate programme': 'Graduate Programme',
    'graduate program': 'Graduate Programme',
    'grad program': 'Graduate Programme',
    
    'temporary': 'Temporary',
    'temp': 'Temporary',
    
    'remote': 'Remote',
    'work from home': 'Remote',
    'wfh': 'Remote',
  };
  
  return typeMap[lower] || 'Full-time';
}

/**
 * Batch normalize multiple jobs
 */
export async function batchNormalizeJobs(
  jobs: Array<{ content: string; url: string }>,
  concurrency = 3
): Promise<Array<NormalizedJob | null>> {
  const results: Array<NormalizedJob | null> = [];
  
  for (let i = 0; i < jobs.length; i += concurrency) {
    const batch = jobs.slice(i, i + concurrency);
    const batchResults = await Promise.all(
      batch.map(job => normalizeJobContent(job.content, job.url))
    );
    results.push(...batchResults);
    
    // Rate limiting: wait 2 seconds between batches
    if (i + concurrency < jobs.length) {
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
  
  return results;
}
