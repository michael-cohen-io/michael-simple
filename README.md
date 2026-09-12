# michaelcohen.io

The source of [michaelcohen.io](https://michaelcohen.io), a one-page personal site: who I am, where I have worked, and how to reach me.

## Stack

- [Next.js 16](https://nextjs.org/) (App Router, React 19.3, React Server Components, Turbopack, the React Compiler) as a static export: `next build` writes the whole site to `out/`
- [Tailwind CSS 4](https://tailwindcss.com/) (configured in [`src/app/globals.css`](./src/app/globals.css), no `tailwind.config`; an OKLCH palette of one pink) and a few [shadcn/ui](https://ui.shadcn.com/) primitives on [Base UI](https://base-ui.com/) (accordion, button, item, separator)
- The work history is a typed TypeScript file, [`src/content/work.ts`](./src/content/work.ts), with Markdown bullets rendered by [react-markdown](https://github.com/remarkjs/react-markdown) at build time; writing and talks are [`src/content/writing.ts`](./src/content/writing.ts)
- A human | agent switch in the header shows the page as an agent receives it: `llms.txt`, which is also what `/` returns as Markdown
- An "Ask Claude About Me" box under the hero, answered by a [Claude Managed Agent](https://claude.com/blog/claude-managed-agents) grounded on the page's own Markdown, through one Vercel Function ([`api/ask.ts`](./api/ask.ts)); see the section below
- [Raleway](https://fonts.google.com/specimen/Raleway) self-hosted through `next/font`
- [bun](https://bun.sh/) as the package manager and script runner; deployed on Vercel as static files, with the response headers and the `*.vercel.app` redirect in [`vercel.json`](./vercel.json), and one [Routing Middleware](https://vercel.com/docs/routing-middleware), [`middleware.ts`](./middleware.ts), that serves `/` as Markdown to clients that prefer it and gives unknown paths a 404 body agents can read (Markdown, or an RFC 9457 problem document for JSON clients)

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
| `bun run build` | Build the site into `out/` (plain files; serve them with any static server, e.g. `python3 -m http.server 3000 --directory out`), then check that `out/` matches the middleware's list of published paths |
| `bun run lint` | Run ESLint (flat config in `eslint.config.mjs`; also covers `tests/` and `playwright.config.ts`) |
| `bun run typecheck` | Run `tsc --noEmit` |
| `bun run test:e2e` | Run the Playwright smoke test against `out/` and the middleware tests (build first; `bunx playwright install chromium` once) |
| `bun run generate` | Render `public/MichaelCohenResume.pdf`, `public/index.md` and `public/llms.txt` (one document), `public/resume.json` and `public/openapi.json` from `src/content` (runs on its own before `dev` and `build`) |

## Resume

The PDF behind "Download resume" is generated, not kept in the repo. [`scripts/build-resume.tsx`](./scripts/build-resume.tsx) renders [`src/resume/document.tsx`](./src/resume/document.tsx) (react-pdf, with Raleway bundled in `src/resume/fonts/`) from the same [`src/content/work.ts`](./src/content/work.ts) the page uses, plus [`src/content/resume.ts`](./src/content/resume.ts) for the contact line, education and skills. It runs before every `bun run dev` and `bun run build`, so the download can never lag the site. Roles carry an optional `resume` field in `work.ts` to shorten their bullets for the one-pager, fold a company into a single block, or leave it off; the build fails if the result exceeds one page.

## Ask Claude About Me

The question box is the one piece of the site with a server: `api/ask.ts`, a Vercel Function. It reads the page's Markdown twin, sends it with the visitor's first question to a Claude Managed Agent, and streams the agent's answer back as server-sent events (text as the model writes it, each Party Mode change the moment it lands, then `done` with the session to continue on; the loop itself is `src/lib/ask-stream.ts`, tested against a scripted session in `tests/ask.spec.ts`); follow-ups reuse the session, so the agent keeps the thread. The agent also has web search and web fetch, allowed only the domains this page links to (the employers, the writing, the profiles), so it can read a linked post for a detail the page does not give; the environment's egress list is the same set, and both are derived from the content files by `scripts/ask-setup.ts`, so a new link needs `bun scripts/ask-setup.ts update`. The agent's one custom tool, `restyle_page`, is Party Mode: the visitor asks for it (or for any visual change: colours, motion, letter case, a font, a banner, the page in French) and the agent picks from a fixed catalog (`src/lib/party.ts`); the function validates the call, answers the agent on the browser's behalf, and hands the effects to the page, which applies them as data attributes, custom properties and swapped text nodes (`src/components/party/party.tsx`, the CSS in `globals.css`). Translating or rewriting the page is a two-step tool call: the browser sends the page's visible text runs with every question, `list_text` hands them to the agent numbered, and the agent answers with one replacement per run. Follow-ups are turns of the same session, so "now make the headings dance" composes on what is active, and "Turn It Off" (a fixed control while anything is active, or Escape) clears it in the browser. Until the agent exists it answers with a single Claude API call over the same text, without the tools, so the box works with just an API key.

To turn it on, set these in the Vercel project (Settings, Environment Variables):

| Variable | What it is |
| --- | --- |
| `ANTHROPIC_API_KEY` | Required. Without it the box says asking is not set up. |
| `ASK_ENVIRONMENT_ID`, `ASK_AGENT_ID` | Optional. Printed by `bun scripts/ask-setup.ts` (run once, locally, with the key set); with both present the box runs on Managed Agents. The agent's model and prompt live in `src/lib/ask.ts` and its tools in the script; after changing either, or adding a link to the page, `ASK_AGENT_ID=… ASK_ENVIRONMENT_ID=… bun scripts/ask-setup.ts update` publishes a new version of the same agent (and the environment's egress list), which new sessions pick up. |
| `ASK_WORKSPACE` | Optional. The workspace the key belongs to, for the Console link the function logs when it opens a session; defaults to `default`. |

Limits: 300-character questions, five a minute per address and 400 a day per function instance, and a $1 cap per agent session (a session that reaches it is dropped and the next question starts a fresh one). The per-address limit is in memory, so it holds per instance; a [Vercel Firewall](https://vercel.com/docs/vercel-firewall) rate-limit rule on `/api/ask` is the durable version.

## Checks

Every pull request runs [`ci.yml`](./.github/workflows/ci.yml): a frozen install, lint, typecheck, the build, and the smoke test in [`tests/smoke.spec.ts`](./tests/smoke.spec.ts), which loads the exported site and fails on any page error, a missing work history without JavaScript, a month that shifts with the visitor's timezone, or a missing crawler file. A second job runs `bun audit --audit-level=high` and fails on any high or critical advisory. [Dependabot](./.github/dependabot.yml) opens one grouped PR a week for minor and patch bumps.

In production, [Vercel Analytics](https://vercel.com/docs/analytics) counts page views and [Speed Insights](https://vercel.com/docs/speed-insights) collects Web Vitals; a small beacon reports uncaught browser errors as a `client-error` analytics event. All three are inert when the site is served from anywhere other than a Vercel host.

## Licence

The code is MIT licensed (see [LICENSE](./LICENSE)). The photos, logos, resume and personal text are not.
