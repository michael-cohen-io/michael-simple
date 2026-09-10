"use client";

import { useTheme } from "next-themes";

import { useSyncExternalStore } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const subscribeToNothing = () => () => {};

export default function ThemeButton({ className }: { className?: string }) {
  // resolvedTheme (not theme) so the default "system" setting reports the
  // theme actually in effect; otherwise the first click is a no-op.
  const { resolvedTheme, setTheme } = useTheme();
  // false in the server HTML and while hydrating, true from the first
  // client-only render on: the same "mounted" gate as a setState-in-effect,
  // without the extra render pass that pattern needs.
  const mounted = useSyncExternalStore(
    subscribeToNothing,
    () => true,
    () => false,
  );

  // resolvedTheme is unknown on the server and during the first client render,
  // so the label is generic until mount. The icons are chosen by CSS, which lets
  // the button render in the server HTML with no pop-in or layout shift.
  const isDark = resolvedTheme === "dark";
  const label = !mounted
    ? "Toggle theme"
    : isDark
      ? "Switch to light theme"
      : "Switch to dark theme";

  return (
    <Button
      variant="ghost"
      className={cn(
        "h-11 w-11 rounded-full p-0 text-foreground hover:text-muted-foreground print:hidden",
        className,
      )}
      aria-label={label}
      onClick={() => {
        if (mounted) setTheme(isDark ? "light" : "dark");
      }}
    >
      {/* Two inline icons instead of an icon library; CSS shows one. */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        className="size-4 dark:hidden"
      >
        <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
      </svg>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        className="hidden size-4 dark:block"
      >
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
      </svg>
    </Button>
  );
}
