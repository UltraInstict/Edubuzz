/**
 * Structured Logging Utility
 * JSON-formatted logs with request context, metrics, and severity levels.
 * Designed for ingestion by Loki, BetterStack, or any JSON log aggregator.
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'fatal';

interface LogEntry {
  level: LogLevel;
  ts: string;
  msg: string;
  service: string;
  env: string;
  [key: string]: unknown;
}

const SERVICE_NAME = 'edubuzz';
const ENV = process.env.NODE_ENV || 'development';

function log(level: LogLevel, msg: string, extra: Record<string, unknown> = {}) {
  const entry: LogEntry = {
    level,
    ts: new Date().toISOString(),
    msg,
    service: SERVICE_NAME,
    env: ENV,
    ...extra,
  };

  const output = JSON.stringify(entry);

  switch (level) {
    case 'error':
    case 'fatal':
      console.error(output);
      break;
    case 'warn':
      console.warn(output);
      break;
    default:
      console.log(output);
  }
}

export const logger = {
  debug: (msg: string, extra?: Record<string, unknown>) => log('debug', msg, extra),
  info: (msg: string, extra?: Record<string, unknown>) => log('info', msg, extra),
  warn: (msg: string, extra?: Record<string, unknown>) => log('warn', msg, extra),
  error: (msg: string, extra?: Record<string, unknown>) => log('error', msg, extra),
  fatal: (msg: string, extra?: Record<string, unknown>) => log('fatal', msg, extra),
};

// ─── Request Metrics ─────────────────────────────────────────────────────

interface RequestMetrics {
  method: string;
  path: string;
  status: number;
  duration: number;
  userAgent?: string;
  ip?: string;
}

export function logRequest(metrics: RequestMetrics) {
  const level = metrics.status >= 500 ? 'error' : metrics.status >= 400 ? 'warn' : 'info';
  log(level, `${metrics.method} ${metrics.path} ${metrics.status} ${metrics.duration}ms`, {
    http_method: metrics.method,
    http_path: metrics.path,
    http_status: metrics.status,
    duration_ms: metrics.duration,
    user_agent: metrics.userAgent,
    client_ip: metrics.ip,
  });
}

// ─── Performance Timers ──────────────────────────────────────────────────

const timers = new Map<string, number>();

export function startTimer(label: string): void {
  timers.set(label, Date.now());
}

export function endTimer(label: string): number {
  const start = timers.get(label);
  if (!start) return 0;
  timers.delete(label);
  return Date.now() - start;
}

// ─── Process Monitoring ──────────────────────────────────────────────────

export function getProcessMetrics() {
  const mem = process.memoryUsage();
  return {
    memory_rss_mb: Math.round(mem.rss / 1024 / 1024),
    memory_heap_mb: Math.round(mem.heapUsed / 1024 / 1024),
    memory_heap_total_mb: Math.round(mem.heapTotal / 1024 / 1024),
    uptime_seconds: Math.round(process.uptime()),
    pid: process.pid,
  };
}

// Periodically log process metrics
if (ENV === 'production') {
  setInterval(() => {
    log('info', 'process_metrics', getProcessMetrics());
  }, 300000); // every 5 minutes
}
