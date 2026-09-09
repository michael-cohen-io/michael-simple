"use client";

import Image from "next/image";
import Link from "next/link";

import useScroll from "@/lib/hooks/use-scroll";
import { cn } from "@/lib/utils";
import ThemeButton from "../theme/theme-button";

export default function Header() {
  const scrolled = useScroll(50);

  return (
    <header
      className={cn(
        "md:fixed md:top-0 md:left-0 md:right-0 mx-auto max-w-3xl flex px-8 items-center z-50 transition-colors",
        scrolled ? "md:border-b md:backdrop-blur-xl" : "bg-transparent",
      )}
    >
      <div className="w-full grid grid-cols-[90px_1fr] gap-2 py-8 justify-between items-center">
        <Link
          href="/"
          aria-label="Michael Cohen, home"
          className="row-span-2 group flex flex-col w-min items-center font-light text-3xl select-none gap-3"
        >
          {/* The mark is a visual logo; the link is named by its aria-label. */}
          <span aria-hidden="true" className="text-primary text-4xl">
            {"<MC>"}
          </span>
          <div className="h-20 w-20 shrink-0 overflow-hidden rounded-full">
            <Image
              src="/profile.webp"
              alt="Michael Cohen"
              width={80}
              height={80}
              priority
              sizes="80px"
              className="h-full w-full rounded-full object-cover grayscale transition-[filter] group-hover:grayscale-0"
            />
          </div>
        </Link>
        <div className="flex justify-end">
          <ThemeButton className="w-min" />
        </div>
        <h1 className="text-xl font-semibold">Michael Cohen</h1>
      </div>
    </header>
  );
}
