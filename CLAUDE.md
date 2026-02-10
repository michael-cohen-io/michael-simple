# CLAUDE.md

This file provides context for AI-assisted development on this project.

## Project Overview

This is Michael Cohen's personal website ([michaelcohen.io](https://www.michaelcohen.io)), built with Next.js 14 using the App Router pattern. It's a single-page site with three main sections: About, Work Experience, and Contact.

## Architecture

- **Next.js App Router** — pages live in `src/app/`, components in `src/components/`
- **React Server Components** are the default; client components are explicitly marked with `"use client"`
- **Prisma ORM** connects to Vercel Postgres — schema is in `prisma/schema.prisma`
- **shadcn/ui** components live in `src/components/ui/` and are configured via `components.json`
- **Theme** — dark/light mode via `next-themes`, toggled in `src/components/theme/`

## Key Files

- `src/app/layout.tsx` — Root layout: Raleway font, header, footer, theme provider, Vercel Analytics
- `src/app/page.tsx` — Home page composing About, Work, and Contact sections
- `src/lib/prisma.ts` — Prisma client singleton (prevents multiple instances in dev)
- `src/lib/utils.ts` — Utility functions including `cn()` for Tailwind class merging
- `prisma/schema.prisma` — Database models: `Company` and `WorkEntry`

## Code Conventions

- **TypeScript** throughout — strict mode enabled
- **Tailwind CSS** for all styling — no CSS modules or styled-components
- **shadcn/ui** for base UI primitives — use existing components from `src/components/ui/` before creating new ones
- **Path aliases** — use `@/` to reference `src/` (e.g., `@/components/`, `@/lib/`)
- **Formatting** — Prettier with 2-space indentation, no tabs (see `.prettierrc`)
- **Linting** — ESLint with `next/core-web-vitals` preset

## Commands

```bash
pnpm dev          # Start dev server
pnpm build        # Production build
pnpm lint         # Run ESLint
pnpm db:migrate   # Run Prisma migrations
```

## Environment Variables

Required for database access:
- `POSTGRES_PRISMA_URL` — Pooled connection string
- `POSTGRES_URL_NON_POOLING` — Direct connection string

## Database

Two models in `prisma/schema.prisma`:
- **Company** — `id`, `name` (unique), `image`, `imageDark`, `url`, `description`
- **WorkEntry** — `id`, `companyId` (FK), `team`, `role`, `description`, `startDate`, `endDate`, `iconColor`, `visible`

Run `pnpm db:migrate` after schema changes. The `postinstall` script runs `prisma generate` automatically.

## Deployment

- Hosted on **Vercel** — auto-deploys from `main`
- Database: **Vercel Postgres**
- Config in `vercel.json` uses npm commands (Vercel's build pipeline)
