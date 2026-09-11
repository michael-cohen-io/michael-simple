/**
 * Facts about the site that more than one file needs. Every absolute URL in
 * the metadata, robots.txt and the sitemap is derived from SITE_URL, so the
 * host is decided in exactly one place. Production answers on the www host
 * (the apex 308s to it on Vercel), so that is the canonical origin.
 */
export const SITE_URL = "https://www.michaelcohen.io";

export const SITE_NAME = "Michael Cohen";

export const SITE_TITLE = "Michael Cohen — Member of Technical Staff at Anthropic";

export const SITE_DESCRIPTION =
  "Michael Cohen is a Member of Technical Staff at Anthropic, on the Agentic Systems team building Claude Managed Agents. Brooklyn, NY.";

/** On the domain, forwarded to the mailbox; the Gmail address is no longer published. */
export const CONTACT_EMAIL = "hello@michaelcohen.io";

export const SOURCE_URL = "https://github.com/michael-cohen-io/michael-simple";

/**
 * Profiles elsewhere, in the order the Connect section lists them. The same
 * URLs are the `sameAs` links in the page's structured data, and the X handle
 * is the card creator in the Twitter metadata.
 */
export const PROFILES = [
  { name: "GitHub", handle: "@michael-cohen-io", url: "https://github.com/michael-cohen-io" },
  { name: "LinkedIn", handle: "/michael-cohen1995", url: "https://www.linkedin.com/in/michael-cohen1995/" },
  { name: "X", handle: "@_hi_mc", url: "https://x.com/_hi_mc" },
] as const;

export const X_HANDLE = PROFILES[2].handle;

/**
 * The resume PDF: where it lives and what it saves as. It is generated from
 * src/content on every build (scripts/build-resume.tsx).
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
