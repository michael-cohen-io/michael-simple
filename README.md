# michael-simple

Michael Cohen's personal website — [michaelcohen.io](https://www.michaelcohen.io)

## Tech Stack

- **Framework:** [Next.js](https://nextjs.org/) 14 (App Router)
- **Language:** TypeScript
- **Styling:** [Tailwind CSS](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/) (Radix primitives)
- **Database:** PostgreSQL via [Prisma](https://www.prisma.io/) ORM
- **Hosting:** [Vercel](https://vercel.com/) (with Vercel Postgres)
- **Analytics:** Vercel Analytics
- **Font:** Raleway (Google Fonts)

## Getting Started

### Prerequisites

- Node.js 24.x (see `.nvmrc`)
- pnpm
- PostgreSQL database (or a Vercel Postgres instance)

### Setup

```bash
# Install dependencies
pnpm install

# Set up environment variables
# Create a .env file with:
#   POSTGRES_PRISMA_URL=<your-pooled-connection-string>
#   POSTGRES_URL_NON_POOLING=<your-direct-connection-string>

# Run database migrations
pnpm db:migrate

# Start the dev server
pnpm dev
```

The site will be available at [http://localhost:3000](http://localhost:3000).

## Scripts

| Command           | Description                        |
| ----------------- | ---------------------------------- |
| `pnpm dev`        | Start the development server       |
| `pnpm build`      | Build for production               |
| `pnpm start`      | Start the production server        |
| `pnpm lint`       | Run ESLint                         |
| `pnpm db:migrate` | Run Prisma migrations              |

## Project Structure

```
src/
├── app/              # Next.js App Router pages & layout
├── components/
│   ├── contact/      # Contact section
│   ├── header/       # Site header / navigation
│   ├── home/         # About / intro section
│   ├── theme/        # Dark/light theme toggle
│   ├── timeline/     # Work history timeline
│   ├── typography/   # Shared typography components
│   ├── ui/           # shadcn/ui primitives
│   └── work/         # Work experience section
├── lib/
│   ├── hooks/        # Custom React hooks
│   ├── prisma.ts     # Prisma client singleton
│   ├── types.ts      # Shared TypeScript types
│   └── utils.ts      # Utility functions (cn, etc.)
prisma/
├── schema.prisma     # Database schema
└── migrations/       # Migration history
```
