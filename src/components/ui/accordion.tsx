"use client";

import * as React from "react";
import { Accordion as AccordionPrimitive } from "@base-ui/react/accordion";

import { cn } from "@/lib/utils";

/**
 * shadcn/ui's accordion on Base UI (the default since July 2026). The parts
 * keep their shadcn names; underneath, Base UI renders the header as an
 * <h3>, the trigger as a <button> with aria-expanded, and the panel with the
 * `data-open` / `data-starting-style` / `data-ending-style` attributes that
 * the open and close transitions key off.
 */
function Accordion({ className, ...props }: AccordionPrimitive.Root.Props) {
  return (
    <AccordionPrimitive.Root
      data-slot="accordion"
      className={cn("flex w-full flex-col", className)}
      {...props}
    />
  );
}

function AccordionItem({ className, ...props }: AccordionPrimitive.Item.Props) {
  return (
    <AccordionPrimitive.Item
      data-slot="accordion-item"
      className={cn("border-b", className)}
      {...props}
    />
  );
}

/** A chevron; inline so the page ships no icon library. */
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

// The trigger text stays in the foreground colour whether the panel is open or
// closed; only the chevron is muted, and it turns when the panel is open.
function AccordionTrigger({
  className,
  headerClassName,
  children,
  ...props
}: AccordionPrimitive.Trigger.Props & { headerClassName?: string }) {
  return (
    <AccordionPrimitive.Header className={cn("flex", headerClassName)}>
      <AccordionPrimitive.Trigger
        data-slot="accordion-trigger"
        className={cn(
          "group/accordion-trigger flex flex-1 items-center justify-between py-4 text-left font-medium text-foreground outline-hidden transition-colors hover:text-primary focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          className,
        )}
        {...props}
      >
        {children}
        <Chevron className="size-4 shrink-0 text-muted-foreground transition-transform duration-200 motion-reduce:transition-none group-data-[panel-open]/accordion-trigger:rotate-180" />
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  );
}

// True once any panel has rendered on the client. A panel that is already
// open in the server HTML must not run the open transition on first paint:
// it would grow from height 0 and shift everything below it (0.18 CLS on
// phones). Panels that mount later, when the visitor opens one, do animate.
// useState's initialiser runs once per panel, so the server-rendered panel
// keeps `false` for its lifetime.
let hydrated = false;
function useAnimateOpen() {
  const [animate] = React.useState(() => hydrated);
  React.useEffect(() => {
    hydrated = true;
  }, []);
  return animate;
}

// Base UI measures the panel into --accordion-panel-height and marks the
// first and last frames with data-starting-style / data-ending-style, so the
// open and close are one height transition (the @starting-style pattern)
// rather than a pair of keyframes. Visitors who ask for reduced motion get
// no transition; the panel then just appears.
function AccordionContent({
  className,
  panelClassName,
  children,
  ...props
}: AccordionPrimitive.Panel.Props & { panelClassName?: string }) {
  const animate = useAnimateOpen();
  return (
    <AccordionPrimitive.Panel
      data-slot="accordion-content"
      className={cn(
        "overflow-hidden text-sm",
        animate &&
          "h-(--accordion-panel-height) transition-[height] duration-200 ease-out data-ending-style:h-0 data-starting-style:h-0 motion-reduce:transition-none",
        panelClassName,
      )}
      {...props}
    >
      <div className={cn("pb-4 pt-0", className)}>{children}</div>
    </AccordionPrimitive.Panel>
  );
}

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent };
