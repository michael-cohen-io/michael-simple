# Michael's Personal Website

A modern, full-stack personal website built with Next.js, React, and PostgreSQL. Features a portfolio of work experiences, dynamic content management, and responsive design.

**Live:** [www.michaelcohen.io](https://www.michaelcohen.io)

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **UI Components:** Radix UI
- **Database:** PostgreSQL with Prisma ORM
- **Content:** MDX support via next-mdx-remote
- **Icons:** Heroicons & Lucide React
- **Theme:** next-themes for dark mode support
- **Hosting:** Vercel
- **Analytics:** Vercel Analytics

## Getting Started

### Prerequisites

- Node.js 24.x (see `.nvmrc`)
- pnpm package manager

### Installation

```bash
# Install dependencies
pnpm install

# Set up environment variables
# Create a .env.local file with:
# POSTGRES_PRISMA_URL=<your-pooled-connection-string>
# POSTGRES_URL_NON_POOLING=<your-direct-connection-string>

# Run database migrations
pnpm db:migrate

# Start development server
pnpm dev
```

The site will be available at `http://localhost:3000`

## Available Scripts

- `pnpm dev` - Start development server with hot reload
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm db:migrate` - Run Prisma migrations
- `pnpm lint` - Run ESLint

## Project Structure

```
src/
├── app/                 # Next.js app router pages and layouts
├── components/          # Reusable React components
└── lib/                 # Utility functions and helpers
prisma/
└── schema.prisma        # Database schema definition
public/                  # Static assets
```

## Database

The site uses Prisma ORM with a PostgreSQL database. Key models:

- **WorkEntry** - Individual work experiences with company association
- **Company** - Companies referenced in work experiences

Run `pnpm db:migrate` to apply pending database migrations.

## Development

The project uses:
- **Linting:** ESLint with Next.js config
- **Formatting:** Prettier
- **Code Editor:** VS Code config included

## License

Private project - Not open source
