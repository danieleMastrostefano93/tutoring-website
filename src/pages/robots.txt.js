import { isIndexable, siteOrigin } from "../lib/site-meta.js";

export function GET() {
  const text = isIndexable
    ? `User-agent: *\nAllow: /\nSitemap: ${siteOrigin}/sitemap.xml\n`
    : "User-agent: *\nDisallow: /\n";
  return new Response(text, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
