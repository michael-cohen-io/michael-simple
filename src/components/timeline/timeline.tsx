import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * A vertical timeline laid out entirely with CSS grid.
 *
 * Every item is its own grid with the same fixed columns, so the dots line up
 * from item to item: `[spine | content]` below md and `[date | spine | content]`
 * from md up. The date is a real grid cell that moves between the two layouts,
 * so it can never be pushed outside the list, and the spine is an ordinary
 * cell spanning every row rather than an absolutely positioned line.
 *
 * Rows: 1 = header (dot, logo, title), 2 = date (only below md), 3 = content.
 */
const Timeline = React.forwardRef<
  HTMLOListElement,
  React.HTMLAttributes<HTMLOListElement>
>(({ className, ...props }, ref) => (
  <ol ref={ref} className={cn("flex flex-col", className)} {...props} />
));
Timeline.displayName = "Timeline";

const TimelineItem = React.forwardRef<
  HTMLLIElement,
  React.LiHTMLAttributes<HTMLLIElement>
>(({ className, ...props }, ref) => (
  <li
    ref={ref}
    className={cn(
      "group grid grid-cols-[auto_1fr] gap-x-4 md:grid-cols-[10rem_auto_1fr]",
      className,
    )}
    {...props}
  />
));
TimelineItem.displayName = "TimelineItem";

/** The date range: under the title below md, in its own column from md up. */
const TimelineTime = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn(
      "col-start-2 row-start-2 pt-1 text-sm font-semibold text-muted-foreground transition-colors hover:text-primary",
      "md:col-start-1 md:row-start-1 md:self-center md:whitespace-nowrap md:pt-0 md:text-right",
      className,
    )}
    {...props}
  />
));
TimelineTime.displayName = "TimelineTime";

/**
 * The dot and the line that runs down to the next item. The dot is centred on
 * the 2rem-tall header row; the line fills the rest of the item and is dropped
 * on the last one.
 */
const TimelineSpine = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    aria-hidden="true"
    className={cn(
      "col-start-1 row-start-1 row-end-4 flex w-4 flex-col items-center md:col-start-2",
      className,
    )}
    {...props}
  >
    <span className="flex h-8 shrink-0 items-center">
      <span className="size-2 rounded-full bg-primary ring-4 ring-background" />
    </span>
    <span className="w-px flex-1 bg-border group-last:hidden" />
  </div>
));
TimelineSpine.displayName = "TimelineSpine";

const TimelineHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "col-start-2 row-start-1 flex items-center gap-3 md:col-start-3",
      className,
    )}
    {...props}
  />
));
TimelineHeader.displayName = "TimelineHeader";

const TimelineTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-lg font-semibold leading-none tracking-tight text-foreground",
      className,
    )}
    {...props}
  />
));
TimelineTitle.displayName = "TimelineTitle";

const TimelineContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "col-start-2 row-start-3 pb-8 pt-3 group-last:pb-0 md:col-start-3",
      className,
    )}
    {...props}
  />
));
TimelineContent.displayName = "TimelineContent";

export {
  Timeline,
  TimelineItem,
  TimelineTime,
  TimelineSpine,
  TimelineHeader,
  TimelineTitle,
  TimelineContent,
};
