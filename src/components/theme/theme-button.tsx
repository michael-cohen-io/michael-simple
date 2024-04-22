"use client";

import { useTheme } from "next-themes";

import { useEffect, useState } from "react";
import { MoonIcon, SunIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ThemeButton() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <Button
      variant="ghost"
      className="text-foreground hover:text-muted-foreground rounded-full p-3"
      onClick={() => setTheme(theme !== "light" ? "light" : "dark")}
    >
      {theme === "light" ? (
        <MoonIcon className="h-4 w-4" />
      ) : (
        <SunIcon className="h-4 w-4 text-foreground" />
      )}
    </Button>
  );
}
