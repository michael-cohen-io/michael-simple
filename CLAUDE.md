# CLAUDE.md - Development Guidelines for michael-simple

This document provides guidance for working on the michael-simple project with AI-assisted development. It outlines the project architecture, best practices, common patterns, and things to keep in mind when making changes.

## Quick Start for Development

### Initial Setup
```bash
# Install dependencies
npm install

# Create .env.local with database credentials
# POSTGRES_PRISMA_URL=postgresql://...
# POSTGRES_URL_NON_POOLING=postgresql://...

# Initialize database
npm run db:migrate

# Start development server
npm run dev
```

### Common Development Tasks
```bash
# Add/run database migrations
npm run db:migrate

# Build for production
npm run build

# Check code quality
npm run lint
```

## Architecture Overview

### Next.js App Router
This project uses Next.js 14 with the App Router (not Pages Router). The project structure is organized as:

```
src/app/           # App router directory
├── page.tsx       # Home page (/)
└── layout.tsx     # Root layout wrapper
```

**Key Points:**
- Single page application with all content on the home page
- `page.tsx` imports main sections: About, Work, and Contact
- Layout is wrapped with providers (theme, analytics, etc.)
- Static site with dynamic data from Prisma

### Component Organization

**UI Components** (`src/components/ui/`)
- Radix UI wrapper components with Tailwind styling
- Follow Shadcn/ui patterns
- Examples: `button.tsx`, `card.tsx`, `accordion.tsx`, `avatar.tsx`
- These should be largely stable and not modified frequently

**Feature Components** (`src/components/`)
- Higher-level business logic components
- Organized by feature/section:
  - `home/about.tsx` - About section
  - `work/` - Work experience components
  - `contact/contact.tsx` - Contact section
  - `header/header.tsx` - Site header
  - `footer.tsx` - Site footer
  - `theme/theme-button.tsx` - Dark mode toggle

**Typography** (`src/components/typography/`)
- `heading.tsx` - Heading component
- `markdown.tsx` - MDX rendering component

### Database Layer (Prisma)

**Schema Location:** `prisma/schema.prisma`

**Key Models:**
- **Company** - Employer information with logo and URL
- **WorkEntry** - Job positions with dates, team, role, and description

**Important:**
- Prisma client is instantiated in `src/lib/prisma.ts` as a singleton
- Always use the singleton instance for database queries
- Database migrations are in `prisma/migrations/`
- When modifying schema, run `npm run db:migrate` to generate migrations

### Styling

**Framework:** Tailwind CSS with custom configuration

**Key Files:**
- `tailwind.config.ts` - Tailwind theme configuration
- `src/app/globals.css` - Global styles and Tailwind directives
- Uses CSS variables for theming (light/dark mode)

**Patterns:**
- Use Tailwind utility classes directly in JSX
- Use `clsx` or ternary operators for conditional classes
- Use `tailwind-merge` to handle utility conflicts
- Component styles should use CVA (Class Variance Authority) for variants

**Example:**
```tsx
import { clsx } from "clsx";

export function Button({ variant, disabled }: Props) {
  return (
    <button
      className={clsx(
        "px-4 py-2 rounded-lg font-medium",
        variant === "primary" && "bg-blue-600 text-white",
        variant === "secondary" && "bg-gray-200 text-gray-900",
        disabled && "opacity-50 cursor-not-allowed"
      )}
      disabled={disabled}
    >
      Click me
    </button>
  );
}
```

### Theme Support

- Uses `next-themes` for theme switching
- Provider setup in `src/app/providers.tsx`
- Theme button in `src/components/theme/theme-button.tsx`
- CSS variables in globals.css handle theme values

## Common Development Patterns

### Adding a New Work Entry

To add a new job/company to the work history:

1. **Via Database:**
   - Use Prisma Studio: `npx prisma studio`
   - Or write a database migration/script

2. **Database Structure:**
   ```prisma
   model WorkEntry {
     id: Int
     company: Company       # Foreign key relation
     team: String          # Department/team
     role: String          # Job title
     description: String   # Role description
     startDate: DateTime   # ISO 8601 date
     endDate: DateTime?    # Optional for current role
     iconColor: String?    # Custom color (hex or Tailwind color)
     visible: Boolean      # Whether to show on site
     createdAt: DateTime   # Auto-set timestamp
   }
   ```

3. **The Work component** (`src/components/work/work.tsx`):
   - Fetches from database using Prisma
   - Renders WorkTimeline (desktop) or MobileWorkAccordion (mobile)
   - Automatically picks up new entries

### Modifying the Layout

The main layout structure is in `src/app/layout.tsx`:
- Wraps the entire app with providers (theme, analytics)
- Includes header and footer
- Main content area has padding and max-width constraints

The home page sections are composed in `src/app/page.tsx`:
- About, Work, and Contact sections are imported and rendered
- To reorder sections, change the order in this file
- To add new sections, create component and import it here

### Responsive Design

The site uses mobile-first Tailwind approach:
- Base styles are mobile
- Use `md:` prefix for medium (768px+) breakpoints
- Use `lg:` prefix for large (1024px+) breakpoints

**Example from WorkTimeline:**
```tsx
// Mobile: single column accordion
// Desktop: timeline with flex layout
<div className="hidden md:flex">
  <WorkTimeline entries={entries} />
</div>
<div className="md:hidden">
  <MobileWorkAccordion entries={entries} />
</div>
```

### Fetching Data

**Server Components:**
This project primarily uses server components. Data fetching is done directly in components:

```tsx
import { prisma } from "@/lib/prisma";

export default async function Work() {
  const companies = await prisma.company.findMany({
    include: { workEntries: true },
  });
  // ... render component
}
```

## Important Files to Know

| File | Purpose |
|------|---------|
| `src/app/page.tsx` | Main home page - composes all sections |
| `src/app/layout.tsx` | Root layout - providers, header, footer |
| `src/app/globals.css` | Global styles, Tailwind directives, theme colors |
| `prisma/schema.prisma` | Database schema definitions |
| `src/lib/prisma.ts` | Prisma client singleton |
| `tailwind.config.ts` | Tailwind theme and plugin configuration |
| `next.config.mjs` | Next.js configuration |
| `components.json` | Shadcn/ui configuration |

## Best Practices

### Code Quality
1. **TypeScript:** Always use proper typing. Avoid `any` unless absolutely necessary.
2. **Component Props:** Define proper interfaces for component props.
3. **Imports:** Use absolute imports (`@/`) from the configured alias in `tsconfig.json`.

### Performance
1. **Server Components:** Use server components by default for data fetching.
2. **Image Optimization:** Use Next.js `Image` component for image optimization.
3. **Bundle Size:** Be mindful of dependencies. Check if Radix UI alternatives exist.

### Database
1. **Prisma Queries:** Always include necessary relations with `include` or `select`.
2. **Error Handling:** Gracefully handle database errors in components.
3. **Migrations:** Commit migrations to git. Never manually modify schema without migrations.

### Styling
1. **Tailwind First:** Use Tailwind utilities. Only add custom CSS when necessary.
2. **Dark Mode:** Test components in both light and dark modes.
3. **Accessibility:** Use semantic HTML and ARIA attributes from Radix UI components.

### Component Development
1. **Single Responsibility:** Each component should have one clear purpose.
2. **Prop Drilling:** Use composition over prop drilling for complex hierarchies.
3. **Reusability:** Extract reusable UI components to `src/components/ui/`.

## Debugging Tips

### Development Server Issues
```bash
# Clear Next.js cache and restart
rm -rf .next
npm run dev
```

### Database Connection Issues
- Check `.env.local` has correct DATABASE URLs
- Verify database is running and accessible
- Use Prisma Studio to test connection: `npx prisma studio`

### Type Errors
```bash
# Regenerate TypeScript types
npx prisma generate
```

### Styling Issues
- Check Tailwind config for theme values
- Verify CSS variables are set in globals.css
- Use browser DevTools to inspect computed styles

## Deployment

### Vercel
The project is configured for Vercel deployment:

1. **Environment Variables:** Set `POSTGRES_PRISMA_URL` and `POSTGRES_URL_NON_POOLING` in Vercel project settings
2. **Database:** Uses Vercel Postgres or external PostgreSQL
3. **Auto-deploy:** Pushes to main branch trigger automatic deployments

### Build Process
```bash
# Local build simulation
npm run build
npm run start
```

## Testing & Validation

### Pre-deployment Checklist
- [ ] Code runs locally without errors: `npm run dev`
- [ ] Build succeeds: `npm run build`
- [ ] No TypeScript errors
- [ ] ESLint passes: `npm run lint`
- [ ] Database migrations are committed
- [ ] Environment variables are set
- [ ] Component looks good in both light and dark modes
- [ ] Mobile responsiveness tested

### Browser DevTools
- Use DevTools to test responsive breakpoints
- Test theme toggle in Application tab (localStorage)
- Check Network tab for any 404s or failed requests

## Adding Dependencies

Before adding a new dependency:
1. Check if Radix UI has an alternative (e.g., form handling, dialogs)
2. Consider the bundle size impact
3. Verify it's actively maintained
4. Update `package.json` and commit lock file

## Git Workflow

1. Create feature branch: `git checkout -b feature/description`
2. Make changes and test locally
3. Commit with clear messages: `git commit -m "Add feature: description"`
4. Push and create pull request
5. Address any review feedback
6. Merge to main

## Common Gotchas

1. **Async Components:** Remember to use `async` keyword for server components that fetch data.
2. **Client Components:** Mark with `"use client"` if using hooks like `useState` or `useEffect`.
3. **Prisma at Build Time:** Prisma migrations need to run after deployment - verify with Vercel settings.
4. **Environment Variables:** Client-side variables must start with `NEXT_PUBLIC_` prefix.
5. **Image Paths:** Static images in `public/` use paths like `/image.png` not `./image.png`.

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Radix UI Documentation](https://www.radix-ui.com/docs/primitives/overview/introduction)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)

## Questions?

Refer to the main [README.md](./README.md) for project overview and setup instructions.
