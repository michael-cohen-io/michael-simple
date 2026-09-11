import * as React from "react";

import { cn } from "@/lib/utils";

/**
 * A padded surface, flat: a tint of the accent with a hairline border, in
 * both themes. Callers put their own list or block content directly inside
 * it; the padding lives here so it is the same on every side.
 */
function Card({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card"
      className={cn(
        "rounded-lg border border-border bg-card p-5 print:break-inside-avoid forced-colors:border-[CanvasText]",
        className,
      )}
      {...props}
    />
  );
}

export { Card };
