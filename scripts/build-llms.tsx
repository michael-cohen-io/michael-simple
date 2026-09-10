// Writes the three files agents read instead of the HTML, from the same
// content the page is rendered from:
//
//   public/index.md     the home page as Markdown (served for `/` when a request
//                       asks for `Accept: text/markdown`, by a 307 redirect; see vercel.json)
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
const notFound = {
  description:
    "No resource at this path. The body is the site's HTML 404 page; it links the home page, the résumé PDF, sitemap.xml and llms.txt.",
  content: { "text/html": { schema: { type: "string" } } },
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
    responses: { ...responses, "404": { $ref: "#/components/responses/NotFound" } },
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
      "The one-page site: introduction, work history and contact details. Sending `Accept: text/markdown` answers with a 307 redirect to `/index.md`, the same content as Markdown; any other Accept value returns the HTML.",
      {
        "200": {
          description: "The page as HTML (also carries `Vary: Accept`).",
          content: { "text/html": { schema: { type: "string" } } },
        },
        "307": {
          description: "Sent when the request accepts `text/markdown`: the Markdown version lives at `/index.md`.",
          headers: {
            Location: { description: "Always `/index.md`.", schema: { type: "string", enum: ["/index.md"] } },
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
          content: { "application/json": { schema: { type: "object" } } },
        },
      },
    ),
  },
  components: { responses: { NotFound: notFound } },
};
for (const item of Object.values(openapi.paths)) Object.assign(item.get, { tags: ["site"] });

const openapiJson = `${JSON.stringify(openapi, null, 2)}\n`;

await writeFile(path.join(publicDir, "index.md"), markdown);
await writeFile(path.join(publicDir, "llms.txt"), llms);
await writeFile(path.join(publicDir, "openapi.json"), openapiJson);
console.log(
  `wrote public/index.md (${Buffer.byteLength(markdown)} B, ${work.length} companies), public/llms.txt (${Buffer.byteLength(llms)} B) and public/openapi.json (${Object.keys(openapi.paths).length} paths)`,
);
