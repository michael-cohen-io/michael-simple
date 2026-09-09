"use client";

import Image from "next/image";
import Link from "next/link";

import useScroll from "@/lib/hooks/use-scroll";
import { cn } from "@/lib/utils";
import ThemeButton from "../theme/theme-button";

export default function Header() {
  const scrolled = useScroll(50);

  return (
    <>
      <div
        className={cn(
          "md:fixed md:top-0 md:left-0 md:right-0 mx-auto max-w-3xl flex md:px-8 items-center z-50 transition-all",
          scrolled ? "md:border-b md:backdrop-blur-xl" : "bg-transparent/0",
        )}
      >
        <div className="w-full grid grid-cols-[90px_1fr] gap-2 py-8 justify-between align-center">
          <Link
            href="/"
            className="row-span-2 group peer flex flex-col w-min items-center font-light text-3xl select-none gap-3"
          >
            <h1 className="text-primary text-4xl group-hover">{"<MC>"}</h1>
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
          <h2 className="text-xl peer-hover:text-primary font-semibold hover:text-primary group-hover:text-primary">
            Michael Cohen
          </h2>
        </div>
      </div>
    </>
  );
}
