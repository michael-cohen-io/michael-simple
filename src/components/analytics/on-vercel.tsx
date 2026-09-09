"use client";

import { type ReactNode, useSyncExternalStore } from "react";

import { isVercelHost } from "@/lib/site";

// The hostname is only known in the browser, so the server (and the first
// client render, which must match it) sees false; React then re-renders once
// with the real answer. The store never changes, so subscribe is a no-op.
const subscribe = () => () => {};
const getSnapshot = () => isVercelHost(window.location.hostname);
const getServerSnapshot = () => false;

/** Renders its children only when the page is served by Vercel. */
export function OnVercel({ children }: { children: ReactNode }) {
  const onVercel = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  return onVercel ? <>{children}</> : null;
}
