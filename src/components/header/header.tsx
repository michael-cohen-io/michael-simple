"use client";

import Link from "next/link";

import useScroll from "@/lib/hooks/use-scroll";
import Image from "next/image";
import { cn } from "@/lib/utils";
import ThemeButton from "../theme/theme-button";

export default function Header() {
  const scrolled = useScroll(50);

  return (
    <>
      <div
        className={cn(
          "fixed top-0 left-0 right-0 mx-auto max-w-2xl px-8 items-center z-50 transition-all",
          scrolled ? "border-b backdrop-blur-xl" : "bg-transparent/0",
        )}
      >
        {/* Desktop Menu */}
        <div className="w-full flex py-8 justify-between align-center">
          <Link
            href="/"
            className="flex flex-col font-light text-3xl select-none gap-3"
          >
            <h1 className="text-primary text-4xl">{"<MC>"}</h1>
            <div className="flex gap-2 items-center group">
              <Image
                src="/profile.jpg"
                alt="Michael Profile image"
                width={75}
                height={75}
                className="grayscale rounded-full group-hover:grayscale-0"
              />
              <h2 className="text-xl font-semibold group-hover:text-primary">
                Michael Cohen
              </h2>
            </div>
          </Link>
          <ThemeButton />
        </div>
      </div>
    </>
  );
}
