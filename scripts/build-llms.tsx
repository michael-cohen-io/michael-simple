// Writes the three files agents read instead of the HTML, from the same
// content the page is rendered from:
//
//   public/index.md     the home page as Markdown (served for `/` when a request
//                       prefers `text/markdown`, by the rewrite in middleware.ts)
//   public/llms.txt     the llms.txt index (https://llmstxt.org): who this is,
//                       when to use the site, and where each thing lives
//   public/openapi.json an OpenAPI 3.1 description of the site's read-only
//                       resources (the files above, the PDF, the sitemap), so a
//                       tool-using agent can fetch them without guessing URLs
//
// Runs before every `bun run build` and `bun run dev`; none of the files is
// committed. `bun run llms` runs it on its own.

import { writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { resume } from "@/content/resume";
import { companies } from "@/content/work";
import { CONTACT_EMAIL, PROFILES, RESUME, SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/site";
import { companyViews } from "@/lib/work";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const publicDir = path.join(root, "public");

const work = companyViews(companies);
const resumeUrl = `${SITE_URL}${RESUME.href}`;

const markdown = [
  `# ${SITE_NAME}`,
  "",
  SITE_DESCRIPTION,
  "",
  `- Site: ${SITE_URL}/`,
  `- Email: ${CONTACT_EMAIL}`,
  ...PROFILES.map((profile) => `- ${profile.name}: ${profile.url}`),
  `- Résumé (one-page PDF): ${resumeUrl}`,
  "",
  "## Work Experience",
  "",
  ...work.flatMap((company) => [
    `### ${company.name} (${company.startLabel} – ${company.endLabel})`,
    "",
    ...(company.url ? [`${company.url}`, ""] : []),
    ...company.entries.flatMap((entry) => [
      `**${entry.role}**, ${entry.team} (${entry.startLabel} – ${entry.endLabel})`,
      "",
      ...entry.bullets.map((bullet) => `- ${bullet}`),
      "",
    ]),
  ]),
  "## Education",
  "",
  ...resume.education.map((item) => `- ${item.school}, ${item.degree} (${item.when})`),
  "",
  "## Skills",
  "",
  ...resume.skills.map((group) => `- ${group.label}: ${group.items.join(", ")}`),
  "",
].join("\n");

const llms = [
  `# ${SITE_NAME}`,
  "",
  `> ${SITE_DESCRIPTION}`,
  "",
  "The site is one page: a short introduction, a dated work history, and ways to get in touch. All of it is available as Markdown: request `/` with `Accept: text/markdown`, or fetch `/index.md` directly.",
  "",
  "## When to use this site",
  "",
  `- To confirm who ${SITE_NAME} of michaelcohen.io is: his current role, employer and team.`,
  "- To read his work history with dates, teams, roles and links, as Markdown or as the one-page PDF résumé.",
  `- To reach him: email ${CONTACT_EMAIL}, or the profiles listed below.`,
  "- Not for Anthropic product or API questions (see https://docs.claude.com), and not a source about any other Michael Cohen.",
  "",
  "## Pages",
  "",
  `- [Home](${SITE_URL}/): the site`,
  `- [Home as Markdown](${SITE_URL}/index.md): the same content as text, for agents`,
  `- [Résumé (PDF)](${resumeUrl}): one page, generated from the same content`,
  `- [Sitemap](${SITE_URL}/sitemap.xml): every indexable URL`,
  `- [OpenAPI description](${SITE_URL}/openapi.json): the resources above as an OpenAPI 3.1 document, for tool-using agents (read-only, no authentication)`,
  "",
  "## Profiles",
  "",
  ...PROFILES.map((profile) => `- [${profile.name}](${profile.url}): ${profile.handle}`),
  "",
].join("\n");

// The site has no API in the usual sense: every resource is a static file
// fetched with GET, unauthenticated, and answered from the CDN. Describing
// those few resources in OpenAPI still helps: an agent that consumes API
// descriptions gets typed operations (operationId, description, response
// media types) for the résumé, the Markdown page and the llms.txt index
// instead of scraping the HTML for their URLs.
// The 404 is negotiated by the middleware (middleware.ts): a problem document
// for JSON clients, Markdown for everyone else who is not a browser.
const notFound = {
  description:
    "No resource at this path. The body follows the Accept header: an RFC 9457 problem document for `application/json` or `application/problem+json` (and by default under `/api/`, `/v1/` and `/graphql`), the site's HTML 404 page for `text/html`, and otherwise (including `*/*` and no Accept header) a short Markdown note. Every variant links the home page, the Markdown page, llms.txt, this document, the résumé PDF and the sitemap.",
  headers: { Vary: { schema: { type: "string", enum: ["Accept"] } } },
  content: {
    "text/markdown": { schema: { type: "string" } },
    "application/problem+json": { schema: { $ref: "#/components/schemas/Problem" } },
    "text/html": { schema: { type: "string" } },
  },
};

const problemSchema = {
  type: "object",
  description: "RFC 9457 problem details, with a stable `code` and a `hint` saying where to look instead.",
  required: ["type", "title", "status", "detail", "instance", "code", "hint", "resources"],
  properties: {
    type: { type: "string", format: "uri", description: "Always `about:blank`: the status code says it all.", enum: ["about:blank"] },
    title: { type: "string", enum: ["Not Found"] },
    status: { type: "integer", enum: [404] },
    detail: { type: "string", description: "What was asked for and where the resources are listed." },
    instance: { type: "string", description: "The path that was requested." },
    code: { type: "string", description: "Machine-readable error code.", enum: ["not_found"] },
    hint: { type: "string", description: "How to recover." },
    resources: {
      type: "object",
      description: "Absolute URLs of every resource on the site.",
      required: ["home", "markdown", "llms", "openapi", "resume", "sitemap"],
      properties: Object.fromEntries(
        ["home", "markdown", "llms", "openapi", "resume", "sitemap"].map((key) => [key, { type: "string", format: "uri" }]),
      ),
    },
  },
};

const operation = (
  operationId: string,
  summary: string,
  description: string,
  responses: Record<string, unknown>,
) => ({
  get: {
    operationId,
    summary,
    description,
    // Inlined rather than $ref'd: not every reader resolves response references.
    responses: { ...responses, "404": notFound },
  },
});

const textResponse = (description: string, mediaType: string) => ({
  "200": {
    description,
    content: { [mediaType]: { schema: { type: "string" } } },
  },
});

const openapi = {
  openapi: "3.1.0",
  info: {
    title: `${SITE_NAME} (michaelcohen.io)`,
    version: "1.0.0",
    summary: "The machine-readable resources of michaelcohen.io, a personal site.",
    description: [
      `${SITE_DESCRIPTION} The site is a single page; these are the files on it that an agent can fetch directly.`,
      "All operations are unauthenticated GET requests answered from a CDN; there are no rate limits beyond the host's, no write operations and no other endpoints.",
      "The résumé PDF is not indexed by search engines (X-Robots-Tag: noindex) but may be fetched freely.",
    ].join(" "),
    contact: { name: SITE_NAME, url: `${SITE_URL}/`, email: CONTACT_EMAIL },
  },
  externalDocs: { description: "llms.txt: what the site is for and where each thing lives", url: `${SITE_URL}/llms.txt` },
  servers: [{ url: SITE_URL, description: "Production (the only host; other hostnames redirect here)" }],
  tags: [{ name: "site", description: "Read-only resources generated from the site's content at build time" }],
  paths: {
    "/": operation(
      "getHome",
      "The home page",
      "The one-page site: introduction, work history and contact details. A request that prefers `text/markdown` (acceptmarkdown.com) gets the same content as Markdown at this URL, no redirect; any other Accept value gets the HTML. The response carries `Vary: Accept`.",
      {
        "200": {
          description: "The page, as HTML or as Markdown depending on the Accept header.",
          headers: { Vary: { schema: { type: "string", enum: ["Accept"] } } },
          content: {
            "text/html": { schema: { type: "string" } },
            "text/markdown": { schema: { type: "string" } },
          },
        },
      },
    ),
    "/index.md": operation(
      "getHomeMarkdown",
      "The home page as Markdown",
      "Everything on the page as CommonMark: the introduction, contact details and profile links, every role with dates, team and bullet points (links preserved), education and skills. Generated from the same content as the HTML on every build.",
      textResponse("The page as Markdown.", "text/markdown"),
    ),
    "/llms.txt": operation(
      "getLlmsTxt",
      "The llms.txt index",
      "An llms.txt file (https://llmstxt.org): a one-paragraph summary, when to use this site and when not to, and links to every page and profile.",
      textResponse("The index as Markdown-formatted plain text.", "text/plain"),
    ),
    [RESUME.href]: operation(
      "getResumePdf",
      "The one-page résumé",
      "A single-page PDF résumé generated from the same work history as the page, with a shorter selection of bullet points per role. Served inline with a `Content-Disposition` filename.",
      {
        "200": {
          description: "The résumé.",
          content: { "application/pdf": { schema: { type: "string", format: "binary" } } },
        },
      },
    ),
    "/sitemap.xml": operation(
      "getSitemap",
      "The XML sitemap",
      "Every indexable URL on the site (there is one) in the sitemaps.org format.",
      textResponse("The sitemap.", "application/xml"),
    ),
    "/openapi.json": operation(
      "getOpenApi",
      "This document",
      "The OpenAPI 3.1 description of the resources listed here.",
      {
        "200": {
          description: "This document.",
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["openapi", "info", "servers", "paths"],
                properties: {
                  openapi: { type: "string", description: "The OpenAPI version, 3.1.x." },
                  info: { type: "object" },
                  servers: { type: "array", items: { type: "object" } },
                  paths: { type: "object" },
                  components: { type: "object" },
                },
              },
            },
          },
        },
      },
    ),
  },
  components: { schemas: { Problem: problemSchema }, responses: { NotFound: notFound } },
};
for (const item of Object.values(openapi.paths)) Object.assign(item.get, { tags: ["site"] });

const openapiJson = `${JSON.stringify(openapi, null, 2)}\n`;

await writeFile(path.join(publicDir, "index.md"), markdown);
await writeFile(path.join(publicDir, "llms.txt"), llms);
await writeFile(path.join(publicDir, "openapi.json"), openapiJson);
console.log(
  `wrote public/index.md (${Buffer.byteLength(markdown)} B, ${work.length} companies), public/llms.txt (${Buffer.byteLength(llms)} B) and public/openapi.json (${Object.keys(openapi.paths).length} paths)`,
);
