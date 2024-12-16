import * as React from "react";
import { cn } from "@/lib/utils";

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
    className={cn("relative flex flex-col p-6 pt-0 [&>*]:mb-3", className)}
    {...props}
  />
));
TimelineItem.displayName = "TimelineItem";

const TimelineTime = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn(
      "absolute -left-32 text-sm font-semibold leading-none text-muted-foreground hidden md:block hover:text-primary",
      className,
    )}
    {...props}
  />
));
TimelineTime.displayName = "TimelineTime";

const TimelineConnector = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "absolute top-[5px] left-4 h-full w-px bg-border",
      className,
    )}
    {...props}
  />
));
TimelineConnector.displayName = "TimelineConnector";

const TimelineHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center gap-4", className)}
    {...props}
  />
));
TimelineHeader.displayName = "TimelineHeader";

const TimelineTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, children, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "font-semibold leading-none tracking-tight text-secondary-foreground",
      className,
    )}
    {...props}>
    {children}
  </h3>
));
TimelineTitle.displayName = "TimelineTitle";

const TimelineIcon = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "absolute left-4 -translate-x-1/2 size-2 rounded-full bg-border ring-4 ring-background",
      className,
    )}
    {...props}
  />
));
TimelineIcon.displayName = "TimelineIcon";

const TimelineDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground max-w-sm", className)}
    {...props}
  />
));
TimelineDescription.displayName = "TimelineDescription";

const TimelineContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("ml-16 flex flex-col gap-2 w-full max-w-2xl", className)}
    {...props}
  />
));
TimelineContent.displayName = "TimelineContent";

export {
  Timeline,
  TimelineItem,
  TimelineConnector,
  TimelineHeader,
  TimelineTitle,
  TimelineIcon,
  TimelineDescription,
  TimelineContent,
  TimelineTime,
};
