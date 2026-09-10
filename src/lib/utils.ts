import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function capitalize(str: string) {
  if (!str || typeof str !== "string") return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// Dates are stored as midnight UTC on the first of the month, so they must be
// formatted in UTC: in any zone west of Greenwich the same instant is still the
// previous month.
export function formatDate(date?: Date | null) {
  return date
    ? date.toLocaleString("en-US", {
        month: "short",
        year: "numeric",
        timeZone: "UTC",
      })
    : "Present";
}

/** `YYYY-MM` in UTC, for `<time dateTime>`. */
export function monthKey(date: Date) {
  return date.toISOString().slice(0, 7);
}

export function shortRole(role: string) {
  return role.replace("Senior", "Sr.").trim();
}

export function shorten(str: string, length: number) {
  return str.length > length ? str.slice(0, length) + "..." : str;
}

export function acronym(str: string) {
  return str.replace(/[^A-Z]/g, "");
}

export function isDev(): boolean {
  return process.env.NEXT_PUBLIC_VERCEL_ENV === "development";
}
