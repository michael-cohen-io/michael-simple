# michaelcohen.io

The source of [michaelcohen.io](https://michaelcohen.io), a one-page personal site: who I am, where I have worked, and how to reach me.

## Stack

- [Next.js 14](https://nextjs.org/) (App Router, React Server Components) as a static export: `next build` writes the whole site to `out/`
- [Tailwind CSS](https://tailwindcss.com/) and a few [shadcn/ui](https://ui.shadcn.com/) primitives (Radix accordion, separator, slot)
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
| `bun run lint` | Run `next lint` (ESLint) |
| `bun run typecheck` | Run `tsc --noEmit` |
| `bun run resume:pdf` | Build `public/MichaelCohenResume.pdf` from `resume.tex` |

## Licence

The code is MIT licensed (see [LICENSE](./LICENSE)). The photos, logos, résumé and personal text are not.
