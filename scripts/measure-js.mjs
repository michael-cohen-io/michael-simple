// Prints the JavaScript the exported home page loads before any interaction:
// every script out/index.html references, raw and gzipped, then per script.
// Usage: node scripts/measure-js.mjs out
import { readFileSync } from "node:fs";
import { gzipSync } from "node:zlib";
import path from "node:path";
const out = process.argv[2];
const html = readFileSync(path.join(out, "index.html"), "utf8");
const srcs = [...new Set([...html.matchAll(/<script[^>]+src="([^"]+\.js)"/g)].map((m) => m[1]))];
let raw = 0, gz = 0;
for (const src of srcs) {
  const file = path.join(out, src);
  const bytes = readFileSync(file);
  raw += bytes.length; gz += gzipSync(bytes).length;
}
console.log(`${srcs.length} scripts, ${(raw / 1024).toFixed(1)} kB raw, ${(gz / 1024).toFixed(1)} kB gzipped`);
for (const src of srcs) { const b = readFileSync(path.join(out, src)); console.log(`  ${(gzipSync(b).length / 1024).toFixed(1).padStart(6)} kB gz  ${src}`); }
