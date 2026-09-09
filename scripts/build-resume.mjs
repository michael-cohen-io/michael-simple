// Renders resume/resume.html to public/MichaelCohenResume.pdf with headless Chromium.
//
//   bun run resume:pdf
//
// Uses the Chromium that playwright-core knows about (`bunx playwright-core
// install chromium` once), or the binary named by CHROME_PATH.
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { chromium } from "playwright-core";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const input = path.join(root, "resume", "resume.html");
const output = path.join(root, "public", "MichaelCohenResume.pdf");

const browser = await chromium.launch({
  executablePath: process.env.CHROME_PATH || undefined,
  // Chromium refuses to start its sandbox as root (CI containers); harmless otherwise.
  args: process.getuid?.() === 0 ? ["--no-sandbox"] : [],
});
try {
  const page = await browser.newPage();
  await page.goto(pathToFileURL(input).href, { waitUntil: "load" });
  await page.pdf({
    path: output,
    format: "Letter",
    printBackground: true,
    preferCSSPageSize: true,
  });
  console.log(`wrote ${path.relative(root, output)}`);
} finally {
  await browser.close();
}
