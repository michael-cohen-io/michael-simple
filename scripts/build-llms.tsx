// Writes the four files agents read instead of the HTML, from the same
// content the page is rendered from:
//
//   public/index.md     the home page as Markdown (served for `/` when a request
//                       prefers `text/markdown`, by the rewrite in middleware.ts)
//   public/llms.txt     the same document: the llms.txt shape (who this is,
//                       when to use the site, where things live) then the page
//   public/resume.json  the resume in the JSON Resume schema (jsonresume.org),
//                       the same work history as typed JSON
//   public/openapi.json an OpenAPI 3.1 description of the site's resources
//                       (the files above, the PDF, the sitemap) and of the one
//                       endpoint, POST /api/ask, so a tool-using agent can use
//                       them without guessing URLs. The endpoint's contract is
//                       src/lib/ask-api.ts, shared with the function itself.
//
// Runs before every `bun run build` and `bun run dev`; none of the files is
// committed. `bun run llms` runs it on its own.

import { writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { resume } from "@/content/resume";
import { companies } from "@/content/work";
import { writing } from "@/content/writing";
import { ASK_EFFECTS_SCHEMA, ASK_EVENTS, ASK_PATH, ASK_PROBLEMS, ASK_PROBLEM_SCHEMA, ASK_REQUEST_SCHEMA } from "@/lib/ask-api";
import { MAX_QUESTION_LENGTH } from "@/lib/ask";
import { CONTACT_EMAIL, PROFILES, RESUME, SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/site";
import { companyViews, monthLabel } from "@/lib/work";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const publicDir = path.join(root, "public");

const work = companyViews(companies);
const resumeUrl = `${SITE_URL}${RESUME.href}`;

// One document serves both files: llms.txt (https://llmstxt.org), and what
// `/` returns for `Accept: text/markdown`. The llms.txt shape comes first
// (title, summary, when to use, where things live), then the page itself.
const markdown = [
  `# ${SITE_NAME}`,
  "",
  `> ${SITE_DESCRIPTION}`,
  "",
  "The site is one page: a short introduction, a dated work history, writing and talks, and ways to get in touch. This document is all of it as Markdown: it is what `/` returns for `Accept: text/markdown`, and it is `/llms.txt`. The work history is also typed JSON at `/resume.json`.",
  "",
  "## When to use this site",
  "",
  `- To confirm who ${SITE_NAME} of michaelcohen.io is: his current role, employer and team.`,
  "- To read his work history with dates, teams, roles and links, as Markdown, as JSON or as the one-page PDF resume.",
  `- To reach him: email ${CONTACT_EMAIL}, or the profiles listed below.`,
  "- Not for Anthropic product or API questions (see https://docs.claude.com), and not a source about any other Michael Cohen.",
  "",
  "## Links",
  "",
  `- Site: ${SITE_URL}/`,
  `- Email: ${CONTACT_EMAIL}`,
  ...PROFILES.map((profile) => `- ${profile.name}: ${profile.url}`),
  `- Resume (PDF): ${resumeUrl}`,
  `- Resume (JSON, jsonresume.org schema): ${SITE_URL}/resume.json`,
  `- OpenAPI description of every file here and of the question endpoint (no authentication): ${SITE_URL}/openapi.json`,
  `- Sitemap: ${SITE_URL}/sitemap.xml`,
  "",
  "## Asking a question",
  "",
  `- POST ${SITE_URL}${ASK_PATH} with a JSON body \`{"question": "…"}\` (up to ${MAX_QUESTION_LENGTH} characters). The answer comes from a Claude agent grounded on this document and the pages it links to.`,
  "- The response is a stream of server-sent events: `delta` (text as it is written), `message` (a finished message), `done` (`{sessionId, backend}`) or `error` (an RFC 9457 problem document). Send `sessionId` back with the next question to keep the thread.",
  "- Limits: 5 questions a minute per address. Errors before the stream are problem documents with a stable `code`; every code is listed in the OpenAPI description.",
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
  "## Writing & Talks",
  "",
  ...[...writing]
    .sort((a, b) => b.date.localeCompare(a.date))
    .map((piece) => `- [${piece.title}](${piece.url}), ${piece.venue}, ${monthLabel(piece.date)}`),
  "",
  "## Education",
  "",
  ...resume.education.map((item) => `- ${item.school}, ${item.degree} (${item.when})`),
  "",
  "## Skills",
  "",
  ...resume.skills.map((group) => `- ${group.label}: ${group.items.join(", ")}`),
  "",
].join("\n");

const llms = markdown;

// The site has no API in the usual sense: every resource is a static file
// fetched with GET, unauthenticated, and answered from the CDN. Describing
// those few resources in OpenAPI still helps: an agent that consumes API
// descriptions gets typed operations (operationId, description, response
// media types) for the resume, the Markdown page and the llms.txt index
// instead of scraping the HTML for their URLs.
// The 404 is negotiated by the middleware (middleware.ts): a problem document
// for JSON clients, Markdown for everyone else who is not a browser.
const notFound = {
  description:
    "No resource at this path. The body follows the Accept header: an RFC 9457 problem document for `application/json` or `application/problem+json` (and by default under `/api/`, `/v1/` and `/graphql`), the site's HTML 404 page for `text/html`, and otherwise (including `*/*` and no Accept header) a short Markdown note. Every variant links the home page, the Markdown page, llms.txt, this document, the resume PDF and the sitemap.",
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

/** Markdown bullets as plain text: links keep their words, emphasis its text. */
const plain = (markdown: string) =>
  markdown
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/(\*\*|__)(.+?)\1/g, "$2")
    .replace(/(\*|_)(.+?)\1/g, "$2");

// The resume in the JSON Resume schema (https://jsonresume.org/schema):
// the same work history as the page, every role its own entry, bullets as
// plain-text highlights, the profiles from lib/site.ts, and the writing as
// publications. Dates are YYYY-MM, which the schema allows.
const current = work.find((company) => company.endIso === null)?.entries[0];
const resumeJson = {
  $schema: "https://raw.githubusercontent.com/jsonresume/resume-schema/v1.0.0/schema.json",
  basics: {
    name: SITE_NAME,
    label: current ? `${current.role}, ${work[0].name}` : undefined,
    image: `${SITE_URL}/portrait.jpg`,
    email: CONTACT_EMAIL,
    url: `${SITE_URL}/`,
    summary: SITE_DESCRIPTION,
    location: { city: "Brooklyn", region: "NY", countryCode: "US" },
    profiles: PROFILES.map((profile) => ({
      network: profile.name,
      username: profile.handle.replace(/^[@/]/, ""),
      url: profile.url,
    })),
  },
  work: work.flatMap((company) =>
    company.entries.map((entry) => ({
      name: company.name,
      position: entry.role,
      ...(company.url && { url: company.url }),
      startDate: entry.startIso,
      ...(entry.endIso && { endDate: entry.endIso }),
      summary: entry.team,
      highlights: entry.bullets.map(plain),
    })),
  ),
  education: resume.education.map((item) => {
    const [studyType, ...area] = item.degree.split(" in ");
    return {
      institution: item.school,
      studyType,
      area: area.join(" in "),
      endDate: item.graduated,
    };
  }),
  skills: resume.skills.map((group) => ({ name: group.label, keywords: group.items })),
  publications: [...writing]
    .sort((a, b) => b.date.localeCompare(a.date))
    .map((piece) => ({
      name: piece.title,
      publisher: piece.venue,
      releaseDate: piece.date,
      url: piece.url,
    })),
  meta: { canonical: `${SITE_URL}/resume.json`, version: "v1.0.0" },
};

const resumeJsonSchema = {
  type: "object",
  description: "A JSON Resume document (https://jsonresume.org/schema).",
  required: ["basics", "work", "education", "skills"],
  properties: {
    $schema: { type: "string", format: "uri" },
    basics: {
      type: "object",
      required: ["name", "email", "url", "summary", "location", "profiles"],
      properties: {
        name: { type: "string" },
        label: { type: "string", description: "Current title and employer." },
        image: { type: "string", format: "uri" },
        email: { type: "string", format: "email" },
        url: { type: "string", format: "uri" },
        summary: { type: "string" },
        location: {
          type: "object",
          properties: { city: { type: "string" }, region: { type: "string" }, countryCode: { type: "string" } },
        },
        profiles: {
          type: "array",
          items: {
            type: "object",
            required: ["network", "username", "url"],
            properties: { network: { type: "string" }, username: { type: "string" }, url: { type: "string", format: "uri" } },
          },
        },
      },
    },
    work: {
      type: "array",
      description: "One entry per role, newest first.",
      items: {
        type: "object",
        required: ["name", "position", "startDate", "summary", "highlights"],
        properties: {
          name: { type: "string", description: "Employer." },
          position: { type: "string" },
          url: { type: "string", format: "uri" },
          startDate: { type: "string", pattern: "^[0-9]{4}-[0-9]{2}$" },
          endDate: { type: "string", pattern: "^[0-9]{4}-[0-9]{2}$", description: "Absent while the role is ongoing." },
          summary: { type: "string", description: "The team." },
          highlights: { type: "array", items: { type: "string" } },
        },
      },
    },
    education: {
      type: "array",
      items: {
        type: "object",
        required: ["institution", "studyType", "area", "endDate"],
        properties: {
          institution: { type: "string" },
          studyType: { type: "string" },
          area: { type: "string" },
          endDate: { type: "string", pattern: "^[0-9]{4}-[0-9]{2}$" },
        },
      },
    },
    skills: {
      type: "array",
      items: {
        type: "object",
        required: ["name", "keywords"],
        properties: { name: { type: "string" }, keywords: { type: "array", items: { type: "string" } } },
      },
    },
    publications: {
      type: "array",
      items: {
        type: "object",
        required: ["name", "publisher", "releaseDate", "url"],
        properties: {
          name: { type: "string" },
          publisher: { type: "string" },
          releaseDate: { type: "string", pattern: "^[0-9]{4}-[0-9]{2}$" },
          url: { type: "string", format: "uri" },
        },
      },
    },
    meta: { type: "object", properties: { canonical: { type: "string", format: "uri" }, version: { type: "string" } } },
  },
};

const openapi = {
  openapi: "3.1.0",
  info: {
    title: `${SITE_NAME} (michaelcohen.io)`,
    version: "1.0.0",
    summary: "The machine-readable resources of michaelcohen.io, a personal site.",
    description: [
      `${SITE_DESCRIPTION} The site is a single page; these are the files on it that an agent can fetch directly.`,
      "The files are unauthenticated GET requests answered from a CDN, with no rate limits beyond the host's. The one endpoint, POST /api/ask, asks a Claude agent a question about the site's subject and streams the answer; it is rate limited and has no other side effect.",
      "The resume PDF is not indexed by search engines (X-Robots-Tag: noindex) but may be fetched freely.",
    ].join(" "),
    contact: { name: SITE_NAME, url: `${SITE_URL}/`, email: CONTACT_EMAIL },
  },
  externalDocs: { description: "llms.txt: what the site is for and where each thing lives", url: `${SITE_URL}/llms.txt` },
  servers: [{ url: SITE_URL, description: "Production (the only host; other hostnames redirect here)" }],
  tags: [
    { name: "site", description: "Read-only resources generated from the site's content at build time" },
    { name: "ask", description: "The one endpoint: a question to a Claude agent grounded on the site" },
  ],
  paths: {
    [ASK_PATH]: {
      post: {
        operationId: "ask",
        tags: ["ask"],
        summary: "Ask a question about Michael",
        description: [
          "Sends one question to a Claude agent (Claude Managed Agents) grounded on the site's Markdown and the pages it links to, and streams the answer back as server-sent events.",
          "Each event is `event: <type>` followed by `data: <JSON>`:",
          ...Object.entries(ASK_EVENTS).map(([type, what]) => `- \`${type}\`: ${what}`),
          "A follow-up sends the `sessionId` from `done` back in the body to keep the thread. The `party` and `runs` fields exist for the site's own page (Party Mode) and can be left out.",
          `Rate limited to 5 questions a minute per address. Anything wrong with the request itself is a problem document with its own status, before any stream starts; every code: ${Object.entries(ASK_PROBLEMS).map(([code, p]) => `\`${code}\` (${p.status}, ${p.when})`).join("; ")}.`,
        ].join("\n"),
        requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/AskRequest" } } } },
        responses: {
          "200": {
            description: "The answer, as a stream of server-sent events (see the description).",
            headers: { "Cache-Control": { schema: { type: "string", enum: ["no-store"] } } },
            content: { "text/event-stream": { schema: { type: "string", description: "Server-sent events; each `data` line is JSON with a `type` field." } } },
          },
          ...Object.fromEntries(
            [...new Set(Object.values(ASK_PROBLEMS).map((p) => p.status))]
              .filter((status) => status < 500 || status === 503)
              .sort()
              .map((status) => [
                String(status),
                {
                  description: Object.entries(ASK_PROBLEMS)
                    .filter(([, p]) => p.status === status && !p.when.includes("`error` event"))
                    .map(([code, p]) => `\`${code}\`: ${p.when}`)
                    .join(" "),
                  content: { "application/problem+json": { schema: { $ref: "#/components/schemas/AskProblem" } } },
                },
              ]),
          ),
        },
      },
    },
    "/": operation(
      "getHome",
      "The home page",
      "The one-page site: introduction, work history, writing and contact details. A request that prefers `text/markdown` (acceptmarkdown.com) gets the same content as Markdown at this URL (the same document as /llms.txt), no redirect; any other Accept value gets the HTML. The response carries `Vary: Accept`.",
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
      "Everything on the page as CommonMark, in the llms.txt shape: a summary, when to use the site, links, every role with dates, team and bullet points (links preserved), writing, education and skills. The same document as /llms.txt. Generated from the same content as the HTML on every build.",
      textResponse("The page as Markdown.", "text/markdown"),
    ),
    "/llms.txt": operation(
      "getLlmsTxt",
      "The llms.txt index",
      "An llms.txt file (https://llmstxt.org): a one-paragraph summary, when to use this site and when not to, links to every file and profile, and then the whole page as Markdown. The same document as /index.md.",
      textResponse("The index as Markdown-formatted plain text.", "text/plain"),
    ),
    [RESUME.href]: operation(
      "getResumePdf",
      "The one-page resume",
      "A single-page PDF resume generated from the same work history as the page, with a shorter selection of bullet points per role. Served inline with a `Content-Disposition` filename.",
      {
        "200": {
          description: "The resume.",
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
    "/resume.json": operation(
      "getResumeJson",
      "The resume as JSON Resume",
      "The work history, education, skills, profiles and writing in the JSON Resume schema (https://jsonresume.org/schema), generated from the same content as the page. The typed counterpart of /index.md and the PDF.",
      {
        "200": {
          description: "The resume.",
          content: { "application/json": { schema: { $ref: "#/components/schemas/JsonResume" } } },
        },
      },
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
  components: {
    schemas: {
      Problem: problemSchema,
      JsonResume: resumeJsonSchema,
      AskRequest: ASK_REQUEST_SCHEMA,
      AskProblem: ASK_PROBLEM_SCHEMA,
      PartyEffects: ASK_EFFECTS_SCHEMA,
    },
    responses: { NotFound: notFound },
  },
};
for (const item of Object.values(openapi.paths)) if ("get" in item) Object.assign(item.get, { tags: ["site"] });

const openapiJson = `${JSON.stringify(openapi, null, 2)}\n`;

await writeFile(path.join(publicDir, "index.md"), markdown);
await writeFile(path.join(publicDir, "llms.txt"), llms);
await writeFile(path.join(publicDir, "resume.json"), `${JSON.stringify(resumeJson, null, 2)}\n`);
await writeFile(path.join(publicDir, "openapi.json"), openapiJson);
console.log(
  `wrote public/index.md (${Buffer.byteLength(markdown)} B, ${work.length} companies), public/llms.txt (${Buffer.byteLength(llms)} B), public/resume.json (${resumeJson.work.length} roles) and public/openapi.json (${Object.keys(openapi.paths).length} paths)`,
);
