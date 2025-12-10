# Michael Simple

A modern web application built with Next.js, TypeScript, and Tailwind CSS.

## Features

- **Next.js 14** - React framework for production
- **TypeScript** - Type-safe development
- **Prisma** - Database ORM
- **Tailwind CSS** - Utility-first CSS framework
- **Radix UI** - Accessible component primitives
- **MDX** - Write JSX in markdown
- **Vercel Analytics** - Performance monitoring
- **Dark Mode Support** - Theme switching with next-themes

## Tech Stack

- **Framework**: Next.js 14.2.2
- **Language**: TypeScript
- **Database**: Prisma with Vercel Postgres
- **Styling**: Tailwind CSS with animations
- **UI Components**: Radix UI, Heroicons, Lucide React
- **Analytics**: Vercel Analytics

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm (recommended) or npm

### Installation

```bash
# Install dependencies
pnpm install

# Set up your database
pnpm db:migrate

# Start the development server
pnpm dev
```

The application will be available at [http://localhost:3000](http://localhost:3000).

## Available Scripts

- `pnpm dev` - Start the development server
- `pnpm build` - Build for production
- `pnpm start` - Start the production server
- `pnpm db:migrate` - Run Prisma migrations
- `pnpm lint` - Run ESLint

## Project Structure

```
├── src/
│   ├── app/           # Next.js app directory
│   ├── components/    # React components
│   └── ...
├── prisma/            # Database schema and migrations
├── public/            # Static assets
├── tailwind.config.ts # Tailwind configuration
├── tsconfig.json      # TypeScript configuration
└── package.json       # Project dependencies
```

## Development

This project uses:
- **ESLint** for code linting
- **Prettier** for code formatting
- **Tailwind CSS** for styling
- **Prisma** for database management

## Deployment

The application is configured for deployment on Vercel:

```bash
pnpm build
pnpm start
```

## Environment Variables

Create a `.env.local` file with your environment variables (database connection, API keys, etc.).

## License

Private project.

---

Visit [www.michaelcohen.io](https://www.michaelcohen.io) for more information.
