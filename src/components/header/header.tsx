import Image from "next/image";
import Link from "next/link";

import ThemeButton from "../theme/theme-button";

/**
 * The identity block. It sits in normal flow: the page is two screens long,
 * so a fixed bar would only cover content and cost 200px of padding. Column
 * one is sized to its content so the mark never overflows it; row two is the
 * avatar's height so the name centres on the avatar.
 */
export default function Header() {
  // w-full matters: the body is a flex column, and a flex item with auto side
  // margins shrinks to its content instead of stretching, which pushed the
  // header inwards from the content's left edge.
  return (
    <header className="mx-auto flex w-full max-w-3xl items-center px-8">
      <div className="grid w-full grid-cols-[auto_1fr] grid-rows-[auto_4rem] items-center gap-x-4 gap-y-2 py-8 md:grid-rows-[auto_5rem]">
        <Link
          href="/"
          aria-label="Michael Cohen, home"
          className="group row-span-2 flex w-min select-none flex-col items-center gap-3 rounded-md outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          {/* The mark is a visual logo; the link is named by its aria-label.
              Monospace and foreground-coloured so it holds its own next to
              the name; the brackets carry the accent. */}
          <span aria-hidden="true" className="font-mono text-3xl font-semibold leading-none">
            <span className="text-primary">{"<"}</span>
            MC
            <span className="text-primary">{">"}</span>
          </span>
          <div className="h-16 w-16 shrink-0 overflow-hidden rounded-full md:h-20 md:w-20">
            <Image
              src="/profile.webp"
              alt="Michael Cohen"
              width={80}
              height={80}
              priority
              // Next 15 no longer derives the hint from `priority`; keep the
              // preload and the img at high priority as before.
              fetchPriority="high"
              sizes="(min-width: 768px) 80px, 64px"
              className="h-full w-full rounded-full object-cover transition-[filter] duration-300 md:grayscale md:group-hover:grayscale-0"
            />
          </div>
        </Link>
        <div className="flex justify-end">
          <ThemeButton />
        </div>
        <h1 className="text-3xl font-semibold">Michael Cohen</h1>
      </div>
    </header>
  );
}
