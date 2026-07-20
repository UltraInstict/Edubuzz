/**
 * Import pipeline — HTTP acquisition helper (Milestone 2).
 *
 * Thin, dependency-free wrapper over global fetch with timeout, a polite
 * User-Agent, and bounded retries with exponential backoff. Adapters use this
 * for the "Download" pipeline stage; parsing is kept separate and pure so it
 * can be unit-tested without network access.
 */

const DEFAULT_UA =
  'EdubuzzBot/1.0 (+https://edubuzz.co.za; job aggregator; respects robots)';

export interface FetchOptions {
  timeoutMs?: number;
  retries?: number;
  headers?: Record<string, string>;
  /** Treat these HTTP status codes as retryable (default: 429, 5xx). */
  retryOn?: number[];
  /** HTTP method (default GET). */
  method?: string;
  /** Request body (string). For JSON POSTs, pass a JSON string + a JSON Content-Type header. */
  body?: string;
}

export class HttpError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly url: string
  ) {
    super(message);
    this.name = 'HttpError';
  }
}

function isRetryable(status: number, retryOn?: number[]): boolean {
  if (retryOn && retryOn.length) return retryOn.includes(status);
  return status === 429 || (status >= 500 && status <= 599);
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Fetch a URL and return the response body as text. Retries transient errors. */
export async function fetchText(url: string, opts: FetchOptions = {}): Promise<string> {
  const { timeoutMs = 15000, retries = 2, headers = {}, retryOn, method, body } = opts;
  let lastErr: unknown;

  for (let attempt = 0; attempt <= retries; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const res = await fetch(url, {
        signal: controller.signal,
        method: method || (body != null ? 'POST' : 'GET'),
        body: body ?? undefined,
        headers: { 'User-Agent': DEFAULT_UA, Accept: '*/*', ...headers },
        redirect: 'follow',
      });
      if (!res.ok) {
        if (attempt < retries && isRetryable(res.status, retryOn)) {
          await sleep(500 * Math.pow(2, attempt));
          continue;
        }
        throw new HttpError(`HTTP ${res.status} for ${url}`, res.status, url);
      }
      return await res.text();
    } catch (err) {
      lastErr = err;
      // Abort/network errors are retryable; HttpError already handled above.
      if (err instanceof HttpError) throw err;
      if (attempt < retries) {
        await sleep(500 * Math.pow(2, attempt));
        continue;
      }
    } finally {
      clearTimeout(timer);
    }
  }
  throw lastErr instanceof Error
    ? lastErr
    : new Error(`Failed to fetch ${url}: ${String(lastErr)}`);
}

/** Fetch and JSON-parse a URL body. */
export async function fetchJson<T = unknown>(url: string, opts: FetchOptions = {}): Promise<T> {
  const text = await fetchText(url, {
    ...opts,
    headers: { Accept: 'application/json', ...(opts.headers || {}) },
  });
  return JSON.parse(text) as T;
}

/** POST a JSON body and JSON-parse the response. */
export async function postJson<T = unknown>(
  url: string,
  payload: unknown,
  opts: FetchOptions = {}
): Promise<T> {
  const text = await fetchText(url, {
    ...opts,
    method: 'POST',
    body: JSON.stringify(payload),
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...(opts.headers || {}),
    },
  });
  return JSON.parse(text) as T;
}

/** Decode HTML entities (named + numeric) back to characters. Pure. */
export function decodeHtmlEntities(input: string | undefined | null): string {
  if (!input) return '';
  const named: Record<string, string> = {
    amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ',
    rsquo: '\u2019', lsquo: '\u2018', rdquo: '\u201d', ldquo: '\u201c',
    hellip: '\u2026', mdash: '\u2014', ndash: '\u2013', bull: '\u2022',
    deg: '\u00b0', eacute: '\u00e9', trade: '\u2122', reg: '\u00ae', copy: '\u00a9',
  };
  return input
    .replace(/&#x([0-9a-f]+);/gi, (_m, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_m, d) => String.fromCodePoint(parseInt(d, 10)))
    .replace(/&([a-z]+);/gi, (m, name) => (name.toLowerCase() in named ? named[name.toLowerCase()] : m));
}

/** Run an async mapper over items with bounded concurrency, preserving order. */
export async function mapLimit<T, R>(
  items: T[],
  limit: number,
  fn: (item: T, index: number) => Promise<R>
): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let cursor = 0;
  const workers = Array.from({ length: Math.max(1, Math.min(limit, items.length)) }, async () => {
    while (cursor < items.length) {
      const i = cursor++;
      results[i] = await fn(items[i], i);
    }
  });
  await Promise.all(workers);
  return results;
}
