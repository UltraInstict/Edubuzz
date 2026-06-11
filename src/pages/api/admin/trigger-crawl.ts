import type { APIRoute } from 'astro';
import { requireAdmin, getAdminPB, auditLog } from '../../../lib/auth';
import { ok, fail } from '../../../lib/api';
import { crawlAllFeeds, updateSourceAfterCrawl, crawlFeedSource } from '../../../lib/feedCrawler';

export const POST: APIRoute = async ({ request }) => {
  const { redirect, user } = await requireAdmin(request);
  if (redirect) return redirect;

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
