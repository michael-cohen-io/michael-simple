"use client";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function About() {
  return (
    <div className="flex justify-center">
      <div className="flex justify-center content-center flex-col w-full px-1 xl:px-0 text-2xl">
        <div>
          <code className="rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono font-semibold">
            Hello, World!
          </code>{" "}
          I&apos;m{" "}
          <Tooltip delayDuration={0}>
            <TooltipTrigger>
              <span className="font-bold text-primary hover:line-through">
                a software developer
              </span>
            </TooltipTrigger>
            <TooltipContent>
              <span className="font-bold">
                most recently an engineering manager
              </span>
            </TooltipContent>
          </Tooltip>{" "}
          based out of Brooklyn, NY. Short blurbs are not my specialty. Reach
          out and let&apos;s become friends if you want to find out more about
          me.
        </div>
      </div>
    </div>
  );
}
