import type { APIRoute } from 'astro';
import { getIndexNowKey } from '../lib/indexnow';

export const prerender = false;

export const GET: APIRoute = async ({ params }) => {
  const key = params.key?.replace('.txt', '') || '';
  if (key !== getIndexNowKey()) {
    return new Response('Not found', { status: 404 });
  }
  return new Response(getIndexNowKey(), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
