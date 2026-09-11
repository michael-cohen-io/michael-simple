import { expect, test } from "@playwright/test";

import { GET, POST } from "../api/ask";
import { PARTY_TOOL, mergeEffects, validateEffects } from "../src/lib/party";

// The function is exercised without a network: everything before the
// Claude call (body validation, the rate limit, the not-configured case).

const post = (body: unknown, address = "203.0.113.7") =>
  POST(
    new Request("https://www.michaelcohen.io/api/ask", {
      method: "POST",
      headers: { "content-type": "application/json", "x-forwarded-for": address },
      body: typeof body === "string" ? body : JSON.stringify(body),
    }),
  );

test("rejects bad bodies with a problem document", async () => {
  for (const [body, code] of [
    ["not json", "invalid_body"],
    [{}, "missing_question"],
    [{ question: "   " }, "missing_question"],
    [{ question: "x".repeat(301) }, "question_too_long"],
  ] as const) {
    const response = await post(body);
    expect(response.status).toBe(400);
    expect(response.headers.get("content-type")).toBe("application/problem+json");
    expect(((await response.json()) as { code: string }).code).toBe(code);
  }
  expect(GET().status).toBe(405);
});

test("says so when no key is configured, and rate-limits an address", async () => {
  const key = process.env.ANTHROPIC_API_KEY;
  delete process.env.ANTHROPIC_API_KEY;
  try {
    const first = await post({ question: "What did he build?" }, "198.51.100.1");
    expect(first.status).toBe(503);
    expect(((await first.json()) as { code: string }).code).toBe("not_configured");

    let last: Response | undefined;
    for (let i = 0; i < 6; i += 1) last = await post({ question: "again?" }, "198.51.100.2");
    expect(last!.status).toBe(429);
    expect(((await last!.json()) as { code: string }).code).toBe("rate_limited");
  } finally {
    if (key) process.env.ANTHROPIC_API_KEY = key;
  }
});

// Party Mode's catalog: the tool input the agent sends is validated before
// anything reaches the browser, and a bad call applies nothing.
test("validates restyle_page input against the catalog and merges turns", () => {
  const good = validateEffects({
    scheme: "party",
    hue: 199.6,
    confetti: true,
    motion: { headings: "dance" },
    text: "lowercase",
    font: "comic",
    replace: [{ from: "Work Experience", to: "Expérience" }],
    banner: "  Party  ",
  });
  expect(good).toEqual({
    effects: {
      scheme: "party",
      hue: 200,
      confetti: true,
      motion: { headings: "dance" },
      text: "lowercase",
      font: "comic",
      replace: [{ from: "Work Experience", to: "Expérience" }],
      banner: "Party",
    },
  });
  for (const bad of [
    "party",
    { scheme: "neon" },
    { hue: 400 },
    { motion: { body: "dance" } },
    { motion: { headings: "explode" } },
    { replace: [{ from: "", to: "x" }] },
    { replace: [{ from: "a", to: "b".repeat(501) }] },
    { banner: "x".repeat(121) },
    { css: "body { display: none }" },
  ]) {
    expect(validateEffects(bad)).toHaveProperty("error");
  }
  expect(PARTY_TOOL.input_schema.properties.scheme.enum).toContain("party");

  const first = { scheme: "party" as const, hue: 200, motion: { headings: "dance" as const }, banner: "Hi" };
  const second = { motion: { links: "spin" as const }, banner: "", replace: [{ from: "a", to: "b" }] };
  expect(mergeEffects(mergeEffects({}, first), second)).toEqual({
    scheme: "party",
    hue: 200,
    motion: { headings: "dance", links: "spin" },
    replace: [{ from: "a", to: "b" }],
  });
  expect(mergeEffects({ scheme: "party", hue: 200 }, { reset: true, font: "mono" })).toEqual({ font: "mono" });
});
