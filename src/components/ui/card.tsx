import * as React from "react";

import { cn } from "@/lib/utils";

/**
 * A bordered, padded surface. Callers put their own list or block content
 * directly inside it; the padding lives here so it is the same on every side.
 */
const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("rounded-lg border bg-card p-5 shadow-sm", className)}
    {...props}
  />
));
Card.displayName = "Card";

export { Card };
