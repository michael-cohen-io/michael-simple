/** @type {import('next').NextConfig} */
const nextConfig = {
  // There is no dynamic route, API or middleware: `next build` writes the
  // whole site to out/ and Vercel serves it as files. Response headers and
  // the *.vercel.app redirect are in vercel.json, because a static export has
  // no server to apply headers()/redirects() from this file.
  output: "export",
  poweredByHeader: false,
  // The only raster image is the 80px avatar, already a sized WebP; a static
  // export has no image optimizer, and it is all cost and attack surface here.
  images: { unoptimized: true },
};

export default nextConfig;
