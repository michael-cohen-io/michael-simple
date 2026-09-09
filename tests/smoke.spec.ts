import { expect, test, type Page } from "@playwright/test";

import { isVercelHost } from "../src/lib/site";

// The one-page site, built to out/ and served as files (see playwright.config.ts).
// Each test guards a bug that has actually shipped: a hydration failure that
// threw six page errors per visit for two years, a Work section that only
// existed after client-side JavaScript ran, and dates that moved back a month
// for visitors west of UTC.

/** Collects uncaught exceptions and React's minified production errors. */
function watchErrors(page: Page) {
  const pageErrors: string[] = [];
  const reactErrors: string[] = [];
  page.on("pageerror", (error) => pageErrors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error" && message.text().includes("Minified React error")) {
      reactErrors.push(message.text());
    }
  });
  return { pageErrors, reactErrors };
}

test("loads without page errors or React errors", async ({ page }) => {
  const errors = watchErrors(page);
  await page.goto("/", { waitUntil: "networkidle" });
  // Hydration has finished once the theme toggle can be used.
  await expect(page.getByRole("button", { name: /theme/i })).toBeVisible();
  await page.waitForTimeout(500);
  expect(errors.pageErrors).toEqual([]);
  expect(errors.reactErrors).toEqual([]);
});

test.describe("without JavaScript on a phone", () => {
  test.use({ viewport: { width: 390, height: 844 }, javaScriptEnabled: false });

  test("the work history is in the HTML", async ({ page }) => {
    await page.goto("/");
    const work = page.getByRole("region", { name: "Work Experience" });
    for (const company of ["Anthropic", "OpenSea", "Amazon"]) {
      await expect(work.getByText(company).first()).toBeVisible();
    }
  });
});

test.describe("in a timezone west of UTC", () => {
  test.use({ timezoneId: "America/New_York" });

  test("months do not shift", async ({ page }) => {
    await page.goto("/", { waitUntil: "networkidle" });
    const text = await page.locator("body").innerText();
    expect(text).toContain("Aug 2024");
    expect(text).not.toContain("Jul 2024");
  });
});

test("has one h1 and alt text on every image", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("h1")).toHaveCount(1);
  await expect(page.locator("img:not([alt])")).toHaveCount(0);
});

test("serves the crawler and sharing files", async ({ request }) => {
  for (const path of ["/robots.txt", "/sitemap.xml", "/opengraph-image"]) {
    const response = await request.get(path);
    expect(response.status(), path).toBe(200);
  }
});

test("loads the Vercel scripts on the apex and nowhere else", async ({ page, baseURL }) => {
  const localRequests: string[] = [];
  page.on("request", (request) => {
    if (request.url().includes("/_vercel/")) localRequests.push(request.url());
  });
  await page.goto("/", { waitUntil: "networkidle" });
  expect(localRequests).toEqual([]);

  // The same files as if Vercel served them: every request to the apex is
  // answered from the local server, except the platform scripts, which are
  // recorded and refused (a 404 is what any other host would return).
  const apexRequests: string[] = [];
  await page.route("https://michaelcohen.io/**", async (route) => {
    const { pathname, search } = new URL(route.request().url());
    if (pathname.startsWith("/_vercel/")) {
      apexRequests.push(pathname);
      return route.fulfill({ status: 404 });
    }
    return route.fulfill({ response: await route.fetch({ url: `${baseURL}${pathname}${search}` }) });
  });
  await page.goto("https://michaelcohen.io/", { waitUntil: "networkidle" });
  expect(apexRequests).toContain("/_vercel/insights/script.js");
  expect(apexRequests).toContain("/_vercel/speed-insights/script.js");

  for (const host of ["www.michaelcohen.io", "michael-simple-abc123.vercel.app"]) {
    expect(isVercelHost(host), host).toBe(true);
  }
  for (const host of ["localhost", "michaelcohen.io.example.com", "vercel.app"]) {
    expect(isVercelHost(host), host).toBe(false);
  }
});
