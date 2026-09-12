// Runs after `next build` (postbuild): every file the export wrote to out/
// must be in the middleware's KNOWN_PATHS, and every KNOWN_PATHS entry must
// exist, or the middleware would answer a real file with a 404 (or wave an
// unknown path through to the HTML 404 for every client). Next's own
// payload files (`__next.*.txt`, `_not-found*`, per isNextInternal) and
// hashed assets under `_next/` are passed through by the middleware and
// skipped here.
//
// It also keeps the API description honest: every function path
// (FUNCTION_PATHS) must be an operation in openapi.json with the method the
// function exports, and every path openapi.json describes must exist, as a
// file or a function. So adding a function means describing it in
// scripts/build-llms.tsx, and describing a path means shipping it.

import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { FUNCTION_PATHS, KNOWN_PATHS, isNextInternal } from "../middleware";
import { ASK_PATH } from "../src/lib/ask-api";

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
  .filter((p) => !p.startsWith("/_next/") && !isNextInternal(p))
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

// The API description against the routes. The methods each function
// exports are listed here, next to the path the contract names.
const FUNCTION_METHODS: Record<string, string[]> = { [ASK_PATH]: ["post"] };
const openapi = JSON.parse(readFileSync(path.join(out, "openapi.json"), "utf8")) as {
  paths: Record<string, Record<string, unknown>>;
};
const problems: string[] = [];
for (const fn of FUNCTION_PATHS) {
  const methods = FUNCTION_METHODS[fn];
  if (!methods) problems.push(`${fn} is in FUNCTION_PATHS (middleware.ts) but scripts/check-paths.ts does not know its methods`);
  for (const method of methods ?? []) {
    if (!openapi.paths[fn]?.[method]) problems.push(`${fn} (${method.toUpperCase()}) is a function but not an operation in openapi.json (scripts/build-llms.tsx)`);
  }
}
for (const [p, item] of Object.entries(openapi.paths)) {
  const exists = KNOWN_PATHS.has(p) || FUNCTION_PATHS.has(p);
  if (!exists) problems.push(`${p} is described in openapi.json but is neither a file in out/ nor a function`);
  if (FUNCTION_PATHS.has(p)) {
    for (const method of Object.keys(item)) {
      if (!FUNCTION_METHODS[p]?.includes(method)) problems.push(`${p} documents ${method.toUpperCase()}, which the function does not export`);
    }
  }
}
if (problems.length) {
  for (const problem of problems) console.error(`check-paths: ${problem}`);
  process.exit(1);
}
console.log(`check-paths: openapi.json describes ${Object.keys(openapi.paths).length} paths, all of them real, including every function`);
