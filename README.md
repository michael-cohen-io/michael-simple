# Michael Simple - Personal Portfolio Website

A modern, minimal personal portfolio website for Michael Cohen. Built with Next.js 14, React 18, TypeScript, Tailwind CSS, and Prisma for database management.

**Live at:** [www.michaelcohen.io](https://www.michaelcohen.io)

## Overview

This is a full-stack Next.js application that showcases professional experience, skills, and contact information. The site features:

- **Home Page**: Clean, minimalist design with sections for about, work experience, and contact
- **Dynamic Work Entries**: Work history stored in PostgreSQL database via Prisma ORM
- **Dark Mode Support**: Theme switching with `next-themes`
- **Responsive Design**: Mobile-first approach using Tailwind CSS
- **MDX Support**: Rich content rendering with `next-mdx-remote`
- **Performance**: Optimized for fast loading and SEO

## Tech Stack

### Core Framework
- **Next.js** 14.2.2 - React framework for production
- **React** 18 - UI library
- **TypeScript** 5 - Type-safe development

### Styling
- **Tailwind CSS** 3.4.1 - Utility-first CSS framework
- **Tailwind Merge** - Utility conflict resolution
- **Tailwind Animate** - Animation utilities

### Database & ORM
- **Prisma** 5.12.1 - Modern ORM for Node.js
- **PostgreSQL** - Primary database
- **Vercel Postgres** - Hosted PostgreSQL solution

### Components & UI
- **Radix UI** - Accessible component library
  - Accordion, Avatar, Hover Card, Label, Separator, Slot, Tabs, Tooltip
- **Heroicons** - Beautiful SVG icons
- **Lucide React** - Icon library
- **Embla Carousel** - Carousel component
- **Class Variance Authority** - CSS utility composition

### Utilities
- **Lodash** - General utility functions
- **Clsx** - Conditional classname utilities

### Analytics & Monitoring
- **Vercel Analytics** - Performance monitoring

### Development Tools
- **ESLint** - Code linting
- **PostCSS** - CSS transformation
- **Node.js** 24.x - JavaScript runtime

## Project Structure

```
michael-simple/
├── src/
│   ├── app/              # Next.js app directory
│   │   ├── page.tsx      # Home page
│   │   ├── layout.tsx    # Root layout
│   │   ├── globals.css   # Global styles
│   │   └── providers.tsx # App providers (theme, etc.)
│   ├── components/
│   │   ├── home/         # Home page sections
│   │   ├── work/         # Work experience components
│   │   ├── contact/      # Contact section
│   │   ├── header/       # Header/navigation
│   │   ├── footer/       # Footer
│   │   ├── ui/           # Reusable UI components (Radix wrapper)
│   │   ├── typography/   # Text and markdown components
│   │   └── theme/        # Theme switching
│   └── lib/
│       ├── types.ts      # TypeScript type definitions
│       ├── utils.ts      # Utility functions
│       ├── prisma.ts     # Prisma client singleton
│       └── hooks/        # Custom React hooks
├── prisma/
│   ├── schema.prisma     # Database schema
│   └── migrations/       # Database migrations
├── public/               # Static assets
├── tailwind.config.ts    # Tailwind configuration
├── tsconfig.json         # TypeScript configuration
├── next.config.mjs       # Next.js configuration
└── vercel.json          # Vercel deployment config
```

## Getting Started

### Prerequisites
- **Node.js** 24.x (specified in `.nvmrc`)
- **npm** or **pnpm** package manager
- PostgreSQL database (or Vercel Postgres)

### Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd michael-simple
   ```

2. **Install dependencies:**
   ```bash
   npm install
   # or
   pnpm install
   ```

3. **Set up environment variables:**
   Create a `.env.local` file in the root directory with your database credentials:
   ```
   POSTGRES_PRISMA_URL="postgresql://user:password@host:port/database?schema=public"
   POSTGRES_URL_NON_POOLING="postgresql://user:password@host:port/database?schema=public"
   ```

   For local development with Vercel Postgres, obtain credentials from your Vercel dashboard.

4. **Initialize the database:**
   ```bash
   npm run db:migrate
   ```

### Development

Start the development server:
```bash
npm run dev
```

The site will be available at `http://localhost:3000`

### Build & Production

Build for production:
```bash
npm run build
```

Start the production server:
```bash
npm run start
```

### Linting

Check code quality:
```bash
npm run lint
```

## Database Schema

The application uses Prisma with PostgreSQL. Key models:

### WorkEntry
Represents a professional work experience entry
- `id` - Primary key
- `company` - Relation to Company
- `team` - Team/department name
- `role` - Job title/position
- `description` - Role description
- `startDate` - Start date
- `endDate` - End date (optional)
- `iconColor` - Custom color for timeline/card display
- `visible` - Control visibility on site
- `createdAt` - Timestamp

### Company
Represents an employer/organization
- `id` - Primary key
- `name` - Company name (unique)
- `image` - Logo image path
- `imageDark` - Dark mode logo image path
- `url` - Company website URL
- `description` - Company description
- `workEntries` - Relation to WorkEntry records
- `createdAt` - Timestamp

## Component Structure

### Pages & Sections
- **About Section** - Introduction and bio
- **Work Section** - Professional experience timeline with accordion view for mobile
- **Contact Section** - Contact information and links

### Key Components
- **Header** - Navigation and branding
- **Footer** - Footer content
- **ThemeButton** - Dark mode toggle
- **WorkTimeline** - Desktop work experience display
- **WorkAccordion** - Mobile work experience display
- **Markdown** - MDX-powered rich content rendering

## Styling Conventions

This project uses:
- **Tailwind CSS** for all styling
- **CVA (Class Variance Authority)** for component style composition
- Custom color schemes with CSS variables for theme support
- Mobile-first responsive design approach

## Deployment

The project is configured for **Vercel** deployment:

1. Connect repository to Vercel dashboard
2. Set environment variables in Vercel project settings
3. Automatic deployments on push to main branch

Configuration is in `vercel.json` with Next.js framework detected.

## Available Scripts

| Script | Purpose |
|--------|---------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Build optimized production bundle |
| `npm run start` | Start production server |
| `npm run db:migrate` | Run Prisma migrations |
| `npm run lint` | Run ESLint to check code quality |

## ESLint Configuration

Basic ESLint setup configured via `.eslintrc.json`. Uses Next.js recommended rules.

## Contributing

When making changes to this project, see [CLAUDE.md](./CLAUDE.md) for guidelines on working effectively with AI-assisted development.

## License

This project is the personal portfolio of Michael Cohen. All rights reserved.
