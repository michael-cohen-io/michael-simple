import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function capitalize(str: string) {
  if (!str || typeof str !== "string") return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function formatDate(date?: Date | null) {
  return date
    ? date.toLocaleString("en-US", { month: "short", year: "numeric" })
    : "Present";
}

export function shortRole(role: string) {
  return role.replace("Senior", "Sr.").trim();
}

export function shorten(str: string, length: number) {
  return str.length > length ? str.slice(0, length) + "..." : str;
}

export function isDev(): boolean {
  return process.env.NEXT_PUBLIC_VERCEL_ENV === "development";
}
