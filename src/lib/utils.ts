import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Dates are stored as midnight UTC on the first of the month, so they must be
// formatted in UTC: in any zone west of Greenwich the same instant is still the
// previous month.
export function formatDate(date: Date | null) {
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
