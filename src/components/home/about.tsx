"use client";

import Link from "next/link";
import { Button } from "../ui/button";

export default function About() {
  return (
    <div className="flex justify-center max-w-screen-xl w-full">
      <div className="flex justify-center content-center flex-col w-full px-1 xl:px-0 text-sm">
        <div>
          Hello, World! I&apos;m a{" "}
          <span className="font-bold">
            <Link className="text-accent-color hover:underline" href="/work">
              software developer
            </Link>
          </span>{" "}
          based out of Brooklyn, NY. Short blurbs are not my specialty, reach
          out and be my friend if you want to find out more about me.
        </div>
        <div></div>
      </div>
    </div>
  );
}
