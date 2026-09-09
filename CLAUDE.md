# michaelcohen.io

One-page personal site: Next.js 14 (App Router, static export to `out/`), React 18, Tailwind CSS, a few shadcn/ui primitives, Raleway via `next/font`. Deployed on Vercel as static files.

## Rules

- Package manager is **bun** only. Never npm, pnpm or yarn; never edit `bun.lock` by hand.
- Content lives in `src/content/` (`work.ts`, typed by `types.ts`; bullets are one line of Markdown each). There is no database: no Postgres, no Prisma, no env vars needed to build.
- Response headers and the `*.vercel.app` redirect are in `vercel.json`, not `next.config.mjs` (a static export ignores `headers()`/`redirects()`).
- Keep the site's identity: one pink accent, Raleway, the `<MC>` mark, the timeline. Refine, don't redesign.
- Before opening a PR run `bun run typecheck && bun run lint && bun run build`; the build must produce `out/index.html` and fails on a malformed or empty work history.
- Serve a build locally with any static server, e.g. `python3 -m http.server 3000 --directory out`.
