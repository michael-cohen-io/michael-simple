// Runs after `next build` (postbuild): every file the export wrote to out/
// must be in the middleware's KNOWN_PATHS, and every KNOWN_PATHS entry must
// exist, or the middleware would answer a real file with a 404 (or wave an
// unknown path through to the HTML 404 for every client). Next's own
// payload files (`__next.*.txt`, `_not-found*`) and hashed assets under
// `_next/` are passed through by the middleware and skipped here.

import { existsSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { KNOWN_PATHS } from "../middleware";

const out = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "out");
if (!existsSync(path.join(out, "index.html"))) {
  console.error(`check-paths: ${out} has no index.html; run the build first`);
  process.exit(1);
}

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const file = path.join(dir, name);
    return statSync(file).isDirectory() ? walk(file) : [file];
  });
}

const published = walk(out)
  .map((file) => `/${path.relative(out, file).split(path.sep).join("/")}`)
  .filter((p) => !p.startsWith("/_"))
  .map((p) => (p === "/index.html" ? "/" : p));

const unlisted = published.filter((p) => !KNOWN_PATHS.has(p));
const missing = [...KNOWN_PATHS].filter(
  (p) => p !== "/index.html" && !published.includes(p),
);

if (unlisted.length || missing.length) {
  for (const p of unlisted) console.error(`check-paths: ${p} is in out/ but not in KNOWN_PATHS (middleware.ts)`);
  for (const p of missing) console.error(`check-paths: ${p} is in KNOWN_PATHS (middleware.ts) but not in out/`);
  process.exit(1);
}
console.log(`check-paths: ${published.length} published paths match KNOWN_PATHS`);
