import { defineConfig, devices } from "@playwright/test";

// Smoke-tests the static export in out/ (run `bun run build` first). The site
// is plain files, so any static server will do; python3 ships on every CI
// image and developer machine this project targets.
const PORT = 3199;

export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 0,
  reporter: process.env.CI ? [["list"], ["html", { open: "never" }]] : "list",
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: "retain-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: `python3 -m http.server ${PORT} --directory out`,
    url: `http://localhost:${PORT}/`,
    reuseExistingServer: !process.env.CI,
    timeout: 30_000,
    // http.server logs every request to stderr; failures show up in the report.
    stderr: "ignore",
  },
});
