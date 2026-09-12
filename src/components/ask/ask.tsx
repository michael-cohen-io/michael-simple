"use client";

import { Collapsible } from "@base-ui/react/collapsible";
import dynamic from "next/dynamic";
import { useId, useState } from "react";

/** A chevron for the section's trigger, the same one the accordion draws. */
function Chevron({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

// The box's inside (the streaming client, Party Mode's engine, the pills) is
// its own chunk, fetched the first time the box is opened: most visitors
// never open it, and the page's own bundle stays what it was before the box
// existed. Once loaded it stays mounted, open or shut, so Party Mode's state
// survives folding the box.
const AskPanel = dynamic(() => import("./ask-panel"), {
  ssr: false,
  loading: () => (
    <p className="p-1 text-sm text-muted-foreground" role="status">
      Loading…
    </p>
  ),
});

/**
 * "Ask Claude About Me": a question box under the hero, folded shut until
 * the visitor opens it. This is the shell, in the page's bundle: the
 * heading, the fold, and the slot the panel loads into (ask-panel.tsx).
 */
export default function Ask() {
  const [opened, setOpened] = useState(false);
  const id = useId();
  return (
    <section
      aria-labelledby={`${id}-heading`}
      className="flex w-full flex-col print:hidden"
      data-party-static
    >
      <Collapsible.Root defaultOpen={false} onOpenChange={(open) => open && setOpened(true)} className="flex flex-col">
        <h2 id={`${id}-heading`} className="text-base font-semibold">
          <Collapsible.Trigger className="group/ask flex w-full items-center justify-between py-2 text-left outline-hidden transition-colors hover:text-primary focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background">
            Ask Claude About Me
            <Chevron className="size-4 shrink-0 text-muted-foreground transition-transform duration-200 motion-reduce:transition-none group-data-[panel-open]/ask:rotate-180" />
          </Collapsible.Trigger>
        </h2>
        <Collapsible.Panel
          keepMounted
          className="-mx-1 h-(--collapsible-panel-height) overflow-hidden transition-[height] duration-200 ease-out data-ending-style:h-0 data-starting-style:h-0 motion-reduce:transition-none"
        >
          {opened && <AskPanel />}
        </Collapsible.Panel>
      </Collapsible.Root>
    </section>
  );
}
