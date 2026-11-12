import { mode, pages } from "./site-data.js";

const siteUrl = import.meta.env.SITE_URL?.trim();
const parsedSite = siteUrl ? new URL(siteUrl) : undefined;

if (parsedSite && !["http:", "https:"].includes(parsedSite.protocol)) {
  throw new Error("SITE_URL deve essere un indirizzo HTTP o HTTPS.");
}

export const siteOrigin = parsedSite?.origin;
export const isIndexable = Boolean(siteOrigin) && mode === "firebase";
export const sitemapPages = Object.values(pages).filter(page => !page.noIndex);
