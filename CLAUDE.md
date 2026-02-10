# CLAUDE.md

This file provides guidance for AI coding agents working on this repository.

## Project Overview

Personal website for Michael Cohen, hosted at [michaelcohen.io](https://www.michaelcohen.io). Built with Next.js 14 (App Router), TypeScript, Tailwind CSS, shadcn/ui, and Prisma with PostgreSQL.

## Commands

- `pnpm dev` — start dev server
- `pnpm build` — production build
- `pnpm lint` — run ESLint (`next lint`)
- `pnpm db:migrate` — run Prisma migrations (`prisma migrate dev`)
- `pnpm postinstall` — regenerate Prisma client (`prisma generate`)

## Code Style & Conventions

- **Language:** TypeScript (strict). All source files use `.ts` / `.tsx`.
- **Formatting:** Prettier with 2-space indentation, no tabs (see `.prettierrc`).
- **Linting:** ESLint extends `next/core-web-vitals`.
- **Imports:** Use `@/` path alias for `src/` (e.g. `@/components/...`, `@/lib/...`).
- **Components:** React Server Components by default (Next.js App Router). Use `"use client"` only when needed for interactivity.
- **UI primitives:** Use shadcn/ui components from `src/components/ui/`. These are based on Radix UI and styled with Tailwind + `class-variance-authority`.
- **Styling:** Tailwind CSS utility classes. Use `cn()` from `@/lib/utils` for conditional class merging.
- **Theme:** Dark/light mode via `next-themes`. Support both themes when adding UI.
- **Database:** Prisma ORM with PostgreSQL. Schema lives in `prisma/schema.prisma`. Use the singleton client from `@/lib/prisma.ts`.
- **Font:** Raleway (Google Fonts), loaded in `src/app/layout.tsx`.

## Architecture Notes

- Single-page layout: `src/app/page.tsx` composes `About`, `Work`, and `Contact` sections.
- Work experience data is stored in PostgreSQL (models: `Company`, `WorkEntry`) and fetched server-side.
- The site is deployed on Vercel with Vercel Postgres. Environment variables `POSTGRES_PRISMA_URL` and `POSTGRES_URL_NON_POOLING` are required.
- Node.js 24.x is required (see `.nvmrc` and `package.json` engines).
