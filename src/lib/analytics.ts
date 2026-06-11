import { getPB } from './pocketbase';

type EventName = 'view' | 'click' | 'apply_click' | 'share' | 'search' | 'alert_signup' | 'page_view';

function detectBot(ua: string): string | null {
  const bots: [RegExp, string][] = [
    [/googlebot/i, 'Googlebot'],
    [/bingbot/i, 'Bingbot'],
    [/slurp/i, 'Yahoo'],
    [/duckduckbot/i, 'DuckDuckGo'],
    [/baiduspider/i, 'Baidu'],
    [/yandexbot/i, 'Yandex'],
    [/facebot|facebookexternalhit/i, 'Facebook'],
    [/twitterbot/i, 'Twitter'],
    [/linkedinbot/i, 'LinkedIn'],
    [/gptbot/i, 'ChatGPT'],
    [/chatgpt-user/i, 'ChatGPT-User'],
    [/perplexitybot/i, 'Perplexity'],
    [/claude|anthropic/i, 'Claude'],
    [/ccbot/i, 'CommonCrawl'],
    [/ahrefsbot/i, 'Ahrefs'],
    [/semrushbot/i, 'Semrush'],
  ];
  for (const [pattern, name] of bots) {
    if (pattern.test(ua)) return name;
  }
  return null;
}

export async function trackEvent(jobId: string, event: EventName, request: Request): Promise<void> {
  const ua = request.headers.get('user-agent') ?? '';
  const ref = request.headers.get('referer') ?? '';
  const device = /tablet/i.test(ua) ? 'tablet' : /mobile/i.test(ua) ? 'mobile' : 'desktop';
  const bot = detectBot(ua);
  let refDomain = 'direct';
  try {
    refDomain = ref ? new URL(ref).hostname : 'direct';
  } catch {
    refDomain = 'direct';
  }

  const pb = getPB();
  pb.collection('analytics_events').create({
    job_id: jobId,
    event,
    ref: refDomain,
    device,
    bot: bot || '',
    created: new Date().toISOString(),
  }).catch(() => {});

  if (!bot) {
    if (event === 'view') pb.collection('jobs').update(jobId, { 'views+': 1 }).catch(() => {});
    if (event === 'click') pb.collection('jobs').update(jobId, { 'clicks+': 1 }).catch(() => {});
    if (event === 'apply_click') pb.collection('jobs').update(jobId, { 'apply_clicks+': 1 }).catch(() => {});
  }
}

export async function trackPageView(request: Request, pageType: string): Promise<void> {
  const ua = request.headers.get('user-agent') ?? '';
  const ref = request.headers.get('referer') ?? '';
  const bot = detectBot(ua);

  const pb = getPB();
  pb.collection('analytics_events').create({
    job_id: '',
    event: 'page_view',
    ref: ref || 'direct',
    device: /tablet/i.test(ua) ? 'tablet' : /mobile/i.test(ua) ? 'mobile' : 'desktop',
    bot: bot || '',
    page_type: pageType,
    created: new Date().toISOString(),
  }).catch(() => {});
}
