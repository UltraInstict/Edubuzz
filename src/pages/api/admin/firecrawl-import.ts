import type { APIRoute } from 'astro';
import { requireAdmin, getAdminPB } from '../../../lib/auth';
import { scrapeJobUrl, batchScrapeJobs, discoverJobUrls } from '../../../services/firecrawlService';
import { normalizeJobContent, batchNormalizeJobs } from '../../../services/aiNormalizationService';
import { slugify } from '../../../lib/pocketbase';
import { getAdminSettings } from '../../../services/jobService';

interface FirecrawlImportRequest {
  type: 'urls' | 'career_page';
  urls?: string[];
  careerPageUrl?: string;
  sourceId?: string;
}

interface ImportResult {
  success: boolean;
  message: string;
  stats: {
    urls_found: number;
    urls_scraped: number;
    jobs_normalized: number;
    jobs_created: number;
    jobs_skipped: number;
    errors: number;
  };
  jobs?: any[];
}

export const POST: APIRoute = async ({ request }) => {
  // Check admin authentication
  const admin = await requireAdmin(request);
  if (!admin) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const body: FirecrawlImportRequest = await request.json();
    
    // Check if imports are enabled
    const settings = await getAdminSettings(['import_enabled']);
    if (settings.import_enabled === 'false') {
      return new Response(JSON.stringify({ 
        success: false, 
        message: 'Imports are disabled in admin settings' 
      }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    let urlsToScrape: string[] = [];

    // Determine URLs to scrape
    if (body.type === 'urls' && body.urls && body.urls.length > 0) {
      urlsToScrape = body.urls;
    } else if (body.type === 'career_page' && body.careerPageUrl) {
      console.log(`[firecrawl-import] Discovering jobs from: ${body.careerPageUrl}`);
      urlsToScrape = await discoverJobUrls(body.careerPageUrl);
    } else {
      return new Response(JSON.stringify({ 
        success: false, 
        message: 'Invalid request. Provide urls array or careerPageUrl.' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (urlsToScrape.length === 0) {
      return new Response(JSON.stringify({ 
        success: false, 
        message: 'No job URLs found' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    console.log(`[firecrawl-import] Processing ${urlsToScrape.length} URLs`);

    const result: ImportResult = {
      success: true,
      message: 'Import completed',
      stats: {
        urls_found: urlsToScrape.length,
        urls_scraped: 0,
        jobs_normalized: 0,
        jobs_created: 0,
        jobs_skipped: 0,
        errors: 0,
      },
      jobs: [],
    };

    // Step 1: Scrape all URLs
    const scrapeResults = await batchScrapeJobs(urlsToScrape);
    result.stats.urls_scraped = scrapeResults.filter(r => r.success).length;

    // Step 2: Normalize content with AI
    const jobsToNormalize = scrapeResults
      .filter(r => r.success && r.markdown)
      .map(r => ({
        content: r.markdown!,
        url: r.url,
      }));

    const normalizedJobs = await batchNormalizeJobs(jobsToNormalize);
    result.stats.jobs_normalized = normalizedJobs.filter(j => j !== null).length;

    // Step 3: Create jobs in PocketBase
    const pb = await getAdminPB();
    const existingJobs = await pb.collection('jobs').getFullList({
      fields: 'source_url,title,company',
    });

    for (const normalized of normalizedJobs) {
      if (!normalized) {
        result.stats.errors++;
        continue;
      }

      // Skip incomplete jobs (confidence < 60%)
      if (normalized.ai_confidence < 60) {
        console.log(`[firecrawl-import] Skipping low confidence job: ${normalized.title} (${normalized.ai_confidence}%)`);
        result.stats.jobs_skipped++;
        continue;
      }

      // Check for duplicates
      const isDuplicate = existingJobs.some(job => 
        job.source_url === normalized.apply_url ||
        (job.title === normalized.title && job.company === normalized.company)
      );

      if (isDuplicate) {
        console.log(`[firecrawl-import] Skipping duplicate: ${normalized.title}`);
        result.stats.jobs_skipped++;
        continue;
      }

      try {
        // Create job
        const jobData = {
          title: normalized.title,
          company: normalized.company,
          province: normalized.province,
          city: normalized.city,
          description: normalized.ai_summary,
          slug: slugify(`${normalized.title}-${normalized.company}`),
          salary_min: normalized.salary_min,
          salary_max: normalized.salary_max,
          salary_period: normalized.salary_period,
          job_type: normalized.job_type,
          category: normalized.category || 'General',
          experience_level: normalized.experience_level,
          education_required: normalized.education_required,
          responsibilities: normalized.responsibilities,
          requirements: normalized.requirements,
          benefits: normalized.benefits,
          skills: normalized.skills,
          closing_date: normalized.closing_date,
          apply_url: normalized.apply_url,
          company_description: normalized.company_description,
          company_website: normalized.company_website,
          ai_summary: normalized.ai_summary,
          ai_confidence: normalized.ai_confidence,
          enrichment_source: normalized.enrichment_source,
          source_url: normalized.apply_url,
          source: body.sourceId || 'firecrawl',
          source_ref: normalized.apply_url || `${normalized.title}-${normalized.company}`,
          last_scraped: new Date().toISOString(),
          active: true,
          featured: false,
          xml_export: true,
          expires: normalized.closing_date || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        };

        const created = await pb.collection('jobs').create(jobData);
        result.stats.jobs_created++;
        result.jobs!.push(created);

        console.log(`[firecrawl-import] ✓ Created: ${normalized.title} at ${normalized.company}`);
      } catch (err: any) {
        console.error(`[firecrawl-import] Error creating job:`, err.message);
        result.stats.errors++;
      }
    }

    // Update source stats if sourceId provided
    if (body.sourceId) {
      try {
        await pb.collection('xml_sources').update(body.sourceId, {
          last_crawled: new Date().toISOString(),
          last_job_count: result.stats.urls_found,
          import_count: result.stats.jobs_created,
          error_log: result.stats.errors > 0 ? `${result.stats.errors} errors` : '',
        });
      } catch (err: any) {
        console.error(`[firecrawl-import] Error updating source:`, err.message);
      }
    }

    result.message = `Import completed: ${result.stats.jobs_created} jobs created, ${result.stats.jobs_skipped} skipped, ${result.stats.errors} errors`;

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (err: any) {
    console.error('[firecrawl-import] Fatal error:', err);
    return new Response(JSON.stringify({ 
      success: false, 
      message: err.message || 'Import failed' 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
