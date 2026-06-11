import type { APIRoute } from 'astro';
import { pb } from '../../lib/pocketbase';
import { getProcessMetrics } from '../../lib/logger';

/**
 * Health check endpoint — verifies all system dependencies.
 * Used by: load balancers, uptime monitors, PM2 health checks.
 *
 * GET /api/health — simple 200/503
 * GET /api/health?full=1 — detailed JSON
 */
export const GET: APIRoute = async ({ url }) => {
  const full = url.searchParams.get('full') === '1';
  const checks: Record<string, { status: 'ok' | 'error'; latency_ms?: number; error?: string }> = {};

  // PocketBase health
  try {
    const start = Date.now();
    await pb.collection('categories').getList(1, 1, { fields: 'id' });
    checks.database = { status: 'ok', latency_ms: Date.now() - start };
  } catch (err: any) {
    checks.database = { status: 'error', error: err?.message || 'Connection failed' };
  }

  // Memory health
  const mem = process.memoryUsage();
  const heapUsedMB = Math.round(mem.heapUsed / 1024 / 1024);
  const heapLimitMB = 450;
  checks.memory = {
    status: heapUsedMB < heapLimitMB ? 'ok' : 'error',
    latency_ms: heapUsedMB,
    error: heapUsedMB >= heapLimitMB ? `Heap at ${heapUsedMB}MB (limit: ${heapLimitMB}MB)` : undefined,
  };

  // Uptime
  const uptimeMinutes = Math.round(process.uptime() / 60);
  checks.uptime = { status: 'ok', latency_ms: uptimeMinutes };

  // Aggregate status
  const allOk = Object.values(checks).every((c) => c.status === 'ok');
  const statusCode = allOk ? 200 : 503;

  if (!full) {
    return new Response(allOk ? 'OK' : 'DEGRADED', {
      status: statusCode,
      headers: { 'Content-Type': 'text/plain', 'Cache-Control': 'no-cache' },
    });
  }

  return new Response(JSON.stringify({
    status: allOk ? 'healthy' : 'degraded',
    timestamp: new Date().toISOString(),
    service: 'edubuzz',
    version: '1.0.0',
    uptime_seconds: process.uptime(),
    checks,
    metrics: getProcessMetrics(),
  }), {
    status: statusCode,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-cache' },
  });
};
