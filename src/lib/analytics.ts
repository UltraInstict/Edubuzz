import { getPB } from './pocketbase';

type EventName = 'view' | 'click' | 'apply_click' | 'share';

export async function trackEvent(jobId: string, event: EventName, request: Request) {
  const ua = request.headers.get('user-agent') ?? '';
  const ref = request.headers.get('referer') ?? '';
  const device = /tablet/i.test(ua) ? 'tablet' : /mobile/i.test(ua) ? 'mobile' : 'desktop';
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
    created: new Date().toISOString(),
  }).catch(() => {});

  if (event === 'view') pb.collection('jobs').update(jobId, { 'views+': 1 }).catch(() => {});
  if (event === 'click') pb.collection('jobs').update(jobId, { 'clicks+': 1 }).catch(() => {});
  if (event === 'apply_click') pb.collection('jobs').update(jobId, { 'apply_clicks+': 1 }).catch(() => {});
}
