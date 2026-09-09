/** The same card as Open Graph; Twitter/X just wants its own tags. */
export { default, alt, size, contentType } from "./opengraph-image";

// Turbopack reads route-segment config statically from the file that owns
// the route, so the export cannot be forwarded from opengraph-image.
export const dynamic = "force-static";
