const PRIMARY_HOST = 'athomegrower.com';
const ALIASES = new Set(['athomegrowers.com', 'www.athomegrower.com', 'www.athomegrowers.com']);

export async function onRequest(context) {
  const url = new URL(context.request.url);
  if (ALIASES.has(url.hostname) && ['GET', 'HEAD'].includes(context.request.method)) {
    url.hostname = PRIMARY_HOST;
    url.protocol = 'https:';
    return new Response(null, { status: 301, headers: { Location: url.href } });
  }
  return context.next();
}
