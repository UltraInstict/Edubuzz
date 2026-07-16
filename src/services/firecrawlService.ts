/**
 * Firecrawl Connector Service
 * 
 * Scrapes job posting URLs and extracts raw content.
 * Part of the pluggable ingestion pipeline - can be extended with other connectors.
 */

import FirecrawlApp from '@mendable/firecrawl-js';

const FIRECRAWL_API_KEY = process.env.FIRECRAWL_API_KEY;

let firecrawl: FirecrawlApp | null = null;

function getClient(): FirecrawlApp {
  if (!FIRECRAWL_API_KEY) {
    throw new Error('FIRECRAWL_API_KEY environment variable not set');
  }
  if (!firecrawl) {
    firecrawl = new FirecrawlApp({ apiKey: FIRECRAWL_API_KEY });
  }
  return firecrawl;
}

export interface ScrapeResult {
  success: boolean;
  url: string;
  markdown?: string;
  html?: string;
  metadata?: {
    title?: string;
    description?: string;
    ogImage?: string;
    sourceURL?: string;
  };
  error?: string;
}

/**
 * Scrape a single job posting URL
 * Returns markdown and HTML content plus metadata
 */
export async function scrapeJobUrl(url: string): Promise<ScrapeResult> {
  try {
    const client = getClient();
    
    console.log(`[firecrawl] Scraping: ${url}`);
    
    const result = await client.scrapeUrl(url, {
      formats: ['markdown', 'html'],
      timeout: 30000,
    });

    if (!result.success) {
      return {
        success: false,
        url,
        error: result.error || 'Scrape failed',
      };
    }

    return {
      success: true,
      url,
      markdown: result.markdown,
      html: result.html,
      metadata: {
        title: result.metadata?.title,
        description: result.metadata?.description,
        ogImage: result.metadata?.ogImage,
        sourceURL: result.metadata?.sourceURL || url,
      },
    };
  } catch (err: any) {
    console.error(`[firecrawl] Error scraping ${url}:`, err.message);
    return {
      success: false,
      url,
      error: err.message || 'Unknown error',
    };
  }
}

/**
 * Crawl a career page to discover job listing URLs
 * Returns array of job URLs found on the page
 */
export async function discoverJobUrls(careerPageUrl: string, selector?: string): Promise<string[]> {
  try {
    const client = getClient();
    
    console.log(`[firecrawl] Discovering jobs from: ${careerPageUrl}`);
    
    const result = await client.crawlUrl(careerPageUrl, {
      maxDepth: 2,
      limit: 100,
      allowBackwardLinks: false,
      allowExternalLinks: false,
    });

    if (!result.success || !result.data) {
      console.warn(`[firecrawl] Crawl failed: ${result.error}`);
      return [];
    }

    // Extract job URLs from crawled pages
    const jobUrls: string[] = [];
    
    for (const page of result.data) {
      if (page.metadata?.sourceURL) {
        // Filter for likely job posting URLs
        const url = page.metadata.sourceURL;
        if (isJobUrl(url)) {
          jobUrls.push(url);
        }
      }
    }

    console.log(`[firecrawl] Found ${jobUrls.length} job URLs`);
    return jobUrls;
  } catch (err: any) {
    console.error(`[firecrawl] Error crawling ${careerPageUrl}:`, err.message);
    return [];
  }
}

/**
 * Heuristic to identify if a URL is likely a job posting
 */
function isJobUrl(url: string): boolean {
  const lower = url.toLowerCase();
  const jobPatterns = [
    '/job/',
    '/jobs/',
    '/careers/',
    '/positions/',
    '/vacancy/',
    '/vacancies/',
    '/apply/',
    '/opportunity/',
    'job_id=',
    'position_id=',
    'vacancy_id=',
  ];
  
  return jobPatterns.some(pattern => lower.includes(pattern));
}

/**
 * Batch scrape multiple job URLs with rate limiting
 */
export async function batchScrapeJobs(urls: string[], concurrency = 5): Promise<ScrapeResult[]> {
  const results: ScrapeResult[] = [];
  
  for (let i = 0; i < urls.length; i += concurrency) {
    const batch = urls.slice(i, i + concurrency);
    const batchResults = await Promise.all(batch.map(scrapeJobUrl));
    results.push(...batchResults);
    
    // Rate limiting: wait 1 second between batches
    if (i + concurrency < urls.length) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  return results;
}
