const buckets = new Map<string, number[]>();

export const jsonHeaders = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': 'https://edubuzz.co.za',
};

export function json(data: unknown, init: ResponseInit = {}) {
  return new Response(JSON.stringify(data), {
    ...init,
    headers: {
      ...jsonHeaders,
      ...(init.headers ?? {}),
    },
  });
}

/** Standardised success response — { success: true, data? } */
export function ok(data?: unknown, init: ResponseInit = {}) {
  return json({ success: true, ...(data !== undefined ? { data } : {}) }, init);
}

/** Standardised error response — { success: false, error } */
export function fail(error: string, status = 400) {
  return json({ success: false, error }, { status });
}

export function checkRateLimit(request: Request) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  const now = Date.now();
  const recent = (buckets.get(ip) ?? []).filter((ts) => now - ts < 60000);
  if (recent.length >= 5) {
    buckets.set(ip, recent);
    return false;
  }
  recent.push(now);
  buckets.set(ip, recent);
  return true;
}

export function cleanString(value: unknown, max = 1000) {
  return String(value ?? '').trim().slice(0, max);
}

export function isEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function isHttpsUrl(value: string) {
  return /^https:\/\/[^\s]+$/i.test(value);
}
