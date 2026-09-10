/** @type {import('next').NextConfig} */
const nextConfig = {
  // There is no dynamic route, API or middleware: `next build` writes the
  // whole site to out/ and Vercel serves it as files. Response headers and
  // the *.vercel.app redirect are in vercel.json, because a static export has
  // no server to apply headers()/redirects() from this file.
  output: "export",
  // The React Compiler memoises components at build time; with one client
  // component the gain is invisible, but anything added later gets it free.
  reactCompiler: true,
  // `href` values are checked against the routes that exist.
  typedRoutes: true,
  poweredByHeader: false,
  // The only raster image is the 80px avatar, already a sized WebP; a static
  // export has no image optimizer, and it is all cost and attack surface here.
  images: { unoptimized: true },
};

export default nextConfig;
