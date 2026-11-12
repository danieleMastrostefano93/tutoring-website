import { isIndexable, siteOrigin, sitemapPages } from "../lib/site-meta.js";

export function GET() {
  const urls = isIndexable
    ? sitemapPages.map(page => `  <url><loc>${new URL(page.path, siteOrigin).href}</loc></url>`).join("\n")
    : "";
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
  return new Response(xml, { headers: { "Content-Type": "application/xml; charset=utf-8" } });
}
