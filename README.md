# Michael Simple - Portfolio Website

A modern, minimalist portfolio website built with Next.js 14, React 18, and TypeScript. Features a clean design with dark mode support, responsive components, and a database-backed work history section.

**Live:** [michaelcohen.io](https://www.michaelcohen.io)

## Tech Stack

- **Framework:** Next.js 14.2.2
- **UI Library:** React 18
- **Language:** TypeScript 5
- **Styling:** Tailwind CSS 3.4.1 with custom animations
- **UI Components:** Radix UI (accordion, avatar, hover-card, label, separator, tabs, tooltip)
- **Database:** PostgreSQL with Prisma ORM
- **Icons:** Heroicons & Lucide React
- **MDX:** next-mdx-remote for markdown content
- **Theme:** next-themes for dark mode support
- **Analytics:** Vercel Analytics
- **Package Manager:** pnpm

## Project Structure

```
src/
├── app/               # Next.js app router
│   ├── layout.tsx     # Root layout with theme provider
│   ├── page.tsx       # Home page
│   └── providers.tsx  # Theme and analytics providers
├── components/
│   ├── home/          # Home page components (About)
│   ├── work/          # Work history timeline component
│   ├── contact/       # Contact section
│   ├── ui/            # Reusable UI components (built with Radix UI & Tailwind)
│   ├── typography/    # Text components (Heading, Markdown)
│   ├── theme/         # Theme toggle button
│   └── footer.tsx     # Footer component
├── lib/
│   ├── types.ts       # TypeScript type definitions
│   ├── prisma.ts      # Prisma client singleton
│   ├── utils.ts       # Utility functions
│   └── hooks/         # Custom React hooks (useScroll, useMediaQuery)
└── public/            # Static assets

prisma/
├── schema.prisma      # Database schema (WorkEntry, Company)
└── migrations/        # Database migration history
```

## Features

- **Responsive Design:** Mobile-first approach with Tailwind CSS
- **Dark Mode:** Theme switching with next-themes
- **Database Integration:** PostgreSQL with Prisma for managing work history
- **Type Safety:** Full TypeScript support across the application
- **Modern Components:** Accessible UI components using Radix UI primitives
- **Markdown Support:** MDX support for rich content
- **Analytics:** Built-in Vercel Analytics
- **Production Ready:** Deployed on Vercel with analytics tracking

## Getting Started

### Prerequisites

- Node.js 24.x
- pnpm (or npm/yarn)
- PostgreSQL database

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd michael-simple
```

2. Install dependencies:
```bash
pnpm install
```

3. Set up environment variables:
Create a `.env.local` file with your PostgreSQL connection strings:
```
POSTGRES_PRISMA_URL=postgresql://user:password@localhost:5432/michael_db?schema=public
POSTGRES_URL_NON_POOLING=postgresql://user:password@localhost:5432/michael_db?schema=public
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

The site will be available at `http://localhost:3000`

### Build & Deploy

Build for production:
```bash
pnpm build
```

Start the production server:
```bash
pnpm start
```

### Linting

Run ESLint:
```bash
pnpm lint
```

## Database Schema

### WorkEntry
Represents a work experience entry in the timeline:
- `id` - Auto-incrementing primary key
- `company` - Related Company object
- `companyId` - Foreign key to Company
- `team` - Team name
- `role` - Job title/role
- `description` - Job description (supports markdown)
- `startDate` - Start date of employment
- `endDate` - End date of employment (nullable for current role)
- `iconColor` - Custom color for timeline icon
- `visible` - Toggle visibility on the website
- `createdAt` - Timestamp

### Company
Represents a company in the work history:
- `id` - Auto-incrementing primary key
- `name` - Company name (unique)
- `image` - Logo/image URL (light mode)
- `imageDark` - Logo/image URL (dark mode)
- `url` - Company website URL
- `description` - Company description
- `workEntries` - Related WorkEntry objects
- `createdAt` - Timestamp

## Environment Variables

- `POSTGRES_PRISMA_URL` - PostgreSQL connection string with connection pooling (for serverless)
- `POSTGRES_URL_NON_POOLING` - Direct PostgreSQL connection string (for migrations)

## Available Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm db:migrate` - Run Prisma migrations
- `pnpm lint` - Run ESLint
- `pnpm postinstall` - Generate Prisma client (runs automatically after install)

## Styling

The project uses Tailwind CSS with custom configuration in `tailwind.config.ts`. Custom animations and utilities are included via the `tailwindcss-animate` plugin.

## Component Library

Custom UI components are built using Radix UI primitives and styled with Tailwind CSS. All components are located in `src/components/ui/` and provide accessible, composable building blocks.

## Deployment

The site is configured for deployment on Vercel. Configuration is in `vercel.json`.

## License

Private project
