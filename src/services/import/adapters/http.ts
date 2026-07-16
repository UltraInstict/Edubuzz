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
  const { timeoutMs = 15000, retries = 2, headers = {}, retryOn } = opts;
  let lastErr: unknown;

  for (let attempt = 0; attempt <= retries; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const res = await fetch(url, {
        signal: controller.signal,
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
