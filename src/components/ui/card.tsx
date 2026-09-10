import * as React from "react";

import { cn } from "@/lib/utils";

/**
 * A padded surface. Callers put their own list or block content directly
 * inside it; the padding lives here so it is the same on every side. In the
 * light theme the card is a faint tint of the accent with a hue-matched
 * shadow standing in for the border, so it reads as a surface on the white
 * page rather than an outline; in the dark theme the border does that job.
 */
function Card({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card"
      className={cn(
        "rounded-lg border border-transparent bg-card p-5 shadow-[0_0_0_1px_oklch(0.45_0.09_348/0.1),0_1px_3px_oklch(0.45_0.09_348/0.12)] dark:border-border dark:shadow-none print:border-border print:shadow-none forced-colors:border-[CanvasText]",
        className,
      )}
      {...props}
    />
  );
}

export { Card };
