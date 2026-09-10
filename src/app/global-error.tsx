"use client";

import Link from "next/link";
import { useEffect } from "react";

import "./globals.css";

/**
 * The last resort: rendered in place of the root layout when the layout
 * itself throws, so it has to supply its own <html> and <body>. Plain
 * markup and the global stylesheet only; nothing here may depend on the
 * providers or fonts the layout normally sets up.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body className="font-sans">
        <main className="mx-auto flex max-w-3xl flex-col items-center gap-6 px-8 py-24 text-center">
          <h1 className="text-3xl font-semibold">Michael Cohen</h1>
          <p className="text-xl font-light">Something went wrong while showing this page.</p>
          <div className="flex flex-wrap justify-center gap-3">
            <button
              type="button"
              onClick={reset}
              className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              Try again
            </button>
            <Link
              href="/"
              className="inline-flex h-10 items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
            >
              Back to the home page
            </Link>
          </div>
        </main>
      </body>
    </html>
  );
}
