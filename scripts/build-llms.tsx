// Writes the two files agents read instead of the HTML, from the same content
// the page is rendered from:
//
//   public/index.md   the home page as Markdown (served for `/` when a request
//                     asks for `Accept: text/markdown`, by a 307 redirect; see vercel.json)
//   public/llms.txt   the llms.txt index (https://llmstxt.org): who this is,
//                     when to use the site, and where each thing lives
//
// Runs before every `bun run build` and `bun run dev`; neither file is
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
  "",
  "## Profiles",
  "",
  ...PROFILES.map((profile) => `- [${profile.name}](${profile.url}): ${profile.handle}`),
  "",
].join("\n");

await writeFile(path.join(publicDir, "index.md"), markdown);
await writeFile(path.join(publicDir, "llms.txt"), llms);
console.log(
  `wrote public/index.md (${Buffer.byteLength(markdown)} B, ${work.length} companies) and public/llms.txt (${Buffer.byteLength(llms)} B)`,
);
