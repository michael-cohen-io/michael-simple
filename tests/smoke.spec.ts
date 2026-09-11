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

/**
 * The header, main and footer must share one column: full width up to the
 * same max width, the same side padding, so the mark, the headings and the
 * footer line up on every screen. Checked at phone and desktop widths
 * because a flex-column body once let the header shrink to its content.
 */
async function expectOneColumn(page: Page) {
  const columns = await page.evaluate(() => {
    const edge = (el: Element | null) => {
      if (!el) return null;
      const box = el.getBoundingClientRect();
      const style = getComputedStyle(el);
      return {
        left: Math.round(box.left + parseFloat(style.paddingLeft)),
        right: Math.round(box.right - parseFloat(style.paddingRight)),
      };
    };
    return {
      header: edge(document.querySelector("header")),
      main: edge(document.querySelector("main")),
      footer: edge(document.querySelector("footer")),
      overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
    };
  });
  expect(columns.overflow, "no horizontal scrolling").toBe(false);
  expect(columns.header).toEqual(columns.main);
  // The footer is full-width text; its content box must not be narrower than main's.
  expect(columns.footer!.left).toBeLessThanOrEqual(columns.main!.left);
  expect(columns.footer!.right).toBeGreaterThanOrEqual(columns.main!.right);
  // The mark sits on the content's left edge, not indented from it.
  const mark = await page.locator("header a").first().boundingBox();
  expect(Math.round(mark!.x)).toBe(columns.main!.left);
}

test("lays the header, content and footer out in one column on a desktop", async ({ page }) => {
  await page.goto("/", { waitUntil: "networkidle" });
  await expectOneColumn(page);
});

test("keeps the mark and the switches in reach as the page scrolls", async ({ page }) => {
  await page.goto("/", { waitUntil: "networkidle" });
  await page.mouse.wheel(0, 1200);
  await page.waitForTimeout(200);
  expect(await page.evaluate(() => window.scrollY)).toBeGreaterThan(1000);
  const header = await page.locator("header").boundingBox();
  expect(Math.round(header!.y)).toBe(0);
  await expect(page.getByRole("button", { name: /theme/i })).toBeInViewport();
  await expect(page.getByRole("group", { name: "View as" })).toBeInViewport();
  // The name scrolled away with the page; only the bar stays.
  await expect(page.locator("h1")).not.toBeInViewport();
});

test("puts the dates in their own column beside the timeline on a desktop", async ({ page }) => {
  await page.goto("/", { waitUntil: "networkidle" });
  const work = page.getByRole("region", { name: "Work Experience" });
  await expect(work.locator("ol")).toHaveCount(1);
  const name = await work.getByRole("button", { name: /Anthropic/ }).boundingBox();
  const date = await work.getByText("Aug 2024 – Present").first().boundingBox();
  expect(date!.x + date!.width).toBeLessThan(name!.x);
  expect(Math.abs(date!.y + date!.height / 2 - (name!.y + name!.height / 2))).toBeLessThan(8);
  // The spine draws on the scroll timeline (Chromium supports it; reduced
  // motion is off in this browser).
  const spine = await page.evaluate(async () => {
    const line = document.querySelector(".timeline-line") as HTMLElement;
    const dot = document.querySelector(".timeline-dot") as HTMLElement;
    // animation-timeline is not in the DOM typings yet.
    const timeline = (el: HTMLElement) => getComputedStyle(el).getPropertyValue("animation-timeline");
    // Scroll the first dot to the middle of the screen, past the range in
    // which its line draws, and read the line's transform there.
    document.querySelector(".timeline-dot-box")!.scrollIntoView({ block: "center" });
    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
    return { line: timeline(line), dot: timeline(dot), drawn: getComputedStyle(line).transform };
  });
  expect(spine.line).toBe("--timeline-dot");
  expect(spine.dot).toBe("--timeline-dot");
  expect(spine.drawn === "none" || spine.drawn.startsWith("matrix(1, 0, 0, 1")).toBe(true);
  // Closed rows still open, and the first is open already.
  await expect(work.getByRole("button", { name: /Anthropic/ })).toHaveAttribute("aria-expanded", "true");
  await work.getByRole("button", { name: /Amazon/ }).click();
  await expect(work.getByRole("button", { name: /Amazon/ })).toHaveAttribute("aria-expanded", "true");
});

test.describe("on a phone", () => {
  test.use({ viewport: { width: 390, height: 844 }, hasTouch: true });

  test("lays the header, content and footer out in one column", async ({ page }) => {
    await page.goto("/", { waitUntil: "networkidle" });
    await expectOneColumn(page);
    // Nothing in the header may sit inside the page's side margin.
    const main = await page.locator("main").boundingBox();
    const theme = await page.getByRole("button", { name: /theme/i }).boundingBox();
    expect(Math.round(theme!.x + theme!.width)).toBeLessThanOrEqual(Math.round(main!.x + main!.width));
  });

  test("nothing shifts after the first paint", async ({ page }) => {
    // Cumulative layout shift, as Lighthouse counts it: every layout-shift
    // entry not caused by input. The open accordion panel once animated from
    // height 0 on load and scored 0.18 here; the budget is a tenth of that.
    await page.addInitScript(() => {
      const w = window as unknown as { __cls: number };
      w.__cls = 0;
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries() as (PerformanceEntry & { hadRecentInput?: boolean; value?: number })[]) {
          if (!entry.hadRecentInput) w.__cls += entry.value ?? 0;
        }
      }).observe({ type: "layout-shift", buffered: true });
    });
    await page.goto("/", { waitUntil: "networkidle" });
    await page.waitForTimeout(1000);
    const cls = await page.evaluate(() => (window as unknown as { __cls: number }).__cls);
    expect(cls).toBeLessThan(0.02);
  });

  test("every link and button is at least 24px tall", async ({ page }) => {
    await page.goto("/", { waitUntil: "networkidle" });
    const small = await page.evaluate(() =>
      Array.from(document.querySelectorAll("a, button"))
        .map((el) => ({ text: (el.textContent ?? "").trim().slice(0, 40), box: el.getBoundingClientRect() }))
        // Hidden controls (the desktop timeline at this width) are 0×0; the
        // skip link is 1×1 until focused, by design.
        .filter(({ box }) => box.width > 0 && box.height > 0)
        .filter(({ text, box }) => text !== "Skip to content" && (box.width < 24 || box.height < 24))
        .map(({ text, box }) => `${text} ${Math.round(box.width)}×${Math.round(box.height)}`),
    );
    expect(small).toEqual([]);
  });

  test("the work history is one list, with the date under the name", async ({ page }) => {
    await page.goto("/", { waitUntil: "networkidle" });
    const work = page.getByRole("region", { name: "Work Experience" });
    await expect(work.locator("ol")).toHaveCount(1);
    const name = await work.getByRole("button", { name: /Anthropic/ }).boundingBox();
    const date = await work.getByText("Aug 2024 – Present").first().boundingBox();
    expect(date!.y).toBeGreaterThan(name!.y + name!.height - 1);
  });

  test("the first company is open and a second can open beside it", async ({ page }) => {
    await page.goto("/", { waitUntil: "networkidle" });
    const work = page.getByRole("region", { name: "Work Experience" });
    const anthropic = work.getByRole("button", { name: /Anthropic/ });
    const opensea = work.getByRole("button", { name: /OpenSea/ });
    await expect(anthropic).toHaveAttribute("aria-expanded", "true");
    await expect(opensea).toHaveAttribute("aria-expanded", "false");
    await opensea.click();
    await expect(opensea).toHaveAttribute("aria-expanded", "true");
    await expect(anthropic).toHaveAttribute("aria-expanded", "true");
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

test("says what I do in one sentence, with the resume one tap away", async ({ page }) => {
  await page.goto("/");
  const hero = page.locator("main p").first();
  await expect(hero).toContainText("Member of Technical Staff at Anthropic");
  await expect(hero).toContainText("Claude Managed Agents");
  await expect(hero).not.toContainText("OpenSea");
  await expect(page.locator("body")).not.toContainText(/updated \w+ \d{4}/i);
  // One resume link on the page, in the Work section; no button row in the hero.
  await expect(page.getByRole("link", { name: /resume \(PDF\)/ })).toHaveCount(1);
  await expect(page.getByRole("link", { name: /resume \(PDF\)/ })).toHaveAttribute(
    "href",
    "/MichaelCohenResume.pdf",
  );
});

test("keeps the accent readable on both grounds and tells the browser the theme", async ({ page }) => {
  await page.goto("/", { waitUntil: "networkidle" });
  const contrast = async () =>
    page.evaluate(() => {
      const channel = (v: number) => {
        const c = v / 255;
        return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
      };
      // Computed colours come back in whatever space they were written in
      // (oklch here); a 1×1 canvas resolves any of them to sRGB bytes.
      const luminance = (color: string) => {
        const canvas = document.createElement("canvas");
        canvas.width = canvas.height = 1;
        const ctx = canvas.getContext("2d")!;
        ctx.fillStyle = color;
        ctx.fillRect(0, 0, 1, 1);
        const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
        return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
      };
      const link = document.querySelector("main a.text-primary") as HTMLElement;
      const fg = luminance(getComputedStyle(link).color);
      const bg = luminance(getComputedStyle(document.body).backgroundColor);
      return {
        ratio: (Math.max(fg, bg) + 0.05) / (Math.min(fg, bg) + 0.05),
        scheme: getComputedStyle(document.documentElement).colorScheme,
      };
    });
  const light = await contrast();
  expect(light.scheme).toBe("light");
  expect(light.ratio).toBeGreaterThanOrEqual(4.5);

  await page.getByRole("button", { name: /theme/i }).click();
  await expect(page.locator("html")).toHaveClass(/dark/);
  // The link colour transitions for 150ms after the switch; poll past it.
  await expect.poll(async () => (await contrast()).scheme).toBe("dark");
  await expect.poll(async () => (await contrast()).ratio).toBeGreaterThanOrEqual(4.5);
});

test("sets the name above the hero on the type scale, with tabular dates", async ({ page }) => {
  const sizes = async () =>
    page.evaluate(() => {
      const px = (el: Element | null) => parseFloat(getComputedStyle(el!).fontSize);
      return {
        name: px(document.querySelector("h1")),
        mark: px(document.querySelector("header a span")),
        hero: px(document.querySelector("main p")),
        heading: px(document.querySelector("main h2")),
        dates: getComputedStyle(document.querySelector("main time")!).fontVariantNumeric,
      };
    });
  await page.goto("/", { waitUntil: "networkidle" });
  const desktop = await sizes();
  expect(desktop.name).toBeGreaterThan(desktop.mark);
  expect(desktop.name).toBeGreaterThan(desktop.hero);
  expect(desktop.hero).toBeLessThan(desktop.heading);
  expect(desktop.dates).toContain("tabular-nums");

  await page.setViewportSize({ width: 390, height: 844 });
  const phone = await sizes();
  expect(phone.name).toBeGreaterThan(phone.hero);
  expect(phone.name).toBeGreaterThanOrEqual(phone.mark);
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
  // The published address is on the domain; the personal Gmail is not on the page.
  await expect(connect.locator('a[href="mailto:hello@michaelcohen.io"]')).toHaveCount(1);
  await expect(page.locator("body")).not.toContainText("gmail.com");
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
  expect(person.email).toBe("hello@michaelcohen.io");
  expect(person.sameAs).toEqual(
    expect.arrayContaining(["https://github.com/michael-cohen-io", "https://x.com/_hi_mc"]),
  );
});

test("serves the resume PDF generated from the content files", async ({ request }) => {
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
  await expect(page.getByRole("link", { name: "Michael Cohen, home" }).first()).toBeVisible();
  await expect(page.locator('meta[name="robots"][content*="noindex"]').first()).toBeAttached();
  await expect(page.locator("main img").first()).toHaveAttribute("src", /memoji\.webp$/);
  // Somewhere to go next, for people and agents alike.
  for (const href of ["/sitemap.xml", "/llms.txt", "/MichaelCohenResume.pdf"]) {
    await expect(page.locator(`main a[href="${href}"]`), href).toHaveCount(1);
  }
  expect(errors.pageErrors).toEqual([]);
});

test("serves llms.txt and the Markdown twin of the home page", async ({ request }) => {
  const llms = await request.get("/llms.txt");
  expect(llms.status()).toBe(200);
  const llmsText = await llms.text();
  expect(llmsText.startsWith("# Michael Cohen\n")).toBe(true);
  expect(llmsText).toContain("## When to use this site");
  expect(llmsText).toContain("https://www.michaelcohen.io/openapi.json");
  expect(llmsText).toContain("Resume (PDF): https://www.michaelcohen.io/MichaelCohenResume.pdf");
  expect(llmsText).not.toContain("é");

  // Generated from the same content as the page, so the roles and their
  // links are the ones the timeline shows.
  // One document: what / returns for Accept: text/markdown is llms.txt.
  const md = await request.get("/index.md");
  expect(md.status()).toBe(200);
  const mdText = await md.text();
  expect(mdText).toBe(llmsText);
  expect(mdText.startsWith("# Michael Cohen\n")).toBe(true);
  expect(mdText).toContain("## Work Experience");
  expect(mdText).toContain("### Anthropic (Aug 2024 – Present)");
  expect(mdText).toContain("[Claude Managed Agents](https://claude.com/blog/claude-managed-agents)");
  expect(mdText).toContain("hello@michaelcohen.io");
  expect(mdText).not.toContain("gmail");
});

test("describes its fetchable resources in an OpenAPI document", async ({ page, request }) => {
  const response = await request.get("/openapi.json");
  expect(response.status()).toBe(200);
  const spec = (await response.json()) as {
    openapi: string;
    info: { title: string; contact?: { email?: string } };
    servers: { url: string }[];
    paths: Record<string, { get?: { operationId?: string; description?: string; tags?: string[] } }>;
    components?: { schemas?: { Problem?: { required?: string[] } } };
  };
  expect(spec.openapi).toMatch(/^3\.1\./);
  expect(spec.info.title).toContain("Michael Cohen");
  expect(spec.info.contact?.email).toBe("hello@michaelcohen.io");
  expect(spec.servers.map((server) => server.url)).toEqual(["https://www.michaelcohen.io"]);
  expect(spec.components?.schemas?.Problem?.required).toEqual(
    expect.arrayContaining(["status", "code", "hint", "resources"]),
  );

  // Every resource it lists exists, and every operation is self-describing.
  const paths = Object.keys(spec.paths);
  expect(paths).toEqual(
    expect.arrayContaining(["/", "/index.md", "/llms.txt", "/MichaelCohenResume.pdf", "/sitemap.xml", "/resume.json", "/openapi.json"]),
  );
  const ids = new Set<string>();
  for (const [route, item] of Object.entries(spec.paths)) {
    expect(item.get?.operationId, route).toMatch(/^[a-zA-Z]+$/);
    expect(item.get?.description?.length ?? 0, route).toBeGreaterThan(40);
    ids.add(item.get?.operationId ?? "");
    expect((await request.get(route)).status(), route).toBe(200);
  }
  expect(ids.size).toBe(paths.length);

  // The home page points at the document and at its Markdown twin, and the
  // footer shows people (and agents reading the page) where llms.txt is.
  await page.goto("/", { waitUntil: "networkidle" });
  await expect(page.locator('link[rel="service-desc"][href="/openapi.json"]')).toBeAttached();
  await expect(page.locator('link[rel="alternate"][type="text/markdown"][href$="/index.md"]')).toBeAttached();
  const agents = page.locator("footer").getByRole("link", { name: "/llms.txt" });
  await expect(agents).toBeVisible();
  await expect(agents).toHaveAttribute("href", "/llms.txt");
  await expect(page.locator("footer").getByText("openapi.json")).toHaveCount(0);
});

test("lists writing and talks under the hero, from the content file", async ({ page }) => {
  await page.goto("/", { waitUntil: "networkidle" });
  const section = page.getByRole("region", { name: "Writing & Talks" });
  await expect(section).toBeVisible();
  const links = section.getByRole("link");
  expect(await links.count()).toBeGreaterThanOrEqual(3);
  for (const link of await links.all()) {
    await expect(link).toHaveAttribute("target", "_blank");
    await expect(link).toHaveAttribute("href", /^https:\/\//);
  }
  await expect(section.getByRole("link", { name: /Decoupling the brain from the hands/ })).toBeVisible();
  // Every row carries a mark saying what it is: an article, or something to watch.
  expect(await section.locator("li svg").count()).toBe(await section.locator("li").count());
  // Each row: title, source and month, nothing else; newest first.
  const rows = section.locator("li");
  await expect(rows.first()).toContainText("Code with Claude, London · May 2026");
  expect(await section.locator("li time").count()).toBe(await rows.count());
  expect(await section.locator("li p").count()).toBe(await rows.count());
  const months = await section.locator("li time").evaluateAll((els) => els.map((el) => el.getAttribute("datetime")));
  expect([...months].sort().reverse()).toEqual(months);
  await expect(section.locator("li svg title").first()).toHaveText(/Talk|Video/);
  await expect(section.getByRole("link", { name: /Building with MCP and the Claude API/ })).toHaveAttribute(
    "href",
    "https://www.youtube.com/watch?v=aZLr962R6Ag",
  );
  await expect(section.locator("li").last()).toContainText("Anthropic on YouTube · Oct 2025");
  await expect(section.locator("li").last().locator("svg title")).toHaveText("Video");
  expect(await section.locator("li svg title", { hasText: /Talk|Video/ }).count()).toBeGreaterThanOrEqual(1);
  // The section sits between the work history and Connect.
  const writing = await section.boundingBox();
  const work = await page.getByRole("region", { name: "Work Experience" }).boundingBox();
  const connect = await page.getByRole("region", { name: "Connect" }).boundingBox();
  expect(writing!.y).toBeGreaterThan(work!.y);
  expect(connect!.y).toBeGreaterThan(writing!.y);
  // Connect rows carry a glyph each.
  expect(await page.getByRole("region", { name: "Connect" }).locator("li svg").count()).toBe(4);
});

test("serves the resume as a JSON Resume document", async ({ request }) => {
  const response = await request.get("/resume.json");
  expect(response.status()).toBe(200);
  expect(response.headers()["content-type"]).toContain("json");
  const resume = (await response.json()) as {
    $schema: string;
    basics: { name: string; email: string; profiles: { network: string; url: string }[] };
    work: { name: string; position: string; startDate: string; endDate?: string; highlights: string[] }[];
    education: { institution: string; endDate: string }[];
    skills: { name: string; keywords: string[] }[];
    publications: { name: string; url: string }[];
  };
  expect(resume.$schema).toContain("jsonresume");
  expect(resume.basics.name).toBe("Michael Cohen");
  expect(resume.basics.email).toBe("hello@michaelcohen.io");
  expect(resume.basics.profiles.map((p) => p.network)).toEqual(["GitHub", "LinkedIn", "X"]);
  expect(resume.work[0]).toMatchObject({ name: "Anthropic", position: "Member of Technical Staff", startDate: "2024-08" });
  expect(resume.work[0].endDate).toBeUndefined();
  expect(resume.work.length).toBeGreaterThanOrEqual(5);
  for (const role of resume.work) {
    expect(role.startDate).toMatch(/^\d{4}-\d{2}$/);
    for (const highlight of role.highlights) expect(highlight).not.toMatch(/\]\(|\*|_/);
  }
  expect(resume.education[0]).toMatchObject({ institution: "University of Florida", endDate: "2017-12" });
  expect(resume.skills.length).toBeGreaterThan(0);
  expect(resume.publications.map((p) => p.url)).toContain("https://www.anthropic.com/engineering/managed-agents");

  // Listed where agents look for it.
  expect(await (await request.get("/llms.txt")).text()).toContain("https://www.michaelcohen.io/resume.json");
  expect(await (await request.get("/index.md")).text()).toContain("## Writing & Talks");
  const spec = (await (await request.get("/openapi.json")).json()) as { paths: Record<string, unknown> };
  expect(Object.keys(spec.paths)).toContain("/resume.json");
});

test("flips the page into the Markdown an agent gets, and back", async ({ page }) => {
  await page.goto("/", { waitUntil: "networkidle" });
  const group = page.getByRole("group", { name: "View as" });
  await expect(group.getByRole("button", { name: "human" })).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByRole("region", { name: "Work Experience" })).toBeVisible();

  await group.getByRole("button", { name: "agent" }).click();
  const agent = page.getByRole("region", { name: "The page as an agent receives it" });
  await expect(agent).toBeVisible();
  await expect(agent).toContainText("curl https://www.michaelcohen.io/llms.txt");
  const copy = agent.getByRole("button", { name: "Copy the command" });
  await expect(copy).toBeVisible();
  await expect(copy).toHaveText("");
  await expect(agent.locator("pre")).toHaveCount(1);
  await expect(agent.locator("pre")).toContainText("# Michael Cohen");
  await expect(agent.locator("pre")).toContainText("## When to use this site");
  await expect(agent.locator("pre")).toContainText("## Work Experience");
  await expect(page.getByRole("region", { name: "Work Experience" })).toBeHidden();
  await expect(page.locator("html")).toHaveAttribute("data-view", "agent");

  await group.getByRole("button", { name: "human" }).click();
  await expect(page.getByRole("region", { name: "Work Experience" })).toBeVisible();
  await expect(agent).toHaveCount(0);
  await expect(page.locator("html")).not.toHaveAttribute("data-view", "agent");
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
