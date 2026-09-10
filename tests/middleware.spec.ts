import { expect, test } from "@playwright/test";

import middleware, { KNOWN_PATHS, config, isNextInternal, looksLikeApi, preferred } from "../middleware";

// The middleware runs on Vercel, not in the static server the smoke tests
// use, so it is exercised here directly with Request objects. `next()` and
// `rewrite()` from @vercel/functions answer with marker headers that the
// platform acts on; those markers are what the assertions read.

const BROWSER = "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8";

function call(path: string, accept?: string): Response {
  const headers = new Headers();
  if (accept !== undefined) headers.set("accept", accept);
  return middleware(new Request(`https://www.michaelcohen.io${path}`, { headers }));
}

test("prefers by q value, ties go to the earlier offer, json accepts a problem document", () => {
  expect(preferred(BROWSER, ["text/html", "text/markdown"])).toBe("text/html");
  expect(preferred("text/markdown", ["text/html", "text/markdown"])).toBe("text/markdown");
  expect(preferred("text/markdown;q=0.9, text/html;q=0.8", ["text/html", "text/markdown"])).toBe("text/markdown");
  expect(preferred("*/*", ["text/markdown", "application/problem+json", "text/html"])).toBe("text/markdown");
  expect(preferred(null, ["text/markdown", "application/problem+json", "text/html"])).toBe("text/markdown");
  expect(preferred("application/json", ["text/markdown", "application/problem+json", "text/html"])).toBe(
    "application/problem+json",
  );
  expect(preferred("text/*", ["application/problem+json", "text/markdown"])).toBe("text/markdown");
  expect(preferred("image/png", ["text/markdown", "text/html"])).toBe("text/markdown");
});

test("serves the page as Markdown at / for clients that prefer it", () => {
  const md = call("/", "text/markdown");
  expect(md.headers.get("x-middleware-rewrite")).toMatch(/\/index\.md$/);
  expect(md.headers.get("content-type")).toBe("text/markdown; charset=utf-8");
  expect(md.headers.get("vary")).toBe("Accept");

  for (const accept of [BROWSER, "*/*", undefined]) {
    const html = call("/", accept);
    expect(html.headers.get("x-middleware-next"), String(accept)).toBe("1");
    expect(html.headers.get("x-middleware-rewrite"), String(accept)).toBeNull();
  }
});

test("passes every published path and Next's own files through to the filesystem", () => {
  for (const path of [
    ...KNOWN_PATHS,
    "/index.txt",
    "/__next._tree.txt",
    "/__next.__PAGE__.txt",
    "/_not-found.html",
    "/_not-found/__next._index.txt",
  ]) {
    const response = call(path, "*/*");
    expect(response.headers.get("x-middleware-next"), path).toBe("1");
    expect(response.status, path).toBe(200);
  }
  expect(config.matcher).toEqual(["/((?!_next/).*)"]);

  // Only Next's files get the underscore pass; any other `_` path is a miss.
  expect(isNextInternal("/__next._full.txt")).toBe(true);
  expect(isNextInternal("/_not-found.txt")).toBe(true);
  for (const path of ["/__ora-404-probe-ga08jq8v", "/_probe", "/__next", "/_"]) {
    expect(isNextInternal(path), path).toBe(false);
    const response = call(path, "*/*");
    expect(response.status, path).toBe(404);
    expect(response.headers.get("content-type"), path).toBe("text/markdown; charset=utf-8");
  }
});

test("passes the ask function through, whatever the client accepts", () => {
  for (const accept of [undefined, "*/*", "application/json", "text/html"]) {
    const response = call("/api/ask", accept);
    expect(response.headers.get("x-middleware-next"), String(accept)).toBe("1");
  }
});

test("treats API-shaped paths as calls from programs", async () => {
  for (const path of ["/api", "/api/", "/api/v1", "/api/v1/things", "/v1", "/v2/probe", "/graphql", "/graphql/"]) {
    expect(looksLikeApi(path), path).toBe(true);
  }
  for (const path of ["/apis", "/v1x", "/version", "/nope", "/api-docs", "/graphql-playground"]) {
    expect(looksLikeApi(path), path).toBe(false);
  }

  // No Accept, `*/*` or JSON: a problem document. An explicit preference for
  // Markdown or HTML is still honoured.
  for (const accept of [undefined, "*/*", "application/json", "application/json, */*;q=0.5"]) {
    const response = call("/api/v1/orank-probe-test", accept);
    expect(response.status, String(accept)).toBe(404);
    expect(response.headers.get("content-type"), String(accept)).toBe("application/problem+json");
    const problem = (await response.json()) as { code: string; instance: string };
    expect(problem.code).toBe("not_found");
    expect(problem.instance).toBe("/api/v1/orank-probe-test");
  }
  expect(call("/api/v1/x", "text/markdown").headers.get("content-type")).toBe("text/markdown; charset=utf-8");
  expect(call("/api/v1/x", BROWSER).headers.get("x-middleware-next")).toBe("1");
});

test("answers unknown paths with a 404 in the shape the client can read", async () => {
  // Browsers get the HTML page: pass through, and Vercel serves 404.html as a 404.
  expect(call("/nope", BROWSER).headers.get("x-middleware-next")).toBe("1");

  // Agents, curl and anyone not asking for HTML get Markdown with links out.
  for (const accept of ["text/markdown", "*/*", "text/plain", undefined]) {
    const response = call("/nope", accept);
    expect(response.status, String(accept)).toBe(404);
    expect(response.headers.get("content-type"), String(accept)).toBe("text/markdown; charset=utf-8");
    expect(response.headers.get("vary")).toBe("Accept");
    const body = await response.text();
    expect(body.startsWith("# 404: nothing at /nope\n")).toBe(true);
    for (const url of [
      "https://www.michaelcohen.io/",
      "https://www.michaelcohen.io/index.md",
      "https://www.michaelcohen.io/llms.txt",
      "https://www.michaelcohen.io/openapi.json",
      "https://www.michaelcohen.io/MichaelCohenResume.pdf",
      "https://www.michaelcohen.io/sitemap.xml",
    ]) {
      expect(body, url).toContain(url);
    }
  }

  // JSON clients get an RFC 9457 problem document.
  for (const accept of ["application/json", "application/problem+json", "application/json, text/plain;q=0.5"]) {
    const response = call("/api/v1/things?x=1", accept);
    expect(response.status, accept).toBe(404);
    expect(response.headers.get("content-type"), accept).toBe("application/problem+json");
    const problem = (await response.json()) as Record<string, unknown>;
    expect(problem).toMatchObject({
      type: "about:blank",
      title: "Not Found",
      status: 404,
      instance: "/api/v1/things",
      code: "not_found",
    });
    expect(String(problem.detail)).toContain("/api/v1/things");
    expect(String(problem.hint)).toContain("/llms.txt");
    expect(problem.resources).toMatchObject({ openapi: "https://www.michaelcohen.io/openapi.json" });
  }
});
