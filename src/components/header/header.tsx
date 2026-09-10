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
              Monospace, semibold and all one pink. */}
          <span aria-hidden="true" className="font-mono text-3xl font-semibold leading-none text-primary">
            {"<mc>"}
          </span>
          {/* On a desktop the portrait rests in grayscale; hovering the mark
              or the photo rings it in the accent and fades in the memoji from
              the 404 page, so the person and the character are one identity.
              Phones have no hover and keep the colour photo. */}
          <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full ring-primary ring-offset-2 ring-offset-background transition-shadow duration-300 md:h-20 md:w-20 md:group-hover:ring-2 motion-reduce:transition-none">
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
              className="h-full w-full rounded-full object-cover md:grayscale"
            />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/memoji.webp"
              alt=""
              aria-hidden="true"
              width={80}
              height={80}
              loading="lazy"
              decoding="async"
              className="absolute inset-0 hidden h-full w-full rounded-full bg-muted object-cover opacity-0 transition-opacity duration-300 md:block md:group-hover:opacity-100 motion-reduce:transition-none"
            />
          </div>
        </Link>
        <div className="flex justify-end">
          <ThemeButton />
        </div>
        {/* The largest type on the page: the name, one step above the mark. */}
        <h1 className="text-3xl font-bold tracking-tight md:text-[2.5rem]/none">Michael Cohen</h1>
      </div>
    </header>
  );
}
