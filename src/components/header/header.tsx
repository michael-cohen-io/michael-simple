"use client";

import Link from "next/link";

import useScroll from "@/lib/hooks/use-scroll";
import Image from "next/image";
import { cn } from "@/lib/utils";

export default function Header() {
  const scrolled = useScroll(50);

  return (
    <>
      <div
        className={cn(
          "fixed top-0 px-48 w-full flex justify-center z-30 transition-all",
          scrolled
            ? "border-b border-gray-200 bg-white/50 backdrop-blur-xl"
            : "bg-white/0",
        )}
      >
        {/* Desktop Menu */}
        <div className="h-max w-full hidden md:flex py-8 justify-between align-center">
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
        </div>
        {/* Mobile Menu */}
        {/* <Flex
          height="max-content"
          width="100%"
          display={{ initial: "flex", md: "none" }}
          px="4"
          py="4"
          align="center"
          justify="between"
        >
          <Link href="/" className="flex items-center text-3xl select-none">
            <Heading color="pink" size="7" weight="regular">
              {"<MC>"}
            </Heading>
          </Link>
          <Flex display={{ md: "none" }} align="center" gap="4" pr="4">
            <ThemeButton />
            <Tooltip content="Navigation">
              <IconButton
                size="3"
                variant="ghost"
                radius="large"
                data-state={mobileMenu.open ? "open" : "closed"}
                onClick={() => mobileMenu.setOpen((open) => !open)}
              >
                <HamburgerMenuIcon width="24" height="24" />
              </IconButton>
            </Tooltip>
          </Flex>
        </Flex> */}
      </div>
    </>
  );
}
