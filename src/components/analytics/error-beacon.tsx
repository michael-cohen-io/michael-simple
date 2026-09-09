"use client";

import { track } from "@vercel/analytics";

// Counts uncaught client errors as a Vercel Analytics event. It is a count
// with a message, not a stack trace, but it is enough to notice that a deploy
// started throwing, which nothing did while a hydration error shipped for two
// years. Nothing is sent when the analytics script is blocked or absent.

const MAX_LENGTH = 200;

function describe(reason: unknown): string {
  const message =
    reason instanceof Error
      ? reason.message
      : typeof reason === "string"
        ? reason
        : JSON.stringify(reason) ?? String(reason);
  return message.slice(0, MAX_LENGTH);
}

function onError(event: ErrorEvent) {
  track("client-error", {
    message: describe(event.error ?? event.message),
    // The script that threw, or the page itself for inline/eval code.
    source: (event.filename || window.location.pathname).slice(0, MAX_LENGTH),
  });
}

function onRejection(event: PromiseRejectionEvent) {
  track("client-error", {
    message: describe(event.reason),
    source: "unhandledrejection",
  });
}

// Registered when the module is evaluated rather than in an effect: the
// client bundle loads before React hydrates, and hydration errors are
// reported before any effect runs, so an effect would miss the failure this
// beacon exists to catch. The guard keeps the module inert during SSR.
if (typeof window !== "undefined") {
  window.addEventListener("error", onError);
  window.addEventListener("unhandledrejection", onRejection);
}

/** Renders nothing; mounting it puts the listeners above in the client bundle. */
export function ErrorBeacon() {
  return null;
}
