// Fix cross-site 403 behind Nginx reverse proxy.
// Astro checks `request.headers.get("origin") === url.origin`
// Nginx connects internally via HTTP, but browser sends Origin: https://
// This restores the https protocol from X-Forwarded-Proto so origin matches.

export const onRequest = async (context, next) => {
  const proto = context.request.headers.get('x-forwarded-proto');
  if (proto !== 'https') return next();

  const url = new URL(context.request.url);
  if (url.protocol !== 'http:') return next();
  url.protocol = 'https:';

  return next(new Request(url, context.request));
};
