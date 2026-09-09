import type { Company, Entry, Month } from "@/content/types";
import type { CompanyView, EntryView, MonthRange } from "@/lib/types";

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

const MONTH = /^(\d{4})-(0[1-9]|1[0-2])$/;

/** "Aug 2024" from "2024-08". Pure string work: no Date, no timezone. */
export function monthLabel(month: Month): string {
  const match = MONTH.exec(month);
  if (!match) throw new Error(`Expected a YYYY-MM month, got "${month}"`);
  return `${MONTHS[Number(match[2]) - 1]} ${match[1]}`;
}

function monthRange(start: Month, end: Month | null): MonthRange {
  return {
    startLabel: monthLabel(start),
    endLabel: end ? monthLabel(end) : "Present",
    startIso: start,
    endIso: end,
  };
}

/** `YYYY-MM` strings order correctly as text, so newest first is a reverse sort. */
const newestFirst = (a: { start: Month }, b: { start: Month }) =>
  b.start.localeCompare(a.start);

function entryView({ start, end, ...entry }: Entry): EntryView {
  return { ...entry, ...monthRange(start, end) };
}

/**
 * The company's tenure spans its roles: it starts with the earliest one and
 * ends with the latest, or is still open if any role is.
 */
function companyView(company: Company): CompanyView {
  const entries = [...company.entries].sort(newestFirst);
  const start = entries[entries.length - 1].start;
  const ends = entries.map((entry) => entry.end);
  const end = ends.every((month): month is Month => month !== null)
    ? ends.reduce((latest, month) => (month > latest ? month : latest))
    : null;
  return {
    name: company.name,
    url: company.url,
    image: company.logo,
    imageDark: company.logoDark ?? null,
    ...monthRange(start, end),
    entries: entries.map(entryView),
  };
}

/**
 * Companies newest first, each with its roles newest first and every date
 * already formatted. Throws on an empty or malformed history so a mistake in
 * the content file fails the build instead of shipping a blank section.
 */
export function companyViews(companies: Company[]): CompanyView[] {
  if (companies.length === 0) throw new Error("No companies in content/work.ts");
  for (const company of companies) {
    if (company.entries.length === 0) {
      throw new Error(`${company.name} has no roles in content/work.ts`);
    }
  }
  return companies
    .map(companyView)
    .sort((a, b) => b.startIso.localeCompare(a.startIso));
}
