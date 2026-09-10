// Renders public/MichaelCohenResume.pdf from src/content/work.ts and
// src/content/resume.ts. Runs before every `bun run build` and `bun run dev`
// (the prebuild/predev scripts), so the PDF always matches the site; it is
// not committed. Fails the build when the content is inconsistent or the
// résumé no longer fits on one page.
//
//   bun run resume:pdf

import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { renderToFile } from "@react-pdf/renderer";

import { resume } from "@/content/resume";
import { companies } from "@/content/work";
import { newestMonth, resumeBlocks } from "@/lib/resume";
import { ResumeDocument } from "@/resume/document";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const output = path.join(root, "public", "MichaelCohenResume.pdf");

const blocks = resumeBlocks(companies);
const newest = newestMonth(blocks);
if (resume.updated < newest) {
  throw new Error(
    `content/resume.ts: updated is ${resume.updated} but the work history reaches ${newest}; bump it`,
  );
}

await renderToFile(<ResumeDocument resume={resume} blocks={blocks} />, output);

const bytes = await readFile(output);
// Each page is a `/Type /Page` object; `/Pages` is the tree above them.
const pages = bytes.toString("latin1").match(/\/Type\s*\/Page(?!s)/g)?.length ?? 0;
if (pages !== 1) {
  throw new Error(
    `The résumé runs to ${pages} pages; shorten a role's resume.bullets in content/work.ts until it fits on one`,
  );
}
console.log(
  `wrote ${path.relative(root, output)}: ${pages} page, ${Math.round(bytes.length / 1024)} kB, ${blocks.length} roles, updated ${resume.updated}`,
);
