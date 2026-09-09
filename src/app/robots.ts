import type { MetadataRoute } from "next";

import { SITE_URL } from "@/lib/site";

/**
 * Everything is crawlable, the résumé PDF included: it is kept out of the
 * index with an X-Robots-Tag header instead, which a crawler can only read if
 * it is allowed to fetch the file.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
