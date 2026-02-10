# michael-simple

My personal website — [michaelcohen.io](https://www.michaelcohen.io)

## Tech Stack

- **Framework:** [Next.js 14](https://nextjs.org/) (App Router)
- **Language:** TypeScript
- **Styling:** [Tailwind CSS](https://tailwindcss.com/) with [shadcn/ui](https://ui.shadcn.com/) components
- **Database:** PostgreSQL via [Prisma](https://www.prisma.io/) ORM (hosted on [Vercel Postgres](https://vercel.com/docs/storage/vercel-postgres))
- **Deployment:** [Vercel](https://vercel.com/)
- **Analytics:** [Vercel Analytics](https://vercel.com/analytics)
- **Font:** Raleway (via `next/font`)

## Project Structure

```
src/
├── app/                  # Next.js App Router pages & layout
│   ├── layout.tsx        # Root layout (font, header, footer, providers)
│   ├── page.tsx          # Home page (About, Work, Contact sections)
│   ├── providers.tsx     # Theme provider (next-themes)
│   └── globals.css       # Global styles & CSS variables
├── components/
│   ├── contact/          # Contact section
│   ├── header/           # Site header / navigation
│   ├── home/             # About / intro section
│   ├── timeline/         # Timeline UI component
│   ├── typography/       # Typography primitives
│   ├── theme/            # Dark/light mode toggle
│   ├── ui/               # shadcn/ui base components
│   ├── work/             # Work experience section
│   └── footer.tsx        # Site footer
└── lib/
    ├── hooks/            # Custom React hooks
    ├── prisma.ts         # Prisma client singleton
    ├── types.ts          # Shared TypeScript types
    └── utils.ts          # Utility functions (cn, etc.)
prisma/
├── schema.prisma         # Database schema (WorkEntry, Company)
└── migrations/           # Prisma migrations
```

## Getting Started

### Prerequisites

- Node.js 24 (see `.nvmrc`)
- pnpm

### Setup

```bash
# Install dependencies
pnpm install

# Set up environment variables
# You'll need POSTGRES_PRISMA_URL and POSTGRES_URL_NON_POOLING
# for the database connection (see prisma/schema.prisma)

# Run database migrations
pnpm db:migrate

# Start the dev server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to view the site.

## Scripts

| Command          | Description                        |
| ---------------- | ---------------------------------- |
| `pnpm dev`       | Start development server           |
| `pnpm build`     | Create production build            |
| `pnpm start`     | Start production server            |
| `pnpm lint`      | Run ESLint                         |
| `pnpm db:migrate`| Run Prisma migrations              |

## Deployment

The site is deployed on Vercel and auto-deploys from the `main` branch. Vercel Postgres provides the database.
