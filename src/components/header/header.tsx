"use client";

import Link from "next/link";

import useScroll from "@/lib/hooks/use-scroll";
import { cn } from "@/lib/utils";
import ThemeButton from "../theme/theme-button";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

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
        {/* Desktop Menu */}
        <div className="w-full flex py-8 justify-between align-center">
          <Link
            href="/"
            className="flex flex-col font-light text-3xl select-none gap-3"
          >
            <h1 className="text-primary text-4xl">{"<MC>"}</h1>
            <div className="flex gap-2 items-center group">
              <Avatar className="h-20 w-20">
                <AvatarImage
                  src="/profile.jpg"
                  className="grayscale group-hover:grayscale-0"
                />
                <AvatarFallback>MC</AvatarFallback>
              </Avatar>
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
