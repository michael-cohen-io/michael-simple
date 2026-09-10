"use client";

import { useTheme } from "next-themes";

import { useSyncExternalStore } from "react";
import { MoonIcon, SunIcon } from "lucide-react";
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
      <MoonIcon className="h-4 w-4 dark:hidden" aria-hidden="true" />
      <SunIcon className="h-4 w-4 hidden dark:block" aria-hidden="true" />
    </Button>
  );
}
