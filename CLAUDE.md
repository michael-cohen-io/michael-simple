# Development Guide for Michael Simple Portfolio

This document provides setup instructions and guidelines for developing the michael-simple portfolio website.

## Quick Start

### Setup

1. **Install dependencies:**
   ```bash
   pnpm install
   ```
   This automatically runs `prisma generate` via the postinstall script.

2. **Set up environment variables:**
   Create a `.env.local` file in the root directory with:
   ```
   POSTGRES_PRISMA_URL=postgresql://user:password@host:5432/michael_db?schema=public
   POSTGRES_URL_NON_POOLING=postgresql://user:password@host:5432/michael_db?schema=public
   ```

3. **Run database migrations:**
   ```bash
   pnpm db:migrate
   ```

4. **Start development:**
   ```bash
   pnpm dev
   ```
   Visit `http://localhost:3000`

## Project Architecture

### Technology Decisions

- **Next.js 14 (App Router):** Modern React framework with built-in optimization, SSR, and API routes
- **TypeScript:** Full type safety across the codebase
- **Tailwind CSS:** Utility-first CSS framework for rapid UI development
- **Radix UI:** Accessible, unstyled component primitives
- **Prisma:** Type-safe database ORM with migration support
- **next-themes:** Seamless dark mode implementation

### Directory Organization

- **`src/app/`** - Next.js App Router pages and layouts
- **`src/components/`** - React components organized by feature/type
- **`src/lib/`** - Utilities, types, hooks, and database client
- **`prisma/`** - Database schema and migrations
- **`public/`** - Static assets

## Key Development Concepts

### Component Structure

Components are organized by domain:
- `components/home/` - Landing page sections
- `components/work/` - Work history timeline
- `components/contact/` - Contact section
- `components/ui/` - Reusable UI primitives
- `components/typography/` - Text and markdown components

All UI components should use Tailwind CSS classes for styling and follow Radix UI patterns for accessibility.

### Database Access

Database access goes through Prisma client. The singleton instance is in `lib/prisma.ts`:

```typescript
import prisma from "@/lib/prisma";

// Query work entries with companies
const workEntries = await prisma.workEntry.findMany({
  include: { company: true },
  where: { visible: true },
  orderBy: { startDate: "desc" },
});
```

### Type Safety

TypeScript types are defined in `lib/types.ts`. Always use proper types for:
- Component props
- Database queries
- API responses
- Utility function inputs/outputs

### Styling Best Practices

- Use Tailwind CSS utilities for all styling
- Use `clsx` or `tailwind-merge` for conditional classes
- Component-level styling should be minimal (prefer Tailwind utilities)
- The custom animation plugin (`tailwindcss-animate`) provides useful keyframes
- Responsive design uses Tailwind breakpoints (sm, md, lg, xl, 2xl)

### Theme Support

Dark mode is handled by `next-themes`:
- Wrap components with `ThemeProvider` in `app/providers.tsx`
- Use `useTheme()` hook to access theme state
- Apply dark mode styles with Tailwind's `dark:` prefix

Example:
```tsx
<div className="bg-white dark:bg-slate-950">
  Light and dark mode background
</div>
```

## Common Development Tasks

### Adding a New Work Entry

Use Prisma Studio or directly insert data:
```bash
pnpm db:migrate dev --name "add_new_company"
```

Then use Prisma Client to add the entry:
```typescript
await prisma.workEntry.create({
  data: {
    team: "Team Name",
    role: "Job Title",
    description: "Job description with markdown support",
    startDate: new Date("2024-01-01"),
    endDate: null, // Current role
    company: {
      connect: { id: companyId },
    },
    iconColor: "#FF5733",
    visible: true,
  },
});
```

### Modifying the Database Schema

1. Edit `prisma/schema.prisma`
2. Create and run migration:
   ```bash
   pnpm db:migrate dev --name "descriptive_name"
   ```
3. Prisma client is automatically regenerated

### Adding UI Components

1. Create new component in `src/components/ui/` if it's reusable
2. Use Radix UI primitives as the base
3. Style with Tailwind CSS
4. Export from component barrel or import directly
5. Ensure accessibility (ARIA labels, keyboard navigation)

Example:
```tsx
import { forwardRef } from "react";
import * as RadixUI from "@radix-ui/react-component";
import { cn } from "@/lib/utils";

const MyComponent = forwardRef<
  React.ElementRef<typeof RadixUI.Root>,
  React.ComponentPropsWithoutRef<typeof RadixUI.Root>
>(({ className, ...props }, ref) => (
  <RadixUI.Root
    ref={ref}
    className={cn("base-classes", className)}
    {...props}
  />
));
MyComponent.displayName = "MyComponent";

export default MyComponent;
```

### Running Migrations

#### View current migration status:
```bash
pnpm db:migrate status
```

#### Create a new migration (interactive):
```bash
pnpm db:migrate dev --name "migration_name"
```

#### Reset database (development only):
```bash
pnpm db:migrate reset
```

## Testing and Validation

### Linting
```bash
pnpm lint
```

Runs ESLint with Next.js configuration. Fix issues before committing.

### Type Checking
TypeScript is configured for strict mode. Run:
```bash
npx tsc --noEmit
```

### Manual Testing

- Test responsive design across breakpoints (use browser DevTools)
- Test dark mode toggle in theme-button component
- Verify all links and navigation work correctly
- Test on multiple browsers if possible

## Performance Considerations

- **Image Optimization:** Use Next.js Image component for company logos
- **Bundle Size:** Monitor dependencies - keep them minimal
- **Database Queries:** Use `.include()` to avoid N+1 queries
- **Code Splitting:** Next.js automatically handles route-based splitting
- **Caching:** Leverage Next.js caching strategies for static content

## Git Workflow

1. Create feature branch from `master`
2. Make changes and test locally
3. Run `pnpm lint` to ensure code quality
4. Commit with clear messages
5. Create pull request with description of changes
6. Request review before merging

## Environment and Secrets

**Never commit `.env.local` or any secrets to version control.**

The `.gitignore` file already excludes:
- `/node_modules`
- `.env*`
- `.aider*`
- Build and cache directories

## Troubleshooting

### Port 3000 already in use
```bash
pnpm dev -- -p 3001
```

### Prisma client not generating
```bash
pnpm postinstall
```

### Database connection issues
- Verify `POSTGRES_PRISMA_URL` and `POSTGRES_URL_NON_POOLING` in `.env.local`
- Check PostgreSQL server is running
- Verify database exists and credentials are correct

### TypeScript errors
```bash
npx tsc --noEmit
```

This provides detailed error information beyond what the IDE shows.

### Next.js cache issues
```bash
rm -rf .next
pnpm dev
```

## Code Style

- Use 2-space indentation
- Quote: single quotes for JS/TS, double quotes in JSX
- Trailing commas in multiline structures
- ESLint configuration enforces Next.js best practices
- Use TypeScript for all new code

## Accessibility Standards

- All interactive elements must be keyboard accessible
- Use semantic HTML (`button`, `a`, `form`, etc.)
- Include ARIA labels for screen readers
- Test with keyboard navigation (Tab, Enter, Escape)
- Maintain sufficient color contrast ratios

## Useful Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Tailwind CSS](https://tailwindcss.com)
- [Radix UI](https://www.radix-ui.com)
- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)

## Questions or Issues?

Check the README.md for general project information and refer back to this document for development-specific guidance.
