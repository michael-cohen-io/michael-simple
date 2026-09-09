# michaelcohen.io

The source of [michaelcohen.io](https://michaelcohen.io), a one-page personal site: who I am, where I have worked, and how to reach me.

## Stack

- [Next.js 14](https://nextjs.org/) (App Router, React Server Components) with a single static route
- [Tailwind CSS](https://tailwindcss.com/) and a few [shadcn/ui](https://ui.shadcn.com/) primitives (Radix accordion, separator, slot)
- [Prisma](https://www.prisma.io/) on Postgres for the work history, read at build time
- [Raleway](https://fonts.google.com/specimen/Raleway) self-hosted through `next/font`
- [bun](https://bun.sh/) as the package manager and script runner; deployed on Vercel

## Getting started

```sh
bun install
bun run dev
```

The dev server listens on <http://localhost:3000>. The work section is read from Postgres, so put `POSTGRES_PRISMA_URL` and `POSTGRES_URL_NON_POOLING` in a `.env` file (gitignored) before building; `bun run build` runs `prisma generate` first.

## Scripts

| Script | What it does |
| --- | --- |
| `bun run dev` | Start the development server |
| `bun run build` | Generate the Prisma client and build the production bundle |
| `bun run start` | Serve the production build |
| `bun run lint` | Run `next lint` (ESLint) |
| `bun run typecheck` | Run `tsc --noEmit` |
| `bun run db:migrate` | Apply Prisma migrations to the local database |
| `bun run resume:pdf` | Build `public/MichaelCohenResume.pdf` from `resume.tex` |

## Licence

The code is MIT licensed (see [LICENSE](./LICENSE)). The photos, logos, résumé and personal text are not.
