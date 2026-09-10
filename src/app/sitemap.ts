import type { MetadataRoute } from "next";

import { SITE_URL } from "@/lib/site";

// Next builds the sitemap as a route handler, and route handlers are
// dynamic by default; a static export needs it declared static.
export const dynamic = "force-static";

/** Two pages. lastModified is the build time, which is when content changes. */
export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  return [
    { url: `${SITE_URL}/`, lastModified, changeFrequency: "monthly", priority: 1 },
    { url: `${SITE_URL}/resume`, lastModified, changeFrequency: "monthly", priority: 0.8 },
  ];
}
