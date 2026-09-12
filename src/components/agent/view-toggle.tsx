"use client";

import { useEffect, useSyncExternalStore } from "react";

import { cn } from "@/lib/utils";
import { getServerView, getView, setView, subscribe, viewFromLocation, type View } from "@/lib/view-store";

const OPTIONS: { value: View; label: string; title: string }[] = [
  { value: "human", label: "human", title: "View the page as a person sees it" },
  { value: "agent", label: "agent", title: "View the page as an agent receives it" },
];

/**
 * A two-way switch, human | agent, in the header. Flipping it swaps the page
 * for the exact Markdown an agent gets from `Accept: text/markdown`, inside
 * a View Transition on the main column (so the theme wipe, which animates
 * the root, is left alone).
 */
export default function ViewToggle({ className }: { className?: string }) {
  const view = useSyncExternalStore(subscribe, getView, getServerView);

  // A link to ?view=agent opens the agent view; the server HTML is always
  // the human one, so this runs after hydration.
  useEffect(() => {
    const wanted = viewFromLocation();
    if (wanted !== getView()) setView(wanted);
  }, []);

  const choose = (next: View) => {
    if (next === view) return;
    const main = document.getElementById("main");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!document.startViewTransition || reduce || !main) return setView(next);
    main.style.viewTransitionName = "page-main";
    const transition = document.startViewTransition(() => setView(next));
    transition.finished.finally(() => {
      main.style.viewTransitionName = "";
    });
  };

  return (
    <div
      role="group"
      aria-label="View as"
      className={cn(
        "flex h-8 items-center rounded-full border border-border p-0.5 font-mono text-xs print:hidden",
        className,
      )}
    >
      {OPTIONS.map((option) => (
        <button
          key={option.value}
          type="button"
          title={option.title}
          aria-pressed={view === option.value}
          onClick={() => choose(option.value)}
          className={cn(
            "h-full rounded-full px-2.5 leading-none outline-hidden transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
            view === option.value
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
