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

test("links every profile from Connect and names X in the card metadata", async ({ page }) => {
  await page.goto("/");
  const connect = page.getByRole("region", { name: "Connect" });
  for (const url of [
    "https://github.com/michael-cohen-io",
    "https://www.linkedin.com/in/michael-cohen1995/",
    "https://x.com/_hi_mc",
  ]) {
    await expect(connect.locator(`a[href="${url}"]`), url).toHaveCount(1);
  }
  await expect(page.locator('meta[name="twitter:creator"]')).toHaveAttribute("content", "@_hi_mc");
});

test("embeds Person structured data derived from the content", async ({ page }) => {
  await page.goto("/");
  const raw = await page.locator('script[type="application/ld+json"]').first().textContent();
  const data = JSON.parse(raw ?? "null");
  expect(data["@type"]).toBe("ProfilePage");
  const person = data.mainEntity;
  expect(person["@type"]).toBe("Person");
  expect(person.name).toBe("Michael Cohen");
  expect(person.worksFor.name).toBe("Anthropic");
  expect(person.jobTitle).toBe("Member of Technical Staff");
  expect(person.sameAs).toEqual(
    expect.arrayContaining(["https://github.com/michael-cohen-io", "https://x.com/_hi_mc"]),
  );
});

test("serves the résumé PDF generated from the content files", async ({ request }) => {
  const response = await request.get("/MichaelCohenResume.pdf");
  expect(response.status()).toBe(200);
  expect(response.headers()["content-type"]).toContain("pdf");
  const body = await response.body();
  expect(body.subarray(0, 5).toString()).toBe("%PDF-");
  expect(body.length).toBeGreaterThan(20_000);
});

test("the 404 page is in the site's chrome with a way back", async ({ page }) => {
  const errors = watchErrors(page);
  // The static export writes the not-found page as 404.html; Vercel serves it
  // for every unknown path.
  await page.goto("/404.html", { waitUntil: "networkidle" });
  await expect(page).toHaveTitle(/Page not found/);
  await expect(page.getByText("nothing at this address")).toBeVisible();
  await expect(page.getByRole("link", { name: "Back to the home page" })).toHaveAttribute("href", "/");
  await expect(page.getByRole("link", { name: "Michael Cohen, home" })).toBeVisible();
  await expect(page.locator('meta[name="robots"][content*="noindex"]').first()).toBeAttached();
  expect(errors.pageErrors).toEqual([]);
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
  expect(await page.evaluate(() => typeof (window as unknown as { va?: unknown }).va)).toBe(
    "undefined",
  );

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

  // The error beacon queues events for the analytics script rather than
  // dropping them, so an error raised before it loads (a hydration error,
  // say) is still reported. The refused script never drains the queue here.
  const queued = await page.evaluate(() => {
    window.dispatchEvent(
      new ErrorEvent("error", { message: "beacon probe", error: new Error("beacon probe") }),
    );
    const queue = (window as unknown as { vaq?: unknown[][] }).vaq ?? [];
    return queue.map((call) => JSON.stringify(call));
  });
  expect(queued.join("\n")).toContain('"name":"client-error"');
  expect(queued.join("\n")).toContain('"message":"beacon probe"');

  for (const host of ["www.michaelcohen.io", "michael-simple-abc123.vercel.app"]) {
    expect(isVercelHost(host), host).toBe(true);
  }
  for (const host of ["localhost", "michaelcohen.io.example.com", "vercel.app"]) {
    expect(isVercelHost(host), host).toBe(false);
  }
});
