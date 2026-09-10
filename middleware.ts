// Vercel Routing Middleware (https://vercel.com/docs/routing-middleware): the
// one piece of the site that runs per request, at the edge, in front of the
// static files in out/. It does two things a static host cannot:
//
//   1. Serve `/` as Markdown, at the same URL, when the request prefers
//      `text/markdown` (acceptmarkdown.com): a rewrite to /index.md.
//   2. Answer paths that do not exist with a 404 whose body fits the client:
//      Markdown for agents and curl, an RFC 9457 problem document for JSON
//      clients, and the HTML page for browsers.
//
// Everything else passes through to the files. Next.js compiles this file
// too (it sees a root middleware.ts) and warns that a static export ignores
// it; that is expected, Vercel runs it, not Next.
//
// KNOWN_PATHS is the list of every path the export publishes. It is checked
// against out/ after every build (scripts/check-paths.ts), so a new file in
// public/ or a new metadata route fails the build until it is listed here.

import { next, rewrite } from "@vercel/functions";

import { RESUME, SITE_URL } from "./src/lib/site";

export const config = {
  // Everything but Next's hashed assets, which are only ever real files.
  matcher: ["/((?!_next/).*)"],
};

/**
 * Next's own files in the export: the RSC payloads (`/__next.*.txt`) and the
 * not-found route's files (`/_not-found*`). They are real files, and the only
 * paths under a leading underscore that are; anything else starting with `_`
 * is as unknown as any other path (a scanner's `/__probe` included).
 */
export function isNextInternal(pathname: string): boolean {
  return pathname.startsWith("/__next.") || pathname.startsWith("/_not-found");
}

/**
 * Paths that read as API calls. A client asking for one of these is a
 * program, so an unknown one gets a problem document unless the request
 * says it prefers HTML or Markdown.
 */
export function looksLikeApi(pathname: string): boolean {
  return /^\/(api|graphql|v\d+)(\/|$)/.test(pathname);
}

export const KNOWN_PATHS: ReadonlySet<string> = new Set([
  // The page, its RSC payload and the 404 page.
  "/",
  "/index.html",
  "/index.txt",
  "/404.html",
  // Generated from src/content before every build.
  "/index.md",
  "/llms.txt",
  "/openapi.json",
  "/resume.json",
  RESUME.href,
  // Metadata routes in src/app.
  "/robots.txt",
  "/sitemap.xml",
  "/manifest.webmanifest",
  "/opengraph-image",
  "/twitter-image",
  "/icon.svg",
  "/apple-icon.png",
  "/favicon.ico",
  // public/
  "/memoji.webp",
  "/portrait.jpg",
  "/profile.webp",
  "/profile-160.webp",
  "/amazon.svg",
  "/anthropic.svg",
  "/anthropic_dark.svg",
  "/clad.svg",
  "/ibm.svg",
  "/opensea.svg",
]);

type Offer = "text/html" | "text/markdown" | "application/problem+json";

/**
 * The offer the Accept header prefers: highest q wins, ties go to the
 * earlier offer. `application/json` counts as accepting a problem document.
 * No Accept header, or one that matches nothing, means the first offer.
 */
export function preferred(accept: string | null, offers: readonly Offer[]): Offer {
  if (!accept) return offers[0];
  const ranges = accept.split(",").map((part) => {
    const [type, ...params] = part.trim().split(";");
    const q = params.map((p) => p.trim().split("=")).find(([k]) => k === "q")?.[1];
    return { type: type.trim().toLowerCase(), q: q === undefined ? 1 : Number(q) || 0 };
  });
  const matches = (offer: Offer, type: string) =>
    type === offer ||
    type === "*/*" ||
    type === `${offer.split("/")[0]}/*` ||
    (offer === "application/problem+json" && type === "application/json");
  let best: { offer: Offer; q: number } | undefined;
  for (const offer of offers) {
    const q = Math.max(0, ...ranges.filter((r) => matches(offer, r.type)).map((r) => r.q));
    if (q > 0 && (!best || q > best.q)) best = { offer, q };
  }
  return best?.offer ?? offers[0];
}

const RESOURCES = {
  home: `${SITE_URL}/`,
  markdown: `${SITE_URL}/index.md`,
  llms: `${SITE_URL}/llms.txt`,
  openapi: `${SITE_URL}/openapi.json`,
  resume: `${SITE_URL}${RESUME.href}`,
  sitemap: `${SITE_URL}/sitemap.xml`,
} as const;

function markdown404(pathname: string): Response {
  const body = [
    `# 404: nothing at ${pathname}`,
    "",
    `There is no resource at \`${pathname}\` on ${new URL(SITE_URL).host}. The site is one page. Where to look next:`,
    "",
    `- Home: ${RESOURCES.home} (as Markdown: ${RESOURCES.markdown})`,
    `- What this site is for and where things live: ${RESOURCES.llms}`,
    `- Every fetchable resource, as OpenAPI: ${RESOURCES.openapi}`,
    `- Resume (PDF): ${RESOURCES.resume}`,
    `- Sitemap: ${RESOURCES.sitemap}`,
    "",
  ].join("\n");
  return new Response(body, {
    status: 404,
    headers: {
      "content-type": "text/markdown; charset=utf-8",
      "cache-control": "no-store",
      vary: "Accept",
    },
  });
}

/** RFC 9457 problem details, with a stable code and a way forward. */
function problem404(pathname: string): Response {
  const body = {
    type: "about:blank",
    title: "Not Found",
    status: 404,
    detail: `There is no resource at ${pathname} on ${new URL(SITE_URL).host}. The site is one page; every fetchable resource is listed in ${RESOURCES.openapi}.`,
    instance: pathname,
    code: "not_found",
    hint: "Fetch / for the page (or /index.md for the same content as Markdown), /llms.txt for what the site is for, and /openapi.json for every resource it serves.",
    resources: RESOURCES,
  };
  return new Response(JSON.stringify(body, null, 2), {
    status: 404,
    headers: {
      "content-type": "application/problem+json",
      "cache-control": "no-store",
      vary: "Accept",
    },
  });
}

export default function middleware(request: Request): Response {
  const { pathname } = new URL(request.url);
  const accept = request.headers.get("accept");

  if (pathname === "/") {
    if (preferred(accept, ["text/html", "text/markdown"]) === "text/markdown") {
      return rewrite(new URL("/index.md", request.url), {
        headers: { "content-type": "text/markdown; charset=utf-8", vary: "Accept" },
      });
    }
    return next();
  }

  // Published files and Next's own payload files are the filesystem's to answer.
  if (KNOWN_PATHS.has(pathname) || isNextInternal(pathname)) return next();

  const offers: readonly Offer[] = looksLikeApi(pathname)
    ? ["application/problem+json", "text/markdown", "text/html"]
    : ["text/markdown", "application/problem+json", "text/html"];
  const variant = preferred(accept, offers);
  // One line per miss, in the Vercel runtime logs: which paths agents and
  // scanners try, what they accept, and what they were given.
  console.log(
    JSON.stringify({
      event: "not_found",
      method: request.method,
      path: pathname,
      accept,
      userAgent: request.headers.get("user-agent"),
      variant,
    }),
  );
  switch (variant) {
    case "text/html":
      // Vercel serves out/404.html with a 404 status.
      return next();
    case "application/problem+json":
      return problem404(pathname);
    default:
      return markdown404(pathname);
  }
}
