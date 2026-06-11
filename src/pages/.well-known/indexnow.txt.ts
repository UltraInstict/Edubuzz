import type { APIRoute } from 'astro';
import { getIndexNowKey } from '../../lib/indexnow';

export const prerender = false;

export const GET: APIRoute = async () => {
  return new Response(getIndexNowKey(), {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=86400',
    },
  });
};
