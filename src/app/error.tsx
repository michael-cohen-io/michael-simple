"use client";

import Link from "next/link";
import { useEffect } from "react";

import { Button } from "@/components/ui/button";

/**
 * Shown inside the site's chrome when rendering a page throws in the
 * browser. The error beacon in layout.tsx has already reported it; this
 * only gives the visitor a retry and a way home.
 */
export default function ErrorPage({
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
    <div className="flex flex-col items-center gap-6 py-12 text-center md:py-16">
      <p className="text-xl font-light leading-snug md:text-2xl md:leading-8">
        <code className="rounded-md bg-muted px-[0.3rem] py-[0.2rem] font-mono text-[0.8em] font-semibold">
          error
        </code>{" "}
        Something went wrong while showing this page.
      </p>
      <div className="flex flex-wrap justify-center gap-3">
        <Button onClick={reset}>Try again</Button>
        <Button variant="outline" render={<Link href="/" />}>
          Back to the home page
        </Button>
      </div>
    </div>
  );
}
