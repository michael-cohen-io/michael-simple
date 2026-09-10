# michaelcohen.io

The source of [michaelcohen.io](https://michaelcohen.io), a one-page personal site: who I am, where I have worked, and how to reach me.

## Stack

- [Next.js 16](https://nextjs.org/) (App Router, React 19, React Server Components, Turbopack) as a static export: `next build` writes the whole site to `out/`
- [Tailwind CSS 4](https://tailwindcss.com/) (configured in [`src/app/globals.css`](./src/app/globals.css), no `tailwind.config`) and a few [shadcn/ui](https://ui.shadcn.com/) primitives (Radix accordion, separator, slot)
- The work history is a typed TypeScript file, [`src/content/work.ts`](./src/content/work.ts), with Markdown bullets rendered by [react-markdown](https://github.com/remarkjs/react-markdown) at build time
- [Raleway](https://fonts.google.com/specimen/Raleway) self-hosted through `next/font`
- [bun](https://bun.sh/) as the package manager and script runner; deployed on Vercel as static files, with the response headers and the `*.vercel.app` redirect in [`vercel.json`](./vercel.json)

## Getting started

```sh
bun install
bun run dev
```

The dev server listens on <http://localhost:3000>. There is no database and nothing to configure: to change the work history, edit `src/content/work.ts` (see [`src/content/README.md`](./src/content/README.md)) and open a PR.

## Scripts

| Script | What it does |
| --- | --- |
| `bun run dev` | Start the development server |
| `bun run build` | Build the site into `out/` (plain files; serve them with any static server, e.g. `python3 -m http.server 3000 --directory out`) |
| `bun run lint` | Run ESLint (flat config in `eslint.config.mjs`; also covers `tests/` and `playwright.config.ts`) |
| `bun run typecheck` | Run `tsc --noEmit` |
| `bun run test:e2e` | Run the Playwright smoke test against `out/` (build first; `bunx playwright install chromium` once) |
| `bun run resume:pdf` | Render `public/MichaelCohenResume.pdf` from `src/content` (runs on its own before `dev` and `build`) |

## Résumé

The PDF behind "Download résumé" is generated, not kept in the repo. [`scripts/build-resume.tsx`](./scripts/build-resume.tsx) renders [`src/resume/document.tsx`](./src/resume/document.tsx) (react-pdf, with Raleway bundled in `src/resume/fonts/`) from the same [`src/content/work.ts`](./src/content/work.ts) the page uses, plus [`src/content/resume.ts`](./src/content/resume.ts) for the contact line, education and skills. It runs before every `bun run dev` and `bun run build`, so the download can never lag the site. Roles carry an optional `resume` field in `work.ts` to shorten their bullets for the one-pager, fold a company into a single block, or leave it off; the build fails if the result exceeds one page.

## Checks

Every pull request runs [`ci.yml`](./.github/workflows/ci.yml): a frozen install, lint, typecheck, the build, and the smoke test in [`tests/smoke.spec.ts`](./tests/smoke.spec.ts), which loads the exported site and fails on any page error, a missing work history without JavaScript, a month that shifts with the visitor's timezone, or a missing crawler file. A second job runs `bun audit --audit-level=high` and fails on any high or critical advisory. [Dependabot](./.github/dependabot.yml) opens one grouped PR a week for minor and patch bumps.

In production, [Vercel Analytics](https://vercel.com/docs/analytics) counts page views and [Speed Insights](https://vercel.com/docs/speed-insights) collects Web Vitals; a small beacon reports uncaught browser errors as a `client-error` analytics event. All three are inert when the site is served from anywhere other than a Vercel host.

## Licence

The code is MIT licensed (see [LICENSE](./LICENSE)). The photos, logos, résumé and personal text are not.
