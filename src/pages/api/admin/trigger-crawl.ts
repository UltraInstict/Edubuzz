import type { APIRoute } from 'astro';
import { requireAdminApi, getAdminPB, auditLog } from '../../../lib/auth';
import { ok, fail } from '../../../lib/api';
import { crawlAllFeeds, updateSourceAfterCrawl, crawlFeedSource } from '../../../lib/feedCrawler';
import { getAdminSettings } from '../../../services/jobService';

export const POST: APIRoute = async ({ request }) => {
  const { error, user } = await requireAdminApi(request);
  if (error) return error;

  const settings = await getAdminSettings(['import_enabled']);
  if (settings.import_enabled !== 'true') {
    return fail('Job import is disabled. Enable it in Settings.', 403);
  }

  try {
    const data = await request.json().catch(() => ({}));
    let results;

    if (data.sourceId) {
      const pb = await getAdminPB();
      const source = await pb.collection('xml_sources').getOne(data.sourceId).catch(() => null);
      if (!source) return fail('Source not found.', 404);
      const crawlResult = await crawlFeedSource(source as any);
      await updateSourceAfterCrawl(crawlResult);
      results = [crawlResult];
    } else {
      results = await crawlAllFeeds();
    }

    auditLog('admin_feed_crawl', { adminId: user?.id, count: results.length });
    return ok({ results });
  } catch {
    return fail('Crawl failed.', 500);
  }
};
