# Michael Cohen Portfolio Website

A modern, responsive portfolio website showcasing work experience, skills, and contact information. Built with Next.js 14, React 18, TypeScript, Tailwind CSS, and PostgreSQL.

**Live Site:** [www.michaelcohen.io](https://www.michaelcohen.io)

## Tech Stack

- **Framework:** Next.js 14.2.2
- **Runtime:** Node.js 24.x
- **Language:** TypeScript 5
- **Styling:** Tailwind CSS 3.4.1 + PostCSS
- **UI Components:** Radix UI + shadcn/ui components
- **Database:** PostgreSQL (Vercel Postgres)
- **ORM:** Prisma 5
- **Package Manager:** pnpm
- **Deployment:** Vercel
- **Analytics:** Vercel Analytics
- **Content:** MDX support (next-mdx-remote)
- **Theme:** Dark mode support (next-themes)

## Project Structure

```
michael-simple/
├── src/
│   ├── app/              # Next.js app directory (pages, layouts, API routes)
│   ├── components/       # React components
│   │   ├── contact/      # Contact section
│   │   ├── home/         # About/home section
│   │   ├── header/       # Header/navigation
│   │   ├── work/         # Work experience section
│   │   └── ui/           # Reusable UI components (Radix + shadcn)
│   └── lib/              # Utilities and helpers
│       ├── hooks/        # Custom React hooks
│       ├── prisma.ts     # Prisma client singleton
│       ├── types.ts      # TypeScript type definitions
│       └── utils.ts      # Utility functions
├── prisma/               # Database schema and migrations
├── public/               # Static assets
├── .vscode/              # VS Code settings
├── tailwind.config.ts    # Tailwind CSS configuration
├── next.config.mjs       # Next.js configuration
└── tsconfig.json         # TypeScript configuration
```

## Getting Started

### Prerequisites

- Node.js 24.x (check `.nvmrc` for exact version)
- pnpm (recommended) or npm/yarn
- PostgreSQL database (for local development, or use Vercel Postgres for production)

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Set up environment variables by creating a `.env.local` file:
   ```
   # Vercel Postgres connection strings
   POSTGRES_PRISMA_URL=your_connection_pooling_url
   POSTGRES_URL_NON_POOLING=your_direct_connection_url
   ```

4. Set up the database:
   ```bash
   pnpm db:migrate
   ```

### Development

Start the development server:
```bash
pnpm dev
```

The site will be available at [http://localhost:3000](http://localhost:3000)

### Building for Production

Build the application:
```bash
pnpm build
```

Start the production server:
```bash
pnpm start
```

## Available Scripts

- `pnpm dev` - Start development server with hot reload
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm db:migrate` - Run Prisma migrations
- `pnpm lint` - Run ESLint

## Database

The project uses PostgreSQL with Prisma ORM. The database stores:

- **Company:** Companies where work experience was gained
- **WorkEntry:** Individual work experiences/positions with references to companies

### Migrations

Database migrations are stored in `prisma/migrations/`. Run migrations with:
```bash
pnpm db:migrate
```

## Key Features

- **Portfolio Display:** Showcase work experience with timeline and accordion views
- **Responsive Design:** Mobile-first design that works on all devices
- **Dark Mode:** Built-in dark/light theme switching
- **Database-Driven:** Work experience data stored in PostgreSQL
- **Contact Section:** Contact information and links
- **TypeScript:** Full type safety throughout the codebase
- **Analytics:** Vercel Analytics integration for tracking

## Deployment

The project is configured for deployment on Vercel:

1. Push changes to the repository
2. Vercel automatically builds and deploys on push to main
3. Environment variables must be set in Vercel dashboard

See `vercel.json` for Vercel-specific configuration.

## Code Quality

- **Linting:** ESLint with Next.js rules
- **Formatting:** Prettier (`.prettierrc`)
- **Type Safety:** TypeScript strict mode

Run linting:
```bash
pnpm lint
```

## Contributing

When making changes to this project, please:

1. Create a feature branch
2. Make your changes
3. Test locally with `pnpm dev`
4. Submit a pull request

For detailed development guidelines, see `CLAUDE.md`.

## License

Private project - all rights reserved
