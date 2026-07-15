import { getAdminPB } from './auth';
import { parseIndeedXml, parseRssXml, type RawJob } from './xmlParser';
import { slugify } from './pocketbase';

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

function parseJsonFeed(json: string): RawJob[] {
  try {
    const data = JSON.parse(json);
    const items = Array.isArray(data) ? data : data.jobs || data.items || data.results || [];
    return items.map((item: any) => ({
      id: String(item.id || item.reference || item.ref || ''),
      title: item.title || '',
      company: item.company || item.employer || '',
      description: item.description || item.body || '',
      apply_url: item.url || item.apply_url || item.link || '',
      city: item.city || item.location?.city || '',
      province: item.province || item.state || item.location?.province || '',
      category: item.category || 'General',
      job_type: item.job_type || item.type || 'Full-time',
      salary_min: item.salary_min || item.salary?.min || null,
      salary_max: item.salary_max || item.salary?.max || null,
      expires: item.expires || item.expiration_date || '',
      source: 'xml_feed',
    }));
  } catch {
    return [];
  }
}

function parseFeed(xml: string, format: string): RawJob[] {
  switch (format) {
    case 'xml':
    case 'indeed_xml':
      return parseIndeedXml(xml);
    case 'json':
      return parseJsonFeed(xml);
    case 'rss':
    default:
      return parseRssXml(xml);
  }
}

export interface CrawlResult {
  sourceId: string;
  sourceName: string;
  success: boolean;
  jobsFound: number;
  jobsCreated: number;
  jobsUpdated: number;
  jobsDeactivated: number;
  error?: string;
}

export async function crawlFeedSource(source: {
  id: string;
  name: string;
  feed_url: string;
  format: string;
}): Promise<CrawlResult> {
  const result: CrawlResult = {
    sourceId: source.id,
    sourceName: source.name,
    success: false,
    jobsFound: 0,
    jobsCreated: 0,
    jobsUpdated: 0,
    jobsDeactivated: 0,
  };

  try {
    const response = await fetch(source.feed_url, {
      headers: { 'User-Agent': 'EdubuzzFeedCrawler/1.0 (+https://edubuzz.co.za)' },
      signal: AbortSignal.timeout(30000),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const text = await response.text();
    const rawJobs = parseFeed(text, source.format);
    result.jobsFound = rawJobs.length;

    if (rawJobs.length === 0) {
      result.success = true;
      return result;
    }

    const pb = await getAdminPB();
    const existingJobs = await pb.collection('jobs').getFullList({
      filter: `source="feed"&&source_ref~"${source.id}"`,
      fields: 'id,source_ref,slug,title,company,description,active',
    });

    const existingByRef = new Map<string, any>();
    const existingRefs = new Set<string>();
    for (const job of existingJobs as any[]) {
      const ref = job.source_ref || '';
      if (ref) {
        existingByRef.set(ref, job);
        existingRefs.add(ref);
      }
    }

    const incomingRefs = new Set<string>();
    for (const raw of rawJobs) {
      if (!raw.title || !raw.company) continue;

      const refId = raw.id || raw.title + raw.company;
      const sourceRef = `${source.id}_${refId}`;
      incomingRefs.add(sourceRef);

      const expires = raw.expires
        ? new Date(raw.expires).toISOString()
        : new Date(Date.now() + 30 * 86400000).toISOString();

      const jobData = {
        title: raw.title,
        slug: slugify(raw.title),
        company: raw.company,
        description: raw.description || '',
        province: raw.province || '',
        city: raw.city || '',
        category: raw.category || 'General',
        job_type: raw.job_type || 'Full-time',
        salary_min: raw.salary_min,
        salary_max: raw.salary_max,
        apply_url: raw.apply_url || '',
        source: 'feed',
        source_ref: sourceRef,
        active: true,
        featured: false,
        xml_export: true,
        expires,
      };

      if (existingByRef.has(sourceRef)) {
        const existing = existingByRef.get(sourceRef);
        const changed =
          existing.title !== jobData.title ||
          existing.company !== jobData.company ||
          existing.description !== jobData.description;
        if (changed) {
          await pb.collection('jobs').update(existing.id, jobData);
          result.jobsUpdated++;
        }
      } else {
        await pb.collection('jobs').create(jobData);
        result.jobsCreated++;
      }
    }

    for (const [ref, job] of existingByRef) {
      if (!incomingRefs.has(ref) && job.active) {
        await pb.collection('jobs').update(job.id, { active: false });
        result.jobsDeactivated++;
      }
    }

    result.success = true;
  } catch (err) {
    result.error = err instanceof Error ? err.message : 'Unknown error';
  }

  return result;
}

export async function updateSourceAfterCrawl(result: CrawlResult): Promise<void> {
  try {
    const pb = await getAdminPB();
    await pb.collection('xml_sources').update(result.sourceId, {
      last_crawled: new Date().toISOString(),
      last_job_count: result.jobsFound,
      import_count: result.jobsCreated,
      error_log: result.error || '',
    });
  } catch {}
}

export async function crawlAllFeeds(): Promise<CrawlResult[]> {
  // Respect master import toggle from admin settings
  const { getAdminSettings } = await import('../services/jobService');
  const settings = await getAdminSettings(['import_enabled']).catch(() => ({ import_enabled: 'true' }));
  if (settings.import_enabled !== 'true') {
    console.log('[feedCrawler] Import disabled via settings — skipping crawl');
    return [];
  }

  const pb = await getAdminPB();
  const sources = await pb.collection('xml_sources').getFullList({
    filter: 'active=true',
  }).catch(() => []);
  const results: CrawlResult[] = [];
  for (const source of sources as any[]) {
    const crawlResult = await crawlFeedSource(source);
    await updateSourceAfterCrawl(crawlResult);
    results.push(crawlResult);
  }
  return results;
}
