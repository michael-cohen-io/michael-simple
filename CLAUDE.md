# michaelcohen.io

One-page personal site: Next.js 15 (App Router, static export to `out/`), React 19, Tailwind CSS 4, a few shadcn/ui primitives, Raleway via `next/font`. Deployed on Vercel as static files.

## Rules

- Package manager is **bun** only. Never npm, pnpm or yarn; never edit `bun.lock` by hand.
- Content lives in `src/content/` (`work.ts`, typed by `types.ts`; bullets are one line of Markdown each). There is no database: no Postgres, no Prisma, no env vars needed to build.
- Response headers and the `*.vercel.app` redirect are in `vercel.json`, not `next.config.mjs` (a static export ignores `headers()`/`redirects()`).
- Every metadata route (`manifest.ts`, `robots.ts`, `sitemap.ts`, `opengraph-image.tsx`) exports `dynamic = "force-static"`; without it Next 15 refuses to export the route.
- `overrides.postcss` in `package.json` exists only because `next` 15 pins a postcss with open advisories; drop it with the Next 16 upgrade (16.3 pins a patched version).
- Tailwind is configured in CSS, not JavaScript: `src/app/globals.css` imports `tailwindcss`, binds `dark:` to next-themes' class, and maps the HSL palette (`--primary: 330 100% 42%` etc. on `:root`/`.dark`) to colour utilities through `@theme inline`. There is no `tailwind.config.ts`; add tokens to the `@theme inline` block.
- Keep the site's identity: one pink accent, Raleway, the `<MC>` mark, the timeline. Refine, don't redesign.
- Before opening a PR run `bun run typecheck && bun run lint && bun run build && bun run test:e2e`; `lint` is `eslint .` (ESLint 9 flat config in `eslint.config.mjs`, `next lint` is gone in Next 16), and the build must produce `out/index.html` and fails on a malformed or empty work history. The smoke test (`tests/smoke.spec.ts`, Playwright, Chromium only) serves `out/` itself; CI (`.github/workflows/ci.yml`) runs the same four commands on every PR.
- Serve a build locally with any static server, e.g. `python3 -m http.server 3000 --directory out`. The Vercel scripts (`Analytics`, `SpeedInsights`, the error beacon's `track`) only load on Vercel hosts (`isVercelHost` in `src/lib/site.ts`), so a local build makes no `/_vercel/` requests.
