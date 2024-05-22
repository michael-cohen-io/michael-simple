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
        <div className="w-full grid grid-cols-[90px_1fr] gap-2 py-8 justify-between align-center">
          <Link
            href="/"
            className="row-span-2 group peer flex flex-col w-min items-center font-light text-3xl select-none gap-3"
          >
            <h1 className="text-primary text-4xl group-hover">{"<MC>"}</h1>
            <div className="flex gap-2 items-center">
              <Avatar className="h-20 w-20">
                <AvatarImage
                  src="/profile.jpg"
                  className="grayscale group-hover:grayscale-0"
                />
                <AvatarFallback>MC</AvatarFallback>
              </Avatar>
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
