import type { APIRoute } from 'astro';
import { getAutocompleteSuggestions } from '../../services/searchService';

export const GET: APIRoute = async ({ url }) => {
  const q = url.searchParams.get('q')?.trim() || '';
  if (q.length < 2) return json([]);

  const suggestions = await getAutocompleteSuggestions(q);
  return json(suggestions);
};

function json(body: unknown) {
  return new Response(JSON.stringify(body), {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=300',
    },
  });
}
