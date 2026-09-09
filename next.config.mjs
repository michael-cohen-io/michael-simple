// The page is fully static, so there is no per-request nonce: the Next flight
// payloads and the next-themes bootstrap are inline scripts and script-src must
// allow 'unsafe-inline'. Everything else loads from this origin (next/font
// self-hosts Raleway, Vercel Analytics is served from /_vercel/insights); the
// analytics script's own beacon host is the one external connect-src.
const contentSecurityPolicy = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self'",
  "connect-src 'self' https://va.vercel-scripts.com",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
  "upgrade-insecure-requests",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: contentSecurityPolicy },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), browsing-topics=()",
  },
  { key: "X-Frame-Options", value: "DENY" },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
];

/**
 * Files in /public are not content-hashed, so they cannot be immutable; a
 * week with a long stale-while-revalidate keeps repeat visits cheap while
 * still letting a replaced image show up within a day or so.
 */
const publicImages = [
  "profile.webp",
  "portrait.jpg",
  "memoji.png",
  "amazon.svg",
  "anthropic.svg",
  "anthropic_dark.svg",
  "clad.svg",
  "ibm.svg",
  "opensea.svg",
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,
  // The only raster image is the 80px avatar, already a sized WebP; keeping
  // the /_next/image optimizer live for it is all cost and attack surface.
  images: { unoptimized: true },
  async headers() {
    return [
      { source: "/(.*)", headers: securityHeaders },
      {
        source: "/MichaelCohenResume.pdf",
        headers: [
          // The résumé is for people, not search results.
          { key: "X-Robots-Tag", value: "noindex" },
          {
            key: "Content-Disposition",
            value: 'inline; filename="Michael Cohen - Resume.pdf"',
          },
          {
            key: "Cache-Control",
            value: "public, max-age=86400, stale-while-revalidate=604800",
          },
        ],
      },
      ...publicImages.map((file) => ({
        source: `/${file}`,
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=604800, stale-while-revalidate=2592000",
          },
        ],
      })),
    ];
  },
  async redirects() {
    return [
      // The production *.vercel.app aliases must not become a second,
      // indexable copy of the site. Only those two hosts are matched: preview
      // deployments (michael-website-<hash>-… and michael-website-git-<branch>-…)
      // have to keep serving themselves, or every preview and its assets
      // would bounce to production. www is the host production answers on.
      {
        source: "/:path*",
        has: [
          {
            type: "host",
            value: "^michael-website(-my-team-ab1503ca)?\\.vercel\\.app$",
          },
        ],
        destination: "https://www.michaelcohen.io/:path*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
