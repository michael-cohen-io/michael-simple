import Link from "next/link";

import ViewToggle from "../agent/view-toggle";
import ThemeButton from "../theme/theme-button";

/**
 * Two parts. A bar with the mark on the left and the two switches on the
 * right, which sticks to the top of the window as the page scrolls so the
 * switches stay in reach; and below it, in normal flow, the identity block:
 * the portrait and the name.
 */
export default function Header() {
  return (
    <>
      {/* w-full matters: the body is a flex column, and a flex item with
          auto side margins shrinks to its content instead of stretching. */}
      <header className="sticky top-0 z-40 mx-auto w-full max-w-3xl bg-background/85 px-8 backdrop-blur-md print:static print:bg-background">
        <div className="flex w-full items-center justify-between py-3">
          <Link
            href="/"
            aria-label="Michael Cohen, home"
            className="rounded-md py-1 outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            {/* The mark is a visual logo; the link is named by its aria-label.
                Monospace, semibold and all one pink. */}
            <span aria-hidden="true" className="font-mono text-2xl font-semibold leading-none text-primary">
              {"<mc>"}
            </span>
          </Link>
          <div className="flex items-center gap-2">
            <ViewToggle />
            <ThemeButton />
          </div>
        </div>
      </header>
      <div className="mx-auto flex w-full max-w-3xl items-center gap-4 px-8 pb-6 pt-3 md:gap-5 md:pb-8">
        <Link
          href="/"
          aria-label="Michael Cohen, home"
          className="group shrink-0 rounded-full outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          {/* On a desktop the portrait rests in grayscale and takes its
              colour and a ring in the accent on hover; phones have no hover
              and keep the colour photo. */}
          <span className="block h-16 w-16 overflow-hidden rounded-full ring-primary ring-offset-2 ring-offset-background transition-shadow duration-300 md:h-20 md:w-20 md:group-hover:ring-2 motion-reduce:transition-none">
            {/* A plain img with its own srcset: the export cannot resize
                images, so the two sizes are files in public/. 160px covers
                2× on both breakpoints; 320px is for 3× phones. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/profile.webp"
              srcSet="/profile-160.webp 160w, /profile.webp 320w"
              sizes="(min-width: 768px) 80px, 64px"
              alt="Michael Cohen"
              width={80}
              height={80}
              fetchPriority="high"
              decoding="async"
              className="h-full w-full rounded-full object-cover transition-[filter] duration-300 md:grayscale md:group-hover:grayscale-0 motion-reduce:transition-none"
            />
          </span>
        </Link>
        {/* The largest type on the page: the name, one step above the mark. */}
        <h1 className="text-3xl font-bold tracking-tight md:text-[2.5rem]/none">Michael Cohen</h1>
      </div>
    </>
  );
}
