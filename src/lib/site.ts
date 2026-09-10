/**
 * Facts about the site that more than one file needs. Every absolute URL in
 * the metadata, robots.txt and the sitemap is derived from SITE_URL, so the
 * host is decided in exactly one place. Production answers on the www host
 * (the apex 308s to it on Vercel), so that is the canonical origin.
 */
export const SITE_URL = "https://www.michaelcohen.io";

export const SITE_NAME = "Michael Cohen";

export const SITE_TITLE = "Michael Cohen — Software Engineer at Anthropic";

export const SITE_DESCRIPTION =
  "Michael Cohen is a software engineer on Anthropic's API team in Brooklyn, NY. Previously OpenSea and Amazon.";

export const CONTACT_EMAIL = "micohen13@gmail.com";

export const SOURCE_URL = "https://github.com/michael-cohen-io/michael-simple";

/**
 * The résumé PDF: where it lives and what it saves as. It is generated from
 * src/content on every build (scripts/build-resume.tsx); the month it was
 * last changed is `resume.updated` in src/content/resume.ts.
 */
export const RESUME = {
  href: "/MichaelCohenResume.pdf",
  download: "Michael Cohen - Resume.pdf",
} as const;

/**
 * Whether a hostname is one Vercel serves this site from: the apex (with or
 * without www) or a *.vercel.app deployment. The analytics scripts talk to
 * `/_vercel/*` endpoints that exist only there; anywhere else, such as a local
 * preview or CI, the requests would only produce 404s.
 */
export function isVercelHost(hostname: string): boolean {
  const apex = new URL(SITE_URL).hostname.replace(/^www\./, "");
  const host = hostname.toLowerCase();
  return host === apex || host === `www.${apex}` || host.endsWith(".vercel.app");
}
