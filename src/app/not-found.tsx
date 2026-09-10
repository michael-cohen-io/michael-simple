import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { Button } from "@/components/ui/button";

// Next adds <meta name="robots" content="noindex"> to not-found pages itself.
export const metadata: Metadata = {
  title: "Page not found",
};

/**
 * The page behind any address that does not exist. It is exported as
 * out/404.html, which Vercel serves with a 404 status for every unknown path,
 * so a stale link (the old /resume, say) lands inside the site's own chrome
 * with a way back instead of on Next's unstyled default.
 */
export default function NotFound() {
  return (
    <div className="flex flex-col items-center gap-6 py-12 text-center md:py-16">
      {/* 320px WebP (8 KB) shown at up to 160px: sharp at 2×, and small
          enough that it no longer dominates the page's load. */}
      <Image
        src="/memoji.webp"
        alt=""
        width={160}
        height={160}
        priority
        fetchPriority="high"
        className="h-32 w-32 md:h-40 md:w-40"
      />
      <p className="text-xl font-light leading-snug md:text-2xl md:leading-8">
        <code className="rounded-md bg-muted px-[0.3rem] py-[0.2rem] font-mono text-[0.8em] font-semibold">
          404
        </code>{" "}
        There&apos;s nothing at this address.
      </p>
      <div className="flex flex-wrap justify-center gap-3">
        <Button asChild>
          <Link href="/">Back to the home page</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/#work-heading">Work experience</Link>
        </Button>
      </div>
    </div>
  );
}
