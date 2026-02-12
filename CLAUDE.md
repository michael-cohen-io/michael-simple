# Claude Development Guide

This document provides setup instructions and guidelines for working on the Michael Cohen Portfolio website using Claude Code.

## Quick Setup

### 1. Environment Setup

Ensure you have the correct Node.js version:
```bash
nvm use  # Uses Node.js version from .nvmrc (24.x)
```

Install dependencies:
```bash
pnpm install
```

### 2. Database Configuration

For local development with a live database:

1. Create a `.env.local` file in the project root
2. Add your PostgreSQL connection strings:
   ```
   POSTGRES_PRISMA_URL=postgresql://user:password@host:5432/dbname
   POSTGRES_URL_NON_POOLING=postgresql://user:password@host:5432/dbname
   ```

3. Set up the database schema:
   ```bash
   pnpm db:migrate
   ```

If you only need to work on frontend features, you can skip the database setup.

### 3. Start Development

```bash
pnpm dev
```

The site will be available at `http://localhost:3000`

## Architecture Overview

### Component Structure

- **App Layout** (`src/app/`): Next.js 14 app directory with pages and API routes
- **Components** (`src/components/`): React components organized by feature
  - `contact/` - Contact information and links
  - `home/` - About section
  - `header/` - Navigation header
  - `work/` - Work experience display (timeline and accordion views)
  - `ui/` - Reusable UI components from Radix UI
- **Utilities** (`src/lib/`): Helper functions, hooks, types, and database client

### Data Models

The project uses Prisma with PostgreSQL. Two main models:

```prisma
model WorkEntry {
  id          Int
  company     Company (relation)
  team        String
  role        String
  description String
  startDate   DateTime
  endDate     DateTime?
  visible     Boolean
}

model Company {
  id          Int
  name        String
  image       String
  imageDark   String?
  url         String?
  description String?
  workEntries WorkEntry[] (relation)
}
```

### Styling

- **Tailwind CSS**: Utility-first CSS framework for styling
- **Dark Mode**: Implemented with `next-themes`, toggle in header
- **Responsive Design**: Mobile-first approach with Tailwind breakpoints (`md:`, `lg:`, etc.)

### UI Components

The project uses shadcn/ui components, which are built on Radix UI primitives:
- Accordion
- Tabs
- Tooltip
- Hover Card
- Avatar
- Label
- Separator

These are located in `src/components/ui/` and can be customized via Tailwind configuration.

## Common Development Tasks

### Adding a New Work Experience

1. Add a new `Company` entry to the database
2. Create a `WorkEntry` with the company reference
3. The work display components (`WorkTimeline`, `WorkAccordion`) will automatically pick it up

### Modifying the Timeline Display

The work experience is displayed in two ways:
- **Desktop**: `WorkTimeline` component shows a vertical timeline
- **Mobile**: `MobileWorkAccordion` component shows an accordion

Both are used in `src/components/work/work.tsx`. Update here if you need to change the layout or styling.

### Adding or Updating UI Components

To add a new Radix UI component:

1. Check if it already exists in `src/components/ui/`
2. If not, you can generate it using shadcn/cli or manually add it
3. Import and use it in your components

To customize component styles, modify the Tailwind classes in the component file.

### Working with Content

The site supports MDX via `next-mdx-remote`. While not currently used extensively, you can add MDX support by:

1. Creating `.mdx` files in the appropriate location
2. Using `next-mdx-remote` to render them in a route
3. This is useful for blog posts, case studies, or static pages

## Deployment

The project is deployed on Vercel:

1. All changes to `main` branch are automatically deployed
2. Environment variables must be set in the Vercel dashboard
3. Build output uses Next.js 14 static generation and server rendering

To test production build locally:
```bash
pnpm build
pnpm start
```

## Code Quality Standards

### TypeScript

- All files use `.ts` or `.tsx` extensions
- Strict mode is enabled in `tsconfig.json`
- Type definitions are in `src/lib/types.ts`

### Linting

Run ESLint before committing:
```bash
pnpm lint
```

The project uses Next.js ESLint config. Fix issues with:
```bash
pnpm lint --fix
```

### Formatting

Prettier is configured (`.prettierrc`). Most IDEs can auto-format on save.

## Performance Considerations

- **Image Optimization**: Use Next.js `Image` component when loading company images
- **Bundle Size**: Be mindful of dependencies; check sizes with `npm ls` or equivalent
- **Server Components**: Use React Server Components where possible (Next.js 14 app directory)
- **Data Fetching**: Leverage Prisma for efficient database queries

## Debugging

### Development Mode

- Use `pnpm dev` for automatic hot reload
- Browser DevTools for client-side debugging
- VS Code debugger can attach to the Next.js process

### Database Debugging

Prisma Studio helps visualize and manage database:
```bash
npx prisma studio
```

## Git Workflow

1. Create a feature branch: `git checkout -b feature/description`
2. Make your changes
3. Test locally: `pnpm dev` and `pnpm lint`
4. Commit with clear messages
5. Push and create a pull request

## Useful Resources

- [Next.js 14 Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Radix UI Documentation](https://www.radix-ui.com/docs/primitives/overview/introduction)
- [React 18 Documentation](https://react.dev)

## Troubleshooting

### Port 3000 Already in Use

Kill the process using port 3000:
```bash
lsof -i :3000
kill -9 <PID>
```

### Database Connection Issues

- Verify connection strings in `.env.local`
- Check database is running and accessible
- Ensure firewall/network allows connection
- Test with: `npx prisma db execute --stdin`

### Build Failures

- Clear Next.js cache: `rm -rf .next`
- Reinstall dependencies: `rm -rf node_modules pnpm-lock.yaml && pnpm install`
- Check `pnpm build` output for specific errors

### TypeScript Errors

- Run `pnpm lint` to see all issues
- Some errors only appear during build; development may not catch all issues
- Check `tsconfig.json` if types seem misconfigured

## Notes for Future Developers

- The project uses `pnpm` for dependency management; avoid `npm` or `yarn`
- The `.nvmrc` file ensures consistent Node.js versions across environments
- Vercel deployment is configured in `vercel.json`
- Database uses Vercel Postgres with connection pooling
- Dark mode is implemented with CSS classes and stored in localStorage
