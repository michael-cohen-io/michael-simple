# Development Guide for michael-simple Website

This guide provides setup instructions and key information for developing on this codebase.

## Quick Start

### 1. Set Up Environment

```bash
# Ensure you have Node.js 24.x installed (check .nvmrc)
node --version

# Install dependencies with pnpm
pnpm install

# The postinstall script automatically runs `prisma generate`
```

### 2. Configure Database

Create a `.env.local` file with your PostgreSQL connection strings:

```
POSTGRES_PRISMA_URL=<pooled-connection-string>
POSTGRES_URL_NON_POOLING=<direct-connection-string>
```

For local development, you can use Vercel's free PostgreSQL database or set up your own instance.

### 3. Run Migrations & Start Development

```bash
# Apply any pending database migrations
pnpm db:migrate

# Start the development server
pnpm dev
```

Visit `http://localhost:3000` to see your changes with hot reload.

## Project Basics

### Architecture

This is a Next.js 14 full-stack application:

- **Frontend:** React components with TypeScript in `/src`
- **Backend:** API routes and server actions (minimal backend footprint)
- **Database:** PostgreSQL via Prisma ORM
- **Styling:** Tailwind CSS with Radix UI components

### Key Files & Directories

- `src/app/` - Next.js App Router pages and layouts
- `src/components/` - Reusable React components (buttons, cards, etc.)
- `src/lib/` - Utility functions and helpers
- `prisma/schema.prisma` - Database schema with WorkEntry and Company models
- `tailwind.config.ts` - Tailwind CSS configuration
- `tsconfig.json` - TypeScript configuration

### Database Models

**WorkEntry** - Represents a work experience/job entry
- Fields: id, company (relation), team, role, description, startDate, endDate, iconColor, visible, createdAt
- Used to display timeline of work experiences

**Company** - Represents an employer
- Fields: id, name, image, imageDark, url, description, createdAt
- Referenced by WorkEntry entries

## Common Development Tasks

### Adding a New Work Experience

Edit the database directly via Prisma Studio or use Vercel's dashboard. To open Prisma Studio:

```bash
npx prisma studio
```

This opens a web UI where you can add/edit WorkEntry and Company records.

### Updating Styling

- Global styles: `src/app/globals.css`
- Tailwind config: `tailwind.config.ts`
- Component styles: Use Tailwind classes directly in components
- Reusable component styles are in `/src/components` using Tailwind

### Creating New Pages

In Next.js App Router, create files in `src/app/`:
- `page.tsx` - Homepage
- `about/page.tsx` - `/about` route
- Create `layout.tsx` for route-specific layouts

### Linting & Formatting

```bash
# Run ESLint
pnpm lint

# Format with Prettier (configured in .prettierrc)
# Most editors auto-format on save if configured
```

## Important Notes

- **Node Version:** Keep Node.js at 24.x as specified in `.nvmrc`
- **Package Manager:** Use pnpm (not npm or yarn)
- **Migrations:** Always run `pnpm db:migrate` after pulling schema changes
- **Environment Variables:** Never commit `.env.local` - it contains secrets
- **Dark Mode:** Handled by `next-themes` - check component implementations for theme-aware styling

## Deployment

The site is hosted on Vercel. Deployment happens automatically on push to the main branch. Environment variables for production are configured in Vercel's dashboard.

## Further Reading

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Radix UI Documentation](https://www.radix-ui.com/docs)
