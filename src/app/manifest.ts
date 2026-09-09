import type { MetadataRoute } from "next";

import { SITE_DESCRIPTION, SITE_NAME } from "@/lib/site";

// Next 15 builds the manifest as a route handler, and route handlers are
// dynamic by default; a static export needs it declared static.
export const dynamic = "force-static";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: SITE_NAME,
    short_name: "MC",
    description: SITE_DESCRIPTION,
    start_url: "/",
    display: "minimal-ui",
    background_color: "#ffffff",
    theme_color: "#d6006b",
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml" },
      { src: "/apple-icon.png", sizes: "180x180", type: "image/png" },
    ],
  };
}
