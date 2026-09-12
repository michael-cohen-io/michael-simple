"use client";

import { ThemeProvider } from "next-themes";
import React from "react";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    // disableTransitionOnChange: the switch is one instant repaint. Without
    // it every element with a colour transition fades over its own timing
    // while the background snaps, which reads as the page shifting.
    <ThemeProvider attribute="class" defaultTheme="system" disableTransitionOnChange>
      {children}
    </ThemeProvider>
  );
}
