import type { MetadataRoute } from "next";

import { SITE_URL } from "@/lib/site";

/** One page. lastModified is the build time, which is when content changes. */
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: `${SITE_URL}/`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 1,
    },
  ];
}
